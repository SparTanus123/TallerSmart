import { z } from 'zod';

export const vehicleTypeSchema = z.enum(['CAR', 'MOTORCYCLE', 'ATV', 'OTHER']);

export const vehicleSchema = z.object({
  currentClientId: z.string().uuid({ message: 'Debes seleccionar un cliente válido' }),
  type: vehicleTypeSchema.default('CAR'),
  plate: z
    .string()
    .trim()
    .min(3, { message: 'La placa debe tener al menos 3 caracteres' })
    .max(10, { message: 'La placa no puede tener más de 10 caracteres' })
    .transform(v => v.toUpperCase().replace(/[\s-.]/g, ''))
    .refine(v => /^[A-Z0-9]{3,10}$/.test(v), {
      message: 'Formato de placa inválido. Debe contener entre 3 y 10 caracteres alfanuméricos (ej: ABC123, ABC12D, ATV01)',
    }),
  vin: z.string().trim().optional().or(z.literal('')),
  make: z.string().trim().min(1, { message: 'La marca del vehículo es obligatoria' }),
  model: z.string().trim().optional().default(''),
  year: z.number().int().min(1900, { message: 'Año inválido' }).max(2100, { message: 'Año inválido' }),
  mileage: z.number().int().nonnegative({ message: 'El kilometraje debe ser mayor o igual a 0' }),
  color: z.string().trim().optional().or(z.literal('')),
});

export const updateVehicleSchema = vehicleSchema.partial().extend({
  changeReason: z.string().trim().min(5, { message: 'El motivo del cambio debe tener al menos 5 caracteres' }).optional(),
});
