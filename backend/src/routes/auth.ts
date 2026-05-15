import { Router } from 'express';

const router = Router();

// POST /api/auth/register     — Inscription (phone + OTP)
// POST /api/auth/login        — Connexion
// POST /api/auth/verify-otp   — Vérification du code OTP
// POST /api/auth/refresh      — Rafraîchissement du token JWT
// POST /api/auth/logout       — Déconnexion

export default router;
