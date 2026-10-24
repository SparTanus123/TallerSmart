import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/modules/auth/password';
const prisma = new PrismaClient();
const actorId = '00000000-0000-4000-8000-000000000001';
const workshopId = '00000000-0000-4000-8000-000000000000';
async function main() {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminPassword || adminPassword.length < 12) throw new Error('Set SEED_ADMIN_PASSWORD to a value of at least 12 characters before seeding.');
  await prisma.workshop.upsert({ where: { id: workshopId }, update: {}, create: { id: workshopId, name: 'Taller principal' } });
  await prisma.user.upsert({ where: { id: actorId }, update: { passwordHash: hashPassword(adminPassword), workshopId }, create: { id: actorId, name: 'Administración Taller', email: 'admin@tallersmart.local', passwordHash: hashPassword(adminPassword), role: 'ADMIN', workshopId } });
  const clientId = '00000000-0000-4000-8000-000000000101';
  await prisma.client.upsert({ where: { id: clientId }, update: { workshopId }, create: { id: clientId, workshopId, name: 'Cliente de prueba', phone: '+57 300 000 0000', email: 'cliente@example.com', type: 'PERSONAL' } });
  const vehicleId = '00000000-0000-4000-8000-000000000201';
  await prisma.vehicle.upsert({ where: { id: vehicleId }, update: { workshopId }, create: { id: vehicleId, workshopId, currentClientId: clientId, plate: 'ABC123', make: 'Toyota', model: 'Hilux', year: 2021, mileage: 45000, color: 'Blanco' } });
  await prisma.catalogItem.upsert({ where: { code: 'SERV-DIAG' }, update: { workshopId }, create: { workshopId, type: 'SERVICE', code: 'SERV-DIAG', name: 'Diagnóstico general', description: 'Inspección y diagnóstico por técnico', unitPrice: 85000 } });
  await prisma.catalogItem.upsert({ where: { code: 'PART-FILTRO' }, update: { workshopId }, create: { workshopId, type: 'PART', code: 'PART-FILTRO', name: 'Filtro de aceite', description: 'Referencia según vehículo', unitPrice: 42000 } });
}
main().finally(() => prisma.$disconnect());
