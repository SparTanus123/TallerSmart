import { z } from 'zod';
export const vehicleSchema = z.object({ currentClientId: z.string().uuid(), plate: z.string().trim().min(5).max(10).transform(v => v.toUpperCase().replace(/\s/g, '')), vin: z.string().trim().optional().or(z.literal('')), make: z.string().trim().min(1), model: z.string().trim().min(1), year: z.number().int().min(1900).max(2100), mileage: z.number().int().nonnegative(), color: z.string().trim().optional().or(z.literal('')) });
export const updateVehicleSchema = vehicleSchema.partial().extend({ changeReason: z.string().trim().min(5).optional() });
