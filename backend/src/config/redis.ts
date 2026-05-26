import Redis from 'ioredis';
import { env } from './env';

// Flag global — permet au fallback mémoire de savoir si Redis est utilisable
export let redisAvailable = false;

// Config optimisée pour Upstash (TLS) + Render (connexions instables)
export const redis = new Redis(env.REDIS_URL, {
  // Ne pas bloquer les requêtes avec des retries — fail fast
  maxRetriesPerRequest: null,
  // Ne pas accumuler les commandes quand Redis est déconnecté
  enableOfflineQueue: false,
  // Ne pas connecter au chargement du module
  lazyConnect: true,
  // Reconnexion automatique avec backoff exponentiel plafonné à 5s
  retryStrategy(times) {
    if (times > 10) return null; // Arrêter après 10 tentatives
    return Math.min(times * 200, 5000);
  },
  // TLS : ioredis détecte "rediss://" automatiquement,
  // mais on force tls: {} pour Upstash au cas où
  ...(env.REDIS_URL.startsWith('rediss://') ? { tls: {} } : {}),
});

redis.on('error', (err) => {
  redisAvailable = false;
  if (env.NODE_ENV !== 'test') {
    console.error('❌ Redis erreur :', err.message);
  }
});

redis.on('connect', () => {
  redisAvailable = true;
  if (env.NODE_ENV !== 'test') {
    console.log('✅ Redis connecté');
  }
});

redis.on('close', () => {
  redisAvailable = false;
});

// Tenter la connexion initiale sans bloquer le démarrage du serveur
redis.connect().catch((err) => {
  redisAvailable = false;
  console.warn('⚠️ Redis connexion initiale échouée :', err.message);
  console.warn('⚠️ Fallback mémoire activé pour les OTPs');
});
