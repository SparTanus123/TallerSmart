import { z } from 'zod';
export const catalogItemSchema = z.object({ type: z.enum(['SERVICE', 'PART']), code: z.string().trim().min(1), name: z.string().trim().min(2), description: z.string().optional(), unitPrice: z.number().nonnegative(), unit: z.string().default('unidad') });
export const updateCatalogItemSchema = catalogItemSchema.partial().extend({ active: z.boolean().optional() }).refine(v => Object.keys(v).length > 0);
