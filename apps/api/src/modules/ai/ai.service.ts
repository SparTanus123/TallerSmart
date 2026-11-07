import { prisma } from '../../lib/prisma';
import {
  callGemini,
  callGeminiChat,
  checkGeminiHealth,
  SMARTMEC_SYSTEM_PROMPT,
} from './gemini.client';
import type {
  ChatRequest,
  IntakeAnalysisInput,
  PreventiveAnalysisInput,
  DeliveryReportInput,
} from './ai.schema';

export async function getSmartMecStatus() {
  const health = await checkGeminiHealth();
  return {
    agent: {
      name: 'SmartMec',
      title: 'Copiloto Automotriz Inteligente de TallerSmart',
      version: '1.0.0',
      description:
        'Agente único especializado en triaje técnico, diagnóstico asistido, mantenimiento preventivo y redacción de informes.',
      capabilities: [
        'Clasificación y triaje de quejas mecánicas',
        'Cálculo inteligente de mantenimiento preventivo por kilometraje',
        'Generación de informes de entrega para clientes y técnicos',
        'Asistencia interactiva en fallas automotrices y códigos OBD-II',
        'Lectura de contexto de vehículos y órdenes de trabajo del taller',
      ],
    },
    gemini: health,
  };
}

export async function processChat(input: ChatRequest, user?: { name: string; role: string }) {
  const lastUserMsg = input.messages[input.messages.length - 1]?.content ?? '';
  const dbContext = await buildWorkshopDatabaseContext(input.workOrderId, input.vehicleId, lastUserMsg);

  const userRoleStr = user ? `El usuario que te consulta en TallerSmart es ${user.name} (${user.role}).` : '';
  const extendedSystemPrompt = `${SMARTMEC_SYSTEM_PROMPT}\n${userRoleStr}\n${dbContext}`;

  const history = input.messages.map((m) => ({
    role: m.role,
    parts: m.content,
  }));

  const result = await callGeminiChat(history, extendedSystemPrompt);

  return {
    reply: result.text,
    model: result.model,
    agent: 'SmartMec',
  };
}

async function buildWorkshopDatabaseContext(
  specificOrderId?: string,
  specificVehicleId?: string,
  lastUserMessage?: string
): Promise<string> {
  try {
    // 1. Fetch active work orders (not delivered or completed)
    const activeOrders = await prisma.workOrder.findMany({
      where: {
        status: { notIn: ['COMPLETED', 'DELIVERED'] },
      },
      include: {
        vehicle: true,
        client: true,
        technician: { select: { id: true, name: true } },
        items: true,
      },
      orderBy: [{ urgency: 'desc' }, { createdAt: 'desc' }],
      take: 20,
    });

    // 2. Count by status
    const counts = await prisma.workOrder.groupBy({
      by: ['status'],
      _count: { id: true },
    });
    const statusMap: Record<string, number> = {};
    for (const c of counts) {
      statusMap[c.status] = c._count.id;
    }

    // 3. Active technicians
    const techs = await prisma.user.findMany({
      where: { role: 'TECHNICIAN', active: true },
      select: { id: true, name: true },
    });

    let ctx = `\n[BASE DE DATOS TALLERSMART - ESTADO OPERATIVO EN TIEMPO REAL]\n`;
    ctx += `Resumen global del taller:\n`;
    ctx += `- Recibido: ${statusMap['RECEIVED'] || 0} | Diagnóstico: ${statusMap['DIAGNOSING'] || 0} | En Proceso: ${statusMap['IN_PROGRESS'] || 0} | Espera Repuestos: ${statusMap['WAITING_PARTS'] || 0} | Finalizado: ${statusMap['COMPLETED'] || 0} | Entregado: ${statusMap['DELIVERED'] || 0}\n`;
    ctx += `- Mecánicos registrados: ${techs.map((t) => t.name).join(', ') || 'Ninguno'}\n`;

    if (activeOrders.length === 0) {
      ctx += `- Actualmente no hay órdenes de trabajo activas en bahía.\n`;
    } else {
      ctx += `\nÓrdenes de Trabajo Activas (${activeOrders.length}):\n`;
      for (const o of activeOrders) {
        const items = o.items.map((i) => `${i.nameSnapshot} (cant: ${i.quantity})`).join(', ') || 'Sin repuestos/servicios cargados';
        const tech = o.technician?.name ?? 'Sin asignar';
        ctx += `• [OT: ${o.number}] (ID: ${o.id})
  - Vehículo: ${o.vehicle.make} ${o.vehicle.model} (${o.vehicle.year}) · Placa: ${o.vehicle.plate} · Km: ${o.mileageIn}
  - Cliente: ${o.client.name} (Tel: ${o.client.phone})
  - Estado: ${o.status} | Urgencia: ${o.urgency} | Técnico: ${tech}
  - Queja: "${o.complaint}"
  - Diagnóstico: "${o.diagnosis || 'Pendiente'}"
  - Repuestos/Servicios: ${items}
  - Notas: "${o.notes || 'Ninguna'}"\n`;
      }
    }

    // If specific order selected
    if (specificOrderId) {
      const specific = await prisma.workOrder.findUnique({
        where: { id: specificOrderId },
        include: {
          vehicle: true,
          client: true,
          technician: true,
          items: true,
          events: { include: { actor: true }, orderBy: { createdAt: 'desc' }, take: 5 },
        },
      });
      if (specific) {
        ctx += `\n[DETALLE PROFUNDO DE LA OT SELECCIONADA: ${specific.number}]
- Vehículo: ${specific.vehicle.make} ${specific.vehicle.model} (${specific.vehicle.year}) · Placa: ${specific.vehicle.plate}
- Cliente: ${specific.client.name} (Tel: ${specific.client.phone})
- Estado: ${specific.status} | Urgencia: ${specific.urgency} | Técnico: ${specific.technician?.name ?? 'Sin asignar'}
- Queja: "${specific.complaint}"
- Diagnóstico: "${specific.diagnosis || 'Pendiente'}"
- Ítems/Repuestos: ${specific.items.map((i) => `${i.nameSnapshot} (cant: ${i.quantity}, $${i.unitPrice})`).join(', ') || 'Ninguno'}
- Notas de trabajo: "${specific.notes || 'Ninguna'}"
`;
      }
    } else if (specificVehicleId) {
      const v = await prisma.vehicle.findUnique({
        where: { id: specificVehicleId },
        include: {
          currentClient: true,
          orders: {
            take: 3,
            orderBy: { createdAt: 'desc' },
            select: { number: true, complaint: true, diagnosis: true, mileageIn: true, createdAt: true },
          },
        },
      });
      if (v) {
        ctx += `\n[DETALLE DEL VEHÍCULO SELECCIONADO: ${v.plate}]
- Vehículo: ${v.make} ${v.model} (${v.year}) · Dueño: ${v.currentClient.name} · Km: ${v.mileage}
- Historial reciente: ${v.orders.map((o) => `OT ${o.number}: ${o.complaint} -> ${o.diagnosis || 'OK'}`).join(' | ') || 'Sin órdenes previas'}
`;
      }
    }

    // Auto-search if plate mentioned in user's prompt
    if (lastUserMessage) {
      const plateMatch = lastUserMessage.match(/\b[A-Za-z]{3}\s*[-]?\s*\d{3}\b/);
      if (plateMatch) {
        const cleanPlate = plateMatch[0].replace(/[\s-]/g, '').toUpperCase();
        const foundVehicle = await prisma.vehicle.findFirst({
          where: { plate: { equals: cleanPlate, mode: 'insensitive' } },
          include: {
            currentClient: true,
            orders: { take: 3, orderBy: { createdAt: 'desc' }, include: { items: true, technician: true } },
          },
        });
        if (foundVehicle) {
          ctx += `\n[BÚSQUEDA AUTOMÁTICA EN BASE DE DATOS PARA PLACA "${cleanPlate}"]:
- Vehículo: ${foundVehicle.make} ${foundVehicle.model} (${foundVehicle.year}) · Cliente: ${foundVehicle.currentClient.name}
- Historial de OTs: ${foundVehicle.orders.map((o) => `OT ${o.number} [${o.status}]: ${o.complaint} -> ${o.diagnosis || 'Revisión'}`).join('; ') || 'Sin OTs previas'}
`;
        }
      }
    }

    return ctx;
  } catch (err) {
    console.error('[SmartMec] Error al construir contexto de base de datos:', err);
    return '\n[BASE DE DATOS: Acceso básico]\n';
  }
}

export async function getSmartMecBriefing() {
  const activeOrders = await prisma.workOrder.findMany({
    where: {
      status: { notIn: ['COMPLETED', 'DELIVERED'] },
    },
    include: {
      vehicle: true,
      client: true,
      technician: { select: { id: true, name: true } },
      items: true,
    },
    orderBy: [{ urgency: 'desc' }, { createdAt: 'desc' }],
    take: 20,
  });

  const waitingParts = activeOrders.filter((o) => o.status === 'WAITING_PARTS');
  const inProgress = activeOrders.filter((o) => o.status === 'IN_PROGRESS');
  const diagnosing = activeOrders.filter((o) => o.status === 'DIAGNOSING');
  const highUrgency = activeOrders.filter((o) => o.urgency === 'HIGH');
  const unassigned = activeOrders.filter((o) => !o.technicianId);

  // Generate contextual suggestions based on actual DB work orders
  const suggestions: Array<{
    id: string;
    icon: string;
    title: string;
    prompt: string;
    workOrderId?: string;
  }> = [];

  // Suggestion 1: High urgency order
  if (highUrgency.length > 0) {
    const o = highUrgency[0];
    suggestions.push({
      id: `sug-urg-${o.id}`,
      icon: '🚨',
      title: `Prioridad Alta: ${o.vehicle.make} (${o.vehicle.plate})`,
      prompt: `¿Cuál es el plan de acción prioritario para la ${o.vehicle.make} ${o.vehicle.model} (OT ${o.number}) de alta urgencia con falla "${o.complaint}"?`,
      workOrderId: o.id,
    });
  }

  // Suggestion 2: Waiting for parts
  if (waitingParts.length > 0) {
    const o = waitingParts[0];
    const partsNames = o.items.filter((i) => i.type === 'PART').map((i) => i.nameSnapshot).join(', ');
    suggestions.push({
      id: `sug-part-${o.id}`,
      icon: '📦',
      title: `Repuestos: ${o.vehicle.make} ${o.vehicle.model}`,
      prompt: `¿Qué repuestos (${partsNames || 'pendientes'}) requiere la OT ${o.number} (${o.vehicle.plate}) y qué trabajos preliminares se pueden adelantar en bahía?`,
      workOrderId: o.id,
    });
  }

  // Suggestion 3: In diagnosis
  if (diagnosing.length > 0) {
    const o = diagnosing[0];
    suggestions.push({
      id: `sug-diag-${o.id}`,
      icon: '🔍',
      title: `Diagnóstico: ${o.vehicle.make} (${o.complaint.slice(0, 24)}...)`,
      prompt: `Guía de diagnóstico técnico para la ${o.vehicle.make} ${o.vehicle.model} (${o.vehicle.plate}): "${o.complaint}". ¿Qué pruebas de taller y códigos OBD-II verificar?`,
      workOrderId: o.id,
    });
  }

  // Suggestion 4: In progress
  if (inProgress.length > 0) {
    const o = inProgress[0];
    suggestions.push({
      id: `sug-prog-${o.id}`,
      icon: '🔧',
      title: `En curso: ${o.vehicle.make} (${o.vehicle.plate})`,
      prompt: `Resumen técnico y puntos clave de control de calidad para la OT ${o.number} (${o.vehicle.make} ${o.vehicle.model}) asignada a ${o.technician?.name ?? 'técnico'}.`,
      workOrderId: o.id,
    });
  }

  // Suggestion 5: General workshop status
  suggestions.push({
    id: 'sug-global-summary',
    icon: '📊',
    title: 'Resumen de bahías del taller',
    prompt: `¿Podrías darme un informe ejecutivo del estado de todas las órdenes de trabajo activas en el taller, técnicos asignados y cuellos de botella?`,
  });

  // Fallbacks if few orders
  if (suggestions.length < 4) {
    suggestions.push({
      id: 'sug-obd-check',
      icon: '⚡',
      title: 'Diagnóstico OBD-II y DTCs',
      prompt: `¿Cómo interpretar y diagnosticar los códigos de falla OBD-II más frecuentes (P0300, P0171, P0420) en el taller?`,
    });
    suggestions.push({
      id: 'sug-preventive-guide',
      icon: '⚙️',
      title: 'Plan preventivo por km',
      prompt: `¿Cuáles son los puntos críticos de mantenimiento preventivo para vehículos con más de 80.000 km?`,
    });
  }

  // Compute robust rule-based briefing text (natural and clean)
  let briefingText = '';
  if (activeOrders.length === 0) {
    briefingText = `Taller al día sin órdenes de trabajo pendientes en bahía. Registra una nueva recepción para iniciar el flujo de diagnósticos.`;
  } else {
    const parts: string[] = [];
    if (highUrgency.length > 0) {
      parts.push(`${highUrgency.length} OT${highUrgency.length > 1 ? 's' : ''} de alta urgencia`);
    }
    if (waitingParts.length > 0) {
      parts.push(`${waitingParts.length} esperan repuestos críticos`);
    }
    if (inProgress.length > 0) {
      parts.push(`${inProgress.length} en proceso técnico`);
    }
    if (diagnosing.length > 0) {
      parts.push(`${diagnosing.length} en diagnóstico`);
    }
    if (unassigned.length > 0) {
      parts.push(`${unassigned.length} sin técnico asignado`);
    }
    briefingText = `${activeOrders.length} OTs en taller: ${parts.join('. ')}. Consulta sugerencias operativas en SmartMec.`;
  }

  // Attempt AI enrichment from Gemini if active
  try {
    const prompt = `Actúa como SmartMec, copiloto de TallerSmart.
Genera un BRIEFING DEL DÍA de exactamente 1 o 2 oraciones concisas para el jefe de taller basado en estos datos reales de la base de datos:
- Total OTs activas: ${activeOrders.length}
- Alta urgencia: ${highUrgency.length} (${highUrgency.map((o) => `${o.vehicle.make} ${o.vehicle.plate}`).join(', ') || 'ninguna'})
- Esperando repuestos: ${waitingParts.length} (${waitingParts.map((o) => `${o.vehicle.make} ${o.vehicle.plate}`).join(', ') || 'ninguna'})
- En proceso en bahía: ${inProgress.length}
- En diagnóstico: ${diagnosing.length}
- Sin técnico asignado: ${unassigned.length}

REQUISITOS OBLIGATORIOS:
1. Redacción natural, profesional y sobria. NO satures con emojis (máximo 1 discreto o preferiblemente ninguno).
2. Sé conciso (máximo 220 caracteres).
3. Enfócate en los puntos críticos y una recomendación práctica de acción para hoy.
4. Devuelve SOLO el texto del briefing, sin comillas ni títulos adicionales.`;

    const aiRes = await callGemini({
      prompt,
      temperature: 0.3,
    });

    if (aiRes.text && aiRes.text.length > 15) {
      briefingText = aiRes.text.replace(/^["']|["']$/g, '').trim();
    }
  } catch {
    // If Gemini fails or times out, fallback remains active
  }

  return {
    briefing: briefingText,
    suggestions,
    stats: {
      total: activeOrders.length,
      waitingParts: waitingParts.length,
      inProgress: inProgress.length,
      diagnosing: diagnosing.length,
      highUrgency: highUrgency.length,
      unassigned: unassigned.length,
    },
  };
}

export async function analyzeIntake(input: IntakeAnalysisInput) {
  let vehicleStr = input.vehicleInfo ?? 'No especificado';
  let mileageStr = input.mileage ? `${input.mileage} km` : 'No especificado';

  if (input.workOrderId) {
    const order = await prisma.workOrder.findUnique({
      where: { id: input.workOrderId },
      include: { vehicle: true },
    });
    if (order) {
      vehicleStr = `${order.vehicle.make} ${order.vehicle.model} (${order.vehicle.year})`;
      mileageStr = `${order.mileageIn} km`;
    }
  }

  const prompt = `Analiza la queja técnica de ingreso y genera una clasificación estructurada:
Vehículo: ${vehicleStr}
Kilometraje: ${mileageStr}
Relato del cliente / queja: "${input.complaint}"

Devuelve EXCLUSIVAMENTE un objeto JSON válido con los siguientes campos:
{
  "sintomas_extraidos": string[],
  "sistema_afectado": string,
  "subsistema": string,
  "nivel_urgencia": "BAJO" | "MEDIO" | "ALTO",
  "razon_urgencia": string,
  "diagnosticos_recomendados": string[],
  "nota_mecanico": string
}`;

  const result = await callGemini({
    prompt,
    temperature: 0.2,
    responseMimeType: 'application/json',
  });

  try {
    const parsed = JSON.parse(result.text);
    return {
      success: true,
      data: parsed,
      model: result.model,
      agent: 'SmartMec',
    };
  } catch {
    return {
      success: false,
      raw: result.text,
      model: result.model,
      agent: 'SmartMec',
    };
  }
}

export async function analyzePreventive(input: PreventiveAnalysisInput) {
  let make = input.make ?? 'Vehículo general';
  let model = input.model ?? '';
  let year = input.year ?? 2020;
  let mileage = input.mileage ?? 80000;
  let historyNotes = '';

  if (input.vehicleId) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: input.vehicleId },
      include: {
        orders: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { items: true },
        },
      },
    });

    if (vehicle) {
      make = vehicle.make;
      model = vehicle.model;
      year = vehicle.year;
      mileage = vehicle.mileage;
      historyNotes = vehicle.orders
        .map(
          (o) =>
            `- OT ${o.number} (${o.mileageIn} km): ${o.items.map((i) => i.nameSnapshot).join(', ') || o.diagnosis || 'Revisión general'}`
        )
        .join('\n');
    }
  }

  const prompt = `Calcula las necesidades de mantenimiento preventivo para el siguiente automóvil:
Vehículo: ${make} ${model} (${year})
Kilometraje actual: ${mileage} km
${historyNotes ? `Historial de intervenciones previas en taller:\n${historyNotes}` : 'Sin historial detallado previo.'}

Evalúa los intervalos habituales para: aceite de motor y filtros, correa/cadena de distribución, líquido de frenos y pastillas/discos, bujías de encendido, refrigerante del radiador, suspensión y neumáticos.

Devuelve EXCLUSIVAMENTE un JSON con un array bajo la clave "recomendaciones":
{
  "recomendaciones": [
    {
      "servicio": string,
      "prioridad": "URGENTE" | "RECOMENDADO" | "PROGRAMAR",
      "km_actual": number,
      "km_intervalo_fabricante": number,
      "razon": string,
      "criticidad": string
    }
  ]
}`;

  const result = await callGemini({
    prompt,
    temperature: 0.2,
    responseMimeType: 'application/json',
  });

  try {
    const parsed = JSON.parse(result.text);
    return {
      success: true,
      data: parsed.recomendaciones || parsed,
      vehicle: { make, model, year, mileage },
      model: result.model,
      agent: 'SmartMec',
    };
  } catch {
    return {
      success: false,
      raw: result.text,
      vehicle: { make, model, year, mileage },
      model: result.model,
      agent: 'SmartMec',
    };
  }
}

export async function generateDeliveryReport(input: DeliveryReportInput) {
  let vehicleInfo = input.vehicleInfo || 'Vehículo no especificado';
  let clientName = input.clientName || 'Estimado cliente';
  let diagnosis = input.diagnosis || 'Revisión y mantenimiento preventivo';
  let notes = input.notes || 'Trabajo finalizado en conformidad';
  let mileageIn = input.mileageIn || 0;
  let mileageOut = input.mileageOut || mileageIn;
  let itemsList = input.itemsInstalled || [];

  if (input.workOrderId) {
    const order = await prisma.workOrder.findUnique({
      where: { id: input.workOrderId },
      include: {
        vehicle: true,
        client: true,
        items: true,
      },
    });

    if (order) {
      clientName = order.client.name;
      vehicleInfo = `${order.vehicle.make} ${order.vehicle.model} (${order.vehicle.year}) · Placa: ${order.vehicle.plate}`;
      diagnosis = order.diagnosis || order.complaint;
      notes = order.notes || 'Servicio técnico realizado.';
      mileageIn = order.mileageIn;
      mileageOut = order.mileageOut || order.mileageIn;
      if (!itemsList.length) {
        itemsList = order.items.map((i) => `${i.nameSnapshot} (cant: ${i.quantity})`);
      }
    }
  }

  const prompt = `Redacta un informe de entrega de taller mecánico profesional con tono "${input.tone === 'tecnico' ? 'técnico exhaustivo' : 'cordial, transparente y comprensible para el cliente final'}":

Datos del caso:
- Cliente: ${clientName}
- Vehículo: ${vehicleInfo}
- Kilometraje entrada: ${mileageIn} km · Kilometraje salida: ${mileageOut} km
- Diagnóstico técnico detectado: ${diagnosis}
- Trabajos ejecutados y notas del mecánico: ${notes}
- Repuestos / Servicios aplicados: ${itemsList.join(', ') || 'Mano de obra y revisión general'}

Estructura requerida:
1. Encabezado formal de entrega (TallerSmart).
2. Saludo personalizado.
3. Resumen comprensible del motivo de ingreso y solución aplicada.
4. Detalle de repuestos y piezas sustituidas.
5. Estado final del vehículo tras prueba de ruta / control de calidad.
6. Recomendación preventiva clave para la próxima visita (fecha o kilometraje estimado).
7. Despedida formal.`;

  const result = await callGemini({
    prompt,
    temperature: 0.4,
  });

  return {
    success: true,
    report: result.text,
    model: result.model,
    agent: 'SmartMec',
  };
}
