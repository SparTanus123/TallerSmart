import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { prisma } from '../../src/lib/prisma';
import { createTestServer, type TestServer } from './test-helper';

describe('Integration: Health & Global HTTP Security Headers', () => {
  let server: TestServer;

  before(async () => {
    // Stub database check for instant deterministic response
    prisma.$queryRaw = (async () => [{ '?column?': 1 }]) as any;
    server = await createTestServer();
  });

  after(async () => {
    await server.close();
  });

  it('serves GET /health with 200 OK and connected database status', async () => {
    const res = await server.request('/health');
    assert.strictEqual(res.status, 200);

    const body = await res.json();
    assert.strictEqual(body.status, 'ok');
    assert.strictEqual(body.service, 'api');
    assert.strictEqual(body.database, 'connected');
  });

  it('applies mandatory security headers on all responses (RNF-09 / OWASP ASVS)', async () => {
    const res = await server.request('/health');

    assert.strictEqual(
      res.headers.get('x-content-type-options'),
      'nosniff',
      'Must enforce X-Content-Type-Options: nosniff'
    );
    assert.strictEqual(
      res.headers.get('x-frame-options'),
      'SAMEORIGIN',
      'Must prevent clickjacking with X-Frame-Options: SAMEORIGIN'
    );
    assert.strictEqual(
      res.headers.get('content-security-policy'),
      "default-src 'self'",
      'Must enforce Content-Security-Policy'
    );
    assert.strictEqual(
      res.headers.get('strict-transport-security'),
      'max-age=31536000; includeSubDomains',
      'Must enforce Strict-Transport-Security (HSTS)'
    );
    assert.strictEqual(
      res.headers.get('x-powered-by'),
      null,
      'X-Powered-By header must be disabled to prevent framework fingerprinting'
    );
  });

  it('configures CORS origin handling according to whitelist', async () => {
    const resAllowed = await server.request('/health', {
      headers: { Origin: 'http://localhost:3000' },
    });
    assert.strictEqual(
      resAllowed.headers.get('access-control-allow-origin'),
      'http://localhost:3000',
      'Permitted origin must be allowed'
    );
    assert.strictEqual(
      resAllowed.headers.get('access-control-allow-credentials'),
      'true',
      'Credentials must be allowed for trusted origin'
    );
  });

  it('protects unmapped API routes with mandatory authentication returning 401', async () => {
    const res = await server.request('/api/v1/non-existent-route');
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.error, 'AUTHENTICATION_REQUIRED');
  });

  it('returns 404 for unmapped routes outside API scope', async () => {
    const res = await server.request('/not-found-random');
    assert.strictEqual(res.status, 404);
  });
});
