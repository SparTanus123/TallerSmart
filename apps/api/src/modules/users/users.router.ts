import { Router } from 'express';
import { prisma } from '../../lib/prisma';
import { requireRoles } from '../../middleware/auth';
import { createUserSchema, updateUserSchema } from './users.schema';
import { createUser, listUsers, updateUser } from './users.service';

const router = Router();

router.get('/', requireRoles('ADMIN', 'ADVISOR'), async (_req, res, next) => {
  try {
    res.json(await listUsers());
  } catch (e) {
    next(e);
  }
});

router.post('/', requireRoles('ADMIN'), async (req, res, next) => {
  try {
    res.status(201).json(await createUser(createUserSchema.parse(req.body)));
  } catch (e) {
    next(e);
  }
});

router.patch('/:id', requireRoles('ADMIN'), async (req, res, next) => {
  try {
    const input = updateUserSchema.parse(req.body);
    const current = res.locals.user as { id: string };
    if (
      req.params.id === current.id &&
      (input.active === false || (input.role !== undefined && input.role !== 'ADMIN'))
    ) {
      return res.status(409).json({ error: 'CANNOT_REMOVE_OWN_ADMIN_ACCESS' });
    }
    const target = await prisma.user.findUniqueOrThrow({ where: { id: req.params.id } });
    if (
      target.active &&
      target.role === 'ADMIN' &&
      (input.active === false || (input.role !== undefined && input.role !== 'ADMIN')) &&
      (await prisma.user.count({ where: { active: true, role: 'ADMIN' } })) <= 1
    ) {
      return res.status(409).json({ error: 'CANNOT_REMOVE_LAST_ACTIVE_ADMIN' });
    }
    res.json(await updateUser(req.params.id, input));
  } catch (e) {
    next(e);
  }
});

export default router;
