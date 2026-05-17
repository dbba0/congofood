import { Router, type Request, type Response } from 'express';
import { otpService } from '../services/otp.service';
import { tokenService } from '../services/token.service';
import { UserModel } from '../models/User';
import { authenticate } from '../middleware/auth';

const router = Router();

const PHONE_REGEX = /^\+243[0-9]{9}$/;

function ok(res: Response, data: Record<string, unknown>, status = 200) {
  res.status(status).json({ success: true, ...data });
}

function fail(res: Response, message: string, status = 400) {
  res.status(status).json({ success: false, error: message });
}

// ── POST /api/auth/send-otp ───────────────────────────────────────────────
router.post('/send-otp', async (req: Request, res: Response): Promise<void> => {
  const { phone } = req.body as { phone?: string };

  if (!phone || !PHONE_REGEX.test(phone)) {
    fail(res, 'Numéro invalide — format attendu : +243XXXXXXXXX');
    return;
  }

  try {
    const result = await otpService.sendOTP(phone);
    ok(res, {
      expiresIn: 300,
      ...(result.devCode ? { dev_code: result.devCode } : {}),
    });
  } catch (err) {
    console.error('[send-otp]', err);
    fail(res, 'Impossible d\'envoyer le SMS', 500);
  }
});

// ── POST /api/auth/verify-otp ─────────────────────────────────────────────
router.post('/verify-otp', async (req: Request, res: Response): Promise<void> => {
  const { phone, code } = req.body as { phone?: string; code?: string };

  if (!phone || !PHONE_REGEX.test(phone)) {
    fail(res, 'Numéro invalide — format attendu : +243XXXXXXXXX');
    return;
  }

  if (!code || !/^[0-9]{6}$/.test(code)) {
    fail(res, 'Le code doit être composé de 6 chiffres');
    return;
  }

  try {
    const { valid, attemptsLeft, reason } = await otpService.verifyOTP(phone, code);

    if (!valid) {
      if (reason === 'expired')      { fail(res, 'Code expiré — demandez un nouveau code'); return; }
      if (reason === 'max_attempts') { fail(res, 'Trop de tentatives — demandez un nouveau code'); return; }
      fail(res, `Code incorrect — ${attemptsLeft} tentative${attemptsLeft > 1 ? 's' : ''} restante${attemptsLeft > 1 ? 's' : ''}`);
      return;
    }

    // Upsert user
    let isNewUser = false;
    let user = await UserModel.findOne({ phone });

    if (!user) {
      isNewUser = true;
      user = await UserModel.create({
        phone,
        name: '',
        role: 'client',
        isVerified: true,
        lastLoginAt: new Date(),
      });
    } else {
      user.lastLoginAt = new Date();
      user.isVerified = true;
      await user.save();
    }

    // Génération des tokens
    const accessToken = tokenService.generateAccessToken({
      userId: user._id.toString(),
      role: user.role,
      phone: user.phone,
    });
    const refreshToken = tokenService.generateRefreshToken(user._id.toString());

    // Stocker le refresh token hashé
    user.refreshToken = tokenService.hashToken(refreshToken);
    await user.save();

    ok(res, {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes en secondes
      user: {
        _id: user._id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
      },
      isNewUser,
    });
  } catch (err) {
    console.error('[verify-otp]', err);
    fail(res, 'Erreur lors de la vérification', 500);
  }
});

// ── POST /api/auth/refresh ────────────────────────────────────────────────
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body as { refreshToken?: string };

  if (!refreshToken) {
    fail(res, 'Refresh token manquant', 401);
    return;
  }

  try {
    const payload = tokenService.verifyRefreshToken(refreshToken);

    const user = await UserModel.findById(payload.userId).select('+refreshToken');

    if (!user || !user.refreshToken) {
      fail(res, 'Token invalide', 401);
      return;
    }

    const incoming = tokenService.hashToken(refreshToken);
    if (incoming !== user.refreshToken) {
      fail(res, 'Token invalide', 401);
      return;
    }

    const accessToken = tokenService.generateAccessToken({
      userId: user._id.toString(),
      role: user.role,
      phone: user.phone,
    });

    ok(res, { accessToken, expiresIn: 900 });
  } catch {
    fail(res, 'Token invalide ou expiré', 401);
  }
});

// ── POST /api/auth/logout ─────────────────────────────────────────────────
router.post('/logout', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    await UserModel.findByIdAndUpdate(req.user!.userId, { refreshToken: null });
    ok(res, {});
  } catch (err) {
    console.error('[logout]', err);
    fail(res, 'Erreur lors de la déconnexion', 500);
  }
});

export default router;
