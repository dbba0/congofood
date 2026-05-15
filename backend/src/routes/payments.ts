import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

// POST /api/payments/initiate              — Initier un paiement Mobile Money
// GET  /api/payments/:id                   — Statut d'un paiement
// POST /api/payments/webhook/cinetpay      — Webhook CinetPay (non authentifié)

router.post('/initiate', authenticate);
router.get('/:id', authenticate);

// Le webhook est appelé par CinetPay — pas de JWT, sécurisé par signature HMAC
// router.post('/webhook/cinetpay', webhookHandler);

export default router;
