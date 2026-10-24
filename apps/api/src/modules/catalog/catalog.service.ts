import { prisma } from '../../lib/prisma';
export function listCatalog() { return prisma.catalogItem.findMany({ orderBy: [{ type: 'asc' }, { name: 'asc' }] }); }
export function createCatalogItem(data: { type: 'SERVICE' | 'PART'; code: string; name: string; description?: string; unitPrice: number; unit: string }) { return prisma.catalogItem.create({ data }); }
