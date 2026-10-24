"use client" /* Header */ /* Content */ /* AI Summary Card */ /* Grid */ /* Footer / Actions */
import { useState } from "react"
import type { UserRole, WorkOrder } from "@/types"
import {
  money,
  nextStatus,
  shortOT,
  vehicleSummary,
  draftReport,
} from "@/lib/workshop"
import { statusConfig, workOrders as mockHistory } from "../../data/mockData"
import {
  AILabel,
  Avatar,
  Drawer,
  Plate,
  StatusBadge,
} from "@/components/ui/primitives"
import { Icon } from "@/components/ui/Icon"
export default function OTDrawer({
  ot,
  onClose,
  onUpdate,
  role,
}: {
  ot: WorkOrder
  onClose: () => void
  onUpdate: (ot: WorkOrder) => void
  role: UserRole
}) {
  const [tab, setTab] = useState<"resumen" | "items" | "ia">("resumen")
  const [isDrafting, setIsDrafting] = useState(false)
  const [draftTone, setDraftTone] = useState<"cliente" | "tecnico">("cliente")
  const [draft, setDraft] = useState(ot.deliveryReportDraft ?? "")
  const [reportApproved, setReportApproved] = useState(false)
  const [diagnosisDraft, setDiagnosisDraft] = useState(ot.diagnosis ?? "")
  const [notesDraft, setNotesDraft] = useState(ot.notes ?? "")
  const next = nextStatus(ot.status)
  const nextCfg = next ? statusConfig[next] : null
  const approved =
    reportApproved ||
    (Boolean(ot.reportApprovedAt) && ot.approvedReportSnapshot === draft)
  const handleAdvance = () => {
    if (next === "completed" && !ot.diagnosis?.trim()) return
    if (next === "delivered" && !approved) return
    if (next)
      onUpdate({ ...ot, status: next, updatedAt: new Date().toISOString() })
  }
  const handleSaveTechnicalRecord = () => {
    const diagnosis = diagnosisDraft.trim()
    const notes = notesDraft.trim()
    const changes = [
      ...(diagnosis !== (ot.diagnosis ?? "") ? ["diagnóstico"] : []),
      ...(notes !== (ot.notes ?? "") ? ["trabajos ejecutados/notas"] : []),
    ]
    if (!changes.length || !diagnosis) return
    const at = new Date().toISOString()
    setDraft("")
    setReportApproved(false)
    onUpdate({
      ...ot,
      diagnosis,
      notes,
      updatedAt: at,
      deliveryReportDraft: undefined,
      approvedReportSnapshot: undefined,
      reportApprovedAt: undefined,
      reportApprovedBy: undefined,
      auditLog: [
        ...(ot.auditLog ?? []),
        {
          id: `evt-${Date.now()}`,
          action: "record_updated",
          actor: role,
          at,
          details: changes,
        },
      ],
    })
  }
  const handleDraft = () => {
    setIsDrafting(true)
    setDraft("")
    setReportApproved(false)
    const full = draftReport(ot, draftTone)
    let i = 0
    const interval = setInterval(() => {
      setDraft(full.slice(0, i))
      i += 3
      if (i > full.length) {
        clearInterval(interval)
        setIsDrafting(false)
      }
    }, 10)
  }
  return (
    <Drawer open={true} onClose={onClose} width={640}>
      {" "}
      {}{" "}
      <div className="flex shrink-0 flex-col border-b border-line px-6 pt-6 pb-0">
        {" "}
        <div className="mb-4 flex items-start justify-between">
          {" "}
          <div>
            {" "}
            <div className="mb-1 flex items-center gap-3">
              {" "}
              <h2 className="font-mono text-[18px] font-semibold text-fg">
                {shortOT(ot.number)}
              </h2>{" "}
              <StatusBadge status={ot.status} />{" "}
            </div>{" "}
            <div className="text-[14px] text-fg-2">
              {" "}
              {ot.vehicle.make} {ot.vehicle.model} {ot.vehicle.year} ·{" "}
              <Plate value={ot.vehicle.plate} />{" "}
            </div>{" "}
          </div>{" "}
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-fg-4 hover:bg-surface-2 hover:text-fg"
          >
            {" "}
            <Icon name="x" size={20} />{" "}
          </button>{" "}
        </div>{" "}
        <div className="flex gap-6">
          {" "}
          {(["resumen", "items", "ia"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`border-b-2 pb-3 text-[13px] font-medium transition-colors ${
                tab === t
                  ? "border-brand-500 text-brand-600"
                  : "border-transparent text-fg-3 hover:text-fg"
              }`}
            >
              {" "}
              {t === "resumen"
                ? "Resumen"
                : t === "items"
                  ? "Trabajos y Repuestos"
                  : "Asistente IA"}{" "}
            </button>
          ))}{" "}
        </div>{" "}
      </div>{" "}
      {}{" "}
      <div className="flex-1 overflow-y-auto p-6 bg-canvas">
        {" "}
        {tab === "resumen" && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {" "}
            {}{" "}
            <div className="ai-surface p-4 shadow-e1">
              {" "}
              <div className="mb-3 flex items-center justify-between">
                {" "}
                <AILabel>Resumen basado en reglas</AILabel>{" "}
                <div className="font-mono text-[10px] uppercase text-fg-4">
                  Resumen de demostración
                </div>{" "}
              </div>{" "}
              <ul className="flex flex-col gap-2">
                {" "}
                {vehicleSummary(
                  ot,
                  mockHistory.filter(
                    (h) => h.vehicle.plate === ot.vehicle.plate,
                  ),
                ).map((b, i) => (
                  <li key={i} className="text-[13px] text-fg-2 leading-relaxed">
                    {" "}
                    <span className="mr-2 text-brand-500">•</span> {b.text}{" "}
                    {b.cites.map((c) => (
                      <span
                        key={c}
                        className="ml-2 cursor-pointer font-mono text-[11px] text-brand-600 hover:underline"
                      >
                        [{c}]
                      </span>
                    ))}{" "}
                  </li>
                ))}{" "}
              </ul>
            </div>
            {ot.auditLog?.length ? (
              <div className="card p-4">
                <div className="eyebrow mb-3">Trazabilidad de la orden</div>
                <ol className="flex flex-col gap-2">
                  {ot.auditLog.map((entry) => (
                    <li key={entry.id} className="text-[12px] text-fg-2">
                      <span className="font-medium text-fg">
                        {entry.action === "created"
                          ? "Orden creada"
                          : entry.action === "status_changed"
                            ? `Estado: ${entry.fromStatus} → ${entry.toStatus}`
                            : entry.action === "record_updated"
                              ? `Registro técnico actualizado: ${entry.details?.join(", ")}`
                              : "Informe aprobado"}
                      </span>
                      <span className="text-fg-3">
                        {" "}
                        · {entry.actor} ·{" "}
                        {new Date(entry.at)
                          .toISOString()
                          .replace("T", " ")
                          .slice(0, 16) + " UTC"}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
            {}{" "}
            <div className="grid grid-cols-2 gap-4">
              {" "}
              <div className="card p-4">
                {" "}
                <div className="eyebrow mb-2">Cliente</div>{" "}
                <div className="text-[14px] font-medium text-fg">
                  {ot.client.name}
                </div>{" "}
                <div className="mt-1 text-[13px] text-fg-3">
                  {ot.client.phone}
                </div>{" "}
              </div>{" "}
              <div className="card p-4">
                {" "}
                <div className="eyebrow mb-2">Técnico Asignado</div>{" "}
                <div className="flex items-center gap-2">
                  {" "}
                  <Avatar name={ot.technicianName} size={24} />{" "}
                  <div className="text-[14px] font-medium text-fg">
                    {ot.technicianName}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
            <div className="card p-4">
              {" "}
              <div className="eyebrow mb-2">Motivo de Ingreso</div>{" "}
              <p className="text-[14px] leading-relaxed text-fg-2">
                {ot.complaint}
              </p>{" "}
            </div>{" "}
            <div className="card flex flex-col gap-3 p-4">
              <label className="eyebrow" htmlFor="technical-diagnosis">Diagnóstico del mecánico</label>
              <textarea id="technical-diagnosis" className="field min-h-20 resize-y" value={diagnosisDraft} onChange={(event) => setDiagnosisDraft(event.target.value)} placeholder="Registra el diagnóstico confirmado por el mecánico." />
              <label className="eyebrow" htmlFor="technical-notes">Trabajo ejecutado y notas</label>
              <textarea id="technical-notes" className="field min-h-20 resize-y" value={notesDraft} onChange={(event) => setNotesDraft(event.target.value)} placeholder="Describe el trabajo realizado con datos de esta orden." />
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] text-fg-3">Guardar registra quién hizo el cambio y cuándo.</span>
                <button className="btn btn-secondary btn-sm" onClick={handleSaveTechnicalRecord} disabled={!diagnosisDraft.trim() || (diagnosisDraft.trim() === (ot.diagnosis ?? "") && notesDraft.trim() === (ot.notes ?? ""))}>Guardar registro</button>
              </div>
            </div>{" "}
          </div>
        )}{" "}
        {tab === "items" && (
          <div className="card overflow-hidden animate-fade-in">
            {" "}
            <table className="w-full text-left text-[13px]">
              {" "}
              <thead className="bg-surface-2 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-fg-3">
                {" "}
                <tr>
                  {" "}
                  <th className="px-4 py-3">Item</th>{" "}
                  <th className="px-4 py-3 text-right">Cant.</th>{" "}
                  <th className="px-4 py-3 text-right">P. Unit</th>{" "}
                  <th className="px-4 py-3 text-right">Subtotal</th>{" "}
                </tr>{" "}
              </thead>{" "}
              <tbody className="divide-y divide-line">
                {" "}
                {ot.items.map((item) => (
                  <tr key={item.id}>
                    {" "}
                    <td className="px-4 py-3">
                      {" "}
                      <div className="font-medium text-fg">{item.name}</div>{" "}
                      <div className="font-mono text-[11px] text-fg-4 uppercase mt-0.5">
                        {item.type === "part" ? "Repuesto" : "Servicio"}
                      </div>{" "}
                    </td>{" "}
                    <td className="px-4 py-3 text-right font-mono tnum">
                      {item.quantity}
                    </td>{" "}
                    <td className="px-4 py-3 text-right font-mono tnum text-fg-3">
                      {money(item.unitPrice)}
                    </td>{" "}
                    <td className="px-4 py-3 text-right font-mono font-medium tnum">
                      {money(item.subtotal)}
                    </td>{" "}
                  </tr>
                ))}{" "}
              </tbody>{" "}
              <tfoot className="bg-surface-2 border-t-2 border-line">
                {" "}
                <tr>
                  {" "}
                  <td
                    colSpan={3}
                    className="px-4 py-3 text-right text-[12px] font-semibold uppercase tracking-[0.06em] text-fg-3"
                  >
                    Total
                  </td>{" "}
                  <td className="px-4 py-3 text-right font-mono text-[15px] font-semibold text-brand-600 tnum">
                    {money(ot.total)}
                  </td>{" "}
                </tr>{" "}
              </tfoot>{" "}
            </table>{" "}
          </div>
        )}{" "}
        {tab === "ia" && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {" "}
            <div className="card p-5">
              {" "}
              <div className="mb-4 flex items-center justify-between">
                {" "}
                <div>
                  {" "}
                  <div className="font-semibold text-fg">
                    Borrador de informe · plantilla determinista
                  </div>{" "}
                  <div className="text-[13px] text-fg-3">
                    Organiza los datos registrados. Revisa y aprueba el texto
                    antes de entregarlo al cliente.
                  </div>{" "}
                </div>{" "}
                <div className="seg">
                  {" "}
                  <button
                    aria-pressed={draftTone === "cliente"}
                    onClick={() => {
                      setDraftTone("cliente")
                      setDraft("")
                      setReportApproved(false)
                    }}
                  >
                    Para Cliente
                  </button>{" "}
                  <button
                    aria-pressed={draftTone === "tecnico"}
                    onClick={() => {
                      setDraftTone("tecnico")
                      setDraft("")
                      setReportApproved(false)
                    }}
                  >
                    Técnico
                  </button>{" "}
                </div>{" "}
              </div>{" "}
              {!draft && !isDrafting ? (
                <button
                  className="btn btn-secondary w-full"
                  onClick={handleDraft}
                >
                  {" "}
                  <Icon name="spark" size={16} duotone /> Generar Borrador{" "}
                </button>
              ) : (
                <div className="rounded-lg border border-line bg-surface p-4">
                  {" "}
                  <AILabel>Borrador generado</AILabel>
                  <textarea
                    aria-label="Borrador del informe para revisar"
                    value={draft}
                    onChange={(event) => {
                      setDraft(event.target.value)
                      setReportApproved(false)
                    }}
                    className="mt-3 min-h-40 w-full resize-y rounded bg-transparent text-[13px] leading-relaxed text-fg-2 focus:outline-none"
                  />
                  {isDrafting && <span className="ai-caret" />}
                  {!isDrafting && (
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-[12px] text-fg-3">
                        {approved
                          ? "Aprobado para entrega"
                          : "Pendiente de revisión humana"}
                      </span>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          const at = new Date().toISOString()
                          setReportApproved(true)
                          onUpdate({
                            ...ot,
                            deliveryReportDraft: draft,
                            approvedReportSnapshot: draft,
                            reportApprovedAt: at,
                            reportApprovedBy: role,
                            auditLog: [
                              ...(ot.auditLog ?? []),
                              {
                                id: `evt-${Date.now()}`,
                                action: "report_approved",
                                actor: role,
                                at,
                              },
                            ],
                          })
                        }}
                        disabled={!draft.trim()}
                      >
                        Aprobar informe
                      </button>
                    </div>
                  )}{" "}
                </div>
              )}{" "}
            </div>{" "}
          </div>
        )}{" "}
      </div>{" "}
      {}{" "}
      <div className="flex shrink-0 items-center justify-between border-t border-line bg-surface p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
        {" "}
        <button className="btn btn-ghost">
          <Icon name="dots" size={20} />
        </button>{" "}
        {ot.status === "in_progress" && (
          <button
            className="btn btn-secondary"
            onClick={() =>
              onUpdate({
                ...ot,
                status: "waiting_parts",
                updatedAt: new Date().toISOString(),
              })
            }
          >
            Esperar repuestos
          </button>
        )}
        {next && nextCfg ? (
          <button
            className="btn btn-primary group"
            onClick={handleAdvance}
            disabled={(next === "completed" && !ot.diagnosis?.trim()) || (next === "delivered" && !approved)}
            title={
              next === "completed" && !ot.diagnosis?.trim()
                ? "Registra y guarda el diagnóstico antes de completar la orden"
                : next === "delivered" && !approved
                  ? "Revisa y aprueba el informe en la pestaña Asistente IA"
                  : undefined
            }
          >
            {" "}
            Mover a {nextCfg.label}{" "}
            <Icon
              name="arrowRight"
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />{" "}
          </button>
        ) : (
          <div className="font-mono text-[12px] font-medium text-ok">
            ✓ OT Completada y Entregada
          </div>
        )}{" "}
      </div>{" "}
    </Drawer>
  )
}
