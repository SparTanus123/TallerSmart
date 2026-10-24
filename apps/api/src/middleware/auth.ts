import type { RequestHandler } from 'express';
import { sessionUser } from '../modules/auth/auth.service';
import type { UserRole } from '@prisma/client';
import { tenantContext } from '../lib/prisma';

export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    const bearer = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : undefined;
    const token = bearer ?? req.headers.cookie?.split(';').map(part => part.trim()).find(part => part.startsWith('ts_session='))?.slice('ts_session='.length);
    const user = token ? await sessionUser(token) : null;
    if (!user) return res.status(401).json({ error: 'AUTHENTICATION_REQUIRED' });
    res.locals.user = user;
    tenantContext.run(user.workshopId, next);
  } catch (error) { next(error); }
};

export function requireRoles(...roles: UserRole[]): RequestHandler {
  return (_req, res, next) => {
    const user = res.locals.user as { role?: UserRole } | undefined;
    if (!user || !roles.includes(user.role as UserRole)) return res.status(403).json({ error: 'FORBIDDEN' });
    next();
  };
}
