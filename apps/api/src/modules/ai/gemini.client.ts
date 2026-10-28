const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';
const PRIMARY_MODEL = process.env.GEMINI_MODEL ?? 'gemini-3-flash-preview';

// Cascade list of models to try in case of temporary 503 or 429
const FALLBACK_MODELS = [
  PRIMARY_MODEL,
  'gemini-3-flash-preview',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.8-flash',
].filter((m, i, arr) => arr.indexOf(m) === i);

export const SMARTMEC_SYSTEM_PROMPT = `Eres SmartMec, el Asistente Automotriz Inteligente y copiloto experto de TallerSmart.
Tu rol es asistir a recepcionistas, asesores de servicio y mecánicos en tareas técnicas:
1. Triaje y clasificación de síntomas iniciales a partir del relato del cliente.
2. Formulación de hipótesis diagnósticas rigurosas y pruebas de taller recomendadas (frenos, inyección, motor, transmisión, dirección, suspensión, electricidad, OBD-II).
3. Planes de mantenimiento preventivo basados en kilometraje y manual de servicio automotriz.
4. Redacción de informes de entrega profesionales para clientes finales o resúmenes técnicos para el taller.
5. Soporte en tiempo real para dudas mecánicas, especificaciones y códigos de error (DTCs).

Directrices:
- Eres profesional, técnico, conciso y preciso.
- Nunca inventes datos que comprometan la seguridad de un vehículo. Ante dudas, sugiere comprobaciones visuales y mediciones físicas (micrómetro, escáner, manómetro, etc.).
- Habla en español en tono técnico y cordial.`;

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
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY no está configurada en las variables de entorno.');
  }

  const systemInstructionPart = options.systemInstruction || SMARTMEC_SYSTEM_PROMPT;

  let lastError: Error | null = null;

  for (const model of FALLBACK_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      
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
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY no está configurada.');
  }

  let lastError: Error | null = null;

  for (const model of FALLBACK_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

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
  try {
    const { model } = await callGemini({
      prompt: 'Responde únicamente con la palabra OK.',
      temperature: 0,
    });
    return { ok: true, model, latencyMs: Date.now() - start };
  } catch (e: unknown) {
    return {
      ok: false,
      model: PRIMARY_MODEL,
      latencyMs: Date.now() - start,
      error: e instanceof Error ? e.message : 'Error al conectar con Gemini API',
    };
  }
}
