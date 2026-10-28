import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from './lib/prisma';
import authRouter from './modules/auth/auth.router';
import usersRouter from './modules/users/users.router';
import { requireAuth } from './middleware/auth';
import clientsRouter from './modules/clients/clients.router';
import vehiclesRouter from './modules/vehicles/vehicles.router';
import catalogRouter from './modules/catalog/catalog.router';
import workOrdersRouter from './modules/work-orders/work-orders.router';
import aiRouter from './modules/ai/ai.router';

const app = express();
app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:3000,http://localhost:8443').split(',').map(v => v.trim());
const originAllowed = (origin?: string) => {
  if (!origin || allowedOrigins.includes(origin)) return true;
  if (process.env.NODE_ENV === 'production') return false;
  try { const { protocol, hostname } = new URL(origin); return ['http:', 'https:'].includes(protocol) && ['localhost', '127.0.0.1', '::1'].includes(hostname); } catch { return false; }
};
app.use(cors({ credentials: true, origin: (origin, callback) => originAllowed(origin) ? callback(null, true) : callback(new Error(`ORIGIN_NOT_ALLOWED: ${origin}`)) }));
app.use(express.json({ limit: '7mb' }));
app.get('/health', async (_req, res) => { try { await prisma.$queryRaw`SELECT 1`; res.json({ status: 'ok', service: 'api', database: 'connected' }); } catch { res.status(503).json({ status: 'error', service: 'api', database: 'unavailable' }); } });
const api = express.Router();
api.use('/auth', authRouter);
api.use(requireAuth);
api.use('/users', usersRouter);
api.use('/clients', clientsRouter);
api.use('/vehicles', vehiclesRouter);
api.use('/catalog', catalogRouter);
api.use('/work-orders', workOrdersRouter);
api.use('/ai', aiRouter);
app.use('/api/v1', api);
app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof ZodError) return res.status(400).json({ error: 'VALIDATION_ERROR', details: error.flatten() });
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'NOT_FOUND' });
    if (error.code === 'P2002') return res.status(409).json({ error: 'DUPLICATE_VALUE', fields: error.meta?.target });
    if (error.code === 'P2003') return res.status(409).json({ error: 'RELATED_RECORD_CONFLICT' });
  }
  const status = typeof error === 'object' && error !== null && 'status' in error && typeof error.status === 'number' ? error.status : 500;
  const message = status >= 500 && process.env.NODE_ENV === 'production' ? 'INTERNAL_SERVER_ERROR' : (error instanceof Error ? error.message : 'INTERNAL_ERROR');
  if (status >= 500) console.error(error);
  res.status(status).json({ error: message });
});

const port = Number(process.env.PORT ?? 3001);
const server = app.listen(port, () => console.log(`TallerSmart API listening on :${port}`));
const shutdown = async () => { server.close(); await prisma.$disconnect(); process.exit(0); };
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
