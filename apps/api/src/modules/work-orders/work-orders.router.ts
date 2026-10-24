import { randomUUID } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Router, type Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { requireRoles } from '../../middleware/auth';
import { createWorkOrderSchema, manualItemSchema, orderStatusSchema, reportSchema, technicalRecordSchema, updateItemSchema } from './work-orders.schema';
import { allowedTransitions, getWorkOrder, listWorkOrders, workOrderInclude } from './work-orders.service';
import { generateWorkOrderPdf, type WorkOrderDocumentType } from './work-orders.pdf';

const router = Router();
const actor = (res: Response) => (res.locals.user as { id: string }).id;
const uploadDir = path.resolve(process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'storage', 'uploads'));
router.get('/', async (_req, res, next) => { try { res.json(await listWorkOrders()); } catch (e) { next(e); } });
router.post('/:id/intake-photos', requireRoles('ADMIN', 'ADVISOR'), async (req, res, next) => {
  try {
    const { fileName, mimeType, base64 } = z.object({ fileName: z.string().trim().min(1).max(180), mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']), base64: z.string().min(1) }).parse(req.body);
    const content = Buffer.from(base64, 'base64');
    if (!content.length || content.length > 5 * 1024 * 1024) return res.status(413).json({ error: 'PHOTO_TOO_LARGE' });
    const signatureValid = mimeType === 'image/jpeg' ? content[0] === 0xff && content[1] === 0xd8 && content[2] === 0xff : mimeType === 'image/png' ? content.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) : content.toString('ascii', 0, 4) === 'RIFF' && content.toString('ascii', 8, 12) === 'WEBP';
    if (!signatureValid) return res.status(400).json({ error: 'INVALID_IMAGE_CONTENT' });
    const actorId = actor(res); const order = await prisma.workOrder.findUniqueOrThrow({ where: { id: req.params.id } });
    if (order.status === 'DELIVERED') return res.status(409).json({ error: 'DELIVERED_ORDER_LOCKED' });
    const key = `${randomUUID()}.${mimeType === 'image/jpeg' ? 'jpg' : mimeType === 'image/png' ? 'png' : 'webp'}`;
    await mkdir(uploadDir, { recursive: true }); await writeFile(path.join(uploadDir, key), content, { flag: 'wx' });
    try {
      const photo = await prisma.$transaction(async tx => {
        const row = await tx.intakePhoto.create({ data: { workOrderId: order.id, fileName: path.basename(fileName), mimeType, storageKey: key } });
        await tx.workOrderEvent.create({ data: { workOrderId: order.id, actorId, action: 'intake_photo_added', toValue: { photoId: row.id, fileName: row.fileName, mimeType } } });
        return row;
      });
      res.status(201).json({ id: photo.id, fileName: photo.fileName, mimeType: photo.mimeType, createdAt: photo.createdAt });
    } catch (e) { await unlink(path.join(uploadDir, key)).catch(() => undefined); throw e; }
  } catch (e) { next(e); }
});
router.get('/:id/intake-photos/:photoId', async (req, res, next) => {
  try { const photo = await prisma.intakePhoto.findFirstOrThrow({ where: { id: req.params.photoId, workOrderId: req.params.id } }); const content = await readFile(path.join(uploadDir, photo.storageKey)); res.setHeader('Content-Type', photo.mimeType); res.setHeader('Content-Disposition', `inline; filename="${photo.fileName.replace(/["\\\r\n]/g, '_')}"`); res.setHeader('Cache-Control', 'private, no-store'); res.send(content); } catch (e) { next(e); }
});
router.delete('/:id/intake-photos/:photoId', requireRoles('ADMIN', 'ADVISOR'), async (req, res, next) => {
  try { const actorId = actor(res); const photo = await prisma.intakePhoto.findFirstOrThrow({ where: { id: req.params.photoId, workOrderId: req.params.id } }); await prisma.$transaction(async tx => { await tx.intakePhoto.delete({ where: { id: photo.id } }); await tx.workOrderEvent.create({ data: { workOrderId: req.params.id, actorId, action: 'intake_photo_removed', fromValue: { photoId: photo.id, fileName: photo.fileName } } }); }); await unlink(path.join(uploadDir, photo.storageKey)).catch(() => undefined); res.status(204).end(); } catch (e) { next(e); }
});
router.post('/', requireRoles('ADMIN', 'ADVISOR'), async (req, res, next) => {
  try {
    const input = createWorkOrderSchema.parse(req.body);
    const actorId = actor(res);
    const order = await prisma.$transaction(async tx => {
      const vehicle = await tx.vehicle.findUnique({ where: { id: input.vehicleId } });
      if (!vehicle) throw Object.assign(new Error('VEHICLE_NOT_FOUND'), { status: 404 });
      if (input.mileageIn < vehicle.mileage) throw Object.assign(new Error('MILEAGE_BELOW_LAST_KNOWN'), { status: 409 });
      const updatedVehicle = await tx.vehicle.updateMany({ where: { id: vehicle.id, mileage: { lte: input.mileageIn } }, data: { mileage: input.mileageIn } });
      if (!updatedVehicle.count) throw Object.assign(new Error('MILEAGE_CHANGED_CONCURRENTLY'), { status: 409 });
      const number = `OT-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
      const created = await tx.workOrder.create({ data: { number, vehicleId: vehicle.id, clientId: vehicle.currentClientId, createdById: actorId, complaint: input.complaint, mileageIn: input.mileageIn, urgency: input.urgency, intakeInspection: input.intakeInspection, estimatedDelivery: input.estimatedDelivery ? new Date(`${input.estimatedDelivery}T00:00:00Z`) : undefined } });
      await tx.workOrderEvent.create({ data: { workOrderId: created.id, actorId, action: 'created', toValue: { number, mileageIn: input.mileageIn, complaint: input.complaint, intakeInspection: input.intakeInspection } } });
      await tx.vehicleEvent.create({ data: { vehicleId: vehicle.id, actorId, action: 'mileage_confirmed_at_intake', fromValue: { mileage: vehicle.mileage }, toValue: { mileage: input.mileageIn }, reason: `Recepción ${number}` } });
      return tx.workOrder.findUniqueOrThrow({ where: { id: created.id }, include: workOrderInclude });
    });
    res.status(201).json(order);
  } catch (e) { next(e); }
});
router.get('/:id', async (req, res, next) => { try { const order = await getWorkOrder(req.params.id); if (!order) return res.status(404).json({ error: 'WORK_ORDER_NOT_FOUND' }); res.json(order); } catch (e) { next(e); } });
router.get('/:id/documents/:type', async (req, res, next) => {
  try {
    const type = req.params.type;
    if (!['intake', 'quotation', 'delivery'].includes(type)) return res.status(404).json({ error: 'DOCUMENT_TYPE_NOT_FOUND' });
    const order = await getWorkOrder(req.params.id);
    if (!order) return res.status(404).json({ error: 'WORK_ORDER_NOT_FOUND' });
    if (type === 'delivery' && (!order.reportApprovedAt || !order.approvedReportSnapshot)) return res.status(409).json({ error: 'APPROVED_REPORT_REQUIRED' });
    const pdf = await generateWorkOrderPdf(order as Parameters<typeof generateWorkOrderPdf>[0], type as WorkOrderDocumentType);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${order.number}-${type}.pdf"`);
    res.setHeader('Cache-Control', 'private, no-store');
    res.send(pdf);
  } catch (e) { next(e); }
});
router.patch('/:id/record', requireRoles('ADMIN', 'TECHNICIAN'), async (req, res, next) => {
  try {
    const input = technicalRecordSchema.parse(req.body); const actorId = actor(res);
    const order = await prisma.$transaction(async tx => { const before = await tx.workOrder.findUniqueOrThrow({ where: { id: req.params.id } }); if (before.status === 'DELIVERED') throw Object.assign(new Error('DELIVERED_ORDER_LOCKED'), { status: 409 }); const updated = await tx.workOrder.update({ where: { id: before.id }, data: { ...input, deliveryReportDraft: null, approvedReportSnapshot: null, reportApprovedAt: null, reportApprovedById: null } }); await tx.workOrderEvent.create({ data: { workOrderId: before.id, actorId, action: 'record_updated', fromValue: { diagnosis: before.diagnosis, notes: before.notes }, toValue: input } }); return tx.workOrder.findUniqueOrThrow({ where: { id: updated.id }, include: workOrderInclude }); });
    res.json(order);
  } catch (e) { next(e); }
});
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = orderStatusSchema.parse(req.body); const role = res.locals.user.role as string;
    const permitted = status === 'RECEIVED' || status === 'DELIVERED' ? ['ADMIN', 'ADVISOR'] : ['ADMIN', 'TECHNICIAN'];
    if (!permitted.includes(role)) return res.status(403).json({ error: 'FORBIDDEN' });
    const actorId = actor(res);
    const order = await prisma.$transaction(async tx => { const before = await tx.workOrder.findUniqueOrThrow({ where: { id: req.params.id } }); if (!allowedTransitions[before.status]?.includes(status)) throw Object.assign(new Error('INVALID_STATUS_TRANSITION'), { status: 409 }); if (status === 'COMPLETED' && !before.diagnosis?.trim()) throw Object.assign(new Error('DIAGNOSIS_REQUIRED'), { status: 409 }); if (status === 'COMPLETED' && await tx.workOrderItem.count({ where: { workOrderId: before.id, authorizationStatus: 'PENDING' } })) throw Object.assign(new Error('PENDING_WORK_REQUIRES_CLIENT_APPROVAL'), { status: 409 }); if (status === 'DELIVERED' && (!before.reportApprovedAt || !before.approvedReportSnapshot)) throw Object.assign(new Error('APPROVED_REPORT_REQUIRED'), { status: 409 }); const updated = await tx.workOrder.update({ where: { id: before.id }, data: { status } }); await tx.workOrderEvent.create({ data: { workOrderId: before.id, actorId, action: 'status_changed', fromValue: { status: before.status }, toValue: { status } } }); return tx.workOrder.findUniqueOrThrow({ where: { id: updated.id }, include: workOrderInclude }); });
    res.json(order);
  } catch (e) { next(e); }
});
router.put('/:id/report', requireRoles('ADMIN', 'ADVISOR'), async (req, res, next) => {
  try { const { text } = reportSchema.parse(req.body); const actorId = actor(res); const order = await prisma.$transaction(async tx => { const before = await tx.workOrder.findUniqueOrThrow({ where: { id: req.params.id } }); if (before.status === 'DELIVERED') throw Object.assign(new Error('DELIVERED_ORDER_LOCKED'), { status: 409 }); const updated = await tx.workOrder.update({ where: { id: before.id }, data: { deliveryReportDraft: text, approvedReportSnapshot: null, reportApprovedAt: null, reportApprovedById: null } }); await tx.workOrderEvent.create({ data: { workOrderId: before.id, actorId, action: 'report_draft_updated', toValue: { text } } }); return tx.workOrder.findUniqueOrThrow({ where: { id: updated.id }, include: workOrderInclude }); }); res.json(order); } catch (e) { next(e); }
});
router.post('/:id/report/approve', requireRoles('ADMIN', 'ADVISOR'), async (req, res, next) => {
  try { const actorId = actor(res); const order = await prisma.$transaction(async tx => { const before = await tx.workOrder.findUniqueOrThrow({ where: { id: req.params.id } }); if (!before.deliveryReportDraft) throw Object.assign(new Error('REPORT_DRAFT_REQUIRED'), { status: 409 }); if (before.status !== 'COMPLETED') throw Object.assign(new Error('ORDER_MUST_BE_COMPLETED'), { status: 409 }); const updated = await tx.workOrder.update({ where: { id: before.id }, data: { approvedReportSnapshot: before.deliveryReportDraft, reportApprovedAt: new Date(), reportApprovedById: actorId } }); await tx.workOrderEvent.create({ data: { workOrderId: before.id, actorId, action: 'report_approved', toValue: { snapshot: before.deliveryReportDraft } } }); return tx.workOrder.findUniqueOrThrow({ where: { id: updated.id }, include: workOrderInclude }); }); res.json(order); } catch (e) { next(e); }
});
router.post('/:id/items', requireRoles('ADMIN', 'ADVISOR', 'TECHNICIAN'), async (req, res, next) => {
  try { const { catalogItemId, quantity } = z.object({ catalogItemId: z.string().uuid(), quantity: z.number().positive().max(10000).default(1) }).parse(req.body); const actorId = actor(res); const order = await prisma.$transaction(async tx => { const before = await tx.workOrder.findUniqueOrThrow({ where: { id: req.params.id } }); if (before.status === 'COMPLETED' || before.status === 'DELIVERED') throw Object.assign(new Error('ORDER_ITEMS_LOCKED'), { status: 409 }); const catalogItem = await tx.catalogItem.findUniqueOrThrow({ where: { id: catalogItemId, active: true } }); const item = await tx.workOrderItem.create({ data: { workOrderId: before.id, catalogItemId, type: catalogItem.type, nameSnapshot: catalogItem.name, quantity, unitPrice: catalogItem.unitPrice } }); await tx.workOrderEvent.create({ data: { workOrderId: before.id, actorId, action: 'additional_work_requested', toValue: { itemId: item.id, name: item.nameSnapshot, quantity, unitPrice: Number(item.unitPrice), authorizationStatus: 'PENDING' } } }); return tx.workOrder.findUniqueOrThrow({ where: { id: before.id }, include: workOrderInclude }); }); res.status(201).json(order); } catch (e) { next(e); }
});
router.post('/:id/items/manual', requireRoles('ADMIN', 'ADVISOR', 'TECHNICIAN'), async (req, res, next) => {
  try { const input = manualItemSchema.parse(req.body); const actorId = actor(res); const order = await prisma.$transaction(async tx => { const before = await tx.workOrder.findUniqueOrThrow({ where: { id: req.params.id } }); if (before.status === 'COMPLETED' || before.status === 'DELIVERED') throw Object.assign(new Error('ORDER_ITEMS_LOCKED'), { status: 409 }); const item = await tx.workOrderItem.create({ data: { workOrderId: before.id, type: input.type, nameSnapshot: input.name, quantity: input.quantity, unitPrice: input.unitPrice } }); await tx.workOrderEvent.create({ data: { workOrderId: before.id, actorId, action: 'manual_item_added', toValue: { itemId: item.id, ...input, authorizationStatus: 'PENDING' } } }); return tx.workOrder.findUniqueOrThrow({ where: { id: before.id }, include: workOrderInclude }); }); res.status(201).json(order); } catch (e) { next(e); }
});
router.patch('/:id/items/:itemId', requireRoles('ADMIN', 'ADVISOR', 'TECHNICIAN'), async (req, res, next) => {
  try { const input = updateItemSchema.parse(req.body); const actorId = actor(res); const order = await prisma.$transaction(async tx => { const before = await tx.workOrder.findUniqueOrThrow({ where: { id: req.params.id } }); if (before.status === 'COMPLETED' || before.status === 'DELIVERED') throw Object.assign(new Error('ORDER_ITEMS_LOCKED'), { status: 409 }); const item = await tx.workOrderItem.findFirstOrThrow({ where: { id: req.params.itemId, workOrderId: before.id } }); const updatedItem = await tx.workOrderItem.update({ where: { id: item.id }, data: { ...(input.name !== undefined ? { nameSnapshot: input.name } : {}), ...(input.quantity !== undefined ? { quantity: input.quantity } : {}), ...(input.unitPrice !== undefined ? { unitPrice: input.unitPrice } : {}), authorizationStatus: 'PENDING', authorizedAt: null } }); await tx.workOrderEvent.create({ data: { workOrderId: before.id, actorId, action: 'item_updated', fromValue: { itemId: item.id, name: item.nameSnapshot, quantity: Number(item.quantity), unitPrice: Number(item.unitPrice), authorizationStatus: item.authorizationStatus }, toValue: { itemId: item.id, name: updatedItem.nameSnapshot, quantity: Number(updatedItem.quantity), unitPrice: Number(updatedItem.unitPrice), authorizationStatus: 'PENDING' } } }); const lines = await tx.workOrderItem.findMany({ where: { workOrderId: before.id, authorizationStatus: 'APPROVED' } }); const total = lines.reduce((sum, line) => sum + Number(line.quantity) * Number(line.unitPrice), 0); await tx.workOrder.update({ where: { id: before.id }, data: { total, reportApprovedAt: null, approvedReportSnapshot: null, reportApprovedById: null } }); return tx.workOrder.findUniqueOrThrow({ where: { id: before.id }, include: workOrderInclude }); }); res.json(order); } catch (e) { next(e); }
});
router.patch('/:id/items/:itemId/authorization', requireRoles('ADMIN', 'ADVISOR'), async (req, res, next) => {
  try { const { authorizationStatus } = z.object({ authorizationStatus: z.enum(['APPROVED', 'REJECTED']) }).parse(req.body); const actorId = actor(res); const order = await prisma.$transaction(async tx => { const before = await tx.workOrder.findUniqueOrThrow({ where: { id: req.params.id } }); if (before.status === 'COMPLETED' || before.status === 'DELIVERED') throw Object.assign(new Error('ORDER_ITEMS_LOCKED'), { status: 409 }); const item = await tx.workOrderItem.findFirstOrThrow({ where: { id: req.params.itemId, workOrderId: before.id } }); await tx.workOrderItem.update({ where: { id: item.id }, data: { authorizationStatus, authorizedAt: new Date() } }); const approvedItems = await tx.workOrderItem.findMany({ where: { workOrderId: before.id, authorizationStatus: 'APPROVED' } }); const total = approvedItems.reduce((sum, line) => sum + Number(line.quantity) * Number(line.unitPrice), 0); await tx.workOrder.update({ where: { id: before.id }, data: { total, reportApprovedAt: null, approvedReportSnapshot: null, reportApprovedById: null } }); await tx.workOrderEvent.create({ data: { workOrderId: before.id, actorId, action: 'item_authorization_changed', fromValue: { itemId: item.id, status: item.authorizationStatus }, toValue: { itemId: item.id, status: authorizationStatus, approvedTotal: total } } }); return tx.workOrder.findUniqueOrThrow({ where: { id: before.id }, include: workOrderInclude }); }); res.json(order); } catch (e) { next(e); }
});
export default router;
