import { describe, it } from 'node:test';
import assert from 'node:assert';
import { hashPassword, verifyPassword } from '../../src/modules/auth/password';

describe('Unit: Password Hashing & Verification (PBKDF2)', () => {
  it('hashes password with PBKDF2, 310000 rounds, and a 16-byte random salt', () => {
    const raw = 'SuperSecret123!';
    const hashed = hashPassword(raw);

    assert.ok(hashed.startsWith('pbkdf2$310000$'), 'Hash should specify pbkdf2 scheme and 310,000 rounds');
    const parts = hashed.split('$');
    assert.strictEqual(parts.length, 4, 'Encoded hash must contain 4 segments: scheme, rounds, salt, hash');
    assert.strictEqual(parts[2].length, 32, 'Salt should be 32 hex characters (16 bytes)');
    assert.strictEqual(parts[3].length, 64, 'Digest should be 64 hex characters (SHA-256 32 bytes)');
  });

  it('generates different salts and hashes for the same password', () => {
    const raw = 'ConsistentPassword123!';
    const hash1 = hashPassword(raw);
    const hash2 = hashPassword(raw);

    assert.notStrictEqual(hash1, hash2, 'Subsequent hashes must have unique salts');
    assert.ok(verifyPassword(raw, hash1), 'Hash 1 must verify');
    assert.ok(verifyPassword(raw, hash2), 'Hash 2 must verify');
  });

  it('correctly verifies a matching password', () => {
    const raw = 'CorrectPassword999#';
    const hashed = hashPassword(raw);

    const isValid = verifyPassword(raw, hashed);
    assert.strictEqual(isValid, true, 'Matching password must return true');
  });

  it('rejects an incorrect password', () => {
    const raw = 'CorrectPassword999#';
    const wrong = 'WrongPassword999#';
    const hashed = hashPassword(raw);

    const isValid = verifyPassword(wrong, hashed);
    assert.strictEqual(isValid, false, 'Non-matching password must return false');
  });

  it('rejects malformed hash encodings safely without crashing', () => {
    assert.strictEqual(verifyPassword('pass', ''), false);
    assert.strictEqual(verifyPassword('pass', 'invalid-format'), false);
    assert.strictEqual(verifyPassword('pass', 'bcrypt$10$salt$hash'), false);
    assert.strictEqual(verifyPassword('pass', 'pbkdf2$310000$salt'), false);
    assert.strictEqual(verifyPassword('pass', 'pbkdf2$notanumber$salt$hash'), false);
    assert.strictEqual(verifyPassword('pass', 'pbkdf2$310000$shortsalt$invalidhex!'), false);
  });
});
