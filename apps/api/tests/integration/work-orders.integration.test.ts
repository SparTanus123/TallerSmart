import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { prisma } from '../../src/lib/prisma';
import { createSession } from '../../src/modules/auth/auth.service';
import { createTestServer, type TestServer } from './test-helper';

describe('Integration: Work Orders Lifecycle & Endpoints (/api/v1/work-orders)', () => {
  let server: TestServer;
  let adminToken: string;
  let techToken: string;

  const adminUser = {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Admin User',
    email: 'admin@tallersmart.local',
    role: 'ADMIN' as const,
    active: true,
    workshopId: '00000000-0000-4000-8000-000000000000',
  };

  const techUser = {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Tech User',
    email: 'tech@tallersmart.local',
    role: 'TECHNICIAN' as const,
    active: true,
    workshopId: '00000000-0000-4000-8000-000000000000',
  };

  const sampleOrder: any = {
    id: '77777777-7777-7777-7777-777777777777',
    number: 'OT-2026-0042',
    vehicleId: '88888888-8888-8888-8888-888888888888',
    clientId: '99999999-9999-9999-9999-999999999999',
    technicianId: techUser.id,
    createdById: adminUser.id,
    status: 'RECEIVED',
    urgency: 'MEDIUM',
    complaint: 'Fuga de aceite visible bajo el cárter y pérdida de potencia',
    diagnosis: null,
    notes: null,
    mileageIn: 88500,
    mileageOut: null,
    total: 0,
    workshopId: adminUser.workshopId,
    createdAt: new Date(),
    updatedAt: new Date(),
    vehicle: {
      make: 'Ford',
      model: 'Fiesta',
      year: 2017,
      plate: 'FRD111',
      vin: '3FADP4BJ2HM000000',
      currentClient: { name: 'Lucia Ramirez' },
    },
    client: {
      name: 'Lucia Ramirez',
      phone: '+57 312 999 8888',
      email: 'lucia@example.com',
    },
    technician: techUser,
    items: [],
    intakePhotos: [],
    events: [],
    reportApprovedBy: null,
  };

  before(async () => {
    (prisma.user.findUnique as any) = async (args: { where: { id?: string } }) => {
      if (args.where.id === adminUser.id) return adminUser;
      if (args.where.id === techUser.id) return techUser;
      return null;
    };

    (prisma.workOrder.findMany as any) = async () => [sampleOrder];
    (prisma.workOrder.findUnique as any) = async (args: { where: { id?: string } }) => {
      if (args.where.id === sampleOrder.id) return sampleOrder;
      return null;
    };
    (prisma.workOrder.findUniqueOrThrow as any) = async (args: { where: { id?: string } }) => {
      if (args.where.id === sampleOrder.id) return sampleOrder;
      throw Object.assign(new Error('Record not found'), { code: 'P2025' });
    };

    (prisma.$transaction as any) = async (callback: any) => {
      const tx = {
        workOrder: {
          findUniqueOrThrow: async () => ({ ...sampleOrder }),
          update: async (args: any) => ({ ...sampleOrder, ...args.data }),
        },
        workOrderItem: {
          count: async () => 0,
          findMany: async () => [],
        },
        workOrderEvent: {
          create: async () => ({ id: 'event-uuid' }),
        },
      };
      return callback(tx);
    };

    server = await createTestServer();
    adminToken = createSession(adminUser.id);
    techToken = createSession(techUser.id);
  });

  after(async () => {
    await server.close();
  });

  it('GET /api/v1/work-orders returns list of active orders', async () => {
    const res = await server.request('/api/v1/work-orders', { token: adminToken });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body));
    assert.strictEqual(body[0].number, 'OT-2026-0042');
  });

  it('GET /api/v1/work-orders/:id returns specific work order detail', async () => {
    const res = await server.request(`/api/v1/work-orders/${sampleOrder.id}`, { token: adminToken });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.id, sampleOrder.id);
    assert.strictEqual(body.vehicle.plate, 'FRD111');
  });

  it('PATCH /api/v1/work-orders/:id/status rejects invalid transition (RECEIVED -> DELIVERED) with 409', async () => {
    const res = await server.request(`/api/v1/work-orders/${sampleOrder.id}/status`, {
      method: 'PATCH',
      token: adminToken,
      body: JSON.stringify({ status: 'DELIVERED' }),
    });

    assert.strictEqual(res.status, 409);
    const body = await res.json();
    assert.strictEqual(body.error, 'INVALID_STATUS_TRANSITION');
  });

  it('PATCH /api/v1/work-orders/:id/status allows valid transition (RECEIVED -> DIAGNOSING)', async () => {
    const res = await server.request(`/api/v1/work-orders/${sampleOrder.id}/status`, {
      method: 'PATCH',
      token: techToken,
      body: JSON.stringify({ status: 'DIAGNOSING' }),
    });

    assert.strictEqual(res.status, 200);
  });

  it('GET /api/v1/work-orders/:id/documents/intake returns generated PDF with proper mime headers', async () => {
    const res = await server.request(`/api/v1/work-orders/${sampleOrder.id}/documents/intake`, {
      token: adminToken,
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get('content-type'), 'application/pdf');
    assert.ok(res.headers.get('content-disposition')?.includes('OT-2026-0042-intake.pdf'));
  });

  it('GET /api/v1/work-orders/:id/documents/unknown returns 404 DOCUMENT_TYPE_NOT_FOUND', async () => {
    const res = await server.request(`/api/v1/work-orders/${sampleOrder.id}/documents/non-existent-doc`, {
      token: adminToken,
    });

    assert.strictEqual(res.status, 404);
    const body = await res.json();
    assert.strictEqual(body.error, 'DOCUMENT_TYPE_NOT_FOUND');
  });
});
