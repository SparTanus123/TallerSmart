import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { prisma } from '../../src/lib/prisma';
import { hashPassword } from '../../src/modules/auth/password';
import { createTestServer, type TestServer } from './test-helper';

describe('Integration: Authentication Routes (/api/v1/auth)', () => {
  let server: TestServer;

  const testUser = {
    id: '11111111-2222-3333-4444-555555555555',
    name: 'Admin Taller',
    email: 'admin@tallersmart.local',
    passwordHash: hashPassword('StrongPassword123!'),
    role: 'ADMIN' as const,
    active: true,
    workshopId: '00000000-0000-4000-8000-000000000000',
  };

  before(async () => {
    // Stub prisma.user.findUnique for auth service lookups
    (prisma.user.findUnique as any) = async (args: { where: { email?: string; id?: string } }) => {
      if (args.where.email && args.where.email.toLowerCase() === testUser.email.toLowerCase()) {
        return testUser;
      }
      if (args.where.id && args.where.id === testUser.id) {
        return testUser;
      }
      return null;
    };

    server = await createTestServer();
  });

  after(async () => {
    await server.close();
  });

  it('rejects login with malformed email or missing password (400 VALIDATION_ERROR)', async () => {
    const res = await server.request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'not-an-email', password: '123' }),
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.error, 'VALIDATION_ERROR');
    assert.ok(body.message.includes('email') || body.details);
  });

  it('rejects login with incorrect password (401 INVALID_CREDENTIALS)', async () => {
    const res = await server.request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: testUser.email, password: 'WrongPassword999!' }),
    });

    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.error, 'INVALID_CREDENTIALS');
  });

  it('rejects login for non-existent user email (401 INVALID_CREDENTIALS)', async () => {
    const res = await server.request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'ghost@tallersmart.local', password: 'StrongPassword123!' }),
    });

    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.error, 'INVALID_CREDENTIALS');
  });

  it('authenticates valid credentials, sets HttpOnly cookie, and returns user profile', async () => {
    const res = await server.request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: testUser.email, password: 'StrongPassword123!' }),
    });

    assert.strictEqual(res.status, 200);
    const cookieHeader = res.headers.get('set-cookie');
    assert.ok(cookieHeader, 'Must set session cookie');
    assert.ok(cookieHeader.includes('ts_session='), 'Cookie name must be ts_session');
    assert.ok(cookieHeader.includes('HttpOnly'), 'Cookie must be HttpOnly for security');

    const body = await res.json();
    assert.strictEqual(body.user.email, testUser.email);
    assert.strictEqual(body.user.role, 'ADMIN');
    assert.strictEqual(body.user.passwordHash, undefined, 'passwordHash must never be leaked');
  });

  it('GET /api/v1/auth/me returns 401 when no token is provided', async () => {
    const res = await server.request('/api/v1/auth/me');
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.error, 'AUTHENTICATION_REQUIRED');
  });

  it('GET /api/v1/auth/me returns current user when valid Bearer token is provided', async () => {
    const { createSession } = await import('../../src/modules/auth/auth.service');
    const validToken = createSession(testUser.id);

    const res = await server.request('/api/v1/auth/me', {
      token: validToken,
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.user.id, testUser.id);
    assert.strictEqual(body.user.email, testUser.email);
    assert.strictEqual(body.user.role, 'ADMIN');
  });

  it('POST /api/v1/auth/logout returns 204 and clears session cookie', async () => {
    const res = await server.request('/api/v1/auth/logout', {
      method: 'POST',
    });

    assert.strictEqual(res.status, 204);
    const cookieHeader = res.headers.get('set-cookie');
    assert.ok(cookieHeader, 'Set-Cookie should be returned to clear cookie');
    assert.ok(
      cookieHeader.includes('ts_session=;') || cookieHeader.includes('Max-Age=0') || cookieHeader.includes('Expires='),
      'Must clear ts_session cookie'
    );
  });
});
