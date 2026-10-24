import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';
const iterations = 310_000;
export function hashPassword(password: string) { const salt = randomBytes(16).toString('hex'); const hash = pbkdf2Sync(password, salt, iterations, 32, 'sha256').toString('hex'); return `pbkdf2$${iterations}$${salt}$${hash}`; }
export function verifyPassword(password: string, encoded: string) { const [scheme, rounds, salt, expected] = encoded.split('$'); if (scheme !== 'pbkdf2' || !rounds || !salt || !expected) return false; const actual = pbkdf2Sync(password, salt, Number(rounds), 32, 'sha256'); const expectedBuffer = Buffer.from(expected, 'hex'); return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer); }
