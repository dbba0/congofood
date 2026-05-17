import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';

import { env } from './config/env';
import { setIO } from './config/socket';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import restaurantRoutes from './routes/restaurants';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import deliveryRoutes from './routes/deliveries';
import paymentRoutes from './routes/payments';

const app = express();
const httpServer = createServer(app);

// Socket.io pour le suivi en temps réel des livraisons
const io = new SocketServer(httpServer, {
  cors: {
    origin: [env.CLIENT_URL, env.ADMIN_URL],
    methods: ['GET', 'POST'],
  },
});

// --- Middlewares ---
app.use(helmet());
app.use(cors({ origin: [env.CLIENT_URL, env.ADMIN_URL], credentials: true }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Gestionnaire d'erreurs global ---
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
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
