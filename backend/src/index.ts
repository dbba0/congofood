import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';

import { env } from './config/env';
import { setIO } from './config/socket';
import healthRoutes from './routes/health';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import restaurantRoutes from './routes/restaurants';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import deliveryRoutes from './routes/deliveries';
import paymentRoutes from './routes/payments';

const app = express();
const httpServer = createServer(app);

// Health check en premier — Railway l'appelle sans auth
app.use('/health', healthRoutes);

// Socket.io pour le suivi en temps réel des livraisons
const io = new SocketServer(httpServer, {
  cors: {
    origin: [env.CLIENT_URL, env.ADMIN_URL],
    methods: ['GET', 'POST'],
  },
});

// --- Origines CORS autorisées (inclut localhost pour dev Expo) ---
const allowedOrigins = [
  'http://localhost:8081',
  'http://localhost:3000',
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
].filter(Boolean) as string[];

// --- Middlewares ---
app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// --- Routes API ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/payments', paymentRoutes);

// --- Gestionnaire d'erreurs global ---
app.use(
  (
    err: Error & { status?: number },
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(err.status ?? 500).json({
      success: false,
      error:
        process.env.NODE_ENV === 'production' ? 'Erreur serveur' : err.message,
    });
  }
);

// --- Connexion MongoDB + démarrage ---
async function start() {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ MongoDB connecté');

    httpServer.listen(env.PORT, () => {
      console.log(`🚀 CongoFood API démarrée sur le port ${env.PORT}`);
      console.log(`🌍 Environnement : ${env.NODE_ENV}`);
    });
  } catch (err) {
    console.error('❌ Impossible de démarrer le serveur :', err);
    process.exit(1);
  }
}

setIO(io);

start();
