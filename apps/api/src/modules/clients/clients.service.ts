import { prisma } from '../../lib/prisma';
export function listClients(search = '') {
  const q = search.trim();
  return prisma.client.findMany({ where: q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { phone: { contains: q } }, { email: { contains: q, mode: 'insensitive' } }] } : {}, include: { vehicles: true }, orderBy: { name: 'asc' } });
}
export function getClient(id: string) { return prisma.client.findUnique({ where: { id }, include: { vehicles: true, orders: { orderBy: { createdAt: 'desc' }, take: 20 } } }); }
export function createClient(data: { name: string; phone: string; email?: string; type: 'PERSONAL' | 'COMPANY' }) { return prisma.client.create({ data: { ...data, email: data.email || null } }); }
export function updateClient(id: string, data: { name?: string; phone?: string; email?: string; type?: 'PERSONAL' | 'COMPANY' }) { return prisma.client.update({ where: { id }, data: { ...data, ...(data.email !== undefined ? { email: data.email || null } : {}) } }); }
