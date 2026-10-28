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
  let contextSnippet = '';

  // Enrich context if workOrderId is provided
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
      contextSnippet += `\n[CONTEXTO DE ORDEN DE TRABAJO ACTUAL:
- Número OT: ${order.number}
- Estado: ${order.status}
- Cliente: ${order.client.name}
- Vehículo: ${order.vehicle.make} ${order.vehicle.model} (${order.vehicle.year}) · Placa: ${order.vehicle.plate} · Km: ${order.mileageIn}
- Queja del cliente: "${order.complaint}"
- Diagnóstico técnico registrado: "${order.diagnosis || 'Pendiente'}"
- Notas de trabajo: "${order.notes || 'Ninguna'}"
- Repuestos y servicios: ${order.items.map((i) => `${i.nameSnapshot} (cant: ${i.quantity})`).join(', ') || 'Sin ítems aún'}
]`;
    }
  } else if (input.vehicleId) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: input.vehicleId },
      include: {
        currentClient: true,
        orders: {
          take: 3,
          orderBy: { createdAt: 'desc' },
          select: { number: true, complaint: true, diagnosis: true, mileageIn: true, createdAt: true },
        },
      },
    });

    if (vehicle) {
      contextSnippet += `\n[CONTEXTO DEL VEHÍCULO:
- Vehículo: ${vehicle.make} ${vehicle.model} ${vehicle.year} · Placa: ${vehicle.plate} · Km actual: ${vehicle.mileage}
- Propietario: ${vehicle.currentClient.name}
- Historial reciente: ${vehicle.orders.map((o) => `OT ${o.number} (${o.mileageIn} km): ${o.complaint} -> ${o.diagnosis || 'OK'}`).join(' | ') || 'Sin órdenes previas'}
]`;
    }
  }

  const userRoleStr = user ? `El usuario que te consulta es ${user.name} (${user.role}).` : '';
  const extendedSystemPrompt = `${SMARTMEC_SYSTEM_PROMPT}\n${userRoleStr}${contextSnippet}`;

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
