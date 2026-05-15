import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// GET   /api/deliveries/available          — Missions disponibles (role: livreur)
// POST  /api/deliveries/:id/accept         — Accepter une mission
// PATCH /api/deliveries/:id/location       — Mettre à jour la position GPS
// PATCH /api/deliveries/:id/status         — Changer le statut de livraison
// GET   /api/deliveries/earnings           — Historique des gains (role: livreur)

router.get('/available', requireRole('livreur'));
router.post('/:id/accept', requireRole('livreur'));
router.patch('/:id/location', requireRole('livreur'));
router.patch('/:id/status', requireRole('livreur'));
router.get('/earnings', requireRole('livreur'));

export default router;
