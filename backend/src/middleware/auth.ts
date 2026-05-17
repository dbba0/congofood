import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import type { UserRole } from '@congofood/types';

/** Payload décodé du JWT */
export interface JwtPayload {
  userId: string;
  role: UserRole;
  phone: string;
  iat: number;
  exp: number;
}

/** Étend Request Express pour porter l'utilisateur authentifié */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/** Vérifie le JWT Bearer et injecte req.user */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Token manquant' });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token invalide ou expiré' });
  }
}

/** Fabrique un middleware qui restreint l'accès à certains rôles */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Non authentifié' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Accès refusé' });
      return;
    }

    next();
  };
}
