import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateWorkOrderPdf } from '../../src/modules/work-orders/work-orders.pdf';

describe('Unit: Work Order PDF Document Generator', () => {
  const mockOrder: any = {
    id: '11111111-2222-3333-4444-555555555555',
    number: 'OT-2026-0001',
    status: 'COMPLETED',
    urgency: 'HIGH',
    complaint: 'Frenos rechinan al desacelerar a más de 40 km/h',
    diagnosis: 'Pastillas delanteras desgastadas al 10% de vida útil y discos rayados.',
    notes: 'Cliente autoriza cambio inmediato de pastillas y rectificación.',
    mileageIn: 64200,
    mileageOut: 64205,
    estimatedDelivery: new Date('2026-11-10'),
    total: 350000,
    deliveryReportDraft: 'Trabajo realizado a satisfacción.',
    approvedReportSnapshot: 'Vehículo probado en ruta. Sistema de frenos operativo al 100%.',
    reportApprovedAt: new Date(),
    client: {
      name: 'Carlos Rodríguez',
      phone: '+57 300 123 4567',
      email: 'carlos@example.com',
    },
    vehicle: {
      make: 'Mazda',
      model: 'CX-5',
      year: 2021,
      plate: 'KLM789',
      vin: 'JM3KFBCM0M0123456',
      currentClient: { name: 'Carlos Rodríguez' },
    },
    technician: {
      name: 'Roberto Gómez',
    },
    reportApprovedBy: {
      name: 'Admin TallerSmart',
    },
    items: [
      {
        id: 'item-1',
        nameSnapshot: 'Juego de pastillas de freno cerámicas',
        type: 'PART',
        quantity: 1,
        unitPrice: 220000,
        authorizationStatus: 'APPROVED',
      },
      {
        id: 'item-2',
        nameSnapshot: 'Mano de obra cambio de pastillas y purgado',
        type: 'SERVICE',
        quantity: 1,
        unitPrice: 130000,
        authorizationStatus: 'APPROVED',
      },
      {
        id: 'item-3',
        nameSnapshot: 'Alineación complementaria',
        type: 'SERVICE',
        quantity: 1,
        unitPrice: 50000,
        authorizationStatus: 'REJECTED',
      },
    ],
  };

  it('generates a valid binary PDF buffer with %PDF- header for intake sheet', async () => {
    const pdfBuffer = await generateWorkOrderPdf(mockOrder, 'intake');
    assert.ok(Buffer.isBuffer(pdfBuffer), 'Result must be a Node.js Buffer');
    assert.ok(pdfBuffer.length > 500, 'PDF buffer should be substantial');
    assert.strictEqual(pdfBuffer.subarray(0, 4).toString('ascii'), '%PDF', 'File must start with %PDF magic header');
  });

  it('generates valid PDF documents for quotation, delivery and receipt', async () => {
    for (const type of ['quotation', 'delivery', 'receipt'] as const) {
      const pdfBuffer = await generateWorkOrderPdf(mockOrder, type);
      assert.ok(Buffer.isBuffer(pdfBuffer));
      assert.strictEqual(pdfBuffer.subarray(0, 4).toString('ascii'), '%PDF');
    }
  });
});
