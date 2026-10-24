import { z } from 'zod';
export const intakeInspectionSchema = z.object({ fuelLevel: z.number().int().min(0).max(100), belongings: z.array(z.string().trim().min(1).max(80)).max(30).default([]), damageAreas: z.array(z.string().trim().min(1).max(80)).max(30).default([]), notes: z.string().trim().max(2000).default('') });
export const createWorkOrderSchema = z.object({ vehicleId: z.string().uuid(), complaint: z.string().trim().min(5), mileageIn: z.number().int().nonnegative(), urgency: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'), estimatedDelivery: z.string().date().optional(), intakeInspection: intakeInspectionSchema });
export const manualItemSchema = z.object({ type: z.enum(['SERVICE', 'PART']), name: z.string().trim().min(2).max(180), quantity: z.number().positive().max(10000), unitPrice: z.number().nonnegative().max(100000000) });
export const updateItemSchema = z.object({ name: z.string().trim().min(2).max(180).optional(), quantity: z.number().positive().max(10000).optional(), unitPrice: z.number().nonnegative().max(100000000).optional() }).refine(v => Object.keys(v).length > 0);
export const technicalRecordSchema = z.object({ diagnosis: z.string().trim().min(1), notes: z.string().trim().default('') });
export const orderStatusSchema = z.object({ status: z.enum(['RECEIVED', 'DIAGNOSING', 'IN_PROGRESS', 'WAITING_PARTS', 'COMPLETED', 'DELIVERED']) });
export const reportSchema = z.object({ text: z.string().trim().min(20) });
