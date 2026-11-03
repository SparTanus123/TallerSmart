function getApiKey(): string {
  return (process.env.GEMINI_API_KEY ?? '').trim();
}

function getPrimaryModel(): string {
  return (process.env.GEMINI_MODEL ?? '').trim() || 'gemini-3.5-flash-lite';
}

// Cascade list of models to try in case of temporary 503 or 429
function getFallbackModels(): string[] {
  const primary = getPrimaryModel();
  return [
    primary,
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-3.6-flash',
    'gemini-3-flash-preview',
  ].filter((m, i, arr) => arr.indexOf(m) === i && !!m);
}

export const SMARTMEC_SYSTEM_PROMPT = `Eres SmartMec, el Asistente Automotriz Inteligente y copiloto experto de TallerSmart.
Tienes acceso y visibilidad completa sobre la base de datos operativa del taller (órdenes de trabajo, vehículos, clientes, mecánicos asignados, repuestos y estados en bahía).

Tu rol es asistir a administradores, asesores de servicio, recepcionistas y mecánicos en tareas técnicas y de gestión:
1. 📋 Consultar, resumir y dar seguimiento a las Órdenes de Trabajo (OTs), su estado, progreso, plazos y niveles de urgencia.
2. 🔍 Triaje y clasificación de síntomas iniciales a partir del relato del cliente.
3. 🔧 Formulación de hipótesis diagnósticas precisas, pruebas de taller recomendadas y lectura de códigos OBD-II (DTCs).
4. ⚙️📦 Asesoramiento sobre repuestos necesarios, sustituciones, stock y compatibilidad.
5. 🚗 Planes de mantenimiento preventivo basados en kilometraje y pautas de fabricantes automotrices.
6. 📑 Redacción de informes de entrega profesionales y comprensibles para el cliente.

USO OBLIGATORIO DE EMOJIS AUTOMOTRICES Y DE TALLER:
En TODAS tus respuestas debes incluir emojis pertinentes para que la experiencia sea visual, dinámica y orientada a la ingeniería mecánica automotriz:
• 🚗 🚙 🚚 🏎️ Para vehículos, marcas, modelos y carrocería.
• 🔧 🪛 ⚙️ 🛠️ 🔩 Para herramientas, reparaciones, mecánica general y ajustes.
• 📋 📝 📑 Para órdenes de trabajo (OTs), fichas técnicas, presupuestos y reportes.
• 📦 🏷️ Para repuestos, refacciones, filtros, pastillas y fluidos.
• ⏱️ ⏳ 🚨 ⚠️ Para tiempos estimados, plazos de entrega, retrasos y urgencias.
• 🔍 💡 🧠 ⚡ Para diagnósticos, códigos OBD-II, fallas eléctricas y sugerencias SmartMec.
• ✅ 🟢 🟡 🔴 Para aprobaciones, semáforos de criticidad y estados finalizados.
• 👨‍🔧 👩‍🔧 Para los mecánicos del equipo y asignaciones de bahía.
• 💰 💵 Para costos y presupuestos.

Directrices de respuesta:
- Utiliza la información de la base de datos provista en el contexto para responder con datos reales y exactos (números de OT, placas, clientes, quejas y técnicos).
- Si te consultan por una OT o vehículo registrado, menciona su placa 🚗, estado actual 🔄, técnico asignado 👨‍🔧 y detalles relevantes.
- Eres profesional, técnico, conciso, riguroso y cordial en español.
- Nunca inventes datos que comprometan la seguridad mecánica. Ante dudas, sugiere comprobaciones visuales y mediciones físicas (micrómetro, escáner OBD, manómetro).

REGLA ESTRICTA DE FORMATO (SIN EXCESO DE ASTERISCOS **):
- NO abuses de los asteriscos dobles (**). NO encierres palabras, nombres, estados ni frases comunes entre asteriscos (**palabra**).
- Al usuario no le gusta ver mensajes recargados de asteriscos. Mantén el texto limpio, fluido y elegante.
- Usa los emojis automotrices, saltos de línea y viñetas simples (•) para jerarquizar visualmente la información en lugar de saturar de negritas con asteriscos.
- Ejemplo de estilo limpio deseado:
  🚗 Vehículo: Toyota Hilux (Placa: ABC123)
  📋 Estado: En Proceso
  👨‍🔧 Técnico: Felipe Núñez
  🔧 Diagnóstico: Desgaste en pastillas de freno`;

interface GenerateOptions {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  responseMimeType?: string;
}

interface GeminiPart {
  text?: string;
}

interface GeminiCandidate {
  content?: {
    parts?: GeminiPart[];
    role?: string;
  };
  finishReason?: string;
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
  error?: {
    code: number;
    message: string;
    status: string;
  };
}

export async function callGemini(options: GenerateOptions): Promise<{ text: string; model: string }> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY no está configurada en las variables de entorno.');
  }

  const systemInstructionPart = options.systemInstruction || SMARTMEC_SYSTEM_PROMPT;

  let lastError: Error | null = null;

  for (const model of getFallbackModels()) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      
      const payload: Record<string, unknown> = {
        system_instruction: {
          parts: [{ text: systemInstructionPart }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: options.prompt }],
          },
        ],
        generationConfig: {
          temperature: options.temperature ?? 0.3,
          ...(options.responseMimeType ? { responseMimeType: options.responseMimeType } : {}),
        },
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorBody = await res.text();
        const status = res.status;
        lastError = new Error(`Gemini error HTTP ${status} en modelo ${model}: ${errorBody}`);
        // If 503 (high demand) or 429 (rate limit) or 404, try next model in cascade
        if (status === 503 || status === 429 || status === 404) {
          console.warn(`[SmartMec] Modelo ${model} respondió con ${status}, intentando siguiente fallback...`);
          continue;
        }
        throw lastError;
      }

      const data = (await res.json()) as GeminiResponse;
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error(`Respuesta vacía de Gemini (modelo ${model})`);
      }

      return { text: text.trim(), model };
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError ?? new Error('No se pudo obtener respuesta de ningún modelo de Gemini configurado.');
}

export async function callGeminiChat(
  history: Array<{ role: 'user' | 'model'; parts: string }>,
  systemInstruction?: string
): Promise<{ text: string; model: string }> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY no está configurada.');
  }

  let lastError: Error | null = null;

  for (const model of getFallbackModels()) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const contents = history.map((h) => ({
        role: h.role,
        parts: [{ text: h.parts }],
      }));

      const payload = {
        system_instruction: {
          parts: [{ text: systemInstruction || SMARTMEC_SYSTEM_PROMPT }],
        },
        contents,
        generationConfig: {
          temperature: 0.4,
        },
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const status = res.status;
        const errText = await res.text();
        lastError = new Error(`HTTP ${status} en ${model}: ${errText}`);
        if (status === 503 || status === 429 || status === 404) {
          continue;
        }
        throw lastError;
      }

      const data = (await res.json()) as GeminiResponse;
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Respuesta vacía');

      return { text: text.trim(), model };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError ?? new Error('Todos los modelos de chat fallaron.');
}

export async function checkGeminiHealth(): Promise<{ ok: boolean; model: string; latencyMs: number; error?: string }> {
  const start = Date.now();
  const primary = getPrimaryModel();
  try {
    const { model } = await callGemini({
      prompt: 'Responde únicamente con la palabra OK.',
      temperature: 0,
    });
    return { ok: true, model, latencyMs: Date.now() - start };
  } catch (e: unknown) {
    return {
      ok: false,
      model: primary,
      latencyMs: Date.now() - start,
      error: e instanceof Error ? e.message : 'Error al conectar con Gemini API',
    };
  }
}
