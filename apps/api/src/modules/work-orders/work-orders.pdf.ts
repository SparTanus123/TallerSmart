import PDFDocument from 'pdfkit';
import type { Prisma } from '@prisma/client';

type Order = Prisma.WorkOrderGetPayload<{ include: {
  vehicle: { include: { currentClient: true } }; client: true; technician: true; items: true;
  reportApprovedBy: true;
} }>;
export type WorkOrderDocumentType = 'intake' | 'quotation' | 'delivery';

const money = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
const date = (value: Date | string) => new Intl.DateTimeFormat('es-CO', { dateStyle: 'long', timeZone: 'America/Bogota' }).format(new Date(value));
const lineTotal = (item: Order['items'][number]) => Number(item.quantity) * Number(item.unitPrice);

function createDocument(title: string, order: Order) {
  const doc = new PDFDocument({ size: 'A4', margins: { top: 52, bottom: 54, left: 52, right: 52 }, info: { Title: `${title} - ${order.number}`, Author: 'TallerSmart' } });
  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
  doc.fillColor('#16324F').font('Helvetica-Bold').fontSize(19).text('TallerSmart', { continued: true });
  doc.fillColor('#64748B').font('Helvetica').fontSize(9).text('  ·  Servicio automotriz');
  doc.moveDown(1.2).fillColor('#16324F').font('Helvetica-Bold').fontSize(16).text(title);
  doc.moveDown(0.25).fillColor('#475569').font('Helvetica').fontSize(10).text(`Orden ${order.number}  ·  Fecha: ${date(new Date())}`);
  doc.moveDown(1).strokeColor('#CBD5E1').moveTo(52, doc.y).lineTo(543, doc.y).stroke();
  doc.moveDown(0.8);
  const field = (label: string, value?: string | number | null) => { if (value !== undefined && value !== null && value !== '') doc.font('Helvetica-Bold').fillColor('#334155').text(`${label}: `, { continued: true }).font('Helvetica').text(String(value)); };
  field('Cliente', order.client.name); field('Teléfono', order.client.phone); field('Correo', order.client.email);
  field('Vehículo', `${order.vehicle.make} ${order.vehicle.model} ${order.vehicle.year}`); field('Placa', order.vehicle.plate); field('VIN', order.vehicle.vin);
  field('Kilometraje de ingreso', `${order.mileageIn.toLocaleString('es-CO')} km`); field('Kilometraje de salida', order.mileageOut === null ? null : `${order.mileageOut.toLocaleString('es-CO')} km`);
  doc.moveDown(0.8);
  return { doc, done, field };
}

function section(doc: PDFKit.PDFDocument, title: string, content?: string | null) {
  if (!content) return;
  doc.moveDown(0.8).fillColor('#16324F').font('Helvetica-Bold').fontSize(11).text(title);
  doc.moveDown(0.25).fillColor('#334155').font('Helvetica').fontSize(10).text(content, { lineGap: 3 });
}

function itemTable(doc: PDFKit.PDFDocument, items: Order['items']) {
  const rows = items.filter(item => item.authorizationStatus === 'APPROVED');
  if (!rows.length) { section(doc, 'Detalle', 'No hay trabajos o repuestos aprobados registrados.'); return 0; }
  doc.moveDown(0.6).fillColor('#16324F').font('Helvetica-Bold').fontSize(11).text('Detalle de trabajos y repuestos');
  doc.moveDown(0.45);
  const x = 52, width = 491;
  const drawHeader = () => {
    const y = doc.y; doc.rect(x, y, width, 22).fill('#EEF3F8');
    doc.fillColor('#334155').font('Helvetica-Bold').fontSize(8).text('CONCEPTO', x + 8, y + 7, { width: 248 });
    doc.text('TIPO', x + 260, y + 7, { width: 52 }); doc.text('CANT.', x + 317, y + 7, { width: 48, align: 'right' });
    doc.text('VALOR', x + 370, y + 7, { width: 112, align: 'right' }); doc.y = y + 27;
  };
  drawHeader();
  for (const item of rows) {
    const height = Math.max(22, doc.font('Helvetica').fontSize(9).heightOfString(item.nameSnapshot, { width: 240 }) + 10);
    if (doc.y + height > 735) { doc.addPage(); drawHeader(); }
    const y = doc.y; doc.fillColor('#334155').font('Helvetica').fontSize(9);
    doc.text(item.nameSnapshot, x + 8, y + 5, { width: 240 });
    doc.text(item.type === 'SERVICE' ? 'Mano de obra' : 'Repuesto', x + 260, y + 5, { width: 52 });
    doc.text(String(Number(item.quantity)), x + 317, y + 5, { width: 48, align: 'right' });
    doc.text(money(lineTotal(item)), x + 370, y + 5, { width: 112, align: 'right' });
    doc.y = y + height; doc.strokeColor('#E2E8F0').moveTo(x, doc.y).lineTo(x + width, doc.y).stroke(); doc.moveDown(0.25);
  }
  return rows.reduce((sum, item) => sum + lineTotal(item), 0);
}

export async function generateWorkOrderPdf(order: Order, type: WorkOrderDocumentType): Promise<Buffer> {
  const titles: Record<WorkOrderDocumentType, string> = { intake: 'Hoja de recepción · Comprobante de ingreso', quotation: 'Cotización · Presupuesto formal', delivery: 'Informe técnico final · Hoja de entrega' };
  const { doc, done, field } = createDocument(titles[type], order);
  if (type === 'intake') {
    section(doc, 'Solicitud del cliente', order.complaint);
    const inspection = order.intakeInspection as { fuelLevel?: number; belongings?: string[]; damageAreas?: string[]; notes?: string } | null;
    if (inspection) {
      section(doc, 'Inspección de recepción', `Combustible: ${inspection.fuelLevel ?? 'No registrado'}%\nObjetos entregados: ${inspection.belongings?.join(', ') || 'Ninguno registrado'}\nDaños visibles reportados: ${inspection.damageAreas?.join(', ') || 'Ninguno registrado'}\n${inspection.notes ? `Observaciones: ${inspection.notes}` : ''}`);
    }
    section(doc, 'Condiciones de recepción', 'Este comprobante registra el estado y la información reportados al recibir el vehículo. La recepción no constituye diagnóstico ni autorización de trabajos.');
    doc.moveDown(2); field('Firma del cliente', '________________________________________'); field('Firma del asesor', '________________________________________');
  } else if (type === 'quotation') {
    section(doc, 'Motivo de ingreso', order.complaint);
    const subtotal = itemTable(doc, order.items);
    const tax = Math.round(subtotal * 0.19);
    doc.moveDown(0.5).font('Helvetica').fontSize(10).fillColor('#334155').text(`Subtotal: ${money(subtotal)}`, { align: 'right' });
    doc.text(`IVA (19%): ${money(tax)}`, { align: 'right' });
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#16324F').text(`Total estimado: ${money(subtotal + tax)}`, { align: 'right' });
    doc.moveDown(0.8).font('Helvetica').fontSize(9).fillColor('#475569').text(`Validez: 15 días calendario desde ${date(new Date())}. Valores expresados en pesos colombianos. Los trabajos adicionales requieren autorización previa del cliente. La cotización incluye únicamente los ítems aprobados registrados en la orden.`);
    doc.moveDown(1.2); field('Aceptación del cliente', '________________________________________');
  } else {
    section(doc, 'Solicitud reportada', order.complaint);
    section(doc, 'Diagnóstico técnico', order.diagnosis);
    section(doc, 'Trabajos realizados y observaciones', order.approvedReportSnapshot ?? order.deliveryReportDraft ?? order.notes ?? 'No se ha registrado un informe técnico aprobado.');
    itemTable(doc, order.items);
    section(doc, 'Recomendaciones preventivas', order.notes || 'Siga el plan de mantenimiento recomendado por el fabricante y atienda cualquier testigo o ruido anormal.');
    field('Técnico responsable', order.technician?.name ?? 'No asignado');
    field('Informe aprobado por', order.reportApprovedBy?.name ?? 'Pendiente de aprobación');
    field('Fecha de aprobación', order.reportApprovedAt ? date(order.reportApprovedAt) : 'Pendiente');
    doc.moveDown(1.4); field('Recibí el vehículo', '________________________________________');
  }
  doc.end();
  return done;
}
