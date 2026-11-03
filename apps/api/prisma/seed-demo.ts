import 'dotenv/config';
import { PrismaClient, WorkOrderStatus, UrgencyLevel, CatalogItemType, AuthorizationStatus } from '@prisma/client';
import { hashPassword } from '../src/modules/auth/password';

const prisma = new PrismaClient();
const workshopId = '00000000-0000-4000-8000-000000000000';
const adminId = '00000000-0000-4000-8000-000000000001';

async function seedDemoData() {
  console.log('🚗 Iniciando carga de datos de prueba para TallerSmart...');

  // 1. Asegurar Workshop
  await prisma.workshop.upsert({
    where: { id: workshopId },
    update: {},
    create: { id: workshopId, name: 'Taller principal' },
  });

  // 2. Usuarios del sistema
  const defaultPassword = process.env.SEED_ADMIN_PASSWORD || 'TallerSmart2026!';
  const passwordHash = hashPassword(defaultPassword);

  // Admin
  const admin = await prisma.user.upsert({
    where: { id: adminId },
    update: { workshopId },
    create: {
      id: adminId,
      name: 'Administración Taller',
      email: 'admin@tallersmart.local',
      passwordHash,
      role: 'ADMIN',
      workshopId,
    },
  });

  // Asesor de servicio
  const advisor = await prisma.user.upsert({
    where: { email: 'alexaramirez840@gmail.com' },
    update: { workshopId },
    create: {
      name: 'Alexa Yulieth Ramírez',
      email: 'alexaramirez840@gmail.com',
      passwordHash,
      role: 'ADVISOR',
      workshopId,
    },
  });

  // Técnicos mecánicos
  const techEdgar = await prisma.user.upsert({
    where: { email: 'danielandresdelrio@gmail.com' },
    update: { workshopId, active: true },
    create: {
      name: 'Edgar Alexander',
      email: 'danielandresdelrio@gmail.com',
      passwordHash,
      role: 'TECHNICIAN',
      workshopId,
      active: true,
    },
  });

  const techFelipe = await prisma.user.upsert({
    where: { email: 'felipe.nunez@tallersmart.local' },
    update: { workshopId, active: true },
    create: {
      name: 'Felipe Núñez',
      email: 'felipe.nunez@tallersmart.local',
      passwordHash,
      role: 'TECHNICIAN',
      workshopId,
      active: true,
    },
  });

  const techRodrigo = await prisma.user.upsert({
    where: { email: 'rodrigo.vargas@tallersmart.local' },
    update: { workshopId, active: true },
    create: {
      name: 'Rodrigo Vargas',
      email: 'rodrigo.vargas@tallersmart.local',
      passwordHash,
      role: 'TECHNICIAN',
      workshopId,
      active: true,
    },
  });

  console.log('✅ Usuarios y técnicos listos.');

  // 3. Catálogo de Servicios y Repuestos
  const catalogData = [
    { code: 'SERV-DIAG', name: 'Diagnóstico computarizado OBD-II', description: 'Lectura y análisis de códigos DTC con escáner profesional', unitPrice: 85000, type: CatalogItemType.SERVICE, unit: 'servicio' },
    { code: 'SERV-FRENOS', name: 'Cambio de frenos delanteros y purga', description: 'Desmontaje, limpieza de mordazas, sustitución de pastillas/discos y purga hidráulica', unitPrice: 45000, type: CatalogItemType.SERVICE, unit: 'servicio' },
    { code: 'SERV-ACEITE', name: 'Cambio de aceite y filtros', description: 'Drenaje de cárter, cambio de filtro y recambio de fluidos', unitPrice: 35000, type: CatalogItemType.SERVICE, unit: 'servicio' },
    { code: 'SERV-SUSP', name: 'Servicio de suspensión delantera', description: 'Reemplazo de amortiguadores, bujes y verificación en banco de alineación', unitPrice: 65000, type: CatalogItemType.SERVICE, unit: 'servicio' },
    { code: 'SERV-ELEC', name: 'Diagnóstico eléctrico y batería', description: 'Prueba de alternador, caída de tensión y consumo parásito en reposo', unitPrice: 50000, type: CatalogItemType.SERVICE, unit: 'servicio' },
    { code: 'SERV-PREV30K', name: 'Mantenimiento preventivo 30.000 km', description: 'Revisión técnica de 30 puntos de inspección según fabricante', unitPrice: 60000, type: CatalogItemType.SERVICE, unit: 'servicio' },
    { code: 'PART-PASTILLAS', name: 'Kit Pastillas de Freno Cerámicas', description: 'Pastillas delanteras de alto rendimiento y bajo desgaste', unitPrice: 95000, type: CatalogItemType.PART, unit: 'juego' },
    { code: 'PART-DISCOS', name: 'Discos de Freno Ventilados (Par)', description: 'Par de discos ventilados de alta disipación térmica', unitPrice: 180000, type: CatalogItemType.PART, unit: 'par' },
    { code: 'PART-BOBINAS', name: 'Juego de Bobinas de Encendido', description: 'Bobinas de alta tensión reforzadas para inyección electrónica', unitPrice: 140000, type: CatalogItemType.PART, unit: 'juego' },
    { code: 'PART-BUJIAS', name: 'Bujías NGK Iridium IX (Set x4)', description: 'Bujías de iridio de larga duración para combustión óptima', unitPrice: 65000, type: CatalogItemType.PART, unit: 'set' },
    { code: 'PART-FILTRO', name: 'Filtro de Aceite OEM Alto Flujo', description: 'Filtro de aceite con válvula antirretorno y microfiltración', unitPrice: 42000, type: CatalogItemType.PART, unit: 'unidad' },
    { code: 'PART-ACEITE', name: 'Aceite Sintético 5W-30 Galón (4L)', description: 'Aceite 100% sintético full SAPS para motores gasolina/diésel', unitPrice: 125000, type: CatalogItemType.PART, unit: 'galón' },
    { code: 'PART-AMORT', name: 'Amortiguador de Gas Reforzado Delantero', description: 'Amortiguador hidráulico presurizado a gas para trabajo pesado', unitPrice: 190000, type: CatalogItemType.PART, unit: 'unidad' },
    { code: 'PART-BATERIA', name: 'Batería 70Ah Libre de Mantenimiento', description: 'Batería con tecnología de calcio-plata y 18 meses de garantía', unitPrice: 240000, type: CatalogItemType.PART, unit: 'unidad' },
  ];

  const catalogMap: Record<string, string> = {};
  for (const item of catalogData) {
    const saved = await prisma.catalogItem.upsert({
      where: { code: item.code },
      update: { unitPrice: item.unitPrice, name: item.name, description: item.description, active: true },
      create: { ...item, workshopId },
    });
    catalogMap[item.code] = saved.id;
  }
  console.log(`✅ Catálogo cargado (${catalogData.length} ítems).`);

  // 4. Clientes
  const clientsData = [
    { id: '00000000-0000-4000-8000-000000000101', name: 'Andrés Ramírez', phone: '+57 310 882 1443', email: 'andres.ramirez@gmail.com', type: 'PERSONAL' as const },
    { id: '00000000-0000-4000-8000-000000000102', name: 'Valentina Torres', phone: '+57 320 776 5332', email: 'v.torres@empresa.co', type: 'PERSONAL' as const },
    { id: '00000000-0000-4000-8000-000000000103', name: 'Marcos Fuentes', phone: '+57 301 923 4567', email: 'marcos.f@hotmail.com', type: 'PERSONAL' as const },
    { id: '00000000-0000-4000-8000-000000000104', name: 'Isabel Castillo', phone: '+57 315 654 3210', email: 'isabel.c@mail.com', type: 'PERSONAL' as const },
    { id: '00000000-0000-4000-8000-000000000105', name: 'LogiTrans SAS', phone: '+57 601 234 5678', email: 'flota@logitrans.co', type: 'COMPANY' as const },
  ];

  const clientMap: Record<string, string> = {};
  for (const c of clientsData) {
    const saved = await prisma.client.upsert({
      where: { id: c.id },
      update: { name: c.name, phone: c.phone, email: c.email, type: c.type },
      create: { ...c, workshopId },
    });
    clientMap[c.name] = saved.id;
  }
  console.log('✅ Clientes registrados.');

  // 5. Vehículos
  const vehiclesData = [
    { id: '00000000-0000-4000-8000-000000000201', clientId: clientMap['Andrés Ramírez'], plate: 'ABC123', vin: '1HGCM82633A123456', make: 'Toyota', model: 'Hilux', year: 2019, mileage: 87450, color: 'Blanco' },
    { id: '00000000-0000-4000-8000-000000000202', clientId: clientMap['Valentina Torres'], plate: 'GHJ781', vin: '2T1BURHE0JC052890', make: 'Chevrolet', model: 'Captiva', year: 2021, mileage: 43200, color: 'Gris Plata' },
    { id: '00000000-0000-4000-8000-000000000203', clientId: clientMap['Marcos Fuentes'], plate: 'KLS452', vin: '3VWFE21C04M000001', make: 'Volkswagen', model: 'Golf', year: 2018, mileage: 112000, color: 'Negro' },
    { id: '00000000-0000-4000-8000-000000000204', clientId: clientMap['Isabel Castillo'], plate: 'BCD345', vin: '5XYKT3A14CG215640', make: 'Kia', model: 'Sportage', year: 2022, mileage: 28900, color: 'Rojo Fuego' },
    { id: '00000000-0000-4000-8000-000000000205', clientId: clientMap['LogiTrans SAS'], plate: 'FLO101', vin: '8AFBA3826GJ000111', make: 'Ford', model: 'Ranger', year: 2020, mileage: 156000, color: 'Blanco' },
    { id: '00000000-0000-4000-8000-000000000206', clientId: clientMap['Valentina Torres'], plate: 'DST894', vin: '9BD118944MN092100', make: 'Renault', model: 'Duster', year: 2021, mileage: 62000, color: 'Verde Grisáceo' },
  ];

  const vehicleMap: Record<string, string> = {};
  for (const v of vehiclesData) {
    const saved = await prisma.vehicle.upsert({
      where: { plate: v.plate },
      update: { currentClientId: v.clientId, make: v.make, model: v.model, year: v.year, mileage: v.mileage, color: v.color },
      create: {
        id: v.id,
        currentClientId: v.clientId,
        plate: v.plate,
        vin: v.vin,
        make: v.make,
        model: v.model,
        year: v.year,
        mileage: v.mileage,
        color: v.color,
        workshopId,
      },
    });
    vehicleMap[v.plate] = saved.id;
  }
  console.log('✅ Vehículos registrados.');

  // 6. Órdenes de Trabajo en TODOS los estados
  const ordersSeed = [
    // 1. RECEIVED
    {
      number: 'OT-2026-0301',
      vehicleId: vehicleMap['BCD345'],
      clientId: clientMap['Isabel Castillo'],
      technicianId: null, // Sin asignar para probar asignación
      status: WorkOrderStatus.RECEIVED,
      urgency: UrgencyLevel.LOW,
      complaint: 'Mantenimiento preventivo 30.000 km según cartilla KIA. Cambio de aceite, filtros y chequeo de niveles.',
      diagnosis: null,
      notes: 'Recepción completada. Esperando asignación de mecánico disponible.',
      mileageIn: 28900,
      total: 227000,
      estimatedDelivery: new Date(Date.now() + 86400000 * 2),
      intakeInspection: {
        fuelLevel: 65,
        belongings: ['Gato hidráulico', 'Llave de pernos', 'Manual de usuario'],
        damageAreas: ['front_bumper'],
        notes: 'Micro-rayón en paragolpes delantero derecho.',
      },
      items: [
        { catalogCode: 'PART-ACEITE', type: CatalogItemType.PART, name: 'Aceite Sintético 5W-30 Galón (4L)', quantity: 1, unitPrice: 125000 },
        { catalogCode: 'PART-FILTRO', type: CatalogItemType.PART, name: 'Filtro de Aceite OEM Alto Flujo', quantity: 1, unitPrice: 42000 },
        { catalogCode: 'SERV-PREV30K', type: CatalogItemType.SERVICE, name: 'Mantenimiento preventivo 30.000 km', quantity: 1, unitPrice: 60000 },
      ],
    },

    // 2. DIAGNOSING
    {
      number: 'OT-2026-0302',
      vehicleId: vehicleMap['KLS452'],
      clientId: clientMap['Marcos Fuentes'],
      technicianId: techRodrigo.id,
      status: WorkOrderStatus.DIAGNOSING,
      urgency: UrgencyLevel.MEDIUM,
      complaint: 'Pérdida de fuerza al acelerar en cuestas y testigo Check Engine parpadeando.',
      diagnosis: 'Escaneo electrónico OBD-II arroja código P0301 (falla de encendido en cilindro 1). Compresión uniforme en 150 PSI. Revisando bobina y bujía.',
      notes: 'Mecánico realizando prueba cruzada de bobinas entre cilindro 1 y 2.',
      mileageIn: 112000,
      total: 85000,
      estimatedDelivery: new Date(Date.now() + 86400000 * 1),
      intakeInspection: {
        fuelLevel: 40,
        belongings: ['Kit de carretera', 'Extintor vigente'],
        damageAreas: [],
        notes: 'Sin novedades estéticas.',
      },
      items: [
        { catalogCode: 'SERV-DIAG', type: CatalogItemType.SERVICE, name: 'Diagnóstico computarizado OBD-II', quantity: 1, unitPrice: 85000 },
      ],
    },

    // 3. IN_PROGRESS (Urgente)
    {
      number: 'OT-2026-0303',
      vehicleId: vehicleMap['ABC123'],
      clientId: clientMap['Andrés Ramírez'],
      technicianId: techFelipe.id,
      status: WorkOrderStatus.IN_PROGRESS,
      urgency: UrgencyLevel.HIGH,
      complaint: 'Cascabeleo fuerte y chirrido metálico al frenar en bajada. Pedal esponjoso.',
      diagnosis: 'Pastillas delanteras desgastadas al límite (5%). Discos con surcos profundos y alabeo. Líquido oxidado con punto de ebullición degradado.',
      notes: 'Desmontaje de mordazas listo. Procediendo a montar discos ventilados y pastillas cerámicas nuevas.',
      mileageIn: 87450,
      total: 320000,
      estimatedDelivery: new Date(),
      intakeInspection: {
        fuelLevel: 80,
        belongings: ['Caja plástica de herramientas en platón'],
        damageAreas: ['hood'],
        notes: 'Impactos menores de gravilla en capó.',
      },
      items: [
        { catalogCode: 'PART-PASTILLAS', type: CatalogItemType.PART, name: 'Kit Pastillas de Freno Cerámicas', quantity: 1, unitPrice: 95000 },
        { catalogCode: 'PART-DISCOS', type: CatalogItemType.PART, name: 'Discos de Freno Ventilados (Par)', quantity: 1, unitPrice: 180000 },
        { catalogCode: 'SERV-FRENOS', type: CatalogItemType.SERVICE, name: 'Cambio de frenos delanteros y purga', quantity: 1, unitPrice: 45000 },
      ],
    },

    // 4. WAITING_PARTS (Urgente esperando proveedor)
    {
      number: 'OT-2026-0304',
      vehicleId: vehicleMap['GHJ781'],
      clientId: clientMap['Valentina Torres'],
      technicianId: techEdgar.id,
      status: WorkOrderStatus.WAITING_PARTS,
      urgency: UrgencyLevel.HIGH,
      complaint: 'Motor tiembla en frío al encender en la mañana y humo negro por el escape.',
      diagnosis: 'Bobinas de encendido 2 y 4 con fuga de chispa hacia masa. Bujías con desgaste irregular.',
      notes: 'Esperando llegada de juego de bobinas de proveedor GM. Entrega programada hoy en la tarde.',
      mileageIn: 43200,
      total: 290000,
      estimatedDelivery: new Date(Date.now() + 86400000 * 2),
      intakeInspection: {
        fuelLevel: 55,
        belongings: ['Silla de bebé en asiento trasero'],
        damageAreas: [],
        notes: 'Vehículo impecable.',
      },
      items: [
        { catalogCode: 'PART-BOBINAS', type: CatalogItemType.PART, name: 'Juego de Bobinas de Encendido', quantity: 1, unitPrice: 140000 },
        { catalogCode: 'PART-BUJIAS', type: CatalogItemType.PART, name: 'Bujías NGK Iridium IX (Set x4)', quantity: 1, unitPrice: 65000 },
        { catalogCode: 'SERV-DIAG', type: CatalogItemType.SERVICE, name: 'Diagnóstico computarizado OBD-II', quantity: 1, unitPrice: 85000 },
      ],
    },

    // 5. COMPLETED (Finalizado esperando retiro)
    {
      number: 'OT-2026-0305',
      vehicleId: vehicleMap['FLO101'],
      clientId: clientMap['LogiTrans SAS'],
      technicianId: techFelipe.id,
      status: WorkOrderStatus.COMPLETED,
      urgency: UrgencyLevel.MEDIUM,
      complaint: 'Golpeteo seco y vibración en tren delantero al pasar baches o reductores.',
      diagnosis: 'Amortiguadores delanteros reventados con fuga total de fluido. Bujes de tijera con holgura.',
      notes: 'Instalación de amortiguadores completada. Alineación computarizada 3D aprobada. Listo para entrega a flota.',
      mileageIn: 156000,
      mileageOut: 156025,
      total: 530000,
      estimatedDelivery: new Date(),
      deliveryReportDraft: 'Se sustituyeron ambos amortiguadores delanteros y se efectuó alineación 3D. Prueba en ruta satisfactoria sin ruidos parásitos.',
      approvedReportSnapshot: 'Informe de entrega aprobado: amortiguadores delanteros nuevos instalados y alineación 3D verificada.',
      reportApprovedAt: new Date(),
      reportApprovedById: admin.id,
      intakeInspection: {
        fuelLevel: 90,
        belongings: ['Radio de comunicaciones flota'],
        damageAreas: ['rear_bumper'],
        notes: 'Uso de flota comercial.',
      },
      items: [
        { catalogCode: 'PART-AMORT', type: CatalogItemType.PART, name: 'Amortiguador de Gas Reforzado Delantero', quantity: 2, unitPrice: 190000 },
        { catalogCode: 'SERV-SUSP', type: CatalogItemType.SERVICE, name: 'Servicio de suspensión delantera', quantity: 1, unitPrice: 65000 },
        { catalogCode: 'SERV-DIAG', type: CatalogItemType.SERVICE, name: 'Diagnóstico computarizado OBD-II', quantity: 1, unitPrice: 85000 },
      ],
    },

    // 6. DELIVERED (Facturado y entregado)
    {
      number: 'OT-2026-0306',
      vehicleId: vehicleMap['DST894'],
      clientId: clientMap['Valentina Torres'],
      technicianId: techEdgar.id,
      status: WorkOrderStatus.DELIVERED,
      urgency: UrgencyLevel.LOW,
      complaint: 'Vehículo no encendió tras reposo de fin de semana. Testigo de batería encendido.',
      diagnosis: 'Batería con celdas degradadas por 3.5 años de servicio. Alternador cargando 14.1V normalmente.',
      notes: 'Instalación de batería nueva 70Ah completada y calibración del sistema eléctrico. Entregado al cliente.',
      mileageIn: 62000,
      mileageOut: 62015,
      total: 290000,
      estimatedDelivery: new Date(Date.now() - 86400000 * 2),
      approvedReportSnapshot: 'Vehículo entregado con acumulador nuevo 70Ah y 18 meses de garantía. Sistema de carga validado.',
      reportApprovedAt: new Date(Date.now() - 86400000 * 2),
      reportApprovedById: admin.id,
      intakeInspection: {
        fuelLevel: 45,
        belongings: ['Llavero de repuesto'],
        damageAreas: [],
        notes: 'Sin novedades.',
      },
      items: [
        { catalogCode: 'PART-BATERIA', type: CatalogItemType.PART, name: 'Batería 70Ah Libre de Mantenimiento', quantity: 1, unitPrice: 240000 },
        { catalogCode: 'SERV-ELEC', type: CatalogItemType.SERVICE, name: 'Diagnóstico eléctrico y batería', quantity: 1, unitPrice: 50000 },
      ],
    },
  ];

  for (const ot of ordersSeed) {
    const existing = await prisma.workOrder.findUnique({ where: { number: ot.number } });
    if (existing) {
      await prisma.workOrderItem.deleteMany({ where: { workOrderId: existing.id } });
      await prisma.workOrderEvent.deleteMany({ where: { workOrderId: existing.id } });
      await prisma.workOrder.delete({ where: { id: existing.id } });
    }

    const created = await prisma.workOrder.create({
      data: {
        number: ot.number,
        vehicleId: ot.vehicleId,
        clientId: ot.clientId,
        technicianId: ot.technicianId,
        createdById: advisor.id,
        status: ot.status,
        urgency: ot.urgency,
        complaint: ot.complaint,
        diagnosis: ot.diagnosis,
        notes: ot.notes,
        mileageIn: ot.mileageIn,
        mileageOut: ot.mileageOut,
        total: ot.total,
        estimatedDelivery: ot.estimatedDelivery,
        intakeInspection: ot.intakeInspection,
        deliveryReportDraft: ot.deliveryReportDraft,
        approvedReportSnapshot: ot.approvedReportSnapshot,
        reportApprovedAt: ot.reportApprovedAt,
        reportApprovedById: ot.reportApprovedById,
        workshopId,
      },
    });

    // Crear ítems de la orden
    for (const item of ot.items) {
      const catId = item.catalogCode ? catalogMap[item.catalogCode] : null;
      await prisma.workOrderItem.create({
        data: {
          workOrderId: created.id,
          catalogItemId: catId,
          type: item.type,
          nameSnapshot: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          authorizationStatus: AuthorizationStatus.APPROVED,
          workshopId,
        },
      });
    }

    // Registrar evento de auditoría inicial
    await prisma.workOrderEvent.create({
      data: {
        workOrderId: created.id,
        actorId: admin.id,
        action: 'created',
        toValue: { status: ot.status, urgency: ot.urgency },
        workshopId,
      },
    });
  }

  console.log(`✅ ${ordersSeed.length} Órdenes de Trabajo creadas en todos los estados operativos.`);
  console.log('🎉 Carga de datos de prueba finalizada con éxito.');
}

seedDemoData()
  .catch((e) => {
    console.error('❌ Error al sembrar datos de prueba:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
