import { z } from 'zod';
export const clientSchema = z.object({ name: z.string().trim().min(2), phone: z.string().trim().min(7), email: z.string().trim().email().optional().or(z.literal('')), type: z.enum(['PERSONAL', 'COMPANY']).default('PERSONAL') });
export const updateClientSchema = clientSchema.partial();
