import http from 'node:http';
import { app } from '../../src/app';
import { createSession } from '../../src/modules/auth/auth.service';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'wV6O5Rhu98VF93w3e-c9zKIEQqK4stbq0H2e1TMCdzzLp2mqjwIKog-mGyJ4AfEV';

export interface TestServer {
  baseUrl: string;
  close: () => Promise<void>;
  request: (
    path: string,
    options?: RequestInit & { token?: string }
  ) => Promise<{ status: number; headers: Headers; json: () => Promise<any>; text: () => Promise<string> }>;
}

export async function createTestServer(): Promise<TestServer> {
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve());
  });

  const addr = server.address();
  const port = typeof addr === 'object' && addr ? addr.port : 0;
  const baseUrl = `http://127.0.0.1:${port}`;

  const close = () =>
    new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });

  const request = async (path: string, options: RequestInit & { token?: string } = {}) => {
    const { token, headers: customHeaders, ...fetchOpts } = options;
    const headers = new Headers(customHeaders);

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    if (fetchOpts.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const res = await fetch(`${baseUrl}${path}`, {
      ...fetchOpts,
      headers,
    });

    return {
      status: res.status,
      headers: res.headers,
      json: () => res.json(),
      text: () => res.text(),
    };
  };

  return { baseUrl, close, request };
}

export function createTestToken(userId = '00000000-0000-4000-8000-000000000001'): string {
  return createSession(userId);
}
