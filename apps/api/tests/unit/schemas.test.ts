import { describe, it } from 'node:test';
import assert from 'node:assert';
import { vehicleSchema, updateVehicleSchema } from '../../src/modules/vehicles/vehicles.schema';
import {
  createWorkOrderSchema,
  intakeInspectionSchema,
  orderStatusSchema,
  manualItemSchema,
  updateItemSchema,
  technicalRecordSchema,
} from '../../src/modules/work-orders/work-orders.schema';
import { loginSchema } from '../../src/modules/auth/auth.schema';
import { catalogItemSchema } from '../../src/modules/catalog/catalog.schema';
import { intakeAnalysisSchema, preventiveAnalysisSchema } from '../../src/modules/ai/ai.schema';

describe('Unit: Zod Validation Schemas', () => {
  describe('Vehicle Schema', () => {
    it('normalizes valid plate by converting to uppercase and stripping spaces and hyphens', () => {
      const parsed = vehicleSchema.parse({
        currentClientId: '11111111-2222-3333-4444-555555555555',
        type: 'CAR',
        plate: '  abc-123 ',
        make: 'Toyota',
        model: 'Corolla',
        year: 2022,
        mileage: 45000,
      });

      assert.strictEqual(parsed.plate, 'ABC123');
      assert.strictEqual(parsed.type, 'CAR');
    });

    it('accepts motorcycle and ATV plates within 3-10 characters', () => {
      const parsedMoto = vehicleSchema.parse({
        currentClientId: '11111111-2222-3333-4444-555555555555',
        type: 'MOTORCYCLE',
        plate: 'XYZ99E',
        make: 'Yamaha',
        year: 2023,
        mileage: 5000,
      });
      assert.strictEqual(parsedMoto.plate, 'XYZ99E');
    });

    it('rejects invalid plates (too short, special chars, invalid symbols)', () => {
      assert.throws(() => {
        vehicleSchema.parse({
          currentClientId: '11111111-2222-3333-4444-555555555555',
          plate: 'AB',
          make: 'Toyota',
          year: 2022,
          mileage: 10000,
        });
      }, /al menos 3 caracteres/);

      assert.throws(() => {
        vehicleSchema.parse({
          currentClientId: '11111111-2222-3333-4444-555555555555',
          plate: 'ABC@123',
          make: 'Toyota',
          year: 2022,
          mileage: 10000,
        });
      }, /Formato de placa inválido/);
    });

    it('rejects negative mileage or invalid years', () => {
      assert.throws(() => {
        vehicleSchema.parse({
          currentClientId: '11111111-2222-3333-4444-555555555555',
          plate: 'ABC123',
          make: 'Toyota',
          year: 1850,
          mileage: 10000,
        });
      }, /Año inválido/);

      assert.throws(() => {
        vehicleSchema.parse({
          currentClientId: '11111111-2222-3333-4444-555555555555',
          plate: 'ABC123',
          make: 'Toyota',
          year: 2020,
          mileage: -50,
        });
      }, /El kilometraje debe ser mayor o igual a 0/);
    });

    it('validates changeReason requirement on partial updates', () => {
      assert.throws(() => {
        updateVehicleSchema.parse({
          changeReason: 'no', // less than 5 characters
        });
      }, /al menos 5 caracteres/);
    });
  });

  describe('Work Order Schema & Inspection', () => {
    it('validates intake inspection fuelLevel between 0 and 100', () => {
      const valid = intakeInspectionSchema.parse({
        fuelLevel: 75,
        belongings: ['Gato hidráulico', 'Llave de pernos'],
        damageAreas: ['Rayón en puerta derecha'],
        notes: 'Vehículo limpio',
      });
      assert.strictEqual(valid.fuelLevel, 75);
      assert.strictEqual(valid.belongings.length, 2);

      assert.throws(() => {
        intakeInspectionSchema.parse({ fuelLevel: 150 });
      });
      assert.throws(() => {
        intakeInspectionSchema.parse({ fuelLevel: -10 });
      });
    });

    it('validates createWorkOrderSchema requiring minimum complaint length', () => {
      const validOrder = {
        vehicleId: '11111111-2222-3333-4444-555555555555',
        complaint: 'Ruido metálico en tren delantero al frenar',
        mileageIn: 55000,
        urgency: 'HIGH',
        intakeInspection: {
          fuelLevel: 50,
          belongings: [],
          damageAreas: [],
          notes: '',
        },
      };

      const parsed = createWorkOrderSchema.parse(validOrder);
      assert.strictEqual(parsed.urgency, 'HIGH');
      assert.strictEqual(parsed.complaint, validOrder.complaint);

      assert.throws(() => {
        createWorkOrderSchema.parse({
          ...validOrder,
          complaint: 'a', // too short (< 5 chars)
        });
      });
    });

    it('validates order status transitions against known enum values', () => {
      const validStatuses = ['RECEIVED', 'DIAGNOSING', 'IN_PROGRESS', 'WAITING_PARTS', 'COMPLETED', 'DELIVERED'];
      for (const status of validStatuses) {
        assert.strictEqual(orderStatusSchema.parse({ status }).status, status);
      }

      assert.throws(() => {
        orderStatusSchema.parse({ status: 'INVALID_STATUS' });
      });
    });

    it('validates manual items requiring positive quantity and non-negative price', () => {
      const validItem = manualItemSchema.parse({
        type: 'PART',
        name: 'Pastillas de freno delanteras',
        quantity: 2,
        unitPrice: 120000,
      });
      assert.strictEqual(validItem.name, 'Pastillas de freno delanteras');

      assert.throws(() => {
        manualItemSchema.parse({
          type: 'PART',
          name: 'Pastillas',
          quantity: 0, // must be positive
          unitPrice: 50000,
        });
      });

      assert.throws(() => {
        manualItemSchema.parse({
          type: 'PART',
          name: 'Pastillas',
          quantity: 1,
          unitPrice: -100, // must be non-negative
        });
      });
    });

    it('validates technicalRecordSchema requiring diagnosis', () => {
      const parsed = technicalRecordSchema.parse({
        diagnosis: 'Desgaste severo en pastillas y discos delanteros',
        notes: 'Se recomienda rectificación',
      });
      assert.strictEqual(parsed.diagnosis, 'Desgaste severo en pastillas y discos delanteros');

      assert.throws(() => {
        technicalRecordSchema.parse({ diagnosis: '   ' });
      });
    });
  });

  describe('Auth & Catalog Schemas', () => {
    it('validates email format and minimum password length', () => {
      const valid = loginSchema.parse({
        email: '  admin@tallersmart.com  ',
        password: 'ValidPassword123!',
      });
      assert.strictEqual(valid.email, 'admin@tallersmart.com');

      assert.throws(() => {
        loginSchema.parse({ email: 'not-an-email', password: '123' });
      });
    });

    it('validates catalog item with non-negative unit price', () => {
      const item = catalogItemSchema.parse({
        type: 'SERVICE',
        code: 'SRV-001',
        name: 'Cambio de aceite y filtro sintético',
        unitPrice: 95000,
      });
      assert.strictEqual(item.unit, 'unidad');
      assert.strictEqual(item.type, 'SERVICE');

      assert.throws(() => {
        catalogItemSchema.parse({
          type: 'SERVICE',
          code: 'SRV-001',
          name: 'S',
          unitPrice: -10,
        });
      });
    });
  });

  describe('AI Schemas', () => {
    it('validates intakeAnalysisSchema complaint length', () => {
      const req = intakeAnalysisSchema.parse({
        complaint: 'Vibración excesiva al superar los 80 km/h',
        vehicleInfo: 'Renault Duster 2020',
      });
      assert.strictEqual(req.complaint, 'Vibración excesiva al superar los 80 km/h');

      assert.throws(() => {
        intakeAnalysisSchema.parse({ complaint: 'bad' });
      });
    });

    it('validates preventiveAnalysisSchema year and mileage constraints', () => {
      const req = preventiveAnalysisSchema.parse({
        make: 'Chevrolet',
        model: 'Onix',
        year: 2021,
        mileage: 30000,
      });
      assert.strictEqual(req.year, 2021);

      assert.throws(() => {
        preventiveAnalysisSchema.parse({ year: 1940 });
      });
    });
  });
});
