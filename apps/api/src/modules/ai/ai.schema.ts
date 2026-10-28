import { z } from 'zod';

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string().trim().min(1, 'El mensaje no puede estar vacío').max(4000),
});

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1, 'Se requiere al menos un mensaje'),
  workOrderId: z.string().uuid().optional(),
  vehicleId: z.string().uuid().optional(),
});

export const intakeAnalysisSchema = z.object({
  complaint: z.string().trim().min(5, 'La queja debe tener al menos 5 caracteres').max(1000),
  vehicleInfo: z.string().trim().max(200).optional(),
  mileage: z.number().int().nonnegative().optional(),
  workOrderId: z.string().uuid().optional(),
});

export const preventiveAnalysisSchema = z.object({
  vehicleId: z.string().uuid().optional(),
  make: z.string().trim().max(60).optional(),
  model: z.string().trim().max(60).optional(),
  year: z.number().int().min(1950).max(2035).optional(),
  mileage: z.number().int().nonnegative().optional(),
});

export const deliveryReportSchema = z.object({
  workOrderId: z.string().uuid().optional(),
  clientName: z.string().trim().max(120).optional(),
  vehicleInfo: z.string().trim().max(200).optional(),
  mileageIn: z.number().int().nonnegative().optional(),
  mileageOut: z.number().int().nonnegative().optional(),
  diagnosis: z.string().trim().max(2000).optional(),
  notes: z.string().trim().max(4000).optional(),
  itemsInstalled: z.array(z.string().trim().max(200)).optional(),
  tone: z.enum(['cliente', 'tecnico']).default('cliente'),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type IntakeAnalysisInput = z.infer<typeof intakeAnalysisSchema>;
export type PreventiveAnalysisInput = z.infer<typeof preventiveAnalysisSchema>;
export type DeliveryReportInput = z.infer<typeof deliveryReportSchema>;
