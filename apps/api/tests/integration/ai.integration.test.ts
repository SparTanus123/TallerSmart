import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { prisma } from '../../src/lib/prisma';
import { createSession } from '../../src/modules/auth/auth.service';
import { createTestServer, type TestServer } from './test-helper';

describe('Integration: AI SmartMec Copilot Endpoints (/api/v1/ai)', () => {
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
    (prisma.workOrder.findMany as any) = async () => [];

    server = await createTestServer();
    adminToken = createSession(adminUser.id);
  });

  after(async () => {
    await server.close();
  });

  it('GET /api/v1/ai/status returns SmartMec agent metadata', async () => {
    const res = await server.request('/api/v1/ai/status', { token: adminToken });
    assert.strictEqual(res.status, 200);

    const body = await res.json();
    assert.strictEqual(body.agent.name, 'SmartMec');
    assert.ok(Array.isArray(body.agent.capabilities));
    assert.ok(typeof body.gemini === 'object');
  });

  it('GET /api/v1/ai/briefing returns operational summary and suggestions', async () => {
    const res = await server.request('/api/v1/ai/briefing', { token: adminToken });
    assert.strictEqual(res.status, 200);

    const body = await res.json();
    assert.ok(typeof body.briefing === 'string');
    assert.ok(Array.isArray(body.suggestions));
    assert.ok(typeof body.stats === 'object');
  });

  it('POST /api/v1/ai/intake validates complaint length (min 5 chars)', async () => {
    const res = await server.request('/api/v1/ai/intake', {
      method: 'POST',
      token: adminToken,
      body: JSON.stringify({ complaint: 'bad' }),
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.error, 'VALIDATION_ERROR');
  });

  it('POST /api/v1/ai/preventive generates maintenance recommendation plan', async () => {
    const res = await server.request('/api/v1/ai/preventive', {
      method: 'POST',
      token: adminToken,
      body: JSON.stringify({
        make: 'Toyota',
        model: 'Corolla',
        year: 2021,
        mileage: 40000,
      }),
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.agent, 'SmartMec');
    assert.ok(body.data !== undefined || body.raw !== undefined, 'Must provide preventive recommendations or raw output');
  });
});
