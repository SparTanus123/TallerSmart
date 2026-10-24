const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1"

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
    credentials: "include",
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    if (response.status === 401 && path !== "/auth/login" && typeof window !== "undefined") window.location.assign("/login")
    throw new Error(payload.error ?? `API_ERROR_${response.status}`)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const api = {
  login: (body: { email: string; password: string }) => request<{ user: { id: string; name: string; email: string; role: "ADMIN" | "ADVISOR" | "TECHNICIAN" } }>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => request<{ user: { id: string; name: string; email: string; role: "ADMIN" | "ADVISOR" | "TECHNICIAN" } }>("/auth/me"),
  logout: () => request<void>("/auth/logout", { method: "POST" }),
  workOrders: () => request<Record<string, unknown>[]>("/work-orders"),
  createWorkOrder: (body: { vehicleId: string; complaint: string; mileageIn: number; urgency: "LOW" | "MEDIUM" | "HIGH"; estimatedDelivery?: string; intakeInspection: { fuelLevel: number; belongings: string[]; damageAreas: string[]; notes: string } }) => request<Record<string, unknown>>("/work-orders", { method: "POST", body: JSON.stringify(body) }),
  updateRecord: (id: string, body: { diagnosis: string; notes: string }) => request<Record<string, unknown>>(`/work-orders/${id}/record`, { method: "PATCH", body: JSON.stringify(body) }),
  changeStatus: (id: string, status: string) => request<Record<string, unknown>>(`/work-orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status: status.toUpperCase() }) }),
  saveReport: (id: string, text: string) => request<Record<string, unknown>>(`/work-orders/${id}/report`, { method: "PUT", body: JSON.stringify({ text }) }),
  approveReport: (id: string) => request<Record<string, unknown>>(`/work-orders/${id}/report/approve`, { method: "POST" }),
  addCatalogItemToOrder: (id: string, catalogItemId: string, quantity: number) => request<Record<string, unknown>>(`/work-orders/${id}/items`, { method: "POST", body: JSON.stringify({ catalogItemId, quantity }) }),
  addManualItemToOrder: (id: string, body: { type: "SERVICE" | "PART"; name: string; quantity: number; unitPrice: number }) => request<Record<string, unknown>>(`/work-orders/${id}/items/manual`, { method: "POST", body: JSON.stringify(body) }),
  updateOrderItem: (id: string, itemId: string, body: { name?: string; quantity?: number; unitPrice?: number }) => request<Record<string, unknown>>(`/work-orders/${id}/items/${itemId}`, { method: "PATCH", body: JSON.stringify(body) }),
  authorizeOrderItem: (id: string, itemId: string, authorizationStatus: "APPROVED" | "REJECTED") => request<Record<string, unknown>>(`/work-orders/${id}/items/${itemId}/authorization`, { method: "PATCH", body: JSON.stringify({ authorizationStatus }) }),
  uploadIntakePhoto: (id: string, body: { fileName: string; mimeType: string; base64: string }) => request<{ id: string; fileName: string; mimeType: string; createdAt: string }>(`/work-orders/${id}/intake-photos`, { method: "POST", body: JSON.stringify(body) }),
  deleteIntakePhoto: (id: string, photoId: string) => request<void>(`/work-orders/${id}/intake-photos/${photoId}`, { method: "DELETE" }),
  deleteClient: (id: string) => request<void>(`/clients/${id}`, { method: "DELETE" }),
  deleteVehicle: (id: string) => request<void>(`/vehicles/${id}`, { method: "DELETE" }),
  deleteCatalogItem: (id: string) => request<void>(`/catalog/${id}`, { method: "DELETE" }),
  clients: () => request<Record<string, unknown>[]>("/clients"),
  createClient: (body: { name: string; phone: string; email?: string; type: "PERSONAL" | "COMPANY" }) => request<Record<string, unknown>>("/clients", { method: "POST", body: JSON.stringify(body) }),
  updateClient: (id: string, body: { name?: string; phone?: string; email?: string; type?: "PERSONAL" | "COMPANY" }) => request<Record<string, unknown>>(`/clients/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  vehicles: () => request<Record<string, unknown>[]>("/vehicles"),
  createVehicle: (body: { currentClientId: string; plate: string; make: string; model: string; year: number; mileage: number; vin?: string; color?: string }) => request<Record<string, unknown>>("/vehicles", { method: "POST", body: JSON.stringify(body) }),
  updateVehicle: (id: string, body: { currentClientId?: string; plate?: string; make?: string; model?: string; year?: number; mileage?: number; color?: string; changeReason?: string }) => request<Record<string, unknown>>(`/vehicles/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  catalog: () => request<Record<string, unknown>[]>("/catalog"),
  createCatalogItem: (body: { type: "SERVICE" | "PART"; code: string; name: string; description?: string; unitPrice: number; unit?: string }) => request<Record<string, unknown>>("/catalog", { method: "POST", body: JSON.stringify(body) }),
  updateCatalogItem: (id: string, body: { type?: "SERVICE" | "PART"; code?: string; name?: string; description?: string; unitPrice?: number; unit?: string; active?: boolean }) => request<Record<string, unknown>>(`/catalog/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  users: () => request<{ id: string; name: string; email: string; role: "ADMIN" | "ADVISOR" | "TECHNICIAN"; active: boolean }[]>("/users"),
  createUser: (body: { name: string; email: string; password: string; role: "ADMIN" | "ADVISOR" | "TECHNICIAN" }) => request<unknown>("/users", { method: "POST", body: JSON.stringify(body) }),
  updateUser: (id: string, body: { active?: boolean; role?: "ADMIN" | "ADVISOR" | "TECHNICIAN"; password?: string }) => request<unknown>(`/users/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
}
