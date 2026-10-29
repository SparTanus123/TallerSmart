import { z } from 'zod';

export const vehicleSchema = z.object({
  currentClientId: z.string().uuid(),
  plate: z
    .string()
    .trim()
    .min(5)
    .max(10)
    .transform(v => v.toUpperCase().replace(/[\s-]/g, ''))
    .refine(v => /^[A-Z]{3}[0-9]{2}[0-9A-Z]$|^[A-Z]{1,3}[0-9]{3,5}[A-Z]?$/.test(v), {
      message: 'Formato de placa colombiana inválido (ej: ABC123 o ABC12D)',
    }),
  vin: z.string().trim().optional().or(z.literal('')),
  make: z.string().trim().min(1),
  model: z.string().trim().optional().default(''),
  year: z.number().int().min(1900).max(2100),
  mileage: z.number().int().nonnegative(),
  color: z.string().trim().optional().or(z.literal('')),
});

export const updateVehicleSchema = vehicleSchema.partial().extend({
  changeReason: z.string().trim().min(5).optional(),
});
