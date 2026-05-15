import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// GET    /api/users/me         — Profil de l'utilisateur connecté
// PATCH  /api/users/me         — Mise à jour du profil
// PUT    /api/users/me/address — Mise à jour de l'adresse de livraison
// DELETE /api/users/me         — Suppression du compte

export default router;
