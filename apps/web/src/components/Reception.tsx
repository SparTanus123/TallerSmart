"use client"
// The current MVP uses a sample client/vehicle while the client selector is pending.

import { useState } from "react"
import type { WorkOrder } from "@/types"
import { vehicles, clients } from "../data/mockData"
import { Drawer, Plate } from "@/components/ui/primitives"
import { Icon } from "@/components/ui/Icon"

export default function Reception({
  open,
  onClose,
  onCreate,
  nextNumber,
}: {
  open: boolean
  onClose: () => void
  onCreate: (ot: WorkOrder) => void
  nextNumber: number
}) {
  const vehicle = vehicles[0]
  const client = clients[0]
  const [complaint, setComplaint] = useState("")
  const [mileage, setMileage] = useState(String(vehicle.mileage))
  const numericMileage = Number(mileage)
  const canSave =
    complaint.trim().length > 0 &&
    Number.isInteger(numericMileage) &&
    numericMileage >= 0

  const handleSave = () => {
    if (!canSave) return
    const now = new Date()
    const timestamp = now.toISOString()
    const newOT: WorkOrder = {
      id: `ot-${Date.now()}`,
      number: `OT-${now.getFullYear()}-${String(nextNumber).padStart(4, "0")}`,
      status: "received",
      urgency: "medium",
      vehicle: { ...vehicle, mileage: numericMileage },
      client,
      technicianId: "t1",
      technicianName: "Rodrigo Vargas",
      complaint: complaint.trim(),
      items: [],
      total: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
      estimatedDelivery: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
      mileageIn: numericMileage,
      notes: "",
      auditLog: [
        {
          id: `evt-${Date.now()}`,
          action: "created",
          actor: "advisor",
          at: timestamp,
          toStatus: "received",
        },
      ],
    }
    onCreate(newOT)
    setComplaint("")
    setMileage(String(vehicle.mileage))
  }

  return (
    <Drawer open={open} onClose={onClose} width={720}>
      <div className="flex shrink-0 items-center justify-between border-b border-line px-6 py-4">
        <h2 className="text-[16px] font-semibold text-fg">Nueva recepción</h2>
        <button
          onClick={onClose}
          className="text-fg-4 hover:text-fg"
          aria-label="Cerrar recepción"
        >
          <Icon name="x" size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-canvas p-6">
        <div className="mb-6 rounded-xl border border-line bg-surface p-4">
          <div className="flex items-center gap-4">
            <Plate value={vehicle.plate} size="lg" />
            <div>
              <div className="font-semibold text-[15px]">
                {vehicle.make} {vehicle.model}{" "}
                <span className="font-normal text-fg-3">{vehicle.year}</span>
              </div>
              <div className="text-[13px] text-fg-2">{client.name}</div>
            </div>
          </div>
          <label
            className="mt-4 block text-[12px] font-medium text-fg-2"
            htmlFor="intake-mileage"
          >
            Kilometraje confirmado al recibir (km)
          </label>
          <input
            id="intake-mileage"
            type="number"
            min="0"
            step="1"
            className="field mt-1 h-10 w-full"
            value={mileage}
            onChange={(event) => setMileage(event.target.value)}
          />
          <p className="mt-1 text-[11px] text-fg-3">
            Confirma el dato con el cliente o el tablero. Este valor queda
            registrado en la orden.
          </p>
        </div>

        <label
          className="mb-2 block text-[12px] font-medium uppercase tracking-wide text-fg-3"
          htmlFor="intake-complaint"
        >
          Motivo de ingreso
        </label>
        <textarea
          id="intake-complaint"
          className="min-h-32 w-full resize-y rounded-xl border border-line bg-surface p-4 text-[14px] leading-relaxed text-fg focus:border-brand-500 focus:outline-none"
          placeholder="Registra con las palabras del cliente qué ocurrió y cuándo ocurre."
          value={complaint}
          onChange={(event) => setComplaint(event.target.value)}
        />
        <p className="mt-2 text-[12px] text-fg-3">
          Esta versión documenta el ingreso. La valoración del síntoma y el
          diagnóstico corresponden al mecánico.
        </p>
      </div>

      <div className="flex shrink-0 items-center justify-end gap-3 border-t border-line bg-surface p-4">
        <button className="btn btn-ghost" onClick={onClose}>
          Cancelar
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={!canSave}
        >
          Crear orden {`OT-${String(nextNumber).padStart(4, "0")}`}
        </button>
      </div>
    </Drawer>
  )
}
