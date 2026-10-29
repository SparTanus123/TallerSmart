"use client"

import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { Client, IntakeInspection, UserRole, Vehicle, WorkOrder } from "@/types"
import { PERSONAS } from "@/lib/constants"
import { api } from "@/lib/api-client"

export interface TechnicianOption {
  id: string
  name: string
}

interface GlobalState {
  role: UserRole
  user: { id: string; name: string; email: string; role: UserRole } | null
  authLoading: boolean
  logout: () => Promise<void>
  orders: WorkOrder[]
  clients: Client[]
  vehicles: Vehicle[]
  technicians: TechnicianOption[]
  loading: boolean
  apiError: string | null
  refreshOrders: () => Promise<void>
  refreshDirectory: () => Promise<void>
  refreshTechnicians: () => Promise<void>
  assignTechnician: (workOrderId: string, technicianId: string | null) => Promise<void>
  createClient: (input: { name: string; phone: string; email?: string; type: "PERSONAL" | "COMPANY" }) => Promise<void>
  createVehicle: (input: { currentClientId: string; plate: string; make: string; model?: string; year: number; mileage: number; vin?: string; color?: string }) => Promise<void>
  createOrder: (input: { vehicleId: string; technicianId?: string | null; complaint: string; mileageIn: number; estimatedDelivery: string; intakeInspection: IntakeInspection; photos: File[] }) => Promise<void>
  uploadIntakePhotos: (workOrderId: string, photos: File[]) => Promise<void>
  updateOrder: (order: WorkOrder) => Promise<void>
  receptionOpen: boolean
  setReceptionOpen: (open: boolean) => void
  paletteOpen: boolean
  setPaletteOpen: (open: boolean) => void
  persona: { name: string; label: string; techId?: string }
}

const GlobalContext = createContext<GlobalState | null>(null)
const lower = (value: unknown) => String(value ?? "").toLowerCase()
type ApiClient = { id: string; name: string; phone: string; email: string | null; type: string; createdAt: string }
type ApiVehicle = { id: string; currentClientId: string; plate: string; vin: string | null; make: string; model: string; year: number; mileage: number; color: string | null }
type ApiEvent = { id: string; action: string; createdAt: string; fromValue: unknown; toValue: unknown; actor: { name: string } | null }
type ApiItem = { id: string; type: string; nameSnapshot: string; quantity: string | number; unitPrice: string | number; authorizationStatus: "PENDING" | "APPROVED" | "REJECTED" }
type ApiWorkOrder = { id: string; number: string; status: string; urgency: string; client: ApiClient; vehicle: ApiVehicle; technicianId: string | null; technician: { name: string } | null; complaint: string; diagnosis: string | null; notes: string | null; items: ApiItem[]; total: string | number; createdAt: string; updatedAt: string; estimatedDelivery: string | null; mileageIn: number; mileageOut: number | null; intakeInspection: IntakeInspection | null; intakePhotos?: { id: string; fileName: string; mimeType: string; createdAt: string }[]; events: ApiEvent[]; deliveryReportDraft: string | null; approvedReportSnapshot: string | null; reportApprovedAt: string | null; reportApprovedBy: { name: string } | null }

function asObject(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

function toOrder(row: ApiWorkOrder): WorkOrder {
  const clientRow = row.client ?? {}
  const vehicleRow = row.vehicle ?? {}
  return {
    id: row.id,
    number: row.number,
    status: lower(row.status).replaceAll("_", "_") as WorkOrder["status"],
    urgency: lower(row.urgency) as WorkOrder["urgency"],
    client: {
      id: clientRow.id,
      name: clientRow.name,
      phone: clientRow.phone,
      email: clientRow.email ?? "",
      createdAt: clientRow.createdAt,
      type: clientRow.type === "COMPANY" ? "empresa" : "personal",
    },
    vehicle: {
      id: vehicleRow.id,
      clientId: vehicleRow.currentClientId,
      plate: vehicleRow.plate,
      vin: vehicleRow.vin ?? "",
      make: vehicleRow.make,
      model: vehicleRow.model ?? "",
      year: vehicleRow.year,
      mileage: vehicleRow.mileage,
      color: vehicleRow.color ?? "",
      notes: "",
    },
    technicianId: row.technicianId ?? "",
    technicianName: row.technician?.name ?? "Sin asignar",
    complaint: row.complaint,
    diagnosis: row.diagnosis ?? undefined,
    notes: row.notes ?? "",
    items: (row.items ?? []).map((i) => ({
      id: i.id,
      type: lower(i.type) as "service" | "part",
      name: i.nameSnapshot,
      quantity: Number(i.quantity),
      unitPrice: Number(i.unitPrice),
      subtotal: Number(i.quantity) * Number(i.unitPrice),
      authorizationStatus: i.authorizationStatus,
    })),
    total: Number(row.total),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    estimatedDelivery: row.estimatedDelivery?.slice?.(0, 10) ?? "",
    mileageIn: row.mileageIn,
    mileageOut: row.mileageOut ?? undefined,
    auditLog: (row.events ?? []).map((e) => {
      const from = asObject(e.fromValue)
      const to = asObject(e.toValue)
      return {
        id: e.id,
        action: e.action as NonNullable<WorkOrder["auditLog"]>[number]["action"],
        actor: e.actor?.name ?? "Sistema",
        at: e.createdAt,
        fromStatus: typeof from.status === "string" ? from.status.toLowerCase() as WorkOrder["status"] : undefined,
        toStatus: typeof to.status === "string" ? to.status.toLowerCase() as WorkOrder["status"] : undefined,
        details: typeof to.diagnosis === "string" ? ["diagnóstico y notas"] : undefined,
      }
    }),
    intakeInspection: row.intakeInspection ?? undefined,
    intakePhotos: row.intakePhotos ?? [],
    deliveryReportDraft: row.deliveryReportDraft ?? undefined,
    approvedReportSnapshot: row.approvedReportSnapshot ?? undefined,
    reportApprovedAt: row.reportApprovedAt ?? undefined,
    reportApprovedBy: row.reportApprovedBy?.name ?? undefined,
  }
}

function toClient(row: ApiClient): Client {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email ?? "",
    createdAt: row.createdAt,
    type: row.type === "COMPANY" ? "empresa" : "personal",
  }
}

function toVehicle(row: ApiVehicle): Vehicle {
  return {
    id: row.id,
    clientId: row.currentClientId,
    plate: row.plate,
    vin: row.vin ?? "",
    make: row.make,
    model: row.model ?? "",
    year: row.year,
    mileage: row.mileage,
    color: row.color ?? "",
    notes: "",
  }
}

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>("admin")
  const [user, setUser] = useState<GlobalState["user"]>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [orders, setOrders] = useState<WorkOrder[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [technicians, setTechnicians] = useState<TechnicianOption[]>([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)
  const [receptionOpen, setReceptionOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const router = useRouter()

  const loadTechnicians = useCallback(async () => {
    try {
      const users = await api.users()
      const techs = users
        .filter((u) => u.active && u.role === "TECHNICIAN")
        .map((u) => ({ id: u.id, name: u.name }))
      setTechnicians(techs)
    } catch {
      // Ignorar si no tiene permisos
    }
  }, [])

  const loadDirectory = useCallback(async () => {
    const [cs, vs] = await Promise.all([api.clients(), api.vehicles()])
    setClients(cs.map((row) => toClient(row as unknown as ApiClient)))
    setVehicles(vs.map((row) => toVehicle(row as unknown as ApiVehicle)))
  }, [])

  const refreshDirectory = loadDirectory
  const refreshTechnicians = loadTechnicians

  const refreshOrders = useCallback(async () => {
    if (!user) return
    try {
      setOrders((await api.workOrders()).map((row) => toOrder(row as unknown as ApiWorkOrder)))
      setApiError(null)
    } catch (e) {
      setApiError(e instanceof Error ? e.message : "No se pudo conectar con el servidor")
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    let active = true
    void api
      .me()
      .then(async (result) => {
        if (!active) return
        const signedIn = { ...result.user, role: lower(result.user.role) as UserRole }
        setUser(signedIn)
        setRole(signedIn.role)
        const [os] = await Promise.all([api.workOrders(), loadDirectory(), loadTechnicians()])
        if (active) {
          setOrders(os.map((row) => toOrder(row as unknown as ApiWorkOrder)))
          setApiError(null)
        }
      })
      .catch((e) => {
        if (active) {
          const message = e instanceof Error ? e.message : "No se pudo validar la sesión"
          if (message === "AUTHENTICATION_REQUIRED") router.replace("/login")
          else setApiError(message)
        }
      })
      .finally(() => {
        if (active) {
          setAuthLoading(false)
          setLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [loadDirectory, loadTechnicians, router])

  useEffect(() => {
    if (!user) return
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void refreshOrders()
    }, 4000)
    return () => window.clearInterval(timer)
  }, [user, refreshOrders])

  const logout = useCallback(async () => {
    try {
      await api.logout()
    } finally {
      setUser(null)
      setOrders([])
      router.replace("/login")
    }
  }, [router])

  const uploadIntakePhotos = useCallback(
    async (workOrderId: string, photos: File[]) => {
      for (const file of photos) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () =>
            typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("PHOTO_READ_FAILED"))
          reader.onerror = () => reject(new Error("PHOTO_READ_FAILED"))
          reader.readAsDataURL(file)
        })
        await api.uploadIntakePhoto(workOrderId, {
          fileName: file.name,
          mimeType: file.type,
          base64: dataUrl.split(",")[1] ?? "",
        })
      }
      await refreshOrders()
    },
    [refreshOrders]
  )

  const assignTechnician = useCallback(
    async (workOrderId: string, technicianId: string | null) => {
      try {
        await api.assignTechnician(workOrderId, technicianId)
        await refreshOrders()
      } catch (e) {
        setApiError(e instanceof Error ? e.message : "No se pudo asignar el técnico")
        throw e
      }
    },
    [refreshOrders]
  )

  const createOrder = useCallback(
    async (input: {
      vehicleId: string
      technicianId?: string | null
      complaint: string
      mileageIn: number
      estimatedDelivery: string
      intakeInspection: IntakeInspection
      photos: File[]
    }) => {
      const { photos, ...body } = input
      try {
        const created = await api.createWorkOrder({ ...body, urgency: "MEDIUM" })
        setOrders((current) => [toOrder(created as unknown as ApiWorkOrder), ...current.filter((o) => o.id !== created.id)])
        setApiError(null)
        if (photos.length)
          try {
            await uploadIntakePhotos(String(created.id), photos)
          } catch (e) {
            setApiError(
              `Orden creada, pero no se guardaron todas las fotos (${e instanceof Error ? e.message : "error"}). Reintenta desde la orden.`
            )
          }
      } catch (e) {
        setApiError(e instanceof Error ? e.message : "No se pudo crear la orden")
        throw e
      }
    },
    [uploadIntakePhotos]
  )

  const createClient = useCallback(
    async (input: { name: string; phone: string; email?: string; type: "PERSONAL" | "COMPANY" }) => {
      await api.createClient(input)
      await loadDirectory()
    },
    [loadDirectory]
  )

  const createVehicle = useCallback(
    async (input: {
      currentClientId: string
      plate: string
      make: string
      model?: string
      year: number
      mileage: number
      vin?: string
      color?: string
    }) => {
      await api.createVehicle(input)
      await loadDirectory()
    },
    [loadDirectory]
  )

  const updateOrder = useCallback(
    async (updated: WorkOrder) => {
      const current = orders.find((o) => o.id === updated.id)
      if (!current) return
      try {
        if (current.technicianId !== updated.technicianId) {
          await api.assignTechnician(updated.id, updated.technicianId || null)
        }
        if (current.diagnosis !== updated.diagnosis || current.notes !== updated.notes) {
          await api.updateRecord(updated.id, {
            diagnosis: updated.diagnosis ?? "",
            notes: updated.notes ?? "",
          })
        }
        if (current.deliveryReportDraft !== updated.deliveryReportDraft && updated.deliveryReportDraft) {
          await api.saveReport(updated.id, updated.deliveryReportDraft)
        }
        if (updated.reportApprovedAt && !current.reportApprovedAt) {
          await api.approveReport(updated.id)
        }
        if (current.status !== updated.status) {
          await api.changeStatus(updated.id, updated.status)
        }
        await refreshOrders()
      } catch (e) {
        setApiError(e instanceof Error ? e.message : "No se pudo guardar el cambio")
        await refreshOrders()
      }
    },
    [orders, refreshOrders]
  )

  const persona = user ? { name: user.name, label: PERSONAS[role].label } : PERSONAS[role]

  return (
    <GlobalContext.Provider
      value={{
        role,
        user,
        authLoading,
        logout,
        orders,
        clients,
        vehicles,
        technicians,
        loading,
        apiError,
        refreshOrders,
        refreshDirectory,
        refreshTechnicians,
        assignTechnician,
        createClient,
        createVehicle,
        createOrder,
        uploadIntakePhotos,
        updateOrder,
        receptionOpen,
        setReceptionOpen,
        paletteOpen,
        setPaletteOpen,
        persona,
      }}
    >
      {children}
    </GlobalContext.Provider>
  )
}

export function useGlobal() {
  const ctx = useContext(GlobalContext)
  if (!ctx) throw new Error("useGlobal must be used within GlobalProvider")
  return ctx
}
