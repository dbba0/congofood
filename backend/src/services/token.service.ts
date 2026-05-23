import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';
import type { UserRole } from '@wapi/types';

export interface AccessTokenPayload {
  userId: string;
  role: UserRole;
  phone: string;
}

interface RefreshTokenPayload {
  userId: string;
  tokenVersion: number;
}

class TokenService {
  generateAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  }

  generateRefreshToken(userId: string): string {
    const payload: RefreshTokenPayload = { userId, tokenVersion: 1 };
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
  }

  /** Hash SHA-256 — utilisé pour stocker le refresh token en base */
  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}

export const tokenService = new TokenService();
