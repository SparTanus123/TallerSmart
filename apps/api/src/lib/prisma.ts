import { PrismaClient } from '@prisma/client';
import { AsyncLocalStorage } from 'node:async_hooks';

export const tenantContext = new AsyncLocalStorage<string>();

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
const tenantModels = new Set(['User', 'Client', 'Vehicle', 'CatalogItem', 'WorkOrder', 'IntakePhoto', 'WorkOrderItem', 'WorkOrderEvent', 'VehicleEvent']);
prisma.$use(async (params, next) => {
  const workshopId = tenantContext.getStore();
  if (!workshopId || !params.model || !tenantModels.has(params.model)) return next(params);
  const args = (params.args ??= {}) as Record<string, any>;
  const scope = { workshopId };
  if (['findUnique', 'findFirst', 'findMany', 'count', 'aggregate', 'groupBy', 'update', 'updateMany', 'delete', 'deleteMany'].includes(params.action)) {
    args.where = { ...(args.where ?? {}), ...scope };
  }
  if (params.action === 'create') args.data = { ...(args.data ?? {}), ...scope };
  if (params.action === 'createMany') args.data = (Array.isArray(args.data) ? args.data : [args.data]).map((row: object) => ({ ...row, ...scope }));
  if (params.action === 'upsert') {
    args.where = { ...(args.where ?? {}), ...scope };
    args.create = { ...(args.create ?? {}), ...scope };
    args.update = { ...(args.update ?? {}), ...scope };
  }
  return next(params);
});
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
