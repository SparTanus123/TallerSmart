import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { prisma } from '../../src/lib/prisma';
import { createSession } from '../../src/modules/auth/auth.service';
import { createTestServer, type TestServer } from './test-helper';

describe('Integration: Role-Based Access Control (RBAC) & Route Security', () => {
  let server: TestServer;

  const adminUser = {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Admin User',
    email: 'admin@tallersmart.local',
    role: 'ADMIN' as const,
    active: true,
    workshopId: '00000000-0000-4000-8000-000000000000',
  };

  const advisorUser = {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Advisor User',
    email: 'advisor@tallersmart.local',
    role: 'ADVISOR' as const,
    active: true,
    workshopId: '00000000-0000-4000-8000-000000000000',
  };

  const technicianUser = {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Technician User',
    email: 'tech@tallersmart.local',
    role: 'TECHNICIAN' as const,
    active: true,
    workshopId: '00000000-0000-4000-8000-000000000000',
  };

  before(async () => {
    (prisma.user.findUnique as any) = async (args: { where: { id?: string } }) => {
      const id = args.where.id;
      if (id === adminUser.id) return adminUser;
      if (id === advisorUser.id) return advisorUser;
      if (id === technicianUser.id) return technicianUser;
      return null;
    };

    (prisma.user.findMany as any) = async () => [adminUser, advisorUser, technicianUser];

    server = await createTestServer();
  });

  after(async () => {
    await server.close();
  });

  it('allows ADMIN to access user management endpoint GET /api/v1/users', async () => {
    const token = createSession(adminUser.id);
    const res = await server.request('/api/v1/users', { token });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body));
  });

  it('allows ADVISOR to view users list', async () => {
    const token = createSession(advisorUser.id);
    const res = await server.request('/api/v1/users', { token });

    assert.strictEqual(res.status, 200);
  });

  it('blocks TECHNICIAN from viewing users list with 403 FORBIDDEN', async () => {
    const token = createSession(technicianUser.id);
    const res = await server.request('/api/v1/users', { token });

    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.strictEqual(body.error, 'FORBIDDEN');
  });

  it('blocks ADVISOR from creating new users (POST /api/v1/users is ADMIN-only)', async () => {
    const token = createSession(advisorUser.id);
    const res = await server.request('/api/v1/users', {
      method: 'POST',
      token,
      body: JSON.stringify({
        name: 'New Person',
        email: 'person@example.com',
        role: 'TECHNICIAN',
        password: 'Password1234!',
      }),
    });

    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.strictEqual(body.error, 'FORBIDDEN');
  });

  it('blocks TECHNICIAN from deleting clients (DELETE /api/v1/clients/:id is ADMIN-only)', async () => {
    const token = createSession(technicianUser.id);
    const res = await server.request('/api/v1/clients/44444444-4444-4444-4444-444444444444', {
      method: 'DELETE',
      token,
    });

    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.strictEqual(body.error, 'FORBIDDEN');
  });
});
