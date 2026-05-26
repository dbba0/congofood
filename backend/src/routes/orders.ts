import { Router, type Request, type Response } from 'express';
import type { FilterQuery } from 'mongoose';
import { authenticate, requireRole } from '../middleware/auth';
import { OrderModel, type OrderDocument } from '../models/Order';
import { RestaurantModel } from '../models/Restaurant';
import { ProductModel } from '../models/Product';
import { PaymentModel } from '../models/Payment';
import { DeliveryModel } from '../models/Delivery';
import { getIO } from '../config/socket';
import type { OrderStatus, PaymentMethod } from '@wapi/types';

const router = Router();
router.use(authenticate);

const DELIVERY_FEE = 1500; // CDF fixe MVP

function ok(res: Response, data: Record<string, unknown>, status = 200) {
  res.status(status).json({ success: true, data });
}
function fail(res: Response, message: string, status = 400) {
  res.status(status).json({ success: false, message });
}

// ── Matrice des transitions de statut autorisées ──────────────────────────
const ALLOWED_TRANSITIONS: Record<string, Partial<Record<OrderStatus, OrderStatus[]>>> = {
  restaurant: {
    pending:   ['confirmed'],
    confirmed: ['preparing'],
    preparing: ['ready'],
  },
  livreur: {
    ready:       ['picking_up'],
    picking_up:  ['on_the_way'],
    on_the_way:  ['delivered'],
  },
  admin: {
    pending:    ['confirmed', 'cancelled'],
    confirmed:  ['preparing', 'cancelled'],
    preparing:  ['ready',     'cancelled'],
    ready:      ['picking_up'],
    picking_up: ['on_the_way'],
    on_the_way: ['delivered'],
    delivered:  [],
    cancelled:  [],
  },
};

function canTransition(role: string, from: OrderStatus, to: OrderStatus): boolean {
  const allowed = ALLOWED_TRANSITIONS[role]?.[from] ?? [];
  return allowed.includes(to);
}

// ── POST /api/orders ──────────────────────────────────────────────────────
router.post('/', requireRole('client'), async (req: Request, res: Response): Promise<void> => {
  const {
    restaurantId,
    items,
    deliveryAddress,
    paymentMethod,
    notes,
  } = req.body as {
    restaurantId: string;
    items: Array<{
      productId: string;
      qty: number;
      selectedOptions?: Array<{ name: string; choice: string; priceDelta: number }>;
    }>;
    deliveryAddress: { label: string; coords: { lat: number; lng: number }; instructions?: string };
    paymentMethod: PaymentMethod;
    notes?: string;
  };

  // Validations basiques
  if (!restaurantId || !items?.length || !deliveryAddress || !paymentMethod) {
    fail(res, 'Champs obligatoires manquants'); return;
  }

  // 1. Vérifier restaurant ouvert
  const restaurant = await RestaurantModel.findById(restaurantId);
  if (!restaurant)        { fail(res, 'Restaurant introuvable', 404); return; }
  if (!restaurant.isOpen) { fail(res, 'Restaurant fermé');            return; }

  // 2. Récupérer tous les produits en une requête
  const productIds = items.map((i) => i.productId);
  const products   = await ProductModel.find({ _id: { $in: productIds } });

  // 3. Valider chaque produit
  for (const item of items) {
    const product = products.find((p) => p._id.toString() === item.productId);
    if (!product)                                         { fail(res, `Produit introuvable : ${item.productId}`);    return; }
    if (product.restaurant.toString() !== restaurantId)   { fail(res, `Produit invalide : ${product.name}`);         return; }
    if (!product.isAvailable)                             { fail(res, `Produit indisponible : ${product.name}`);     return; }
    if (!item.qty || item.qty < 1)                        { fail(res, `Quantité invalide pour : ${product.name}`);  return; }
  }

  // 4. Calculer les prix UNIQUEMENT depuis la base (sécurité critique)
  let subtotal = 0;
  const orderItems = items.map((item) => {
    const product = products.find((p) => p._id.toString() === item.productId)!;
    let itemTotal = product.price * item.qty;
    const mappedOptions = (item.selectedOptions ?? []).map((opt) => {
      itemTotal += opt.priceDelta * item.qty;
      return { optionName: opt.name, choiceLabel: opt.choice, priceDelta: opt.priceDelta };
    });
    subtotal += itemTotal;
    return {
      product: product._id,
      name:    product.name,
      price:   product.price,
      qty:     item.qty,
      selectedOptions: mappedOptions,
    };
  });

  const total = subtotal + DELIVERY_FEE;

  // 5. Statut initial selon méthode de paiement
  const isCash    = paymentMethod === 'cash';
  const initStatus: OrderStatus = isCash ? 'confirmed' : 'pending';
  const timeline = [
    { status: 'pending' as OrderStatus, timestamp: new Date() },
    ...(isCash ? [{ status: 'confirmed' as OrderStatus, timestamp: new Date() }] : []),
  ];

  // 6. Créer la commande
  const order = await OrderModel.create({
    client:      req.user!.userId,
    restaurant:  restaurantId,
    items:       orderItems,
    subtotal,
    deliveryFee: DELIVERY_FEE,
    total,
    currency:    'CDF',
    status:      initStatus,
    paymentStatus: isCash ? 'paid' : 'pending',
    deliveryAddress,
    timeline,
    notes,
  });

  // 7. Si mobile money → créer Payment initié
  if (!isCash) {
    await PaymentModel.create({
      order:    order._id,
      user:     req.user!.userId,
      method:   paymentMethod,
      provider: 'cinetpay',
      amount:   total,
      currency: 'CDF',
      status:   'initiated',
    });
  }

  // 8. Émettre événement Socket.io au restaurant
  try {
    getIO().to(`restaurant:${restaurantId}`).emit('order:new', order);
  } catch {
    // Socket non initialisé en test — non bloquant
  }

  ok(res, { order }, 201);
});

// ── GET /api/orders ───────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { status } = req.query as { status?: OrderStatus };
  const page  = Math.max(1, Number(req.query['page']  ?? 1));
  const limit = Math.min(100, Math.max(1, Number(req.query['limit'] ?? 20)));
  const { userId, role } = req.user!;

  const filter: FilterQuery<OrderDocument> = {};
  if (status) filter['status'] = status;

  if (role === 'client')      filter['client']     = userId;
  else if (role === 'restaurant') {
    // Trouver le restaurant dont cet user est owner
    const restaurant = await RestaurantModel.findOne({ owner: userId }).select('_id');
    if (!restaurant) { ok(res, { orders: [], total: 0, page, totalPages: 0 }); return; }
    filter['restaurant'] = restaurant._id;
  } else if (role === 'livreur') filter['livreur'] = userId;
  // admin → pas de filtre utilisateur

  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    OrderModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('client', 'name phone')
      .populate('restaurant', 'name logo address'),
    OrderModel.countDocuments(filter),
  ]);

  ok(res, { orders, total, page, totalPages: Math.ceil(total / limit) });
});

// ── GET /api/orders/:id ───────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const order = await OrderModel.findById(req.params['id'])
    .populate('client',     'name phone')
    .populate('restaurant', 'name logo address estimatedPrepTime')
    .populate('livreur',    'name phone');

  if (!order) { fail(res, 'Commande introuvable', 404); return; }

  const { userId, role } = req.user!;
  const canView =
    role === 'admin' ||
    order.client.toString()     === userId ||
    order.restaurant.toString() === userId ||
    order.livreur?.toString()   === userId;

  if (!canView) { fail(res, 'Accès refusé', 403); return; }

  ok(res, { order });
});

// ── PATCH /api/orders/:id/status ──────────────────────────────────────────
router.patch(
  '/:id/status',
  requireRole('restaurant', 'livreur', 'admin'),
  async (req: Request, res: Response): Promise<void> => {
    const { status: newStatus } = req.body as { status?: OrderStatus };
    if (!newStatus) { fail(res, 'Champ status requis'); return; }

    const order = await OrderModel.findById(req.params['id']);
    if (!order) { fail(res, 'Commande introuvable', 404); return; }

    const { role } = req.user!;

    if (!canTransition(role, order.status, newStatus)) {
      fail(res, `Transition de statut invalide : ${order.status} → ${newStatus}`);
      return;
    }

    const timestamp = new Date();
    order.status = newStatus;
    order.timeline.push({ status: newStatus, timestamp: timestamp.toISOString() });
    await order.save();

    // Émettre mise à jour temps réel
    try {
      getIO()
        .to(`order:${order._id.toString()}`)
        .emit('order:status', { orderId: order._id, status: newStatus, timestamp });
    } catch {
      // Socket non initialisé en test
    }

    // Si livré → mettre à jour la Delivery
    if (newStatus === 'delivered') {
      await DeliveryModel.findOneAndUpdate(
        { order: order._id },
        { status: 'completed', deliveredAt: timestamp }
      );
    }

    ok(res, { order });
  }
);

export default router;
