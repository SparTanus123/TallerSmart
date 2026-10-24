"use client"

import { useCallback, useEffect, useState, type FormEvent } from "react"
import { api } from "@/lib/api-client"
import { useGlobal } from "@/lib/context"

type Item = { id: string; type: "SERVICE" | "PART"; code: string; name: string; description: string; unitPrice: number; unit: string }
function mapItem(row: Record<string, unknown>): Item { return { id: String(row.id), type: row.type === "PART" ? "PART" : "SERVICE", code: String(row.code), name: String(row.name), description: String(row.description ?? ""), unitPrice: Number(row.unitPrice), unit: String(row.unit ?? "unidad") } }

export default function Catalog() {
  const { role } = useGlobal()
  const [items, setItems] = useState<Item[]>([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("ALL")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Item | null>(null)
  const [busy, setBusy] = useState(false)
  const refresh = useCallback(async () => { try { setItems((await api.catalog()).map(mapItem)); setError("") } catch (e) { setError(e instanceof Error ? e.message : "No se pudo cargar el catálogo") } finally { setLoading(false) } }, [])
  useEffect(() => { void refresh() }, [refresh])
  const filtered = items.filter(item => (filter === "ALL" || item.type === filter) && `${item.code} ${item.name} ${item.description}`.toLowerCase().includes(search.toLowerCase()))

  async function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("")
    const form = new FormData(event.currentTarget)
    try { const body = { type: String(form.get("type")) as "SERVICE" | "PART", code: String(form.get("code")), name: String(form.get("name")), description: String(form.get("description") ?? ""), unitPrice: Number(form.get("unitPrice")), unit: String(form.get("unit") || "unidad") }; if (editing) await api.updateCatalogItem(editing.id, body); else await api.createCatalogItem(body); setShowForm(false); setEditing(null); await refresh() }
    catch (e) { setError(e instanceof Error ? e.message : "No se pudo guardar el ítem") }
    finally { setBusy(false) }
  }

  return <section className="p-6 lg:p-8">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Datos del taller</p><h1 className="mt-1 text-2xl font-semibold text-fg">Catálogo</h1><p className="mt-1 text-sm text-fg-3">Servicios y repuestos guardados en la base de datos.</p></div>{role === "admin" && <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(v => !v) }}>Nuevo ítem</button>}</div>
    {error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {showForm && <form onSubmit={addItem} className="card mb-5 grid gap-3 p-4 md:grid-cols-3"><select className="field h-10" name="type" defaultValue={editing?.type ?? "SERVICE"}><option value="SERVICE">Servicio</option><option value="PART">Repuesto</option></select><input className="field h-10" name="code" placeholder="Código" defaultValue={editing?.code} required /><input className="field h-10" name="name" placeholder="Nombre del ítem" defaultValue={editing?.name} required minLength={2} /><input className="field h-10" name="description" placeholder="Descripción" defaultValue={editing?.description} /><input className="field h-10" name="unitPrice" type="number" min="0" step="0.01" placeholder="Precio unitario" defaultValue={editing?.unitPrice} required /><input className="field h-10" name="unit" placeholder="Unidad" defaultValue={editing?.unit ?? "unidad"} /><div className="flex gap-2 md:col-span-3"><button className="btn btn-primary" disabled={busy}>{busy ? "Guardando…" : editing ? "Guardar cambios" : "Guardar"}</button><button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditing(null) }}>Cancelar</button></div></form>}
    <div className="card overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4"><input className="field h-9 w-full max-w-sm" placeholder="Buscar por código o nombre" value={search} onChange={e => setSearch(e.target.value)} /><div className="flex gap-2">{[["ALL","Todos"],["SERVICE","Servicios"],["PART","Repuestos"]].map(([value,label]) => <button key={value} className={`btn btn-sm ${filter === value ? "btn-primary" : "btn-secondary"}`} onClick={() => setFilter(value)}>{label}</button>)}</div></div>
      {loading ? <p className="p-8 text-center text-sm text-fg-3">Cargando catálogo…</p> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-surface-2 text-xs uppercase text-fg-3"><tr><th className="p-3">Código</th><th className="p-3">Tipo</th><th className="p-3">Nombre</th><th className="p-3">Descripción</th><th className="p-3">Precio</th>{role === "admin" && <th className="p-3">Acciones</th>}</tr></thead><tbody>{filtered.map(item => <tr key={item.id} className="border-t border-line"><td className="p-3 font-mono">{item.code}</td><td className="p-3">{item.type === "PART" ? "Repuesto" : "Servicio"}</td><td className="p-3 font-medium">{item.name}</td><td className="p-3 text-fg-3">{item.description || "—"}</td><td className="p-3 font-mono">${item.unitPrice.toLocaleString("es-CO")} / {item.unit}</td>{role === "admin" && <td className="p-3"><button className="btn btn-secondary btn-sm" onClick={() => { setEditing(item); setShowForm(true) }}>Editar</button></td>}</tr>)}</tbody></table>{!filtered.length && <p className="p-8 text-center text-sm text-fg-3">{items.length ? "No hay coincidencias." : "Todavía no hay ítems en el catálogo."}</p>}</div>}
    </div>
  </section>
}
