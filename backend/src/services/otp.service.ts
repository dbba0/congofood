import crypto from 'crypto';
import { redis, redisAvailable } from '../config/redis';
import { env } from '../config/env';

const OTP_TTL_SECONDS = 300;
const MAX_ATTEMPTS = 3;
// Timeout max pour une commande Redis — au-delà, fallback mémoire
const REDIS_CMD_TIMEOUT_MS = 2000;

interface OTPData {
  code: string;
  attempts: number;
}

// Fallback mémoire — toujours disponible, même en production
interface MemoryOTPData extends OTPData {
  expiresAt: number;
}
const memoryStore = new Map<string, MemoryOTPData>();

// Nettoyage périodique des entrées expirées
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of memoryStore) {
    if (value.expiresAt <= now) memoryStore.delete(key);
  }
}, 60_000);

/* eslint-disable @typescript-eslint/no-require-imports */
type ATInstance = {
  SMS: {
    send: (params: { to: string[]; message: string }) => Promise<unknown>;
  };
};
type ATFactory = (opts: { apiKey: string; username: string }) => ATInstance;

// --- Helpers : Redis avec timeout + fallback mémoire instantané ---

/** Exécute une commande Redis avec un timeout strict de 2s */
function withTimeout<T>(promise: Promise<T>, ms = REDIS_CMD_TIMEOUT_MS): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Redis timeout')), ms);
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); },
    );
  });
}

async function storeSet(key: string, data: OTPData, ttlSeconds: number): Promise<void> {
  // Si Redis est déjà déconnecté, aller directement en mémoire
  if (!redisAvailable) {
    console.warn('[OTP] Redis indisponible, écriture mémoire directe');
    memoryStore.set(key, { ...data, expiresAt: Date.now() + ttlSeconds * 1000 });
    return;
  }
  try {
    await withTimeout(redis.setex(key, ttlSeconds, JSON.stringify(data)));
  } catch (e) {
    console.warn('[OTP] Redis SET échoué, fallback mémoire :', (e as Error).message);
    memoryStore.set(key, { ...data, expiresAt: Date.now() + ttlSeconds * 1000 });
  }
}

async function storeGet(key: string): Promise<OTPData | null> {
  if (!redisAvailable) {
    const entry = memoryStore.get(key);
    if (!entry || entry.expiresAt <= Date.now()) {
      memoryStore.delete(key);
      return null;
    }
    return { code: entry.code, attempts: entry.attempts };
  }
  try {
    const raw = await withTimeout(redis.get(key));
    if (!raw) return null;
    return JSON.parse(raw) as OTPData;
  } catch (e) {
    console.warn('[OTP] Redis GET échoué, fallback mémoire :', (e as Error).message);
    const entry = memoryStore.get(key);
    if (!entry || entry.expiresAt <= Date.now()) {
      memoryStore.delete(key);
      return null;
    }
    return { code: entry.code, attempts: entry.attempts };
  }
}

async function storeDel(key: string): Promise<void> {
  if (!redisAvailable) {
    memoryStore.delete(key);
    return;
  }
  try {
    await withTimeout(redis.del(key));
  } catch (e) {
    console.warn('[OTP] Redis DEL échoué, fallback mémoire :', (e as Error).message);
  }
  // Toujours nettoyer la mémoire aussi (double source)
  memoryStore.delete(key);
}

// --- Service OTP ---

class OTPService {
  private key(phone: string): string {
    return `otp:${phone}`;
  }

  private generateCode(): string {
    return crypto.randomInt(100000, 999999).toString().padStart(6, '0');
  }

  async sendOTP(phone: string): Promise<{ devCode?: string }> {
    const code = this.generateCode();
    const data: OTPData = { code, attempts: 0 };

    await storeSet(this.key(phone), data, OTP_TTL_SECONDS);

    // En dev/test : logger le code et le retourner (pas de SMS)
    if (env.NODE_ENV !== 'production') {
      console.log(`[OTP DEV] ${phone} → ${code}`);
      return { devCode: code };
    }

    const AfricasTalking = require('africastalking') as ATFactory;
    const at = AfricasTalking({
      apiKey: env.AFRICAS_TALKING_API_KEY ?? '',
      username: env.AFRICAS_TALKING_USERNAME,
    });

    await at.SMS.send({
      to: [phone],
      message: `Votre code Wapi : ${code}\nValable 5 minutes.`,
    });

    return {};
  }

  async verifyOTP(
    phone: string,
    code: string
  ): Promise<{ valid: boolean; attemptsLeft: number; reason?: 'expired' | 'max_attempts' | 'wrong_code' }> {
    const data = await storeGet(this.key(phone));

    if (!data) {
      return { valid: false, attemptsLeft: 0, reason: 'expired' };
    }

    data.attempts += 1;

    if (data.attempts > MAX_ATTEMPTS) {
      await storeDel(this.key(phone));
      return { valid: false, attemptsLeft: 0, reason: 'max_attempts' };
    }

    if (data.code !== code) {
      await storeSet(this.key(phone), data, OTP_TTL_SECONDS);
      return { valid: false, attemptsLeft: MAX_ATTEMPTS - data.attempts, reason: 'wrong_code' };
    }

    await storeDel(this.key(phone));
    return { valid: true, attemptsLeft: MAX_ATTEMPTS - data.attempts };
  }

  async invalidateOTP(phone: string): Promise<void> {
    await storeDel(this.key(phone));
  }
}

export const otpService = new OTPService();
