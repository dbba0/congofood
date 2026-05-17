import Redis from 'ioredis';
import { env } from './env';

export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
});

redis.on('error', (err) => {
  if (env.NODE_ENV !== 'test') {
    console.error('❌ Redis erreur :', err.message);
  }
});

redis.on('connect', () => {
  if (env.NODE_ENV !== 'test') {
    console.log('✅ Redis connecté');
  }
});
