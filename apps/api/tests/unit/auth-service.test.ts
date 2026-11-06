import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import { createSession, readSession } from '../../src/modules/auth/auth.service';

describe('Unit: Authentication Service & HMAC Session Tokens', () => {
  before(() => {
    process.env.JWT_SECRET = 'wV6O5Rhu98VF93w3e-c9zKIEQqK4stbq0H2e1TMCdzzLp2mqjwIKog-mGyJ4AfEV';
  });

  it('creates a signed token containing payload and base64url HMAC signature', () => {
    const userId = '11111111-2222-3333-4444-555555555555';
    const token = createSession(userId);

    assert.ok(typeof token === 'string' && token.includes('.'), 'Token must be dot-separated string');
    const [payloadB64, signature] = token.split('.');
    assert.ok(payloadB64 && signature, 'Token must have both payload and signature parts');

    const decoded = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    assert.strictEqual(decoded.sub, userId, 'Subject in payload must match userId');
    assert.ok(decoded.exp > Math.floor(Date.now() / 1000), 'Expiration must be in the future');
  });

  it('successfully reads and verifies a valid, non-expired session token', () => {
    const userId = 'abcdef12-3456-7890-abcd-ef1234567890';
    const token = createSession(userId);

    const verifiedUserId = readSession(token);
    assert.strictEqual(verifiedUserId, userId, 'Extracted userId must match input');
  });

  it('rejects a token if the payload was tampered with', () => {
    const originalToken = createSession('user-original');
    const [originalPayload, signature] = originalToken.split('.');

    // Tamper with payload: replace userId with another
    const tamperedObj = { sub: 'user-attacker', exp: Math.floor(Date.now() / 1000) + 3600 };
    const tamperedPayload = Buffer.from(JSON.stringify(tamperedObj)).toString('base64url');
    const forgedToken = `${tamperedPayload}.${signature}`;

    const result = readSession(forgedToken);
    assert.strictEqual(result, null, 'Tampered payload with mismatched signature must be rejected');
  });

  it('rejects a token if the signature was altered', () => {
    const validToken = createSession('user-valid');
    const [payload, signature] = validToken.split('.');

    const corruptedSignature = signature.slice(0, -2) + (signature.slice(-2) === 'aa' ? 'bb' : 'aa');
    const tamperedToken = `${payload}.${corruptedSignature}`;

    const result = readSession(tamperedToken);
    assert.strictEqual(result, null, 'Corrupted signature must be rejected');
  });

  it('rejects an expired token', () => {
    const expiredPayloadObj = {
      sub: 'user-expired',
      exp: Math.floor(Date.now() / 1000) - 60, // 1 minute in the past
    };
    const expiredPayload = Buffer.from(JSON.stringify(expiredPayloadObj)).toString('base64url');
    
    // Sign it with valid secret
    const { createHmac } = require('node:crypto');
    const sig = createHmac('sha256', process.env.JWT_SECRET!).update(expiredPayload).digest('base64url');
    const expiredToken = `${expiredPayload}.${sig}`;

    const result = readSession(expiredToken);
    assert.strictEqual(result, null, 'Expired session must return null');
  });

  it('rejects malformed token strings safely', () => {
    assert.strictEqual(readSession(''), null);
    assert.strictEqual(readSession('randomstringwithoutdot'), null);
    assert.strictEqual(readSession('not.base64.or.valid.json'), null);
    assert.strictEqual(readSession('...'), null);
  });
});
