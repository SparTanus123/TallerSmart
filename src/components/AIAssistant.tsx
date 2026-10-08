import { useState } from 'react';
import { workOrders, vehicles, clients } from '../data/mockData';

type ToolId = 'intake' | 'history' | 'preventive' | 'report';

const TOOL_META: Record<ToolId, { title: string; subtitle: string; color: string; model: string }> = {
  intake:    { title: 'Clasificación de Entrada',    subtitle: 'Extrae síntomas, sistema afectado y urgencia a partir de la descripción del cliente', color: '#7C3AED', model: 'claude-sonnet-5' },
  history:   { title: 'Resumen de Historial',        subtitle: 'Analiza el historial del vehículo y genera un briefing estructurado para el mecánico', color: '#2563EB', model: 'claude-sonnet-5' },
  preventive:{ title: 'Recomendaciones Preventivas', subtitle: 'Cruza kilometraje y servicios previos con reglas estándar del fabricante', color: '#059669', model: 'claude-sonnet-5' },
  report:    { title: 'Informe de Entrega',          subtitle: 'Transforma notas técnicas en un informe claro y profesional para el cliente final', color: '#E55A2B', model: 'claude-sonnet-5' },
};

const MOCK_RESPONSES: Record<ToolId, (input: string) => string> = {
  intake: (input) => JSON.stringify({
    sintomas_extraidos: ['vibración al frenar', 'ruido metálico', 'pedal esponjoso'],
    sistema_afectado: 'Sistema de Frenado',
    subsistema: 'Frenos delanteros (pastillas y discos)',
    nivel_urgencia: 'ALTO',
    razon_urgencia: 'Falla en sistema de seguridad crítico. Riesgo de accidente por pérdida de capacidad de frenado.',
    diagnosticos_recomendados: [
      'Inspección visual de pastillas y discos delanteros',
      'Prueba de presión del sistema hidráulico (pedal)',
      'Medición de espesor de discos con micrómetro',
      'Verificación nivel y estado del líquido de frenos',
    ],
    nota_mecanico: 'El paciente describe síntomas clásicos de desgaste avanzado en kit de frenos delanteros. Prioridad de atención: inmediata.',
  }, null, 2),

  history: () => `• HISTORIAL DE MANTENIMIENTO (últimos 24 meses / 45.000 km):
  El vehículo registra 3 intervenciones. En 80.000 km: cambio de aceite 5W-30 + filtros (dic 2024). En 87.000 km: revisión preventiva 15 puntos sin anomalías (mar 2025). Sistema eléctrico inspeccionado sin fallas registradas.

• PIEZAS CAMBIADAS RECIENTEMENTE:
  Pastillas traseras reemplazadas en ago 2024 (67.500 km). Discos traseros sin ranurado visible. Bujías originales con aprox. 40.000 km de uso — dentro de vida útil estimada NGK Iridium (60.000 km). Batería evaluada ene 2025, voltaje 12.6V, condición buena.

• ALERTAS PREVENTIVAS:
  ⚠ CORREA DE DISTRIBUCIÓN: último registro hace 45.000 km — fabricante recomienda cambio cada 60.000 km. Programar evaluación urgente en próxima visita.
  ⚠ FRENOS DELANTEROS: no hay registro de cambio en los últimos 45.000 km. Inspección recomendada ante síntomas reportados hoy.
  ℹ Aceite: próximo cambio estimado en 90.000 km (+2.550 km actuales).`,

  preventive: () => JSON.stringify([
    {
      servicio: 'Cambio correa de distribución',
      prioridad: 'URGENTE',
      km_actual: 87450,
      km_ultimo_servicio: 42000,
      km_intervalo_fabricante: 60000,
      delta_km: 45450,
      razon: 'Supera el 75% del intervalo recomendado. Riesgo de ruptura con daño catastrófico al motor.',
      costo_estimado: 185000,
    },
    {
      servicio: 'Revisión y cambio frenos delanteros',
      prioridad: 'URGENTE',
      km_actual: 87450,
      km_ultimo_servicio: null,
      km_intervalo_fabricante: 40000,
      delta_km: null,
      razon: 'Sin registro de cambio. Síntomas activos reportados por el cliente. Seguridad comprometida.',
      costo_estimado: 163500,
    },
    {
      servicio: 'Cambio líquido de frenos DOT4',
      prioridad: 'RECOMENDADO',
      km_actual: 87450,
      km_ultimo_servicio: null,
      km_intervalo_fabricante: 40000,
      delta_km: null,
      razon: 'Sin registro en sistema. Estándar: cada 2 años o 40.000 km. Puede estar absorbido y oxidado.',
      costo_estimado: 20000,
    },
    {
      servicio: 'Inspección suspensión delantera',
      prioridad: 'PROGRAMAR',
      km_actual: 87450,
      km_ultimo_servicio: null,
      km_intervalo_fabricante: 80000,
      delta_km: null,
      razon: 'Vehículo 2019 con 87.450 km. Revisión preventiva de amortiguadores y bujes a esta kilometraje.',
      costo_estimado: 20000,
    },
  ], null, 2),

  report: () => `INFORME DE ENTREGA — OT-2025-0341
Fecha: 25 de septiembre de 2025
Asesor: Carlos Mendoza · Técnico: Felipe Núñez

═══════════════════════════════════════════════

Estimado/a Andrés Ramírez:

Nos complace informarle que su vehículo Toyota Hilux 2019 (patente BCDF42) ha sido revisado y está listo para ser retirado. A continuación, detallamos los trabajos realizados en esta visita.

TRABAJOS EJECUTADOS

Se procedió al reemplazo completo del sistema de frenos delanteros, intervencion motivada por el desgaste avanzado de las pastillas de freno —que se encontraban por debajo del límite de seguridad— y la presencia de ranuras profundas en ambos discos. Adicionalmente, se realizó una purga completa del sistema hidráulico con reposición de líquido de frenos DOT4 nuevo, ya que el fluido presentaba contaminación y oxidación propias del paso del tiempo.

REPUESTOS INSTALADOS
  • Kit de pastillas de freno delanteras originales Toyota Hilux
  • Par de discos de freno delanteros nuevos (medida de fábrica)
  • Líquido de frenos DOT4 de alta temperatura (500 ml)

CONDICIÓN FINAL DEL VEHÍCULO

El vehículo fue sometido a una prueba de frenado en ruta con resultados satisfactorios. El pedal de freno responde con firmeza, sin pulsaciones ni ruidos anómalos. El sistema opera dentro de los parámetros normales especificados por el fabricante.

RECOMENDACIÓN PARA SU PRÓXIMO MANTENIMIENTO

Le sugerimos programar una revisión de la correa de distribución en su próxima visita, dado que el vehículo acumula 87.450 km sin registro de este cambio. El intervalo recomendado por Toyota para este motor es de 60.000 km, por lo que le recomendamos no postergarlo para evitar daños mayores al motor.

Km de ingreso: 87.450 · Km de salida: 87.450
Total facturado: $163.500 CLP

Gracias por confiar en TallerSmart.
Estaremos felices de atenderle en su próxima visita.`,
};

function ToolPanel({ id }: { id: ToolId }) {
  const meta = TOOL_META[id];
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasResult, setHasResult] = useState(false);

  const placeholders: Record<ToolId, string> = {
    intake: 'Ej: "El auto hace un ruido raro cuando freno en bajada, el pedal se siente diferente y a veces el volante vibra"',
    history: 'Seleccione vehículo: Toyota Hilux 2019 · BCDF42 · 87.450 km',
    preventive: 'Vehículo: Toyota Hilux 2019 · Km actual: 87.450 · Historial: 3 OTs registradas',
    report: 'Notas del mecánico: "Cambié pastillas y discos delanteros, también purgué el sistema de frenos. Todo quedó OK, pedal firme."',
  };

  const handleGenerate = () => {
    if (!input.trim() && id !== 'history' && id !== 'preventive') return;
    setLoading(true);
    setHasResult(false);
    setTimeout(() => {
      setOutput(MOCK_RESPONSES[id](input));
      setLoading(false);
      setHasResult(true);
    }, 1400 + Math.random() * 800);
  };

  const isJson = hasResult && (output.startsWith('{') || output.startsWith('['));

  return (
    <div className="ai-tool-panel" style={{
      background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0',
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: meta.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {id === 'intake' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={meta.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>}
          {id === 'history' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={meta.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>}
          {id === 'preventive' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={meta.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
          {id === 'report' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={meta.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A' }}>{meta.title}</div>
          <div style={{ fontSize: '0.73rem', color: '#64748B', marginTop: 2, lineHeight: 1.4 }}>{meta.subtitle}</div>
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', color: meta.color, background: meta.color + '15', padding: '2px 7px', borderRadius: 4, whiteSpace: 'nowrap', flexShrink: 0 }}>
          {meta.model}
        </div>
      </div>

      {/* Input */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #F8FAFC' }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={placeholders[id]}
          rows={3}
          style={{
            width: '100%', padding: '10px 12px', borderRadius: 7, border: '1px solid #E2E8F0',
            fontSize: '0.8rem', color: '#334155', resize: 'none', lineHeight: 1.6,
            background: '#F8FAFC', fontFamily: 'inherit',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
          <div style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
            Llamada estructurada con JSON Schema
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              background: loading ? '#94A3B8' : meta.color, color: '#fff',
              border: 'none', borderRadius: 7, padding: '7px 18px',
              fontWeight: 600, fontSize: '0.8rem', cursor: loading ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 7, transition: 'background 0.15s',
            }}
          >
            {loading ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Procesando…
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Generar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Output */}
      {hasResult && (
        <div style={{ padding: '14px 20px', flex: 1, overflow: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Respuesta del Modelo</span>
          </div>
          <pre style={{
            background: isJson ? '#0F172A' : '#F8FAFC',
            color: isJson ? '#E2E8F0' : '#334155',
            borderRadius: 7, padding: '14px 16px',
            fontSize: '0.72rem', fontFamily: "'DM Mono', monospace",
            lineHeight: 1.8, overflowX: 'auto', whiteSpace: 'pre-wrap',
            wordBreak: 'break-word', margin: 0,
            border: isJson ? 'none' : '1px solid #E2E8F0',
          }}>{output}</pre>
        </div>
      )}

      {!hasResult && !loading && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#CBD5E1', fontSize: '0.75rem', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          El resultado aparecerá aquí
        </div>
      )}
    </div>
  );
}

const SYSTEM_PROMPTS: Record<ToolId, string> = {
  intake: `Eres un asistente de diagnóstico automotriz. Recibes la descripción informal de un cliente sobre el problema de su vehículo. Extrae síntomas concretos, identifica el sistema afectado, determina la urgencia (BAJO/MEDIO/ALTO) y sugiere diagnósticos iniciales. Responde SIEMPRE en JSON válido con la estructura: { sintomas_extraidos, sistema_afectado, subsistema, nivel_urgencia, razon_urgencia, diagnosticos_recomendados, nota_mecanico }.`,
  history: `Eres un asistente técnico automotriz. Recibes el historial de mantenimiento de un vehículo. Genera un briefing conciso en 3 viñetas para el mecánico: (1) resumen de mantenimientos previos, (2) piezas cambiadas recientemente, (3) alertas preventivas según kilometraje y tiempo. No fabriques datos; trabaja solo con la información provista.`,
  preventive: `Eres un sistema de mantenimiento preventivo. Recibe el kilometraje actual, el historial de servicios y las reglas del fabricante. Devuelve un array JSON de recomendaciones con: { servicio, prioridad (URGENTE/RECOMENDADO/PROGRAMAR), km_actual, km_ultimo_servicio, km_intervalo_fabricante, delta_km, razon, costo_estimado }. Ordena por prioridad descendente.`,
  report: `Eres un redactor técnico para talleres automotrices. Recibes las notas breves del mecánico y los repuestos instalados. Transforma esto en un informe de entrega formal, claro y comprensible para el cliente final (no técnico). Incluye: trabajos realizados, repuestos instalados, condición final del vehículo y recomendaciones para el próximo mantenimiento. Tono: profesional y amigable.`,
};

export default function AIAssistant() {
  const [docTab, setDocTab] = useState<ToolId | 'prompts'>('prompts');
  const tools: ToolId[] = ['intake', 'history', 'preventive', 'report'];

  return (
    <div style={{ padding: '32px 36px', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #7C3AED, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10" /><path d="M22 2L12 12" /><path d="M17 2h5v5" />
            </svg>
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>Asistente IA</h1>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', background: '#F5F3FF', color: '#7C3AED', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
            4 HERRAMIENTAS ACTIVAS
          </span>
        </div>
        <p style={{ color: '#64748B', fontSize: '0.82rem', margin: 0, maxWidth: 700 }}>
          Módulos de IA para asistir la documentación del taller. El criterio técnico siempre permanece en manos del mecánico.
        </p>
      </div>

      {/* Warning banner */}
      <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '10px 16px', marginBottom: 24, display: 'flex', gap: 10, alignItems: 'center' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span style={{ fontSize: '0.78rem', color: '#92400E' }}>
          <strong>Importante:</strong> Las respuestas del modelo son sugerencias de apoyo. El diagnóstico definitivo y la validación técnica son responsabilidad exclusiva del mecánico.
        </span>
      </div>

      {/* Tool panels grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18, marginBottom: 28 }}>
        {tools.map(id => <ToolPanel key={id} id={id} />)}
      </div>

      {/* System prompts documentation */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', gap: 6, alignItems: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
          </svg>
          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A' }}>System Prompts</span>
          <span style={{ fontSize: '0.72rem', color: '#94A3B8', marginLeft: 4 }}>Instrucciones enviadas al modelo en cada llamada</span>
        </div>
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #F1F5F9', overflowX: 'auto' }}>
          {tools.map(id => (
            <button key={id} onClick={() => setDocTab(id)} style={{
              padding: '8px 18px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: '0.78rem', fontWeight: docTab === id ? 700 : 400,
              color: docTab === id ? TOOL_META[id].color : '#64748B',
              borderBottom: docTab === id ? `2px solid ${TOOL_META[id].color}` : '2px solid transparent',
              whiteSpace: 'nowrap',
            }}>
              {TOOL_META[id].title}
            </button>
          ))}
        </div>
        {tools.includes(docTab as ToolId) && (
          <div style={{ padding: '18px 20px' }}>
            <div style={{ marginBottom: 10, display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', background: TOOL_META[docTab as ToolId].color + '15', color: TOOL_META[docTab as ToolId].color, padding: '2px 8px', borderRadius: 4 }}>SYSTEM PROMPT</span>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Enviado como system message · Structured Output via JSON Schema</span>
            </div>
            <pre className="code-block">{SYSTEM_PROMPTS[docTab as ToolId]}</pre>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
