import { prisma } from '../../lib/prisma';
export function listVehicles(search = '', clientId?: string) {
  const q = search.trim();
  return prisma.vehicle.findMany({ where: { ...(clientId ? { currentClientId: clientId } : {}), ...(q ? { OR: [{ plate: { contains: q, mode: 'insensitive' } }, { make: { contains: q, mode: 'insensitive' } }, { model: { contains: q, mode: 'insensitive' } }] } : {}) }, include: { currentClient: true }, orderBy: { plate: 'asc' } });
}
export function createVehicle(data: { currentClientId: string; plate: string; vin?: string; make: string; model: string; year: number; mileage: number; color?: string }) { return prisma.vehicle.create({ data: { ...data, vin: data.vin || null, color: data.color || null }, include: { currentClient: true } }); }
