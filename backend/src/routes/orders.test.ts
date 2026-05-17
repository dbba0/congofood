import express from 'express';
import request from 'supertest';

// ── Mocks ─────────────────────────────────────────────────────────────────

let mockUserRole = 'client';
let mockUserId   = 'user_client_123';

jest.mock('../middleware/auth', () => ({
  authenticate: jest.fn((req: express.Request, _res: express.Response, next: express.NextFunction) => {
    req.user = { userId: mockUserId, role: mockUserRole as never, phone: '+243000000000', iat: 0, exp: 0 };
    next();
  }),
  requireRole: (...roles: string[]) =>
    (req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (roles.includes(req.user?.role ?? '')) return next();
      res.status(403).json({ success: false, error: 'Accès refusé' });
    },
}));

const mockRestaurantFindById = jest.fn();
jest.mock('../models/Restaurant', () => ({
  RestaurantModel: {
    findById: mockRestaurantFindById,
    findOne:  jest.fn(),
    find:     jest.fn(),
  },
}));

const mockProductFind = jest.fn();
jest.mock('../models/Product', () => ({
  ProductModel: { find: mockProductFind },
}));

const mockOrderCreate       = jest.fn();
const mockOrderFindById     = jest.fn();
const mockOrderFind         = jest.fn();
const mockOrderSave         = jest.fn();
jest.mock('../models/Order', () => ({
  OrderModel: {
    create:     mockOrderCreate,
    findById:   mockOrderFindById,
    find:       mockOrderFind,
    countDocuments: jest.fn().mockResolvedValue(0),
  },
}));

const mockPaymentCreate = jest.fn();
jest.mock('../models/Payment', () => ({
  PaymentModel: { create: mockPaymentCreate },
}));

jest.mock('../models/Delivery', () => ({
  DeliveryModel: { findOneAndUpdate: jest.fn() },
}));

jest.mock('../config/socket', () => ({
  getIO: jest.fn(() => ({ to: jest.fn(() => ({ emit: jest.fn() })) })),
}));

// ── App de test ────────────────────────────────────────────────────────────

import orderRoutes from './orders';

const app = express();
app.use(express.json());
app.use('/api/orders', orderRoutes);

// ── Fixtures ───────────────────────────────────────────────────────────────

function fakeRestaurant(isOpen = true) {
  return { _id: 'resto_001', name: 'Poulet Ya Biso', isOpen };
}

function fakeProducts() {
  return [
    { _id: 'prod_1', name: 'Poulet braisé', price: 5000, isAvailable: true, restaurant: { toString: () => 'resto_001' } },
    { _id: 'prod_2', name: 'Fanta',         price: 1500, isAvailable: true, restaurant: { toString: () => 'resto_001' } },
  ];
}

function fakeOrder(overrides: Record<string, unknown> = {}) {
  return {
    _id: 'order_001',
    client: { toString: () => 'user_client_123' },
    restaurant: { toString: () => 'resto_001' },
    livreur: null,
    status: 'pending',
    total: 13000,
    timeline: [],
    save: mockOrderSave,
    ...overrides,
  };
}

const validBody = {
  restaurantId: 'resto_001',
  items: [{ productId: 'prod_1', qty: 2, selectedOptions: [] }],
  deliveryAddress: { label: 'Chez moi', coords: { lat: -4.3, lng: 15.3 } },
  paymentMethod: 'cash',
};

beforeEach(() => {
  jest.clearAllMocks();
  mockOrderSave.mockResolvedValue(undefined);
});

// ── POST /api/orders ───────────────────────────────────────────────────────

describe('POST /api/orders', () => {
  beforeEach(() => {
    mockUserRole = 'client';
    mockUserId   = 'user_client_123';
  });

  it('crée une commande cash → statut confirmed, paymentStatus paid', async () => {
    mockRestaurantFindById.mockResolvedValue(fakeRestaurant());
    mockProductFind.mockResolvedValue(fakeProducts());
    mockOrderCreate.mockResolvedValue(fakeOrder({ status: 'confirmed', paymentStatus: 'paid' }));

    const res = await request(app).post('/api/orders').send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(mockOrderCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        status:        'confirmed',
        paymentStatus: 'paid',
        currency:      'CDF',
        deliveryFee:   1500,
      })
    );
    expect(mockPaymentCreate).not.toHaveBeenCalled();
  });

  it('crée une commande mobile money → statut pending + Payment initié', async () => {
    mockRestaurantFindById.mockResolvedValue(fakeRestaurant());
    mockProductFind.mockResolvedValue(fakeProducts());
    mockOrderCreate.mockResolvedValue(fakeOrder({ status: 'pending', paymentStatus: 'pending' }));
    mockPaymentCreate.mockResolvedValue({});

    const res = await request(app)
      .post('/api/orders')
      .send({ ...validBody, paymentMethod: 'airtel_money' });

    expect(res.status).toBe(201);
    expect(mockOrderCreate).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'pending', paymentStatus: 'pending' })
    );
    expect(mockPaymentCreate).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'airtel_money', status: 'initiated', provider: 'cinetpay' })
    );
  });

  it('retourne 400 si le restaurant est fermé', async () => {
    mockRestaurantFindById.mockResolvedValue(fakeRestaurant(false));

    const res = await request(app).post('/api/orders').send(validBody);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/fermé/i);
    expect(mockOrderCreate).not.toHaveBeenCalled();
  });

  it('recalcule le prix depuis la DB (ignore le prix envoyé par le client)', async () => {
    mockRestaurantFindById.mockResolvedValue(fakeRestaurant());
    mockProductFind.mockResolvedValue(fakeProducts());
    mockOrderCreate.mockResolvedValue(fakeOrder());

    // Le client envoie 2 qty × prod_1 (prix DB = 5000)
    // subtotal attendu = 10000, total = 11500
    await request(app).post('/api/orders').send({
      ...validBody,
      items: [{ productId: 'prod_1', qty: 2 }],
    });

    expect(mockOrderCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        subtotal:    10000,
        deliveryFee: 1500,
        total:       11500,
      })
    );
  });

  it('retourne 400 si un produit est indisponible', async () => {
    const unavailableProducts = fakeProducts().map((p) =>
      p._id === 'prod_1' ? { ...p, isAvailable: false } : p
    );
    mockRestaurantFindById.mockResolvedValue(fakeRestaurant());
    mockProductFind.mockResolvedValue(unavailableProducts);

    const res = await request(app).post('/api/orders').send(validBody);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/indisponible/i);
  });

  it('retourne 403 si l\'utilisateur n\'est pas client', async () => {
    mockUserRole = 'livreur';

    const res = await request(app).post('/api/orders').send(validBody);

    expect(res.status).toBe(403);
  });
});

// ── PATCH /api/orders/:id/status ──────────────────────────────────────────

describe('PATCH /api/orders/:id/status', () => {
  it('restaurant : pending → confirmed (transition valide)', async () => {
    mockUserRole = 'restaurant';
    const order = fakeOrder({ status: 'pending', timeline: [] });
    mockOrderFindById.mockResolvedValue(order);

    const res = await request(app)
      .patch('/api/orders/order_001/status')
      .send({ status: 'confirmed' });

    expect(res.status).toBe(200);
    expect(mockOrderSave).toHaveBeenCalled();
  });

  it('restaurant : pending → delivering (transition invalide → 400)', async () => {
    mockUserRole = 'restaurant';
    const order = fakeOrder({ status: 'pending', timeline: [] });
    mockOrderFindById.mockResolvedValue(order);

    const res = await request(app)
      .patch('/api/orders/order_001/status')
      .send({ status: 'on_the_way' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalide/i);
    expect(mockOrderSave).not.toHaveBeenCalled();
  });

  it('livreur : ready → picking_up (transition valide)', async () => {
    mockUserRole = 'livreur';
    const order = fakeOrder({ status: 'ready', timeline: [] });
    mockOrderFindById.mockResolvedValue(order);

    const res = await request(app)
      .patch('/api/orders/order_001/status')
      .send({ status: 'picking_up' });

    expect(res.status).toBe(200);
  });

  it('livreur : pending → confirmed (transition invalide → 400)', async () => {
    mockUserRole = 'livreur';
    const order = fakeOrder({ status: 'pending', timeline: [] });
    mockOrderFindById.mockResolvedValue(order);

    const res = await request(app)
      .patch('/api/orders/order_001/status')
      .send({ status: 'confirmed' });

    expect(res.status).toBe(400);
  });

  it('client ne peut pas changer le statut (mauvais rôle → 403)', async () => {
    mockUserRole = 'client';

    const res = await request(app)
      .patch('/api/orders/order_001/status')
      .send({ status: 'confirmed' });

    expect(res.status).toBe(403);
    expect(mockOrderFindById).not.toHaveBeenCalled();
  });

  it('admin peut faire n\'importe quelle transition valide', async () => {
    mockUserRole = 'admin';
    const order = fakeOrder({ status: 'confirmed', timeline: [] });
    mockOrderFindById.mockResolvedValue(order);

    const res = await request(app)
      .patch('/api/orders/order_001/status')
      .send({ status: 'preparing' });

    expect(res.status).toBe(200);
  });
});
