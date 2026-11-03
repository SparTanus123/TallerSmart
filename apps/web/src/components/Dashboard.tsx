"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { UserRole, WorkOrder } from '@/types';
import { money, moneyK } from '@/lib/workshop';
import { CardHeader, Plate, SlaTimer, StatusBadge } from '@/components/ui/primitives';
import { SmartMecLogo } from '@/components/ai/SmartMecLogo';
import { api } from '@/lib/api-client';

export default function Dashboard({
  orders,
  role,
  persona,
  technicians = [],
  onOpenOrder,
  onNewReception,
}: {
  orders: WorkOrder[];
  role: UserRole;
  persona: { name: string; label: string; techId?: string };
  technicians?: Array<{ id: string; name: string }>;
  onOpenOrder: (id: string) => void;
  onNewReception: () => void;
}) {
  const active = orders.filter((o) => o.status !== 'delivered' && o.status !== 'completed');
  const monthRev = orders
    .filter((o) => o.status === 'completed' || o.status === 'delivered')
    .reduce((s, o) => s + o.total, 0);

  // Status breakdown calculated dynamically from real work orders
  const receivedCount = orders.filter((o) => o.status === 'received').length;
  const diagnosingCount = orders.filter((o) => o.status === 'diagnosing').length;
  const inProgressCount = orders.filter((o) => o.status === 'in_progress').length;
  const waitingPartsCount = orders.filter((o) => o.status === 'waiting_parts').length;
  const finishedCount = orders.filter((o) => o.status === 'completed' || o.status === 'delivered').length;
  const totalOrders = orders.length;

  const getPct = (count: number) => (totalOrders > 0 ? (count / totalOrders) * 100 : 0);
  const receivedPct = getPct(receivedCount);
  const diagnosingPct = getPct(diagnosingCount);
  const inProgressPct = getPct(inProgressCount);
  const waitingPartsPct = getPct(waitingPartsCount);
  const finishedPct = getPct(finishedCount);

  // Dynamic technician occupancy
  const assignedTechs = new Set(active.map((o) => o.technicianId).filter(Boolean)).size;
  const totalTechs = technicians.length > 0 ? technicians.length : Math.max(assignedTechs, 0);
  const techOccupancy = totalTechs > 0 ? Math.round((assignedTechs / totalTechs) * 100) : 0;

  // SmartMec AI Briefing & Suggestions
  const [briefingText, setBriefingText] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Array<{ id: string; icon: string; title: string; prompt: string; workOrderId?: string }>>([]);
  const [loadingBriefing, setLoadingBriefing] = useState<boolean>(false);

  const fallbackBriefing = useMemo(() => {
    if (orders.length === 0) {
      return '🚗 Taller al día sin órdenes activas en este momento. 📋 Registra una nueva recepción para iniciar diagnósticos asistidos con SmartMec. 🔧';
    }
    const parts: string[] = [];
    const highUrgency = orders.filter((o) => o.urgency === 'high');
    if (highUrgency.length > 0) {
      parts.push(`🚨 ${highUrgency.length} OT${highUrgency.length > 1 ? 's' : ''} de alta urgencia`);
    }
    if (waitingPartsCount > 0) {
      parts.push(`📦 ${waitingPartsCount} esperan repuestos`);
    }
    if (inProgressCount > 0) {
      parts.push(`🔧 ${inProgressCount} en proceso técnico`);
    }
    if (diagnosingCount > 0) {
      parts.push(`🔍 ${diagnosingCount} en diagnóstico`);
    }
    return `🚗 ${active.length} OTs en taller: ${parts.length > 0 ? parts.join('. ') : 'flujo de trabajo normal en bahías'}. 💡 Consulta recomendaciones SmartMec. ⏱️`;
  }, [orders.length, active.length, waitingPartsCount, inProgressCount, diagnosingCount]);

  useEffect(() => {
    let isMounted = true;
    setLoadingBriefing(true);
    api.aiBriefing()
      .then((data) => {
        if (isMounted) {
          if (data.briefing) setBriefingText(data.briefing);
          if (data.suggestions) setSuggestions(data.suggestions);
        }
      })
      .catch(() => {
        // Fallback remains active
      })
      .finally(() => {
        if (isMounted) setLoadingBriefing(false);
      });
    return () => {
      isMounted = false;
    };
  }, [orders.length]);

  if (role === 'technician') {
    const myOrders = active.filter((o) => o.technicianId === persona.techId);
    const inProgress = myOrders.find((o) => o.status === 'in_progress');
    const queue = myOrders.filter((o) => o.id !== inProgress?.id);
    return (
      <div className="mx-auto max-w-4xl p-6 lg:p-8 animate-fade-in">
        <h2 className="mb-6 text-[24px] font-bold tracking-tight text-fg">Mi Bahía</h2>
        {inProgress ? (
          <div className="mb-8">
            <div className="eyebrow mb-2">OT en proceso</div>
            <div className="card card-interactive p-5" onClick={() => onOpenOrder(inProgress.id)}>
              <div className="mb-4 flex items-center justify-between border-b border-line pb-4">
                <Plate value={inProgress.vehicle.plate} size="lg" />
                <SlaTimer ot={inProgress} size={16} />
              </div>
              <div className="mb-1 text-[20px] font-semibold">
                {inProgress.vehicle.make}{inProgress.vehicle.model ? ` ${inProgress.vehicle.model}` : ""}
              </div>
              <div className="text-[15px] text-fg-2">{inProgress.complaint}</div>
            </div>
          </div>
        ) : (
          <div className="mb-8 rounded-xl border border-dashed border-line-strong bg-canvas px-6 py-10 text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white text-fg-3 shadow-e1">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
            <div className="text-[15px] font-medium text-fg">No tienes ninguna orden en proceso</div>
            <div className="text-[13px] text-fg-2">Selecciona una de tu cola para comenzar</div>
          </div>
        )}
        <div className="eyebrow mb-2">Mi Cola ({queue.length})</div>
        <div className="flex flex-col gap-3">
          {queue.map((ot) => (
            <div
              key={ot.id}
              className="card card-interactive flex items-center gap-4 p-4"
              onClick={() => onOpenOrder(ot.id)}
            >
              <Plate value={ot.vehicle.plate} />
              <div className="flex-1 min-w-0">
                <div className="truncate text-[14px] font-medium">
                  {ot.vehicle.make}{ot.vehicle.model ? ` ${ot.vehicle.model}` : ""}
                </div>
                <div className="truncate text-[13px] text-fg-3">{ot.complaint}</div>
              </div>
              <StatusBadge status={ot.status} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] p-6 lg:p-8 animate-fade-in">
      {/* AI Brief */}
      <div className="ai-surface mb-6 flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-xl border border-line bg-gradient-to-r from-surface via-surface to-brand-50/20 shadow-e1">
        <SmartMecLogo size={42} glow className="shrink-0 ring-1 ring-cyan-500/30" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-display text-[12px] font-bold text-fg">
              Smart<span className="text-cyan-600">Mec</span> AI
            </span>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
              Briefing del día
            </span>
            {loadingBriefing && (
              <span className="font-mono text-[10px] text-fg-3 animate-pulse">Sincronizando con base de datos...</span>
            )}
          </div>
          <div className="text-[13.5px] font-medium text-fg mt-1 leading-snug">
            {briefingText || fallbackBriefing}
          </div>
          {/* Real Work Order Suggestion Pills */}
          {suggestions.length > 0 && (
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-fg-3">Sugerencias:</span>
              {suggestions.slice(0, 3).map((sug) => (
                <Link
                  key={sug.id}
                  href={`/ai?prompt=${encodeURIComponent(sug.prompt)}${sug.workOrderId ? `&orderId=${sug.workOrderId}` : ''}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200/70 bg-white/90 px-2.5 py-1 text-[11.5px] font-medium text-brand-900 shadow-2xs transition-all hover:bg-brand-50 hover:border-brand-400"
                >
                  <span>{sug.icon}</span>
                  <span className="truncate max-w-[260px]">{sug.title}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
        <Link href="/ai" className="btn btn-secondary btn-sm flex items-center gap-1.5 shrink-0 self-start md:self-center">
          <span>Abrir SmartMec</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      </div>

      {/* Bento Top Row */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
        {role === 'admin' ? (
          <>
            <div className="card col-span-1 p-5 md:col-span-2">
              <div className="eyebrow mb-1">Ingresos del Mes</div>
              <div className="flex items-baseline gap-3">
                <div className="font-sans text-[36px] font-semibold tracking-[-0.03em] tnum">{money(monthRev)}</div>
                <div className="font-mono text-[13px] text-ok">▲ 12.4%</div>
              </div>
              <div className="mt-4 h-12 w-full rounded-sm bg-surface-2" />
            </div>
            <div className="card p-5">
              <div className="eyebrow mb-1">Ticket Promedio</div>
              <div className="flex items-baseline gap-3">
                <div className="font-sans text-[36px] font-semibold tracking-[-0.03em] tnum">
                  {moneyK(
                    monthRev /
                      Math.max(
                        1,
                        orders.filter((o) => o.status === 'completed' || o.status === 'delivered').length
                      )
                  )}
                </div>
                <div className="font-mono text-[13px] text-danger">▼ 3.1%</div>
              </div>
            </div>
            <div className="card p-5">
              <div className="eyebrow mb-1">Ocupación Técnicos</div>
              <div className="font-sans text-[36px] font-semibold tracking-[-0.03em] tnum">{techOccupancy}%</div>
              <div className="font-mono text-[13px] text-fg-3">
                {assignedTechs} asignados de {totalTechs}
              </div>
            </div>
          </>
        ) : (
          <>
            <div
              className="card flex items-center justify-center p-5 md:col-span-2 bg-brand-50"
              style={{ border: '1px solid #FFE3D4', boxShadow: 'none' }}
            >
              <button className="btn btn-primary btn-touch" onClick={onNewReception}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Registrar Nueva Recepción
              </button>
            </div>
            <div className="card p-5">
              <div className="eyebrow mb-1">Entregas de Hoy</div>
              <div className="font-sans text-[36px] font-semibold tracking-[-0.03em] tnum">
                {orders.filter((o) => o.status === 'completed' || o.status === 'delivered').length}
                <span className="text-fg-4">/{Math.max(1, orders.length)}</span>
              </div>
            </div>
            <div className="card p-5">
              <div className="eyebrow mb-1">Pendientes de Contacto</div>
              <div className="font-sans text-[36px] font-semibold tracking-[-0.03em] tnum">
                {orders.filter((o) => o.status === 'waiting_parts' || o.status === 'diagnosing').length}
              </div>
              <div className="font-mono text-[13px] text-warn">Presupuesto / repuesto</div>
            </div>
          </>
        )}
      </div>

      {/* Workshop Pulse - Volume by Status according to actual Work Orders */}
      <div className="card mb-6">
        <CardHeader
          title="Pulso del Taller"
          eyebrow="VOLUMEN POR ESTADO"
          right={<span className="font-mono text-[11px] font-semibold text-fg-3">{totalOrders} OTs registradas</span>}
        />
        <div className="px-5 pb-5">
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-surface-2">
            {totalOrders === 0 ? (
              <div className="h-full w-full bg-slate-200/60" title="Sin órdenes registradas" />
            ) : (
              <>
                {receivedPct > 0 && (
                  <div
                    style={{ width: `${receivedPct}%`, background: '#CBD5E1' }}
                    title={`Recibido: ${receivedCount} (${receivedPct.toFixed(1)}%)`}
                    className="transition-all duration-300"
                  />
                )}
                {diagnosingPct > 0 && (
                  <div
                    style={{ width: `${diagnosingPct}%`, background: '#DDD0FE' }}
                    title={`En Diagnóstico: ${diagnosingCount} (${diagnosingPct.toFixed(1)}%)`}
                    className="transition-all duration-300"
                  />
                )}
                {inProgressPct > 0 && (
                  <div
                    style={{ width: `${inProgressPct}%`, background: '#C7D7FE' }}
                    title={`En Proceso: ${inProgressCount} (${inProgressPct.toFixed(1)}%)`}
                    className="transition-all duration-300"
                  />
                )}
                {waitingPartsPct > 0 && (
                  <div
                    style={{ width: `${waitingPartsPct}%`, background: '#FCE3A6' }}
                    title={`Espera Repuestos: ${waitingPartsCount} (${waitingPartsPct.toFixed(1)}%)`}
                    className="transition-all duration-300"
                  />
                )}
                {finishedPct > 0 && (
                  <div
                    style={{ width: `${finishedPct}%`, background: '#A7E8C9' }}
                    title={`Finalizado/Entregado: ${finishedCount} (${finishedPct.toFixed(1)}%)`}
                    className="transition-all duration-300"
                  />
                )}
              </>
            )}
          </div>
          <div className="mt-3 flex justify-between font-mono text-[11px] uppercase tracking-[0.04em] text-fg-3">
            <span className={receivedCount > 0 ? "font-semibold text-fg-2" : ""}>Recibido {receivedCount}</span>
            <span className={diagnosingCount > 0 ? "font-semibold text-fg-2" : ""}>Diag. {diagnosingCount}</span>
            <span className={inProgressCount > 0 ? "font-semibold text-fg-2" : ""}>En proceso {inProgressCount}</span>
            <span className={waitingPartsCount > 0 ? "font-semibold text-fg-2" : ""}>Espera rep. {waitingPartsCount}</span>
            <span className={finishedCount > 0 ? "font-semibold text-fg-2" : ""}>Fin. {finishedCount}</span>
          </div>
        </div>
      </div>

      {/* Exceptions Table */}
      <div className="card">
        <CardHeader title="Requieren Atención" eyebrow="EXCEPCIONES Y ATRASOS" />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-line bg-surface-2 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-fg-3">
                <th className="px-5 py-2">OT #</th>
                <th className="px-5 py-2">Vehículo</th>
                <th className="px-5 py-2">Técnico</th>
                <th className="px-5 py-2">Estado</th>
                <th className="px-5 py-2">SLA</th>
              </tr>
            </thead>
            <tbody>
              {active.slice(0, 5).map((ot) => (
                <tr
                  key={ot.id}
                  className="row-hover cursor-pointer border-b border-line last:border-0"
                  onClick={() => onOpenOrder(ot.id)}
                >
                  <td className="px-5 py-3 font-mono font-medium">{ot.number.slice(-7)}</td>
                  <td className="px-5 py-3 font-medium">
                    {ot.vehicle.make}{ot.vehicle.model ? ` ${ot.vehicle.model}` : ""}
                  </td>
                  <td className="px-5 py-3 text-fg-2">{ot.technicianName.split(' ')[0]}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={ot.status} />
                  </td>
                  <td className="px-5 py-3">
                    <SlaTimer ot={ot} />
                  </td>
                </tr>
              ))}
              {active.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-fg-3">
                    No hay órdenes activas pendientes de atención.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
