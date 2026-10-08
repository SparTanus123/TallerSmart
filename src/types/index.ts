export type UserRole = 'admin' | 'advisor' | 'technician';

export type OTStatus =
  | 'received'
  | 'diagnosing'
  | 'in_progress'
  | 'waiting_parts'
  | 'completed'
  | 'delivered';

export type UrgencyLevel = 'low' | 'medium' | 'high';

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  createdAt: string;
  type: 'personal' | 'empresa';
}

export interface Vehicle {
  id: string;
  clientId: string;
  plate: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  color: string;
  notes: string;
}

export interface WorkOrderItem {
  id: string;
  type: 'service' | 'part';
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface WorkOrder {
  id: string;
  number: string;
  vehicle: Vehicle;
  client: Client;
  technicianId: string;
  technicianName: string;
  status: OTStatus;
  complaint: string;
  diagnosis?: string;
  notes: string;
  items: WorkOrderItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery: string;
  mileageIn: number;
  mileageOut?: number;
  urgency: UrgencyLevel;
}

export interface Technician {
  id: string;
  name: string;
  specialty: string;
  activeOrders: number;
  completedThisMonth: number;
  utilization: number;
}

export interface CatalogItem {
  id: string;
  type: 'service' | 'part';
  code: string;
  name: string;
  description: string;
  unitPrice: number;
  unit: string;
  category: string;
}
