import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// GET  /api/products?restaurantId=xxx   — Produits d'un restaurant
// GET  /api/products/:id                — Détail d'un produit
// POST /api/products                    — Créer un produit (role: restaurant)
// PUT  /api/products/:id                — Modifier un produit
// PATCH /api/products/:id/availability  — Activer/désactiver un produit
// DELETE /api/products/:id              — Supprimer un produit

router.post('/', authenticate, requireRole('restaurant'));
router.put('/:id', authenticate, requireRole('restaurant'));
router.patch('/:id/availability', authenticate, requireRole('restaurant'));
router.delete('/:id', authenticate, requireRole('restaurant'));

export default router;
