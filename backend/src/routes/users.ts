import { Router, type Request, type Response } from 'express';
import { authenticate } from '../middleware/auth';
import { UserModel } from '../models/User';

const router = Router();

router.use(authenticate);

function ok(res: Response, data: Record<string, unknown>, status = 200) {
  res.status(status).json({ success: true, data });
}
function fail(res: Response, message: string, status = 400) {
  res.status(status).json({ success: false, message });
}

// ── GET /api/users/me ────────────────────────────────────────────────────
router.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await UserModel.findById(req.user!.userId)
      .select('-password -refreshToken -__v');

    if (!user) {
      fail(res, 'Utilisateur introuvable', 404);
      return;
    }

    ok(res, { user });
  } catch (err) {
    console.error('[GET /users/me]', err);
    fail(res, 'Erreur serveur', 500);
  }
});

// ── PATCH /api/users/me ──────────────────────────────────────────────────
router.patch('/me', async (req: Request, res: Response): Promise<void> => {
  // Champs modifiables par l'utilisateur
  const { name, quartier, deviceToken } = req.body as {
    name?: string;
    quartier?: string;
    deviceToken?: string;
  };

  // Bloquer les champs critiques — ne jamais accepter phone, role, password, etc.
  const forbidden = ['phone', 'role', 'password', 'refreshToken', 'isVerified', '_id'];
  for (const key of forbidden) {
    if (key in req.body) {
      fail(res, `Le champ "${key}" ne peut pas être modifié via cette route`);
      return;
    }
  }

  try {
    const user = await UserModel.findById(req.user!.userId)
      .select('-password -refreshToken -__v');

    if (!user) {
      fail(res, 'Utilisateur introuvable', 404);
      return;
    }

    // Appliquer les modifications autorisées
    if (name !== undefined) {
      const trimmed = name.trim();
      if (trimmed.length > 100) {
        fail(res, 'Le nom ne peut pas dépasser 100 caractères');
        return;
      }
      user.name = trimmed;
    }

    if (quartier !== undefined) {
      const trimmed = quartier.trim();
      if (trimmed.length > 50) {
        fail(res, 'Le quartier ne peut pas dépasser 50 caractères');
        return;
      }
      // Stocker le quartier dans l'adresse
      if (!user.address) {
        user.address = {
          label: trimmed,
          coords: { lat: -4.3222, lng: 15.3222 }, // Kinshasa centre par défaut
          quartier: trimmed,
        };
      } else {
        user.address.quartier = trimmed;
        user.address.label = trimmed;
      }
    }

    if (deviceToken !== undefined) {
      user.deviceToken = deviceToken;
    }

    await user.save();

    ok(res, { user });
  } catch (err) {
    console.error('[PATCH /users/me]', err);
    fail(res, 'Erreur serveur', 500);
  }
});

export default router;
