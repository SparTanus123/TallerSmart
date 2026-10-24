import { z } from 'zod';
export const createUserSchema = z.object({ name: z.string().trim().min(2), email: z.string().trim().email().transform(value => value.toLowerCase()), password: z.string().min(12).max(200), role: z.enum(['ADMIN', 'ADVISOR', 'TECHNICIAN']) });
export const updateUserSchema = z.object({ name: z.string().trim().min(2).optional(), role: z.enum(['ADMIN', 'ADVISOR', 'TECHNICIAN']).optional(), active: z.boolean().optional(), password: z.string().min(12).max(200).optional() });
