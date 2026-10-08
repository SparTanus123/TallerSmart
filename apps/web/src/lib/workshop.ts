import type { OTStatus, Vehicle, WorkOrder } from '../types';
import { catalogItems, technicians } from '../data/mockData';

/** Reference "now" for the demo data set (mock data lives in Sept 2025). */
export const NOW = new Date('2025-09-25T15:00:00');

export const STATUS_ORDER: OTStatus[] = ['received', 'diagnosing', 'in_progress', 'waiting_parts', 'completed', 'delivered'];

export const PHASES: { id: string; label: string; statuses: OTStatus[] }[] = [
  { id: 'ingreso', label: 'Ingreso', statuses: ['received', 'diagnosing'] },
  { id: 'taller', label: 'Taller', statuses: ['in_progress', 'waiting_parts'] },
  { id: 'salida', label: 'Salida', statuses: ['completed', 'delivered'] },
];

export const ACTIVE_STATUSES: OTStatus[] = ['received', 'diagnosing', 'in_progress', 'waiting_parts'];

/** SLA (hours allowed in each stage). */
export const SLA_HOURS: Record<OTStatus, number> = {
  received: 4,
  diagnosing: 24,
  in_progress: 48,
  waiting_parts: 72,
  completed: 24,
  delivered: Infinity,
};

export const WIP_LIMITS: Partial<Record<OTStatus, number>> = { in_progress: 6, diagnosing: 4 };

export function nextStatus(s: OTStatus): OTStatus | null {
  const i = STATUS_ORDER.indexOf(s);
  return i >= 0 && i < STATUS_ORDER.length - 1 ? STATUS_ORDER[i + 1] : null;
}

export function hoursInStage(ot: WorkOrder): number {
  return Math.max(0, (NOW.getTime() - new Date(ot.updatedAt).getTime()) / 36e5);
}

export type SlaLevel = 'ok' | 'warn' | 'late' | 'none';

export function slaLevel(ot: WorkOrder): SlaLevel {
  const limit = SLA_HOURS[ot.status];
  if (!isFinite(limit)) return 'none';
  const r = hoursInStage(ot) / limit;
  return r >= 1 ? 'late' : r >= 0.75 ? 'warn' : 'ok';
}

export function slaRatio(ot: WorkOrder): number {
  const limit = SLA_HOURS[ot.status];
  return isFinite(limit) ? hoursInStage(ot) / limit : 0;
}

export const SLA_COLOR: Record<SlaLevel, string> = {
  ok: '#64748B',
  warn: '#B45309',
  late: '#DC2626',
  none: '#94A3B8',
};

export function fmtDuration(h: number): string {
  if (h < 1) return `${Math.round(h * 60)}m`;
  if (h < 48) return `${Math.round(h)}h`;
  return `${Math.floor(h / 24)}d ${Math.round(h % 24)}h`;
}

export const URGENCY_COLOR = { high: '#DC2626', medium: '#D97706', low: 'transparent' } as const;
export const URGENCY_LABEL = { high: 'Alta', medium: 'Media', low: 'Baja' } as const;

export function money(n: number): string {
  return '$' + n.toLocaleString('es-CL');
}

export function moneyK(n: number): string {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toLocaleString('es-CL', { maximumFractionDigits: 1 }) + 'M';
  if (n >= 1000) return '$' + Math.round(n / 1000) + 'K';
  return '$' + n;
}

export function km(n: number): string {
  return n.toLocaleString('es-CL') + ' km';
}

/** Chilean plate formatting: BCDF42 → BCDF·42 */
export function formatPlate(p: string): string {
  const s = p.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return s.length > 4 ? `${s.slice(0, s.length - 2)}·${s.slice(-2)}` : s;
}

export function initials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export function bodyType(v: Vehicle): 'pickup' | 'car' {
  return /hilux|ranger|l200|navara|amarok|frontier/i.test(v.model) ? 'pickup' : 'car';
}

export function shortOT(number: string): string {
  return 'OT-' + number.slice(-4);
}

export function partsProgress(ot: WorkOrder): { arrived: number; total: number } | null {
  const total = ot.items.filter((i) => i.type === 'part').length;
  if (!total) return null;
  const arrived =
    ot.status === 'waiting_parts' ? Math.floor(total / 2)
    : ot.status === 'received' || ot.status === 'diagnosing' ? 0
    : total;
  return { arrived, total };
}

/* ══════════════════════════════════════════════════════════════
   Mock AI — symptom classification
   ══════════════════════════════════════════════════════════════ */

export interface SymptomMatch {
  code: string;
  system: string;
  symptom: string;
  fragments: string[];
  confidence: 1 | 2 | 3 | 4;
}

const RULES: { code: string; system: string; re: RegExp; symptom: (t: string) => string }[] = [
  {
    code: 'FRN', system: 'Frenos',
    re: /fren\w*|pastilla\w*|disco\w* de freno|pedal\w*/gi,
    symptom: (t) => /esponjos/i.test(t) ? 'Pedal esponjoso' : /chirr|ruido|cascabel|metálic/i.test(t) ? 'Ruido al frenar' : 'Falla de frenado',
  },
  {
    code: 'MOT', system: 'Motor',
    re: /motor|arranc\w*|check engine|tiembla|bobina\w*|bujía\w*|ralent\w*|tironea\w*/gi,
    symptom: (t) => /check engine/i.test(t) ? 'Testigo motor encendido' : /tiembla|tironea/i.test(t) ? 'Funcionamiento irregular' : 'Falla de motor',
  },
  {
    code: 'LUB', system: 'Lubricación',
    re: /aceite|fuga\w*|mancha\w*|goteo\w*/gi,
    symptom: (t) => /fuga|mancha|goteo/i.test(t) ? 'Posible fuga de aceite' : 'Consumo de aceite',
  },
  {
    code: 'SUS', system: 'Suspensión',
    re: /suspensi\w*|amortigu\w*|traquete\w*|vibra\w*|volante|ripio/gi,
    symptom: (t) => /vibra|volante/i.test(t) ? 'Vibración en volante' : /traquete/i.test(t) ? 'Traqueteo' : 'Desgaste suspensión',
  },
  {
    code: 'ELE', system: 'Eléctrico',
    re: /bater\w*|alternador|luces|eléctric\w*|sin carga|no enciende/gi,
    symptom: (t) => /bater|carga/i.test(t) ? 'Batería sin carga' : 'Falla eléctrica',
  },
  {
    code: 'PRV', system: 'Preventivo',
    re: /mantenci\w*|mantenimiento|preventiv\w*|\d{1,3}[.\s]?000\s?km/gi,
    symptom: () => 'Mantenimiento programado',
  },
];

const CONDITION_RE = /(en frío|en la mañana|al arrancar|en bajada|al acelerar|al frenar|a más de \d+ ?km\/h|en camino ripio|en curvas)/gi;

export function classifySymptoms(text: string): SymptomMatch[] {
  const out: SymptomMatch[] = [];
  for (const r of RULES) {
    const found = Array.from(new Set((text.match(r.re) ?? []).map((m) => m.trim())));
    if (found.length) {
      out.push({
        code: r.code,
        system: r.system,
        symptom: r.symptom(text),
        fragments: found,
        confidence: Math.min(4, found.length + 1) as 1 | 2 | 3 | 4,
      });
    }
  }
  return out.sort((a, b) => b.confidence - a.confidence);
}

export function detectConditions(text: string): string[] {
  return Array.from(new Set((text.match(CONDITION_RE) ?? []).map((c) => c.toLowerCase())));
}

export function urgencyFromSymptoms(m: SymptomMatch[]): 'high' | 'medium' | 'low' {
  if (m.some((s) => s.code === 'FRN')) return 'high';
  if (m.some((s) => s.code === 'MOT' || s.code === 'ELE' || s.code === 'LUB')) return 'medium';
  return 'low';
}

const SPECIALTY_BY_CODE: Record<string, string> = { FRN: 't2', SUS: 't2', MOT: 't1', LUB: 't1', ELE: 't3', PRV: 't3' };

export function suggestTechnician(m: SymptomMatch[]) {
  if (!m.length) return null;
  return technicians.find((t) => t.id === SPECIALTY_BY_CODE[m[0].code]) ?? null;
}

/* ══════════════════════════════════════════════════════════════
   Mock AI — predictive maintenance
   ══════════════════════════════════════════════════════════════ */

export interface Prediction {
  id: string;
  title: string;
  atKm: number;
  costMin: number;
  costMax: number;
  confidence: 1 | 2 | 3 | 4;
  reasons: string[];
}

export const KM_PER_MONTH = 1200;

export function predictMaintenance(v: Vehicle, history: WorkOrder[]): Prediction[] {
  const m = v.mileage;
  const next = (step: number) => Math.ceil((m + 1) / step) * step;
  const price = (code: string) => catalogItems.find((c) => c.code === code)?.unitPrice ?? 30000;
  const lastOT = history[0];
  const cite = lastOT ? `Registro en ${shortOT(lastOT.number)} (${km(lastOT.mileageIn)})` : 'Sin registros previos en el taller';

  const all: Prediction[] = [
    {
      id: 'oil', title: 'Cambio de aceite y filtros', atKm: next(10000),
      costMin: price('SVC-001') + price('PRT-002'), costMax: price('SVC-001') + price('PRT-001') + price('PRT-002'),
      confidence: 4,
      reasons: ['Intervalo estándar de 10.000 km', `Uso promedio estimado: ${KM_PER_MONTH.toLocaleString('es-CL')} km/mes`, cite],
    },
    {
      id: 'align', title: 'Alineación y balanceo', atKm: next(20000),
      costMin: price('SVC-005'), costMax: price('SVC-005') + 12000,
      confidence: 3,
      reasons: ['Recomendación cada 20.000 km', bodyType(v) === 'pickup' ? 'Uso mixto / carga en pickup acelera desgaste' : 'Desgaste típico urbano'],
    },
    {
      id: 'brakefluid', title: 'Cambio líquido de frenos', atKm: next(40000),
      costMin: price('PRT-006') + 12000, costMax: price('PRT-006') + 20000,
      confidence: 3,
      reasons: ['Plan del fabricante: 40.000 km o 2 años', history.some((h) => /fren/i.test(h.complaint)) ? 'Intervención de frenos reciente en historial' : 'Sin registro de cambio en el sistema'],
    },
    {
      id: 'timing', title: 'Correa de distribución', atKm: next(60000),
      costMin: price('SVC-006') + 60000, costMax: price('SVC-006') + 140000,
      confidence: 2,
      reasons: [`Plan ${v.make}: cada 60.000 km`, 'No hay registro de cambio previo — verificar con el cliente'],
    },
  ];
  return all.sort((a, b) => a.atKm - b.atKm).slice(0, 3);
}

export function monthsUntil(atKm: number, currentKm: number): string {
  const months = (atKm - currentKm) / KM_PER_MONTH;
  if (months < 1.5) return `~ ${Math.max(1, Math.round(months * 4.3))} semanas`;
  return `~ ${Math.round(months)} meses`;
}

/* ══════════════════════════════════════════════════════════════
   Mock AI — vehicle summary & report
   ══════════════════════════════════════════════════════════════ */

export function vehicleSummary(ot: WorkOrder, history: WorkOrder[]): { text: string; cites: string[] }[] {
  const systems = classifySymptoms(ot.complaint);
  const bullets: { text: string; cites: string[] }[] = [];
  bullets.push({
    text: `Ingresa con ${km(ot.mileageIn)}; ${systems.length ? `síntomas compatibles con sistema de ${systems[0].system.toLowerCase()}` : 'sin síntomas clasificados'}.`,
    cites: [shortOT(ot.number)],
  });
  if (ot.diagnosis) bullets.push({ text: `Diagnóstico confirmado: ${ot.diagnosis.split('.')[0].toLowerCase()}.`, cites: [shortOT(ot.number)] });
  const prev = history.filter((h) => h.id !== ot.id);
  bullets.push(
    prev.length
      ? { text: `${prev.length} visita(s) previa(s) registradas en el taller.`, cites: prev.map((p) => shortOT(p.number)) }
      : { text: 'Primera visita registrada para este vehículo en TallerSmart.', cites: [] },
  );
  if (ot.vehicle.notes) bullets.push({ text: `Nota del vehículo: ${ot.vehicle.notes}.`, cites: ['Ficha'] });
  return bullets.slice(0, 3);
}

export function draftReport(ot: WorkOrder, tone: 'cliente' | 'tecnico'): string {
  const parts = ot.items.filter((i) => i.type === 'part').map((i) => i.name);
  const services = ot.items.filter((i) => i.type === 'service').map((i) => i.name);
  if (tone === 'tecnico') {
    return `${ot.number} · ${ot.vehicle.make} ${ot.vehicle.model} ${ot.vehicle.year} · ${formatPlate(ot.vehicle.plate)}\n\nMotivo: ${ot.complaint}\nDiagnóstico: ${ot.diagnosis ?? 'Pendiente.'}\n\nTrabajos: ${services.join('; ') || '—'}.\nRepuestos: ${parts.join('; ') || '—'}.\n\nKm ingreso: ${ot.mileageIn.toLocaleString('es-CL')}. Total: ${money(ot.total)}.`;
  }
  return `Estimado/a ${ot.client.name}:\n\nSu ${ot.vehicle.make} ${ot.vehicle.model} (patente ${formatPlate(ot.vehicle.plate)}) ingresó por: "${ot.complaint.toLowerCase()}"\n\n${ot.diagnosis ? `Tras la revisión, encontramos que ${ot.diagnosis.charAt(0).toLowerCase() + ot.diagnosis.slice(1)}` : 'Nuestro equipo está finalizando el diagnóstico.'}\n\nRealizamos: ${services.join(', ').toLowerCase() || 'la revisión correspondiente'}${parts.length ? `, instalando ${parts.length} repuesto(s) nuevos` : ''}.\n\nTotal del servicio: ${money(ot.total)} CLP.\n\nGracias por confiar en TallerSmart.`;
}
