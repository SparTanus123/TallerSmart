import type { Client, Vehicle, WorkOrder, Technician, CatalogItem, User } from '../types';

export const currentUser: User = {
  id: 'u0',
  name: 'Carlos Mendoza',
  role: 'admin',
};

export const technicians: Technician[] = [
  { id: 't1', name: 'Rodrigo Vargas', specialty: 'Motor y Transmisión', activeOrders: 3, completedThisMonth: 12, utilization: 85 },
  { id: 't2', name: 'Felipe Núñez', specialty: 'Suspensión y Frenos', activeOrders: 2, completedThisMonth: 9, utilization: 70 },
  { id: 't3', name: 'Diego Salinas', specialty: 'Eléctrico y Diagnóstico', activeOrders: 1, completedThisMonth: 7, utilization: 45 },
];

export const clients: Client[] = [
  { id: 'c1', name: 'Andrés Ramírez', phone: '+56 9 8821 4433', email: 'andres.ramirez@gmail.com', createdAt: '2024-01-15', type: 'personal' },
  { id: 'c2', name: 'Valentina Torres', phone: '+56 9 7765 3322', email: 'v.torres@empresa.cl', createdAt: '2024-03-08', type: 'personal' },
  { id: 'c3', name: 'Marcos Fuentes', phone: '+56 9 9234 5678', email: 'marcos.f@hotmail.com', createdAt: '2024-02-20', type: 'personal' },
  { id: 'c4', name: 'Isabel Castillo', phone: '+56 9 6543 2109', email: 'isabel.c@mail.com', createdAt: '2024-05-11', type: 'personal' },
  { id: 'c5', name: 'LogiTrans SpA', phone: '+56 2 2345 6789', email: 'flota@logitrans.cl', createdAt: '2023-11-01', type: 'empresa' },
];

export const vehicles: Vehicle[] = [
  { id: 'v1', clientId: 'c1', plate: 'BCDF42', vin: '1HGCM82633A123456', make: 'Toyota', model: 'Hilux', year: 2019, mileage: 87450, color: 'Blanco', notes: 'GNV instalado' },
  { id: 'v2', clientId: 'c2', plate: 'GHJK71', vin: '2T1BURHE0JC052890', make: 'Chevrolet', model: 'Captiva', year: 2021, mileage: 43200, color: 'Gris Plata', notes: '' },
  { id: 'v3', clientId: 'c3', plate: 'AABC91', vin: '3VWFE21C04M000001', make: 'Volkswagen', model: 'Golf', year: 2018, mileage: 112000, color: 'Negro', notes: 'Cliente frecuente, descuento 10%' },
  { id: 'v4', clientId: 'c4', plate: 'BCDE55', vin: '5XYKT3A14CG215640', make: 'Kia', model: 'Sportage', year: 2022, mileage: 28900, color: 'Rojo Fuego', notes: '' },
  { id: 'v5', clientId: 'c5', plate: 'FLOT01', vin: '8AFBA3826GJ000111', make: 'Ford', model: 'Ranger', year: 2020, mileage: 156000, color: 'Blanco', notes: 'Flota — prioridad alta' },
  { id: 'v6', clientId: 'c5', plate: 'FLOT02', vin: '8AFBA3826GJ000222', make: 'Ford', model: 'Ranger', year: 2020, mileage: 148000, color: 'Blanco', notes: 'Flota empresarial' },
];

export const workOrders: WorkOrder[] = [
  {
    id: 'ot1', number: 'OT-2025-0341',
    vehicle: vehicles[0], client: clients[0],
    technicianId: 't2', technicianName: 'Felipe Núñez',
    status: 'in_progress', urgency: 'high',
    complaint: 'Cascabeleo al frenar en bajada. Pedal se siente esponjoso y hay ruido metálico.',
    diagnosis: 'Pastillas delanteras desgastadas al límite. Discos con ranuras profundas. Líquido de frenos oxidado.',
    notes: 'Reemplazar kit completo frenos delanteros. Cliente espera hoy.',
    items: [
      { id: 'i1', type: 'part', name: 'Kit Pastillas Delanteras Toyota Hilux', quantity: 1, unitPrice: 42000, subtotal: 42000 },
      { id: 'i2', type: 'part', name: 'Discos de Freno Delanteros (par)', quantity: 1, unitPrice: 78000, subtotal: 78000 },
      { id: 'i3', type: 'part', name: 'Líquido de Frenos DOT4 500ml', quantity: 1, unitPrice: 8500, subtotal: 8500 },
      { id: 'i4', type: 'service', name: 'Cambio frenos delanteros + purga', quantity: 1, unitPrice: 35000, subtotal: 35000 },
    ],
    total: 163500, createdAt: '2025-09-23T09:15:00', updatedAt: '2025-09-25T11:30:00',
    estimatedDelivery: '2025-09-25', mileageIn: 87450,
  },
  {
    id: 'ot2', number: 'OT-2025-0340',
    vehicle: vehicles[1], client: clients[1],
    technicianId: 't1', technicianName: 'Rodrigo Vargas',
    status: 'waiting_parts', urgency: 'medium',
    complaint: 'Motor tiembla al arrancar en frío. Check engine encendido hace 3 días.',
    diagnosis: 'Bobinas de encendido cilindros 2 y 4 defectuosas. Bujías con desgaste irregular.',
    notes: 'Esperando llegada de bobinas. ETA proveedor: 26/09.',
    items: [
      { id: 'i5', type: 'part', name: 'Bobina de Encendido GM 1.5T', quantity: 4, unitPrice: 31000, subtotal: 124000 },
      { id: 'i6', type: 'part', name: 'Bujías NGK Iridium', quantity: 4, unitPrice: 12500, subtotal: 50000 },
      { id: 'i7', type: 'service', name: 'Diagnóstico electrónico OBD', quantity: 1, unitPrice: 25000, subtotal: 25000 },
      { id: 'i8', type: 'service', name: 'Cambio bobinas y bujías', quantity: 1, unitPrice: 30000, subtotal: 30000 },
    ],
    total: 229000, createdAt: '2025-09-22T14:00:00', updatedAt: '2025-09-24T16:00:00',
    estimatedDelivery: '2025-09-27', mileageIn: 43200,
  },
  {
    id: 'ot3', number: 'OT-2025-0339',
    vehicle: vehicles[2], client: clients[2],
    technicianId: 't1', technicianName: 'Rodrigo Vargas',
    status: 'diagnosing', urgency: 'medium',
    complaint: 'Aceite bajando rápido. Aparecen manchas oscuras en el piso del estacionamiento.',
    diagnosis: undefined,
    notes: 'Revisando sellos de válvulas y retén de cigüeñal.',
    items: [
      { id: 'i9', type: 'service', name: 'Diagnóstico de fugas y sellos', quantity: 1, unitPrice: 20000, subtotal: 20000 },
    ],
    total: 20000, createdAt: '2025-09-25T08:00:00', updatedAt: '2025-09-25T10:00:00',
    estimatedDelivery: '2025-09-26', mileageIn: 112000,
  },
  {
    id: 'ot4', number: 'OT-2025-0338',
    vehicle: vehicles[3], client: clients[3],
    technicianId: 't3', technicianName: 'Diego Salinas',
    status: 'received', urgency: 'low',
    complaint: 'Mantenimiento preventivo 30.000 km según programa KIA.',
    notes: 'Revisión completa 30k puntos + cambio aceite + filtros.',
    items: [
      { id: 'i10', type: 'part', name: 'Aceite Sintético 5W-30 4L', quantity: 1, unitPrice: 28000, subtotal: 28000 },
      { id: 'i11', type: 'part', name: 'Filtro de Aceite KIA Sportage', quantity: 1, unitPrice: 9500, subtotal: 9500 },
      { id: 'i12', type: 'part', name: 'Filtro de Aire', quantity: 1, unitPrice: 12000, subtotal: 12000 },
      { id: 'i13', type: 'service', name: 'Cambio aceite + filtros', quantity: 1, unitPrice: 18000, subtotal: 18000 },
      { id: 'i14', type: 'service', name: 'Revisión 30k puntos', quantity: 1, unitPrice: 15000, subtotal: 15000 },
    ],
    total: 82500, createdAt: '2025-09-25T11:30:00', updatedAt: '2025-09-25T11:30:00',
    estimatedDelivery: '2025-09-25', mileageIn: 28900,
  },
  {
    id: 'ot5', number: 'OT-2025-0337',
    vehicle: vehicles[4], client: clients[4],
    technicianId: 't2', technicianName: 'Felipe Núñez',
    status: 'completed', urgency: 'medium',
    complaint: 'Suspensión delantera desgastada. Traqueteo fuerte en camino ripio.',
    diagnosis: 'Amortiguadores delanteros con fuga interna. Bujes barra estabilizadora rotos.',
    notes: 'Trabajo completado. Esperando retiro cliente.',
    items: [
      { id: 'i15', type: 'part', name: 'Amortiguadores Monroe Delanteros x2', quantity: 2, unitPrice: 85000, subtotal: 170000 },
      { id: 'i16', type: 'part', name: 'Kit bujes barra estabilizadora', quantity: 1, unitPrice: 15000, subtotal: 15000 },
      { id: 'i17', type: 'service', name: 'Cambio amortiguadores + alineación', quantity: 1, unitPrice: 45000, subtotal: 45000 },
    ],
    total: 230000, createdAt: '2025-09-20T09:00:00', updatedAt: '2025-09-24T17:00:00',
    estimatedDelivery: '2025-09-25', mileageIn: 156000, mileageOut: 156045,
  },
  {
    id: 'ot6', number: 'OT-2025-0336',
    vehicle: vehicles[5], client: clients[4],
    technicianId: 't3', technicianName: 'Diego Salinas',
    status: 'delivered', urgency: 'low',
    complaint: 'Batería sin carga. Alternador con ruido metálico al acelerar.',
    diagnosis: 'Batería con 3 celdas dañadas (3 años). Alternador con rodamiento desgastado.',
    notes: 'Entregado en perfectas condiciones el 22/09.',
    items: [
      { id: 'i18', type: 'part', name: 'Batería 70Ah Bosch Silver', quantity: 1, unitPrice: 95000, subtotal: 95000 },
      { id: 'i19', type: 'part', name: 'Alternador Reconstruido Ford', quantity: 1, unitPrice: 120000, subtotal: 120000 },
      { id: 'i20', type: 'service', name: 'Instalación y calibración eléctrica', quantity: 1, unitPrice: 25000, subtotal: 25000 },
    ],
    total: 240000, createdAt: '2025-09-18T10:00:00', updatedAt: '2025-09-22T15:00:00',
    estimatedDelivery: '2025-09-22', mileageIn: 148000, mileageOut: 148012,
  },
];

export const catalogItems: CatalogItem[] = [
  { id: 'cat1', type: 'service', code: 'SVC-001', name: 'Cambio de aceite y filtro', description: 'Incluye drenaje, aceite mineral/semisintético y filtro', unitPrice: 35000, unit: 'servicio', category: 'Mantenimiento' },
  { id: 'cat2', type: 'service', code: 'SVC-002', name: 'Revisión preventiva 10.000 km', description: '15 puntos de inspección según cartilla del fabricante', unitPrice: 25000, unit: 'servicio', category: 'Mantenimiento' },
  { id: 'cat3', type: 'service', code: 'SVC-003', name: 'Diagnóstico electrónico OBD', description: 'Lectura de códigos de falla y reporte escrito', unitPrice: 25000, unit: 'servicio', category: 'Diagnóstico' },
  { id: 'cat4', type: 'service', code: 'SVC-004', name: 'Cambio frenos delanteros completo', description: 'Pastillas, discos y purga del sistema hidráulico', unitPrice: 35000, unit: 'servicio', category: 'Frenos' },
  { id: 'cat5', type: 'service', code: 'SVC-005', name: 'Alineación y balanceo 4 ruedas', description: 'Alineación computarizada 3D y balanceo dinámico', unitPrice: 22000, unit: 'servicio', category: 'Suspensión' },
  { id: 'cat6', type: 'service', code: 'SVC-006', name: 'Cambio correa de distribución', description: 'Incluye tensores y bomba de agua (recomendado)', unitPrice: 85000, unit: 'servicio', category: 'Motor' },
  { id: 'cat7', type: 'service', code: 'SVC-007', name: 'Diagnóstico de fugas', description: 'Inspección visual y con fluido revelador UV', unitPrice: 20000, unit: 'servicio', category: 'Diagnóstico' },
  { id: 'cat8', type: 'part', code: 'PRT-001', name: 'Aceite Castrol EDGE 5W-40 4L', description: 'Aceite 100% sintético, full SAPS', unitPrice: 32000, unit: 'litro', category: 'Lubricantes' },
  { id: 'cat9', type: 'part', code: 'PRT-002', name: 'Filtro de aceite OEM genérico', description: 'Compatible múltiples marcas (ver ficha técnica)', unitPrice: 8000, unit: 'unidad', category: 'Filtros' },
  { id: 'cat10', type: 'part', code: 'PRT-003', name: 'Pastillas Bosch BP Premium', description: 'Set 4 pastillas delanteras cerámicas, baja polución', unitPrice: 38000, unit: 'set', category: 'Frenos' },
  { id: 'cat11', type: 'part', code: 'PRT-004', name: 'Bujías NGK Iridium IX', description: 'Alta durabilidad 60.000 km, set 4 unidades', unitPrice: 12500, unit: 'unidad', category: 'Encendido' },
  { id: 'cat12', type: 'part', code: 'PRT-005', name: 'Batería 60Ah Bosch Silver', description: 'Start&Stop compatible, garantía 18 meses', unitPrice: 82000, unit: 'unidad', category: 'Eléctrico' },
  { id: 'cat13', type: 'part', code: 'PRT-006', name: 'Líquido de frenos DOT4 500ml', description: 'Punto de ebullición 260°C mínimo', unitPrice: 8500, unit: 'unidad', category: 'Frenos' },
  { id: 'cat14', type: 'part', code: 'PRT-007', name: 'Amortiguador Monroe Reflex', description: 'Amortiguador gas-presurizado, unidad única', unitPrice: 85000, unit: 'unidad', category: 'Suspensión' },
];

export const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  received:      { label: 'Recibido',          color: '#475569', bg: '#F1F5F9', border: '#CBD5E1' },
  diagnosing:    { label: 'En Diagnóstico',    color: '#6D28D9', bg: '#F3EEFF', border: '#DDD0FE' },
  in_progress:   { label: 'En Proceso',        color: '#1D4ED8', bg: '#EEF4FF', border: '#C7D7FE' },
  waiting_parts: { label: 'Espera Repuestos',  color: '#B45309', bg: '#FEF6E0', border: '#FCE3A6' },
  completed:     { label: 'Finalizado',        color: '#047857', bg: '#E9F9F1', border: '#A7E8C9' },
  delivered:     { label: 'Entregado',         color: '#334155', bg: '#E8EBEF', border: '#CBD5E1' },
};
