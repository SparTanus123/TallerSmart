import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { prisma } from '../../src/lib/prisma';
import { createSession } from '../../src/modules/auth/auth.service';
import { createTestServer, type TestServer } from './test-helper';

describe('Integration: Clients & Vehicles Endpoints', () => {
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

  const sampleClient = {
    id: '99999999-9999-9999-9999-999999999999',
    name: 'Juan Perez',
    phone: '+57 300 000 0000',
    email: 'juan@example.com',
    type: 'PERSONAL',
    workshopId: adminUser.workshopId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const sampleVehicle = {
    id: '88888888-8888-8888-8888-888888888888',
    currentClientId: sampleClient.id,
    plate: 'KDJ123',
    vin: '1HGCR2F83HA000000',
    type: 'CAR',
    make: 'Honda',
    model: 'Accord',
    year: 2018,
    mileage: 72000,
    color: 'Gris Plata',
    currentClient: sampleClient,
  };

  before(async () => {
    (prisma.user.findUnique as any) = async () => adminUser;

    (prisma.client.findMany as any) = async () => [sampleClient];
    (prisma.client.findFirst as any) = async (args: { where: { id?: string } }) => {
      if (args.where.id === sampleClient.id) return sampleClient;
      return null;
    };
    (prisma.client.create as any) = async (args: { data: any }) => ({
      id: 'new-client-uuid',
      ...args.data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    (prisma.vehicle.findMany as any) = async () => [sampleVehicle];
    (prisma.vehicle.create as any) = async (args: { data: any }) => ({
      id: 'new-vehicle-uuid',
      ...args.data,
      currentClient: sampleClient,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    server = await createTestServer();
    adminToken = createSession(adminUser.id);
  });

  after(async () => {
    await server.close();
  });

  it('GET /api/v1/clients returns list of clients', async () => {
    const res = await server.request('/api/v1/clients', { token: adminToken });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body));
    assert.strictEqual(body[0].name, sampleClient.name);
  });

  it('POST /api/v1/clients rejects invalid phone or missing name', async () => {
    const res = await server.request('/api/v1/clients', {
      method: 'POST',
      token: adminToken,
      body: JSON.stringify({ name: '', phone: '' }),
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.error, 'VALIDATION_ERROR');
  });

  it('POST /api/v1/clients creates client with valid payload', async () => {
    const res = await server.request('/api/v1/clients', {
      method: 'POST',
      token: adminToken,
      body: JSON.stringify({
        name: 'Maria Gomez',
        phone: '+57 311 222 3344',
        email: 'maria@example.com',
        type: 'PERSONAL',
      }),
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.name, 'Maria Gomez');
  });

  it('GET /api/v1/vehicles returns list of vehicles with current client relation', async () => {
    const res = await server.request('/api/v1/vehicles', { token: adminToken });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body));
    assert.strictEqual(body[0].plate, 'KDJ123');
    assert.strictEqual(body[0].currentClient.name, sampleClient.name);
  });

  it('POST /api/v1/vehicles rejects negative mileage or invalid plate format', async () => {
    const res = await server.request('/api/v1/vehicles', {
      method: 'POST',
      token: adminToken,
      body: JSON.stringify({
        currentClientId: sampleClient.id,
        plate: 'X', // too short
        make: 'Honda',
        year: 2020,
        mileage: -100, // negative
      }),
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.error, 'VALIDATION_ERROR');
  });

  it('POST /api/v1/vehicles creates vehicle successfully and normalizes plate', async () => {
    const res = await server.request('/api/v1/vehicles', {
      method: 'POST',
      token: adminToken,
      body: JSON.stringify({
        currentClientId: sampleClient.id,
        type: 'CAR',
        plate: ' abc-987 ',
        make: 'Nissan',
        model: 'Sentra',
        year: 2021,
        mileage: 32000,
        color: 'Azul',
      }),
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.plate, 'ABC987', 'Plate must be trimmed, uppercase and hyphen-free');
    assert.strictEqual(body.make, 'Nissan');
  });
});
