import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// POST /api/orders                         — Passer une commande (role: client)
// GET  /api/orders                         — Liste des commandes (filtrées par rôle)
// GET  /api/orders/:id                     — Détail d'une commande
// PATCH /api/orders/:id/status             — Changer le statut (restaurant / livreur / admin)
// POST /api/orders/:id/cancel              — Annuler une commande (client ou restaurant)

router.post('/', requireRole('client'));
router.patch('/:id/status', requireRole('restaurant', 'livreur', 'admin'));
router.post('/:id/cancel', requireRole('client', 'restaurant'));

export default router;
