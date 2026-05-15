import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// GET  /api/restaurants            — Liste des restaurants (avec filtres : quartier, catégorie, isOpen)
// GET  /api/restaurants/nearby     — Restaurants proches (lat, lng, radius)
// GET  /api/restaurants/:id        — Détail d'un restaurant
// POST /api/restaurants            — Créer un restaurant (role: restaurant)
// PUT  /api/restaurants/:id        — Modifier son restaurant
// PATCH /api/restaurants/:id/hours — Gérer les horaires d'ouverture

router.post('/', authenticate, requireRole('restaurant'));
router.put('/:id', authenticate, requireRole('restaurant'));

export default router;
