import crypto from 'crypto';
import { redis } from '../config/redis';
import { env } from '../config/env';

const OTP_TTL_SECONDS = 300;
const MAX_ATTEMPTS = 3;

interface OTPData {
  code: string;
  attempts: number;
}

/* eslint-disable @typescript-eslint/no-require-imports */
type ATInstance = {
  SMS: {
    send: (params: { to: string[]; message: string }) => Promise<unknown>;
  };
};
type ATFactory = (opts: { apiKey: string; username: string }) => ATInstance;

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

    await redis.setex(this.key(phone), OTP_TTL_SECONDS, JSON.stringify(data));

    if (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') {
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
    const raw = await redis.get(this.key(phone));

    if (!raw) {
      return { valid: false, attemptsLeft: 0, reason: 'expired' };
    }

    const data: OTPData = JSON.parse(raw) as OTPData;
    data.attempts += 1;

    if (data.attempts > MAX_ATTEMPTS) {
      await redis.del(this.key(phone));
      return { valid: false, attemptsLeft: 0, reason: 'max_attempts' };
    }

    if (data.code !== code) {
      await redis.setex(this.key(phone), OTP_TTL_SECONDS, JSON.stringify(data));
      return { valid: false, attemptsLeft: MAX_ATTEMPTS - data.attempts, reason: 'wrong_code' };
    }

    await redis.del(this.key(phone));
    return { valid: true, attemptsLeft: MAX_ATTEMPTS - data.attempts };
  }

  async invalidateOTP(phone: string): Promise<void> {
    await redis.del(this.key(phone));
  }
}

export const otpService = new OTPService();
