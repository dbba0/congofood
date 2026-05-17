import express from 'express';
import request from 'supertest';

// ── Mocks déclarés avant tout import de modules applicatifs ──────────────

const mockRedisGet  = jest.fn();
const mockRedisSetex = jest.fn();
const mockRedisDel  = jest.fn();

jest.mock('ioredis', () =>
  jest.fn().mockImplementation(() => ({
    get: mockRedisGet,
    setex: mockRedisSetex,
    del: mockRedisDel,
    on: jest.fn(),
  }))
);

jest.mock('africastalking', () =>
  jest.fn(() => ({
    SMS: { send: jest.fn().mockResolvedValue({ SMSMessageData: {} }) },
  }))
);

const mockFindOne           = jest.fn();
const mockFindById          = jest.fn();
const mockFindByIdAndUpdate = jest.fn();
const mockCreate            = jest.fn();
const mockSave              = jest.fn();

jest.mock('../models/User', () => ({
  UserModel: {
    findOne: mockFindOne,
    findById: mockFindById,
    findByIdAndUpdate: mockFindByIdAndUpdate,
    create: mockCreate,
  },
}));

// ── Import après les mocks ────────────────────────────────────────────────

import authRoutes from './auth';
import { tokenService } from '../services/token.service';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// ── Helpers ───────────────────────────────────────────────────────────────

function otpRedisValue(code: string, attempts = 0) {
  return JSON.stringify({ code, attempts });
}

function mockUser(overrides: Record<string, unknown> = {}) {
  return {
    _id: 'user_123',
    phone: '+243812345678',
    name: '',
    role: 'client',
    isVerified: true,
    lastLoginAt: null,
    refreshToken: undefined,
    save: mockSave,
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockSave.mockResolvedValue(undefined);
});

// ── describe: POST /api/auth/send-otp ────────────────────────────────────

describe('POST /api/auth/send-otp', () => {
  it('retourne 200 avec un téléphone valide (mode dev)', async () => {
    mockRedisSetex.mockResolvedValue('OK');

    const res = await request(app)
      .post('/api/auth/send-otp')
      .send({ phone: '+243812345678' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.expiresIn).toBe(300);
    expect(res.body.dev_code).toMatch(/^[0-9]{6}$/);
    expect(mockRedisSetex).toHaveBeenCalledWith(
      'otp:+243812345678',
      300,
      expect.stringContaining('"attempts":0')
    );
  });

  it('retourne 400 avec un numéro sans préfixe +243', async () => {
    const res = await request(app)
      .post('/api/auth/send-otp')
      .send({ phone: '0812345678' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('retourne 400 avec un body vide', async () => {
    const res = await request(app).post('/api/auth/send-otp').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('retourne 400 avec un numéro trop court', async () => {
    const res = await request(app)
      .post('/api/auth/send-otp')
      .send({ phone: '+24381234' });

    expect(res.status).toBe(400);
  });
});

// ── describe: POST /api/auth/verify-otp ──────────────────────────────────

describe('POST /api/auth/verify-otp', () => {
  const VALID_PHONE = '+243812345678';
  const VALID_CODE  = '654321';

  it('retourne les tokens avec le code correct — utilisateur existant', async () => {
    const user = mockUser({ lastLoginAt: new Date('2024-01-01') });
    mockRedisGet.mockResolvedValue(otpRedisValue(VALID_CODE));
    mockRedisDel.mockResolvedValue(1);
    mockFindOne.mockResolvedValue(user);

    const res = await request(app)
      .post('/api/auth/verify-otp')
      .send({ phone: VALID_PHONE, code: VALID_CODE });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.isNewUser).toBe(false);
    expect(res.body.user.phone).toBe(VALID_PHONE);
  });

  it('isNewUser=true au premier login', async () => {
    const newUser = mockUser();
    mockRedisGet.mockResolvedValue(otpRedisValue(VALID_CODE));
    mockRedisDel.mockResolvedValue(1);
    mockFindOne.mockResolvedValue(null);      // utilisateur inconnu
    mockCreate.mockResolvedValue(newUser);

    const res = await request(app)
      .post('/api/auth/verify-otp')
      .send({ phone: VALID_PHONE, code: VALID_CODE });

    expect(res.status).toBe(200);
    expect(res.body.isNewUser).toBe(true);
  });

  it('retourne 400 avec un code incorrect', async () => {
    mockRedisGet.mockResolvedValue(otpRedisValue('111111'));
    mockRedisSetex.mockResolvedValue('OK');

    const res = await request(app)
      .post('/api/auth/verify-otp')
      .send({ phone: VALID_PHONE, code: '999999' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/incorrect/i);
  });

  it('retourne 400 après 3 tentatives échouées', async () => {
    // attempts déjà à 3 → la 4e dépasse MAX_ATTEMPTS
    mockRedisGet.mockResolvedValue(otpRedisValue('111111', 3));
    mockRedisDel.mockResolvedValue(1);

    const res = await request(app)
      .post('/api/auth/verify-otp')
      .send({ phone: VALID_PHONE, code: '999999' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/tentatives/i);
  });

  it('retourne 400 quand l\'OTP est expiré (absent de Redis)', async () => {
    mockRedisGet.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/verify-otp')
      .send({ phone: VALID_PHONE, code: VALID_CODE });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/expiré/i);
  });

  it('retourne 400 avec un code non numérique', async () => {
    const res = await request(app)
      .post('/api/auth/verify-otp')
      .send({ phone: VALID_PHONE, code: 'abcdef' });

    expect(res.status).toBe(400);
  });
});

// ── describe: POST /api/auth/refresh ─────────────────────────────────────

describe('POST /api/auth/refresh', () => {
  it('retourne un nouveau accessToken avec un refresh token valide', async () => {
    const user = mockUser();
    const refreshToken = tokenService.generateRefreshToken('user_123');
    const hashedToken  = tokenService.hashToken(refreshToken);
    const userWithToken = { ...user, refreshToken: hashedToken };

    mockFindById.mockReturnValue({
      select: jest.fn().mockResolvedValue(userWithToken),
    });

    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.expiresIn).toBe(900);
  });

  it('retourne 401 avec un refresh token invalide (mauvaise signature)', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'invalid.token.here' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('retourne 401 si le token ne correspond pas à celui en base', async () => {
    const refreshToken = tokenService.generateRefreshToken('user_123');
    const userWithWrongToken = mockUser({ refreshToken: 'different_hash' });

    mockFindById.mockReturnValue({
      select: jest.fn().mockResolvedValue(userWithWrongToken),
    });

    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });

    expect(res.status).toBe(401);
  });

  it('retourne 401 si le body est vide', async () => {
    const res = await request(app).post('/api/auth/refresh').send({});
    expect(res.status).toBe(401);
  });
});
