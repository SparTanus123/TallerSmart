"use client" /* Header */ /* Content */ /* AI Summary Card */ /* Grid */ /* Footer / Actions */
import { useEffect, useState } from "react"
import Image from "next/image"
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
import { api } from "@/lib/api-client"
import { useGlobal } from "@/lib/context"
import { SmartMecLogo } from "@/components/ai/SmartMecLogo"
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
  const { refreshOrders, uploadIntakePhotos, technicians, assignTechnician } = useGlobal()
  const [tab, setTab] = useState<"resumen" | "items" | "ia">("resumen")
  const [catalog, setCatalog] = useState<{ id: string; type: "SERVICE" | "PART"; name: string; code: string }[]>([])
  const [catalogId, setCatalogId] = useState("")
  const [lineError, setLineError] = useState("")
  const [lineBusy, setLineBusy] = useState(false)
  const [documentBusy, setDocumentBusy] = useState(false)
  const [documentError, setDocumentError] = useState("")
  const [manualLine, setManualLine] = useState(false)
  const canAuthorize = role === "admin" || role === "advisor"
  const editable = ot.status !== "completed" && ot.status !== "delivered"
  useEffect(() => { if (tab === "items") void api.catalog().then(rows => setCatalog(rows.filter(r => r.active !== false).map(r => ({ id: String(r.id), type: r.type === "PART" ? "PART" : "SERVICE", name: String(r.name), code: String(r.code) })))).catch(e => setLineError(e instanceof Error ? e.message : "No se pudo cargar el catálogo")) }, [tab])
  async function changeLine(action: () => Promise<unknown>) { setLineBusy(true); setLineError(""); try { await action(); await refreshOrders() } catch (e) { setLineError(e instanceof Error ? e.message : "No se pudo guardar el ítem") } finally { setLineBusy(false) } }
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
    if (next === "delivered" && !canAuthorize) return
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
  const handleDraft = async () => {
    setIsDrafting(true)
    setDraft("")
    setReportApproved(false)
    try {
      const res = await api.aiDeliveryReport({
        workOrderId: ot.id,
        tone: draftTone,
      })
      if (res.success && res.report) {
        setDraft(res.report)
      } else {
        setDraft(draftReport(ot, draftTone))
      }
    } catch {
      setDraft(draftReport(ot, draftTone))
    } finally {
      setIsDrafting(false)
    }
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
              {ot.vehicle.make}{ot.vehicle.model ? ` ${ot.vehicle.model}` : ""} {ot.vehicle.year} ·{" "}
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
        <div className="mb-3 flex flex-wrap gap-2">
          {([
            ["intake", "Comprobante de ingreso"],
            ["quotation", "Cotización"],
            ["delivery", "Informe de entrega"],
          ] as const).map(([type, label]) => (
            <button key={type} className="btn btn-secondary btn-sm" disabled={documentBusy || (type === "delivery" && !approved)} title={type === "delivery" && !approved ? "Aprueba el informe técnico para generar la hoja de entrega" : undefined} onClick={async () => {
              setDocumentBusy(true); setDocumentError("")
              try { await api.downloadWorkOrderDocument(ot.id, type) }
              catch (error) { setDocumentError(error instanceof Error ? error.message : "No se pudo generar el PDF") }
              finally { setDocumentBusy(false) }
            }}>{documentBusy ? "Generando…" : label}</button>
          ))}
          {documentError && <span role="alert" className="self-center text-[12px] text-red-600">{documentError}</span>}
        </div>
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
                            : entry.action === "technician_assigned"
                              ? "Técnico asignado"
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
            {(ot.intakeInspection || ot.intakePhotos?.length || (editable && canAuthorize)) && <div className="card p-4"><div className="eyebrow mb-3">Inspección de recepción</div>{ot.intakeInspection && <div className="grid gap-2 text-sm sm:grid-cols-2"><p><span className="text-fg-3">Combustible:</span> {ot.intakeInspection.fuelLevel}%</p><p><span className="text-fg-3">Pertenencias:</span> {ot.intakeInspection.belongings.join(", ") || "Ninguna declarada"}</p><p className="sm:col-span-2"><span className="text-fg-3">Daños previos:</span> {ot.intakeInspection.damageAreas.join(", ") || "Sin daños marcados"}</p>{ot.intakeInspection.notes && <p className="sm:col-span-2 whitespace-pre-wrap"><span className="text-fg-3">Detalle:</span> {ot.intakeInspection.notes}</p>}</div>}{Boolean(ot.intakePhotos?.length) && <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{ot.intakePhotos?.map(photo => <figure key={photo.id} className="relative overflow-hidden rounded-lg border border-line"><Image unoptimized width={480} height={360} className="h-36 w-full object-cover" src={`/api/v1/work-orders/${ot.id}/intake-photos/${photo.id}`} alt={`Inspección: ${photo.fileName}`}/><figcaption className="truncate px-2 py-1 text-[11px] text-fg-3">{photo.fileName}</figcaption>{canAuthorize && editable && <button className="absolute right-1 top-1 rounded bg-white/90 px-2 py-1 text-xs text-red-700 shadow" onClick={() => void changeLine(() => api.deleteIntakePhoto(ot.id, photo.id))}>Quitar</button>}</figure>)}</div>}{canAuthorize && editable && <label className="mt-4 block text-xs text-fg-3">Adjuntar fotos de inspección<input className="field mt-1 w-full py-2" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e => { const files = Array.from(e.target.files ?? []); if (files.some(f => f.size > 5 * 1024 * 1024) || files.reduce((s,f) => s + f.size, 0) > 5 * 1024 * 1024 || files.some(f => !["image/jpeg","image/png","image/webp"].includes(f.type))) { setLineError("Imágenes JPG, PNG o WebP hasta 5 MB en total."); e.target.value = ""; return } if (files.length) void changeLine(() => uploadIntakePhotos(ot.id, files)); e.target.value = "" }}/></label>}</div>}
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
                <div className="mb-2 flex items-center justify-between">
                  <div className="eyebrow">Técnico Asignado</div>
                  {canAuthorize && editable && (
                    <span className="text-[11px] text-fg-3">Admin / Asesora</span>
                  )}
                </div>{" "}
                {canAuthorize && editable ? (
                  <div className="flex items-center gap-2">
                    <Avatar name={ot.technicianName} size={24} />
                    <select
                      className="field h-8 flex-1 text-xs font-medium"
                      value={ot.technicianId || ""}
                      disabled={lineBusy}
                      onChange={(e) => {
                        const newId = e.target.value || null
                        const tech = technicians.find((t) => t.id === newId)
                        void changeLine(async () => {
                          await assignTechnician(ot.id, newId)
                        })
                        onUpdate({
                          ...ot,
                          technicianId: newId ?? "",
                          technicianName: tech?.name ?? "Sin asignar",
                        })
                      }}
                    >
                      <option value="">Sin asignar</option>
                      {technicians.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Avatar name={ot.technicianName} size={24} />
                    <div className="text-[14px] font-medium text-fg">
                      {ot.technicianName}
                    </div>
                  </div>
                )}{" "}
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
            {editable && <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
              <select className="field h-9 min-w-56 flex-1" value={catalogId} onChange={e => setCatalogId(e.target.value)}><option value="">Agregar desde catálogo…</option>{catalog.map(row => <option key={row.id} value={row.id}>{row.code} · {row.name}</option>)}</select>
              <button className="btn btn-secondary btn-sm" disabled={!catalogId || lineBusy} onClick={() => void changeLine(() => api.addCatalogItemToOrder(ot.id, catalogId, 1))}>Agregar</button>
              <button className="btn btn-secondary btn-sm" disabled={lineBusy} onClick={() => setManualLine(v => !v)}>Ítem manual</button>
            </div>}
            {manualLine && editable && <form className="grid gap-2 border-b border-line bg-surface-2 p-3 sm:grid-cols-5" onSubmit={e => { e.preventDefault(); const f = new FormData(e.currentTarget); void changeLine(async () => { await api.addManualItemToOrder(ot.id, { type: String(f.get("type")) as "SERVICE" | "PART", name: String(f.get("name")), quantity: Number(f.get("quantity")), unitPrice: Number(f.get("unitPrice")) }); setManualLine(false) }) }}><select className="field h-9" name="type"><option value="SERVICE">Servicio</option><option value="PART">Repuesto</option></select><input className="field h-9 sm:col-span-2" name="name" placeholder="Descripción" minLength={2} required/><input className="field h-9" name="quantity" type="number" min="0.01" step="0.01" defaultValue="1" required/><input className="field h-9" name="unitPrice" type="number" min="0" step="0.01" placeholder="Precio" required/><button className="btn btn-primary btn-sm sm:col-span-5" disabled={lineBusy}>Añadir pendiente de aprobación</button></form>}
            {lineError && <p role="alert" className="m-3 rounded bg-red-50 p-2 text-sm text-red-800">{lineError}</p>}
            <div className="overflow-x-auto"><table className="w-full text-left text-[13px]"><thead className="bg-surface-2 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-fg-3"><tr><th className="px-3 py-3">Ítem y aprobación</th><th className="px-3 py-3 text-right">Cant.</th><th className="px-3 py-3 text-right">P. Unit</th><th className="px-3 py-3 text-right">Subtotal</th></tr></thead><tbody className="divide-y divide-line">{ot.items.map(item => <tr key={item.id}><td className="px-3 py-3"><div className="font-medium text-fg">{item.name}</div><div className="mt-1 flex flex-wrap items-center gap-2"><span className="font-mono text-[10px] uppercase text-fg-4">{item.type === "part" ? "Repuesto" : "Servicio"}</span><span className={`rounded px-2 py-0.5 text-[10px] ${item.authorizationStatus === "APPROVED" ? "bg-green-100 text-green-800" : item.authorizationStatus === "REJECTED" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-900"}`}>{item.authorizationStatus === "APPROVED" ? "Aprobado" : item.authorizationStatus === "REJECTED" ? "Rechazado" : "Pendiente de aprobación"}</span></div>{editable && canAuthorize && item.authorizationStatus !== "APPROVED" && <button className="mt-2 text-xs font-medium text-green-700 underline" disabled={lineBusy} onClick={() => void changeLine(() => api.authorizeOrderItem(ot.id, item.id, "APPROVED"))}>Aprobar</button>}{editable && canAuthorize && item.authorizationStatus !== "REJECTED" && <button className="ml-3 mt-2 text-xs font-medium text-red-700 underline" disabled={lineBusy} onClick={() => void changeLine(() => api.authorizeOrderItem(ot.id, item.id, "REJECTED"))}>Rechazar</button>}</td><td className="px-2 py-3 text-right"><input className="field h-8 w-20 text-right font-mono" type="number" min="0.01" step="0.01" defaultValue={item.quantity} disabled={!editable || lineBusy} onBlur={e => { const quantity = Number(e.target.value); if (quantity > 0 && quantity !== item.quantity) void changeLine(() => api.updateOrderItem(ot.id, item.id, { quantity })) }}/></td><td className="px-2 py-3 text-right"><input className="field h-8 w-28 text-right font-mono" type="number" min="0" step="0.01" defaultValue={item.unitPrice} disabled={!editable || lineBusy} onBlur={e => { const unitPrice = Number(e.target.value); if (unitPrice >= 0 && unitPrice !== item.unitPrice) void changeLine(() => api.updateOrderItem(ot.id, item.id, { unitPrice })) }}/></td><td className="px-3 py-3 text-right font-mono font-medium tnum">{money(item.subtotal)}</td></tr>)}</tbody><tfoot className="border-t-2 border-line bg-surface-2"><tr><td colSpan={3} className="px-3 py-3 text-right text-xs font-semibold uppercase text-fg-3">Total aprobado</td><td className="px-3 py-3 text-right font-mono text-[15px] font-semibold text-brand-600">{money(ot.total)}</td></tr></tfoot></table></div>
            <p className="border-t border-line px-3 py-2 text-[11px] text-fg-3">El total solo incluye ítems aprobados. Cambiar cantidad o precio devuelve el ítem a pendiente.</p>
          </div>
        )}{" "}
        {tab === "ia" && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {" "}
            <div className="card p-5">
              {" "}
              <div className="mb-4 flex items-center justify-between">
                {" "}
                <div className="flex items-center gap-3">
                  <SmartMecLogo size={36} glow />
                  <div>
                    <div className="font-semibold text-fg">
                      Borrador de informe · SmartMec (Gemini AI)
                    </div>
                    <div className="text-[13px] text-fg-3">
                      Organiza los datos registrados. Revisa y aprueba el texto
                      antes de entregarlo al cliente.
                    </div>
                  </div>
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
            disabled={
              (next === "completed" && !ot.diagnosis?.trim()) ||
              (next === "delivered" && !canAuthorize)
            }
            title={
              next === "completed" && !ot.diagnosis?.trim()
                ? "Registra y guarda el diagnóstico antes de completar la orden"
                : next === "delivered" && !canAuthorize
                  ? "Solo el administrador o la asesora pueden mover el vehículo a entregado"
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
