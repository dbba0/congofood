import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

/** Schéma de validation des variables d'environnement avec Zod */
const envSchema = z.object({
  PORT: z.string().default('3000').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  MONGODB_URI: z.string().min(1, 'MONGODB_URI est requis'),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET doit faire au moins 32 caractères'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET doit faire au moins 32 caractères'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  CINETPAY_API_KEY: z.string().optional(),
  CINETPAY_SITE_ID: z.string().optional(),
  CINETPAY_NOTIFY_URL: z.string().url().optional(),

  AFRICAS_TALKING_API_KEY: z.string().optional(),
  AFRICAS_TALKING_USERNAME: z.string().default('sandbox'),

  FCM_SERVER_KEY: z.string().optional(),

  CLOUDINARY_URL: z.string().optional(),

  REDIS_URL: z.string().default('redis://localhost:6379'),

  CLIENT_URL: z.string().default('http://localhost:8081'),
  ADMIN_URL: z.string().default('http://localhost:3001'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Variables d\'environnement invalides :');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
