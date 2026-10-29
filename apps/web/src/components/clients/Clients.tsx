"use client"

import { useState, type FormEvent } from "react"
import { useGlobal } from "@/lib/context"
import type { Client, Vehicle, WorkOrder } from "@/types"
import { api } from "@/lib/api-client"
import { Plate } from "@/components/ui/primitives"

export default function Clients() {
  const { clients, vehicles, orders, createClient, createVehicle, role } = useGlobal()
  const [search, setSearch] = useState("")
  const [clientForm, setClientForm] = useState(false)
  const [vehicleOwner, setVehicleOwner] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const filtered = clients.filter(c => (c.name + " " + c.email + " " + c.phone).toLowerCase().includes(search.toLowerCase()))
  const canEdit = role === "admin" || role === "advisor"

  async function saveClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("")
    const form = new FormData(event.currentTarget)
    try { await createClient({ name: String(form.get("name")), phone: String(form.get("phone")), email: String(form.get("email") ?? ""), type: String(form.get("type")) as "PERSONAL" | "COMPANY" }); setClientForm(false) }
    catch (e) { setError(e instanceof Error ? e.message : "No se pudo guardar el cliente") }
    finally { setBusy(false) }
  }
  async function saveVehicle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("")
    const form = new FormData(event.currentTarget)
    try {
      await createVehicle({
        currentClientId: String(form.get("clientId")),
        plate: String(form.get("plate")),
        make: String(form.get("make")),
        model: String(form.get("model") ?? ""),
        year: Number(form.get("year")),
        mileage: Number(form.get("mileage")),
        vin: String(form.get("vin") ?? ""),
        color: String(form.get("color") ?? ""),
      })
      setVehicleOwner("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar el vehículo")
    } finally {
      setBusy(false)
    }
  }

  return <section className="mx-auto max-w-5xl p-6 lg:p-8">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Directorio persistente</p><h1 className="mt-1 text-2xl font-semibold text-fg">Clientes y vehículos</h1><p className="mt-1 text-sm text-fg-3">Registros consultados desde PostgreSQL.</p></div>{canEdit && <button className="btn btn-primary" onClick={() => setClientForm(v => !v)}>Nuevo cliente</button>}</div>
    {error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {clientForm && <form onSubmit={saveClient} className="card mb-5 grid gap-3 p-4 md:grid-cols-2"><input className="field h-10" name="name" placeholder="Nombre o razón social" minLength={2} required /><input className="field h-10" name="phone" placeholder="Teléfono" minLength={7} required /><input className="field h-10" name="email" type="email" placeholder="Correo (opcional)" /><select className="field h-10" name="type"><option value="PERSONAL">Persona</option><option value="COMPANY">Empresa</option></select><div className="flex gap-2 md:col-span-2"><button className="btn btn-primary" disabled={busy}>{busy ? "Guardando…" : "Guardar cliente"}</button><button type="button" className="btn btn-secondary" onClick={() => setClientForm(false)}>Cancelar</button></div></form>}
    {vehicleOwner && <form onSubmit={saveVehicle} className="card mb-5 grid gap-3 p-4 md:grid-cols-3"><input type="hidden" name="clientId" value={vehicleOwner} /><input className="field h-10" name="plate" placeholder="Placa colombiana (ej: ABC123 o ABC12D)" minLength={5} required /><input className="field h-10" name="make" placeholder="Marca" required /><input className="field h-10" name="year" type="number" min="1900" max="2100" placeholder="Año" required /><input className="field h-10" name="mileage" type="number" min="0" placeholder="Kilometraje actual" required /><input className="field h-10" name="vin" placeholder="VIN (opcional)" /><input className="field h-10" name="color" placeholder="Color" /><div className="flex gap-2 md:col-span-3"><button className="btn btn-primary" disabled={busy}>{busy ? "Guardando…" : "Guardar vehículo"}</button><button type="button" className="btn btn-secondary" onClick={() => setVehicleOwner("")}>Cancelar</button></div></form>}
    <div className="mb-4 flex items-center justify-between gap-3"><input className="field h-9 w-full max-w-sm" placeholder="Buscar cliente por nombre, correo o teléfono" value={search} onChange={e => setSearch(e.target.value)} /><span className="text-xs text-fg-3">{clients.length} clientes · {vehicles.length} vehículos</span></div>
    <div className="space-y-3">{filtered.map(client => <ClientCard key={client.id} client={client} vehicles={vehicles.filter(v => v.clientId === client.id)} orders={orders} canEdit={canEdit} canDelete={role === "admin"} onAddVehicle={() => setVehicleOwner(client.id)} />)}{!filtered.length && <div className="card p-8 text-center text-sm text-fg-3">{clients.length ? "No hay coincidencias." : "Todavía no hay clientes registrados."}</div>}</div>
  </section>
}

function ClientCard({ client, vehicles, orders, canEdit, canDelete, onAddVehicle }: { client: Client; vehicles: Vehicle[]; orders: WorkOrder[]; canEdit: boolean; canDelete: boolean; onAddVehicle: () => void }) {
  const { refreshDirectory } = useGlobal()
  const [editClient, setEditClient] = useState(false)
  const [editVehicle, setEditVehicle] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  async function saveClient(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const f = new FormData(event.currentTarget); setBusy(true); setError(""); try { await api.updateClient(client.id, { name: String(f.get("name")), phone: String(f.get("phone")), email: String(f.get("email") ?? ""), type: String(f.get("type")) as "PERSONAL" | "COMPANY" }); await refreshDirectory(); setEditClient(false) } catch (e) { setError(e instanceof Error ? e.message : "No se pudo actualizar") } finally { setBusy(false) } }
  async function saveVehicle(event: FormEvent<HTMLFormElement>, vehicle: Vehicle) {
    event.preventDefault(); const f = new FormData(event.currentTarget); setBusy(true); setError("")
    try {
      await api.updateVehicle(vehicle.id, {
        plate: String(f.get("plate")),
        make: String(f.get("make")),
        model: vehicle.model ?? "",
        year: Number(f.get("year")),
        mileage: Number(f.get("mileage")),
        color: String(f.get("color") ?? ""),
        changeReason: String(f.get("changeReason") ?? "")
      })
      await refreshDirectory(); setEditVehicle(null)
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo actualizar") } finally { setBusy(false) }
  }
  async function removeClient() { if (!window.confirm(`¿Eliminar el cliente ${client.name}? Solo es posible si no tiene vehículos ni órdenes.`)) return; setBusy(true); setError(""); try { await api.deleteClient(client.id); await refreshDirectory() } catch (e) { setError(e instanceof Error ? e.message : "No se pudo eliminar") } finally { setBusy(false) } }
  async function removeVehicle(vehicle: Vehicle) { if (!window.confirm(`¿Eliminar el vehículo ${vehicle.plate}? Solo es posible si no tiene órdenes.`)) return; setBusy(true); setError(""); try { await api.deleteVehicle(vehicle.id); await refreshDirectory() } catch (e) { setError(e instanceof Error ? e.message : "No se pudo eliminar") } finally { setBusy(false) } }
  return <article className="card p-4 md:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold text-fg">{client.name}</h2><p className="mt-1 text-sm text-fg-3">{client.phone}{client.email ? " · " + client.email : ""}</p><span className="mt-2 inline-block rounded bg-surface-2 px-2 py-1 text-[11px] uppercase text-fg-3">{client.type === "empresa" ? "Empresa" : "Persona"}</span></div>{(canEdit || canDelete) && <div className="flex gap-2">{canEdit && <><button className="btn btn-secondary btn-sm" onClick={() => setEditClient(v => !v)}>Editar cliente</button><button className="btn btn-secondary btn-sm" onClick={onAddVehicle}>Registrar vehículo</button></>}{canDelete && <button className="btn btn-secondary btn-sm text-red-700" disabled={busy} onClick={() => void removeClient()}>Eliminar</button>}</div>}</div>
    {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    {editClient && <form onSubmit={saveClient} className="mt-3 grid gap-2 rounded border border-line bg-surface-2 p-3 sm:grid-cols-2"><input className="field h-9" name="name" defaultValue={client.name} required minLength={2}/><input className="field h-9" name="phone" defaultValue={client.phone} required minLength={7}/><input className="field h-9" name="email" type="email" defaultValue={client.email}/><select className="field h-9" name="type" defaultValue={client.type === "empresa" ? "COMPANY" : "PERSONAL"}><option value="PERSONAL">Persona</option><option value="COMPANY">Empresa</option></select><div className="flex gap-2 sm:col-span-2"><button className="btn btn-primary btn-sm" disabled={busy}>Guardar cambios</button><button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditClient(false)}>Cancelar</button></div></form>}
    {vehicles.length > 0 && <div className="mt-4 divide-y divide-line">{vehicles.map(vehicle => { const recent = orders.filter(order => order.vehicle.id === vehicle.id).sort((a,b) => b.createdAt.localeCompare(a.createdAt))[0]; return <div key={vehicle.id} className="py-3"><div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-3"><Plate value={vehicle.plate} /><div><p className="font-medium text-fg">{vehicle.year} {vehicle.make}{vehicle.model ? " " + vehicle.model : ""}</p><p className="text-xs text-fg-3">{vehicle.mileage.toLocaleString("es-CO")} km{vehicle.color ? " · " + vehicle.color : ""}</p></div></div><div className="flex items-center gap-3"><p className="text-xs text-fg-3">{recent ? "Última OT " + recent.number + " · " + recent.status : "Sin órdenes previas"}</p>{canEdit && <button className="btn btn-secondary btn-sm" onClick={() => setEditVehicle(editVehicle === vehicle.id ? null : vehicle.id)}>Editar</button>}{canDelete && <button className="btn btn-secondary btn-sm text-red-700" disabled={busy} onClick={() => void removeVehicle(vehicle)}>Eliminar</button>}</div></div>{editVehicle === vehicle.id && <form onSubmit={e => void saveVehicle(e, vehicle)} className="mt-3 grid gap-2 rounded border border-line bg-surface-2 p-3 sm:grid-cols-3"><input className="field h-9" name="plate" defaultValue={vehicle.plate} placeholder="Placa" required/><input className="field h-9" name="make" defaultValue={vehicle.make} placeholder="Marca" required/><input className="field h-9" name="year" type="number" defaultValue={vehicle.year} placeholder="Año" required/><input className="field h-9" name="mileage" type="number" min="0" defaultValue={vehicle.mileage} placeholder="Kilometraje" required/><input className="field h-9" name="color" defaultValue={vehicle.color} placeholder="Color"/><input className="field h-9 sm:col-span-3" name="changeReason" placeholder="Motivo (obligatorio si baja km)"/><div className="flex gap-2 sm:col-span-3"><button className="btn btn-primary btn-sm" disabled={busy}>Guardar</button><button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditVehicle(null)}>Cancelar</button></div></form>}</div>})}</div>}
    {!vehicles.length && <p className="mt-4 text-sm text-fg-3">Sin vehículos registrados.</p>}</article>
}
