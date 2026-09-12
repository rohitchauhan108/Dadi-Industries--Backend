import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { config } from './config.js';
import { phonePeConfigured } from './payment.js';
import { emailConfigured } from './email.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: config.frontendUrl }));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));

app.get('/', (_req, res) => res.send('backend in running'));
app.get('/api/health', (_req, res) => res.json({ ok: true, paymentConfigured: phonePeConfigured, emailConfigured }));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/wishlist', wishlistRoutes);

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof z.ZodError) return res.status(400).json({ message: 'Invalid request', errors: error.issues });
  if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
    return res.status(409).json({ message: 'An account with this email already exists. Please sign in instead.' });
  }
  if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError') {
    return res.status(400).json({ message: 'Invalid account details.' });
  }
  const message = error instanceof Error ? error.message : 'Internal server error';
  const status = message.includes('not found') || message.includes('unavailable') ? 400 : 500;
  res.status(status).json({ message });
});

export default app;
