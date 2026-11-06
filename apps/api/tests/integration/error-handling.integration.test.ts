import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { Prisma } from '@prisma/client';
import { prisma } from '../../src/lib/prisma';
import { createSession } from '../../src/modules/auth/auth.service';
import { createTestServer, type TestServer } from './test-helper';

describe('Integration: Error Handling Middleware & Boundary Contracts', () => {
  let server: TestServer;
  let adminToken: string;

  const adminUser = {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Admin User',
    email: 'admin@tallersmart.local',
    role: 'ADMIN' as const,
    active: true,
    workshopId: '00000000-0000-4000-8000-000000000000',
  };

  before(async () => {
    (prisma.user.findUnique as any) = async () => adminUser;

    server = await createTestServer();
    adminToken = createSession(adminUser.id);
  });

  after(async () => {
    await server.close();
  });

  it('translates Zod validation errors to 400 with VALIDATION_ERROR and details', async () => {
    const res = await server.request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.error, 'VALIDATION_ERROR');
    assert.ok(body.message);
    assert.ok(body.details);
  });

  it('translates Prisma P2025 (Record not found) to 404 NOT_FOUND', async () => {
    (prisma.workOrder.findUnique as any) = async () => null;

    const res = await server.request('/api/v1/work-orders/00000000-0000-4000-8000-000000000999', {
      token: adminToken,
    });

    assert.strictEqual(res.status, 404);
    const body = await res.json();
    assert.strictEqual(body.error, 'WORK_ORDER_NOT_FOUND');
  });

  it('translates Prisma P2002 (Duplicate value) to 409 DUPLICATE_VALUE', async () => {
    (prisma.vehicle.create as any) = async () => {
      const err = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '5.22.0',
        meta: { target: ['plate'] },
      });
      throw err;
    };
    (prisma.client.findFirst as any) = async () => ({ id: 'client-id' });

    const res = await server.request('/api/v1/vehicles', {
      method: 'POST',
      token: adminToken,
      body: JSON.stringify({
        currentClientId: '11111111-2222-3333-4444-555555555555',
        plate: 'DUP123',
        make: 'Renault',
        year: 2020,
        mileage: 50000,
      }),
    });

    assert.strictEqual(res.status, 409);
    const body = await res.json();
    assert.strictEqual(body.error, 'DUPLICATE_VALUE');
    assert.ok(body.message.includes('Ya existe un vehículo registrado con esta placa'));
  });

  it('translates Prisma P2003 (Foreign key conflict) to 409 RELATED_RECORD_CONFLICT', async () => {
    (prisma.client.create as any) = async () => {
      const err = new Prisma.PrismaClientKnownRequestError('Foreign key failed', {
        code: 'P2003',
        clientVersion: '5.22.0',
      });
      throw err;
    };

    const res = await server.request('/api/v1/clients', {
      method: 'POST',
      token: adminToken,
      body: JSON.stringify({
        name: 'Carlos Test',
        phone: '+57 300 111 2233',
      }),
    });

    assert.strictEqual(res.status, 409);
    const body = await res.json();
    assert.strictEqual(body.error, 'RELATED_RECORD_CONFLICT');
  });
});
