import { Router, type Request, type Response } from 'express';
import type { FilterQuery } from 'mongoose';
import { authenticate, requireRole } from '../middleware/auth';
import { RestaurantModel, type RestaurantDocument } from '../models/Restaurant';
import { ProductModel } from '../models/Product';
import type { RestaurantCategory } from '@wapi/types';

const router = Router();

function ok(res: Response, data: Record<string, unknown>, status = 200) {
  res.status(status).json({ success: true, data });
}
function fail(res: Response, error: string, status = 400) {
  res.status(status).json({ success: false, error });
}

// ── GET /api/restaurants ──────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { quartier, category, search } = req.query as Record<string, string | undefined>;
  const page  = Math.max(1, Number(req.query['page']  ?? 1));
  const limit = Math.min(100, Math.max(1, Number(req.query['limit'] ?? 20)));

  const filter: FilterQuery<RestaurantDocument> = { isOpen: true };
  if (quartier) filter['address.quartier'] = { $regex: quartier, $options: 'i' };
  if (category) filter['category'] = category as RestaurantCategory;
  if (search)   filter['name']     = { $regex: search,   $options: 'i' };

  const skip = (page - 1) * limit;

  const [restaurants, total] = await Promise.all([
    RestaurantModel.find(filter)
      .sort({ 'rating.avg': -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    RestaurantModel.countDocuments(filter),
  ]);

  ok(res, { restaurants, total, page, totalPages: Math.ceil(total / limit) });
});

// ── GET /api/restaurants/:id ──────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const restaurant = await RestaurantModel.findById(req.params['id']);
  if (!restaurant) { fail(res, 'Restaurant introuvable', 404); return; }

  const products = await ProductModel.find({
    restaurant: restaurant._id,
    isAvailable: true,
  }).sort({ name: 1 });

  // Grouper les produits par catégorie
  const menu: Record<string, typeof products> = {};
  for (const p of products) {
    if (!menu[p.category]) menu[p.category] = [];
    menu[p.category]!.push(p);
  }

  ok(res, { restaurant, menu });
});

// ── GET /api/restaurants/:id/products ────────────────────────────────────
router.get('/:id/products', async (req: Request, res: Response): Promise<void> => {
  const { category } = req.query as { category?: string };

  const exists = await RestaurantModel.exists({ _id: req.params['id'] });
  if (!exists) { fail(res, 'Restaurant introuvable', 404); return; }

  const filter: FilterQuery<typeof ProductModel> = {
    restaurant: req.params['id'],
    isAvailable: true,
  };
  if (category) filter['category'] = category;

  const products = await ProductModel.find(filter).sort({ name: 1 });
  ok(res, { products });
});

// ── PATCH /api/restaurants/:id/toggle ────────────────────────────────────
router.patch(
  '/:id/toggle',
  authenticate,
  requireRole('restaurant'),
  async (req: Request, res: Response): Promise<void> => {
    const restaurant = await RestaurantModel.findById(req.params['id']);
    if (!restaurant) { fail(res, 'Restaurant introuvable', 404); return; }

    if (restaurant.owner.toString() !== req.user!.userId) {
      fail(res, 'Ce restaurant ne vous appartient pas', 403);
      return;
    }

    restaurant.isOpen = !restaurant.isOpen;
    await restaurant.save();

    ok(res, { isOpen: restaurant.isOpen });
  }
);

// Placeholders protégés (à implémenter)
router.post('/', authenticate, requireRole('restaurant'));
router.put('/:id', authenticate, requireRole('restaurant'));

export default router;
