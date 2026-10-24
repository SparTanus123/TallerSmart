import { prisma } from '../../lib/prisma';
export const workOrderInclude = { vehicle: { include: { currentClient: true } }, client: true, technician: true, items: true, events: { include: { actor: true }, orderBy: { createdAt: 'asc' as const } }, reportApprovedBy: true };
export const allowedTransitions: Record<string, string[]> = { RECEIVED: ['DIAGNOSING'], DIAGNOSING: ['IN_PROGRESS', 'WAITING_PARTS'], IN_PROGRESS: ['WAITING_PARTS', 'COMPLETED'], WAITING_PARTS: ['IN_PROGRESS'], COMPLETED: ['DELIVERED'] };
export function listWorkOrders() { return prisma.workOrder.findMany({ include: workOrderInclude, orderBy: { createdAt: 'desc' }, take: 200 }); }
export function getWorkOrder(id: string) { return prisma.workOrder.findUnique({ where: { id }, include: workOrderInclude }); }
