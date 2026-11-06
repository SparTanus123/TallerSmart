"use client"

import { useState, type FormEvent } from "react"
import { useGlobal } from "@/lib/context"
import type { Client, Vehicle, VehicleType, WorkOrder } from "@/types"
import { api } from "@/lib/api-client"
import { Plate } from "@/components/ui/primitives"
import { VehicleFormFields } from "@/components/vehicles/VehicleFormFields"
import { getVehicleTypeInfo } from "@/lib/vehicle-catalog"

export default function Clients() {
  const { clients, vehicles, orders, createClient, createVehicle, role } = useGlobal()
  const [search, setSearch] = useState("")
  const [clientForm, setClientForm] = useState(false)
  const [globalVehicleForm, setGlobalVehicleForm] = useState(false)
  const [selectedClientIdForGlobal, setSelectedClientIdForGlobal] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [activeClientAddVehicle, setActiveClientAddVehicle] = useState<string | null>(null)

  const filtered = clients.filter((c) =>
    (c.name + " " + (c.email ?? "") + " " + c.phone).toLowerCase().includes(search.toLowerCase())
  )
  const canEdit = role === "admin" || role === "advisor" || role === "technician"

  async function saveClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError("")
    const form = new FormData(event.currentTarget)
    try {
      await createClient({
        name: String(form.get("name")),
        phone: String(form.get("phone")),
        email: String(form.get("email") ?? ""),
        type: String(form.get("type")) as "PERSONAL" | "COMPANY",
      })
      setClientForm(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar el cliente")
    } finally {
      setBusy(false)
    }
  }

  async function saveGlobalVehicle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError("")
    const form = new FormData(event.currentTarget)
    const clientId = String(form.get("clientId") || selectedClientIdForGlobal)

    if (!clientId) {
      setError("Debes seleccionar a qué cliente pertenece el vehículo")
      setBusy(false)
      return
    }

    try {
      await createVehicle({
        currentClientId: clientId,
        type: (String(form.get("type")) || "CAR") as VehicleType,
        plate: String(form.get("plate")),
        make: String(form.get("make")),
        model: String(form.get("model") ?? ""),
        year: Number(form.get("year")),
        mileage: Number(form.get("mileage")),
        vin: String(form.get("vin") ?? ""),
        color: String(form.get("color") ?? ""),
      })
      setGlobalVehicleForm(false)
      setSelectedClientIdForGlobal("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo registrar el vehículo")
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="mx-auto max-w-5xl p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Directorio persistente</p>
          <h1 className="mt-1 text-2xl font-semibold text-fg">Clientes y vehículos</h1>
          <p className="mt-1 text-sm text-fg-3">Registros de clientes, carros, motos y cuatrimotos en PostgreSQL.</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <button className="btn btn-secondary" onClick={() => setGlobalVehicleForm((v) => !v)}>
              + Registrar vehículo
            </button>
            <button className="btn btn-primary" onClick={() => setClientForm((v) => !v)}>
              + Nuevo cliente
            </button>
          </div>
        )}
      </div>

      {/* Global Error Banner */}
      {error && (
        <div role="alert" className="mb-5 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} className="text-red-600 hover:text-red-800 font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Formulario Nuevo Cliente */}
      {clientForm && (
        <form onSubmit={saveClient} className="card mb-6 grid gap-3 p-5 md:grid-cols-2 border-primary/30 shadow-sm animate-fade-in">
          <div className="md:col-span-2 flex items-center justify-between border-b border-line pb-2 mb-1">
            <h3 className="font-semibold text-fg">Crear nuevo cliente</h3>
            <span className="text-xs text-fg-3">Ingresa los datos del propietario o empresa</span>
          </div>
          <input className="field h-10" name="name" placeholder="Nombre completo o razón social *" minLength={2} required />
          <input className="field h-10" name="phone" placeholder="Teléfono / Celular *" minLength={7} required />
          <input className="field h-10" name="email" type="email" placeholder="Correo electrónico (opcional)" />
          <select className="field h-10" name="type">
            <option value="PERSONAL">Persona natural</option>
            <option value="COMPANY">Empresa (Flota / Jurídica)</option>
          </select>
          <div className="flex gap-2 md:col-span-2 pt-2">
            <button className="btn btn-primary" disabled={busy}>
              {busy ? "Guardando…" : "Guardar cliente"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setClientForm(false)}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Formulario Global Registrar Vehículo */}
      {globalVehicleForm && (
        <form onSubmit={saveGlobalVehicle} className="card mb-6 p-5 border-primary/30 shadow-sm animate-fade-in space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-2">
            <div>
              <h3 className="font-semibold text-fg">Registrar nuevo vehículo</h3>
              <p className="text-xs text-fg-3">Selecciona el cliente y completa los datos del vehículo (carro, moto, cuatrimoto, etc.)</p>
            </div>
            <button type="button" className="text-fg-3 hover:text-fg text-sm font-semibold" onClick={() => setGlobalVehicleForm(false)}>
              ✕
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-fg-2 mb-1">
              Cliente propietario <span className="text-red-500">*</span>
            </label>
            <select
              className="field h-10 w-full"
              name="clientId"
              value={selectedClientIdForGlobal}
              onChange={(e) => setSelectedClientIdForGlobal(e.target.value)}
              required
            >
              <option value="">-- Selecciona el cliente propietario --</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {c.phone} {c.email ? `(${c.email})` : ""}
                </option>
              ))}
            </select>
          </div>

          <VehicleFormFields />

          <div className="flex gap-2 pt-2 border-t border-line">
            <button className="btn btn-primary" disabled={busy}>
              {busy ? "Guardando vehículo…" : "Registrar vehículo"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setGlobalVehicleForm(false)}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Buscador */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <input
          className="field h-9 w-full max-w-sm"
          placeholder="Buscar cliente por nombre, correo o teléfono"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="text-xs text-fg-3">
          {clients.length} clientes · {vehicles.length} vehículos
        </span>
      </div>

      {/* Lista de Clientes */}
      <div className="space-y-4">
        {filtered.map((client) => (
          <ClientCard
            key={client.id}
            client={client}
            vehicles={vehicles.filter((v) => v.clientId === client.id)}
            orders={orders}
            canEdit={canEdit}
            canDelete={role === "admin"}
            isAddingVehicle={activeClientAddVehicle === client.id}
            onToggleAddVehicle={() =>
              setActiveClientAddVehicle((curr) => (curr === client.id ? null : client.id))
            }
          />
        ))}
        {!filtered.length && (
          <div className="card p-8 text-center text-sm text-fg-3">
            {clients.length ? "No hay clientes que coincidan con la búsqueda." : "Todavía no hay clientes registrados."}
          </div>
        )}
      </div>
    </section>
  )
}

function ClientCard({
  client,
  vehicles,
  orders,
  canEdit,
  canDelete,
  isAddingVehicle,
  onToggleAddVehicle,
}: {
  client: Client
  vehicles: Vehicle[]
  orders: WorkOrder[]
  canEdit: boolean
  canDelete: boolean
  isAddingVehicle: boolean
  onToggleAddVehicle: () => void
}) {
  const { refreshDirectory, createVehicle } = useGlobal()
  const [editClient, setEditClient] = useState(false)
  const [editVehicle, setEditVehicle] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  async function saveClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const f = new FormData(event.currentTarget)
    setBusy(true)
    setError("")
    try {
      await api.updateClient(client.id, {
        name: String(f.get("name")),
        phone: String(f.get("phone")),
        email: String(f.get("email") ?? ""),
        type: String(f.get("type")) as "PERSONAL" | "COMPANY",
      })
      await refreshDirectory()
      setEditClient(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo actualizar")
    } finally {
      setBusy(false)
    }
  }

  async function handleAddVehicleInline(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError("")
    const form = new FormData(event.currentTarget)
    try {
      await createVehicle({
        currentClientId: client.id,
        type: (String(form.get("type")) || "CAR") as VehicleType,
        plate: String(form.get("plate")),
        make: String(form.get("make")),
        model: String(form.get("model") ?? ""),
        year: Number(form.get("year")),
        mileage: Number(form.get("mileage")),
        vin: String(form.get("vin") ?? ""),
        color: String(form.get("color") ?? ""),
      })
      await refreshDirectory()
      onToggleAddVehicle()
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo registrar el vehículo")
    } finally {
      setBusy(false)
    }
  }

  async function saveVehicle(event: FormEvent<HTMLFormElement>, vehicle: Vehicle) {
    event.preventDefault()
    const f = new FormData(event.currentTarget)
    setBusy(true)
    setError("")
    try {
      await api.updateVehicle(vehicle.id, {
        plate: String(f.get("plate")),
        type: (String(f.get("type")) || vehicle.type || "CAR") as VehicleType,
        make: String(f.get("make")),
        model: String(f.get("model") ?? vehicle.model ?? ""),
        year: Number(f.get("year")),
        mileage: Number(f.get("mileage")),
        color: String(f.get("color") ?? ""),
        changeReason: String(f.get("changeReason") ?? ""),
      })
      await refreshDirectory()
      setEditVehicle(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo actualizar")
    } finally {
      setBusy(false)
    }
  }

  async function removeClient() {
    if (!window.confirm(`¿Eliminar el cliente ${client.name}? Solo es posible si no tiene vehículos ni órdenes asociadas.`)) return
    setBusy(true)
    setError("")
    try {
      await api.deleteClient(client.id)
      await refreshDirectory()
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo eliminar el cliente")
    } finally {
      setBusy(false)
    }
  }

  async function removeVehicle(vehicle: Vehicle) {
    if (!window.confirm(`¿Eliminar el vehículo ${vehicle.plate}? Solo es posible si no tiene órdenes de trabajo registradas.`)) return
    setBusy(true)
    setError("")
    try {
      await api.deleteVehicle(vehicle.id)
      await refreshDirectory()
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo eliminar el vehículo")
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className="card p-4 md:p-5">
      {/* Encabezado del cliente */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-fg text-lg">{client.name}</h2>
            <span className="rounded bg-surface-2 px-2 py-0.5 text-[11px] uppercase font-medium text-fg-3">
              {client.type === "empresa" ? "Empresa" : "Persona"}
            </span>
          </div>
          <p className="mt-1 text-sm text-fg-3">
            📞 {client.phone}
            {client.email ? ` · ✉️ ${client.email}` : ""}
          </p>
        </div>

        {(canEdit || canDelete) && (
          <div className="flex flex-wrap gap-2">
            {canEdit && (
              <>
                <button className="btn btn-secondary btn-sm" onClick={() => setEditClient((v) => !v)}>
                  {editClient ? "Cerrar edición" : "Editar cliente"}
                </button>
                <button
                  className={`btn btn-sm ${isAddingVehicle ? "btn-primary" : "btn-secondary"}`}
                  onClick={onToggleAddVehicle}
                >
                  {isAddingVehicle ? "Cerrar formulario" : "+ Registrar vehículo"}
                </button>
              </>
            )}
            {canDelete && (
              <button className="btn btn-secondary btn-sm text-red-700 hover:bg-red-50" disabled={busy} onClick={() => void removeClient()}>
                Eliminar cliente
              </button>
            )}
          </div>
        )}
      </div>

      {error && <p role="alert" className="mt-3 text-sm text-red-700 bg-red-50 p-2.5 rounded border border-red-200">{error}</p>}

      {/* Edición de Cliente */}
      {editClient && (
        <form onSubmit={saveClient} className="mt-3 grid gap-2 rounded-lg border border-line bg-surface-2 p-3 sm:grid-cols-2 animate-fade-in">
          <input className="field h-9" name="name" defaultValue={client.name} required minLength={2} placeholder="Nombre o Razón social" />
          <input className="field h-9" name="phone" defaultValue={client.phone} required minLength={7} placeholder="Teléfono" />
          <input className="field h-9" name="email" type="email" defaultValue={client.email} placeholder="Correo electrónico" />
          <select className="field h-9" name="type" defaultValue={client.type === "empresa" ? "COMPANY" : "PERSONAL"}>
            <option value="PERSONAL">Persona</option>
            <option value="COMPANY">Empresa</option>
          </select>
          <div className="flex gap-2 sm:col-span-2 pt-1">
            <button className="btn btn-primary btn-sm" disabled={busy}>
              Guardar cambios
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditClient(false)}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Formulario INLINE para Registrar Vehículo para este cliente específico */}
      {isAddingVehicle && (
        <form
          onSubmit={handleAddVehicleInline}
          className="mt-4 rounded-xl border-2 border-primary/40 bg-surface-2/60 p-4 shadow-sm animate-fade-in space-y-3"
        >
          <div className="flex items-center justify-between border-b border-line pb-2">
            <div>
              <h3 className="font-semibold text-fg text-sm">Registrar vehículo para: {client.name}</h3>
              <p className="text-xs text-fg-3">Selecciona el tipo de vehículo, la marca o escríbela si no aparece.</p>
            </div>
            <button type="button" className="text-fg-3 hover:text-fg text-xs font-semibold" onClick={onToggleAddVehicle}>
              Cerrar
            </button>
          </div>

          <VehicleFormFields compact />

          <div className="flex gap-2 pt-2 border-t border-line">
            <button className="btn btn-primary btn-sm" disabled={busy}>
              {busy ? "Guardando…" : "Guardar vehículo"}
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onToggleAddVehicle}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Lista de vehículos del cliente */}
      {vehicles.length > 0 && (
        <div className="mt-4 divide-y divide-line">
          {vehicles.map((vehicle) => {
            const recent = orders
              .filter((order) => order.vehicle.id === vehicle.id)
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
            const typeInfo = getVehicleTypeInfo(vehicle.type)

            return (
              <div key={vehicle.id} className="py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" title={typeInfo.label} role="img" aria-label={typeInfo.shortLabel}>
                      {typeInfo.icon}
                    </span>
                    <Plate value={vehicle.plate} />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-fg">
                          {vehicle.year} {vehicle.make}
                          {vehicle.model ? " " + vehicle.model : ""}
                        </p>
                        <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-fg-3">
                          {typeInfo.shortLabel}
                        </span>
                      </div>
                      <p className="text-xs text-fg-3">
                        {vehicle.mileage.toLocaleString("es-CO")} km
                        {vehicle.color ? ` · Color: ${vehicle.color}` : ""}
                        {vehicle.vin ? ` · VIN: ${vehicle.vin}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="text-xs text-fg-3 hidden sm:block">
                      {recent ? `Última OT ${recent.number} · ${recent.status}` : "Sin órdenes previas"}
                    </p>
                    {canEdit && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setEditVehicle(editVehicle === vehicle.id ? null : vehicle.id)}
                      >
                        {editVehicle === vehicle.id ? "Cerrar" : "Editar"}
                      </button>
                    )}
                    {canDelete && (
                      <button
                        className="btn btn-secondary btn-sm text-red-700 hover:bg-red-50"
                        disabled={busy}
                        onClick={() => void removeVehicle(vehicle)}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>

                {/* Edición de vehículo existente */}
                {editVehicle === vehicle.id && (
                  <form
                    onSubmit={(e) => void saveVehicle(e, vehicle)}
                    className="mt-3 rounded-lg border border-line bg-surface-2 p-4 animate-fade-in space-y-3"
                  >
                    <div className="font-semibold text-xs uppercase text-fg-2 tracking-wider">
                      Modificar datos del vehículo
                    </div>
                    <VehicleFormFields
                      initialData={{
                        type: vehicle.type ?? "CAR",
                        make: vehicle.make,
                        model: vehicle.model ?? "",
                        plate: vehicle.plate,
                        year: vehicle.year,
                        mileage: vehicle.mileage,
                        color: vehicle.color ?? "",
                        vin: vehicle.vin ?? "",
                      }}
                      compact
                    />
                    <div>
                      <label className="block text-xs font-medium text-fg-2 mb-1">
                        Motivo del cambio <span className="text-fg-3 font-normal">(obligatorio si se reduce el kilometraje)</span>
                      </label>
                      <input className="field h-9 w-full" name="changeReason" placeholder="Motivo de la corrección o cambio" />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button className="btn btn-primary btn-sm" disabled={busy}>
                        Guardar cambios
                      </button>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditVehicle(null)}>
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )
          })}
        </div>
      )}

      {!vehicles.length && !isAddingVehicle && (
        <div className="mt-4 flex items-center justify-between rounded-lg bg-surface-2/40 p-3 text-xs text-fg-3">
          <span>Este cliente aún no tiene vehículos registrados.</span>
          {canEdit && (
            <button className="font-medium text-primary hover:underline" onClick={onToggleAddVehicle}>
              + Registrar primer vehículo
            </button>
          )}
        </div>
      )}
    </article>
  )
}
