export type UserRole = "admin" | "advisor" | "technician"

export type OTStatus = "received" | "diagnosing" | "in_progress" | "waiting_parts" | "completed" | "delivered"

export type UrgencyLevel = "low" | "medium" | "high"

export interface User {
  id: string
  name: string
  role: UserRole
}

export interface Client {
  id: string
  name: string
  phone: string
  email: string
  createdAt: string
  type: "personal" | "empresa"
}

export interface Vehicle {
  id: string
  clientId: string
  plate: string
  vin: string
  make: string
  model: string
  year: number
  mileage: number
  color: string
  notes: string
}

export interface WorkOrderItem {
  id: string
  type: "service" | "part"
  name: string
  quantity: number
  unitPrice: number
  subtotal: number
  authorizationStatus?: "PENDING" | "APPROVED" | "REJECTED"
}

export interface IntakeInspection {
  fuelLevel: number
  belongings: string[]
  damageAreas: string[]
  notes: string
}

export interface WorkOrderAuditEntry {
  id: string
  action: "created" | "status_changed" | "record_updated" | "report_approved" | "report_draft_updated" | "additional_work_requested" | "item_authorization_changed"
  actor: string
  at: string
  fromStatus?: OTStatus
  toStatus?: OTStatus
  details?: string[]
}

export interface WorkOrder {
  id: string
  number: string
  vehicle: Vehicle
  client: Client
  technicianId: string
  technicianName: string
  status: OTStatus
  complaint: string
  diagnosis?: string
  notes: string
  items: WorkOrderItem[]
  total: number
  createdAt: string
  updatedAt: string
  estimatedDelivery: string
  mileageIn: number
  intakeInspection?: IntakeInspection
  mileageOut?: number
  urgency: UrgencyLevel
  auditLog?: WorkOrderAuditEntry[]
  deliveryReportDraft?: string
  approvedReportSnapshot?: string
  reportApprovedAt?: string
  reportApprovedBy?: string
}

export interface Technician {
  id: string
  name: string
  specialty: string
  activeOrders: number
  completedThisMonth: number
  utilization: number
}

export interface CatalogItem {
  id: string
  type: "service" | "part"
  code: string
  name: string
  description: string
  unitPrice: number
  unit: string
  category: string
}
