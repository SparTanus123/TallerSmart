"use client";

import { useState, useEffect, useRef } from "react";
import { useGlobal } from "@/lib/context";
import { api } from "@/lib/api-client";
import { Icon } from "@/components/ui/Icon";
import { SmartMecLogo } from "@/components/ai/SmartMecLogo";

type TabId = "chat" | "intake" | "preventive" | "report";

interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
  model?: string;
}

interface IntakeResult {
  sintomas_extraidos: string[];
  sistema_afectado: string;
  subsistema: string;
  nivel_urgencia: "BAJO" | "MEDIO" | "ALTO";
  razon_urgencia: string;
  diagnosticos_recomendados: string[];
  nota_mecanico: string;
}

interface PreventiveItem {
  servicio: string;
  prioridad: "URGENTE" | "RECOMENDADO" | "PROGRAMAR";
  km_actual: number;
  km_intervalo_fabricante: number;
  razon: string;
  criticidad: string;
}

export default function AIAssistant() {
  const { orders, vehicles, user } = useGlobal();
  const [activeTab, setActiveTab] = useState<TabId>("chat");

  // Status check state
  const [health, setHealth] = useState<{
    ok: boolean;
    model: string;
    latencyMs: number;
    error?: string;
  } | null>(null);
  const [checkingHealth, setCheckingHealth] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "model",
      content: `¡Hola ${user?.name ? user.name.split(" ")[0] : "taller"}! Soy **SmartMec**, el copiloto técnico inteligente de TallerSmart.

Estoy conectado con la API de Gemini para asistirte en tiempo real con:
• **Diagnóstico mecánico y códigos OBD-II** (DTCs, síntomas, posibles causas).
• **Triaje y clasificación de fallas** en la recepción del cliente.
• **Planes preventivos** según kilometraje y modelo del vehículo.
• **Redacción de informes claros de entrega** para clientes.

¿En qué vehículo u orden de trabajo estamos trabajando hoy?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      model: "SmartMec / gemini-3-flash-preview",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [selectedChatOrder, setSelectedChatOrder] = useState<string>("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Intake tool state
  const [intakeComplaint, setIntakeComplaint] = useState("");
  const [intakeVehicle, setIntakeVehicle] = useState("");
  const [intakeMileage, setIntakeMileage] = useState<string>("");
  const [intakeSelectedOrder, setIntakeSelectedOrder] = useState<string>("");
  const [intakeLoading, setIntakeLoading] = useState(false);
  const [intakeResult, setIntakeResult] = useState<IntakeResult | null>(null);
  const [intakeError, setIntakeError] = useState<string | null>(null);

  // Preventive tool state
  const [prevVehicleId, setPrevVehicleId] = useState<string>("");
  const [prevMake, setPrevMake] = useState("Toyota");
  const [prevModel, setPrevModel] = useState("Hilux");
  const [prevYear, setPrevYear] = useState<number>(2019);
  const [prevMileage, setPrevMileage] = useState<number>(87450);
  const [prevLoading, setPrevLoading] = useState(false);
  const [prevResults, setPrevResults] = useState<PreventiveItem[] | null>(null);
  const [prevError, setPrevError] = useState<string | null>(null);

  // Report tool state
  const [reportOrderId, setReportOrderId] = useState<string>("");
  const [reportClient, setReportClient] = useState("");
  const [reportVehicle, setReportVehicle] = useState("");
  const [reportDiagnosis, setReportDiagnosis] = useState("");
  const [reportNotes, setReportNotes] = useState("");
  const [reportParts, setReportParts] = useState("");
  const [reportTone, setReportTone] = useState<"cliente" | "tecnico">("cliente");
  const [reportLoading, setReportLoading] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  // Check health on load
  const verifyConnection = async () => {
    setCheckingHealth(true);
    try {
      const res = await api.aiStatus();
      setHealth(res.gemini);
    } catch {
      setHealth({ ok: false, model: "gemini-3-flash-preview", latencyMs: 0, error: "No se pudo contactar al servidor" });
    } finally {
      setCheckingHealth(false);
    }
  };

  useEffect(() => {
    verifyConnection();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

  // Handle chat submission
  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = chatInput.trim();
    if (!text || chatLoading) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setChatInput("");
    setChatLoading(true);

    try {
      // Send last 6 messages for context
      const payloadMessages = newHistory.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.aiChat({
        messages: payloadMessages,
        workOrderId: selectedChatOrder || undefined,
      });

      const modelMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: "model",
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        model: res.model,
      };
      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Error al conectar con SmartMec";
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: "model",
          content: `⚠️ Hubo un problema al procesar la respuesta: ${errMsg}. Por favor reintenta en un momento.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          model: "Error",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Populate intake from selected order
  const handleIntakeOrderChange = (orderId: string) => {
    setIntakeSelectedOrder(orderId);
    if (!orderId) return;
    const ot = orders.find((o) => o.id === orderId);
    if (ot) {
      setIntakeComplaint(ot.complaint);
      setIntakeVehicle(`${ot.vehicle.make} ${ot.vehicle.model} (${ot.vehicle.year}) · ${ot.vehicle.plate}`);
      setIntakeMileage(String(ot.mileageIn));
    }
  };

  // Run intake analysis
  const handleRunIntake = async () => {
    if (!intakeComplaint.trim() || intakeLoading) return;
    setIntakeLoading(true);
    setIntakeResult(null);
    setIntakeError(null);

    try {
      const res = await api.aiIntake({
        complaint: intakeComplaint,
        vehicleInfo: intakeVehicle || undefined,
        mileage: intakeMileage ? parseInt(intakeMileage, 10) : undefined,
        workOrderId: intakeSelectedOrder || undefined,
      });

      if (res.success && res.data) {
        setIntakeResult(res.data);
      } else {
        setIntakeError("Respuesta no estructurada recibida del modelo.");
      }
    } catch (err: unknown) {
      setIntakeError(err instanceof Error ? err.message : "Error en el triaje de ingreso.");
    } finally {
      setIntakeLoading(false);
    }
  };

  // Populate preventive from vehicle
  const handlePrevVehicleChange = (vehId: string) => {
    setPrevVehicleId(vehId);
    if (!vehId) return;
    const v = vehicles.find((item) => item.id === vehId);
    if (v) {
      setPrevMake(v.make);
      setPrevModel(v.model);
      setPrevYear(v.year);
      setPrevMileage(v.mileage);
    }
  };

  // Run preventive analysis
  const handleRunPreventive = async () => {
    setPrevLoading(true);
    setPrevResults(null);
    setPrevError(null);

    try {
      const res = await api.aiPreventive({
        vehicleId: prevVehicleId || undefined,
        make: prevMake,
        model: prevModel,
        year: Number(prevYear),
        mileage: Number(prevMileage),
      });

      if (res.success && res.data && Array.isArray(res.data)) {
        setPrevResults(res.data);
      } else {
        setPrevError("No se pudieron extraer recomendaciones estructuradas.");
      }
    } catch (err: unknown) {
      setPrevError(err instanceof Error ? err.message : "Error al calcular mantenimiento preventivo.");
    } finally {
      setPrevLoading(false);
    }
  };

  // Populate report from order
  const handleReportOrderChange = (orderId: string) => {
    setReportOrderId(orderId);
    if (!orderId) return;
    const ot = orders.find((o) => o.id === orderId);
    if (ot) {
      setReportClient(ot.client.name);
      setReportVehicle(`${ot.vehicle.make} ${ot.vehicle.model} (${ot.vehicle.year}) · Placa: ${ot.vehicle.plate}`);
      setReportDiagnosis(ot.diagnosis || ot.complaint);
      setReportNotes(ot.notes || "Reemplazo de piezas y prueba de ruta satisfactoria.");
      const parts = ot.items.map((i) => `${i.name} (x${i.quantity})`).join(", ");
      setReportParts(parts || "Mano de obra y fluidos nuevos");
    }
  };

  // Run report generation
  const handleGenerateReport = async () => {
    setReportLoading(true);
    setGeneratedReport("");
    setReportError(null);

    try {
      const res = await api.aiDeliveryReport({
        workOrderId: reportOrderId || undefined,
        clientName: reportClient,
        vehicleInfo: reportVehicle,
        diagnosis: reportDiagnosis,
        notes: reportNotes,
        itemsInstalled: reportParts ? reportParts.split(",").map((s) => s.trim()) : [],
        tone: reportTone,
      });

      if (res.success && res.report) {
        setGeneratedReport(res.report);
      } else {
        setReportError("Error al generar el informe.");
      }
    } catch (err: unknown) {
      setReportError(err instanceof Error ? err.message : "No se pudo generar el informe.");
    } finally {
      setReportLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedReport) return;
    navigator.clipboard.writeText(generatedReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="mx-auto max-w-[1340px] p-6 lg:p-8 animate-fade-in">
      {/* SmartMec Hero Header */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-line bg-gradient-to-r from-surface via-surface to-surface-2 p-6 text-fg shadow-e2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <SmartMecLogo size={62} glow className="ring-2 ring-cyan-500/40" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight text-fg">
                Smart<span className="text-auto-blue">Mec</span>
              </h1>
              <span className="rounded-full bg-brand-50 px-3 py-0.5 font-mono text-[11px] font-semibold text-fg ring-1 ring-brand-500/30">
                AGENTE EXPERTO AUTOMOTRIZ
              </span>
              <span className="rounded-full bg-ok-50 px-2.5 py-0.5 font-mono text-[11px] font-medium text-ok ring-1 ring-ok/30">
                GEMINI AI ACTIVO
              </span>
            </div>
            <p className="mt-1 text-[13px] text-fg-2">
              Copiloto único de TallerSmart conectado a Google Gemini. Triaje de ingreso, cálculo preventivo, informes y asistencia técnica de taller.
            </p>
          </div>
        </div>

        {/* Health status pill */}
        <div className="flex shrink-0 items-center gap-3 rounded-xl border border-line bg-surface p-3 shadow-e1">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block h-3 w-3 rounded-full ${
                health?.ok ? "bg-emerald-400 shadow-[0_0_8px_#34D399]" : health ? "bg-amber-400" : "bg-neutral-500"
              }`}
            />
            <div className="text-left">
              <div className="font-mono text-[11px] font-medium text-fg">
                {health?.ok ? "CONEXIÓN ESTABLE" : health ? "VERIFICANDO" : "CONECTANDO..."}
              </div>
              <div className="font-mono text-[10px] text-fg-3">
                {health?.model ?? "gemini-3-flash-preview"} {health?.latencyMs ? `· ${health.latencyMs}ms` : ""}
              </div>
            </div>
          </div>
          <button
            onClick={verifyConnection}
            disabled={checkingHealth}
            title="Verificar conexión con Gemini"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2 text-fg-2 transition-colors hover:bg-line hover:text-fg disabled:opacity-50"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={checkingHealth ? "animate-spin" : ""}
            >
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6 flex overflow-x-auto border-b border-line bg-canvas">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex items-center gap-2.5 px-5 py-3.5 text-[14px] font-semibold transition-all border-b-2 whitespace-nowrap ${
            activeTab === "chat"
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-fg-2 hover:text-fg hover:border-line-strong"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Chat Interactivo con SmartMec
        </button>

        <button
          onClick={() => setActiveTab("intake")}
          className={`flex items-center gap-2.5 px-5 py-3.5 text-[14px] font-semibold transition-all border-b-2 whitespace-nowrap ${
            activeTab === "intake"
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-fg-2 hover:text-fg hover:border-line-strong"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4l3 3" />
          </svg>
          Clasificación y Triaje de Entrada
        </button>

        <button
          onClick={() => setActiveTab("preventive")}
          className={`flex items-center gap-2.5 px-5 py-3.5 text-[14px] font-semibold transition-all border-b-2 whitespace-nowrap ${
            activeTab === "preventive"
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-fg-2 hover:text-fg hover:border-line-strong"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          Mantenimiento Preventivo IA
        </button>

        <button
          onClick={() => setActiveTab("report")}
          className={`flex items-center gap-2.5 px-5 py-3.5 text-[14px] font-semibold transition-all border-b-2 whitespace-nowrap ${
            activeTab === "report"
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-fg-2 hover:text-fg hover:border-line-strong"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          Redactor de Informes de Entrega
        </button>
      </div>

      {/* TAB 1: CHAT WITH SMARTMEC */}
      {activeTab === "chat" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Main Chat Box */}
          <div className="flex h-[660px] flex-col rounded-2xl border border-line bg-surface shadow-e1 lg:col-span-3">
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5 bg-canvas/40">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <SmartMecLogo size={36} glow />
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>
                <div>
                  <div className="text-[14px] font-bold text-fg">Sesión con SmartMec</div>
                  <div className="text-[12px] text-fg-3">
                    Asistente en vivo · Respuestas potenciadas por Gemini 3
                  </div>
                </div>
              </div>

              {/* Order Context Selector */}
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-medium text-fg-3 hidden sm:inline">Vincular OT:</span>
                <select
                  value={selectedChatOrder}
                  onChange={(e) => setSelectedChatOrder(e.target.value)}
                  className="field max-w-[220px] py-1 text-[12px]"
                >
                  <option value="">Ninguna (Consulta general)</option>
                  {orders.map((ot) => (
                    <option key={ot.id} value={ot.id}>
                      {ot.number} · {ot.vehicle.make} ({ot.vehicle.plate})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "model" && (
                    <SmartMecLogo size={32} className="shrink-0" />
                  )}

                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed shadow-sm ${
                      msg.role === "user"
                        ? "bg-brand-500 text-[#17212b] rounded-br-none"
                        : "bg-canvas border border-line text-fg rounded-bl-none"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    <div
                      className="mt-1.5 flex items-center justify-between text-[11px] text-fg-3"
                    >
                      <span>{msg.timestamp}</span>
                      {msg.model && msg.role === "model" && (
                        <span className="font-mono text-[10px] ml-3 text-fg-3 opacity-75">{msg.model}</span>
                      )}
                    </div>
                  </div>

                  {msg.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-800 text-white text-[12px] font-bold shadow-sm">
                      {user?.name ? user.name[0].toUpperCase() : "U"}
                    </div>
                  )}
                </div>
              ))}

              {chatLoading && (
                <div className="flex gap-3 justify-start animate-fade-in">
                  <SmartMecLogo size={32} glow className="shrink-0 animate-pulse" />
                  <div className="rounded-2xl rounded-bl-none border border-line bg-canvas px-4 py-3 text-[14px] text-fg-2 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-brand-600 animate-bounce" />
                      <div className="h-2 w-2 rounded-full bg-brand-600 animate-bounce [animation-delay:0.2s]" />
                      <div className="h-2 w-2 rounded-full bg-brand-600 animate-bounce [animation-delay:0.4s]" />
                      <span className="ml-1 text-[13px] text-fg-3">SmartMec está analizando...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendChat} className="border-t border-line p-3 bg-canvas/60">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Pregúntale a SmartMec (ej: '¿Cómo diagnosticar código P0171 en Toyota Hilux?', 'Par de apriete culata...')"
                  disabled={chatLoading}
                  className="field flex-1 py-2.5 text-[14px]"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || chatLoading}
                  className="btn btn-primary px-5 py-2.5 flex items-center gap-2 shrink-0"
                >
                  <span>Enviar</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </form>
          </div>

          {/* Quick Shortcuts & Context Info */}
          <div className="flex flex-col gap-4 lg:col-span-1">
            <div className="card p-4">
              <div className="eyebrow mb-2">Preguntas Sugeridas</div>
              <div className="flex flex-col gap-2">
                {[
                  "¿Qué significa el código OBD-II P0300 y cómo diagnosticarlo?",
                  "¿Cuáles son las causas de un pedal de freno esponjoso?",
                  "Intervalo de cambio de correa vs cadena en Toyota Hilux",
                  "Procedimiento de purga de frenos con ABS",
                  "Síntomas de falla en bomba de gasolina vs inyectores sucios",
                ].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setChatInput(prompt);
                    }}
                    className="rounded-lg border border-line bg-canvas p-2.5 text-left text-[12px] text-fg-2 transition-all hover:border-brand-300 hover:bg-brand-50/50 hover:text-brand-900"
                  >
                    💡 {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div className="card p-4 bg-gradient-to-br from-indigo-50/40 to-transparent border-indigo-100">
              <div className="text-[13px] font-semibold text-indigo-950 mb-1">Capacidad de Contexto</div>
              <p className="text-[12px] text-indigo-900/80 leading-relaxed">
                Si seleccionas una Orden de Trabajo activa en el menú superior, SmartMec conocerá la placa, kilometraje, queja del cliente y repuestos instalados para asesorarte directamente en el caso.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTAKE CLASSIFICATION & TRIAGE */}
      {activeTab === "intake" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Form Left */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[16px] font-bold text-fg">Triaje y Clasificación de Ingreso</h2>
                <p className="text-[13px] text-fg-3">
                  SmartMec extrae síntomas técnicos, identifica el subsistema y determina la urgencia para el recepcionista.
                </p>
              </div>
              <span className="rounded bg-indigo-50 px-2 py-1 font-mono text-[11px] font-semibold text-indigo-600">
                JSON ESTRUCTURADO
              </span>
            </div>

            {/* Quick load from real workshop order */}
            <div className="mb-4 rounded-xl border border-line bg-canvas/60 p-3">
              <label className="text-[12px] font-semibold text-fg-2 block mb-1">
                Cargar datos de una Orden de Trabajo existente:
              </label>
              <select
                value={intakeSelectedOrder}
                onChange={(e) => handleIntakeOrderChange(e.target.value)}
                className="field text-[13px]"
              >
                <option value="">Selecciona una OT para autocompletar...</option>
                {orders.map((ot) => (
                  <option key={ot.id} value={ot.id}>
                    {ot.number} · {ot.vehicle.make} {ot.vehicle.model} ({ot.vehicle.plate})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[13px] font-semibold text-fg block mb-1">
                  Relato o queja del cliente *
                </label>
                <textarea
                  value={intakeComplaint}
                  onChange={(e) => setIntakeComplaint(e.target.value)}
                  placeholder='Ej: "El cliente indica que al frenar en bajada el volante vibra violentamente y se escucha un chillido metálico agudo en la rueda delantera izquierda."'
                  rows={4}
                  className="field text-[13px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-semibold text-fg block mb-1">
                    Vehículo (opcional)
                  </label>
                  <input
                    type="text"
                    value={intakeVehicle}
                    onChange={(e) => setIntakeVehicle(e.target.value)}
                    placeholder="Toyota Hilux 2019"
                    className="field text-[13px]"
                  />
                </div>
                <div>
                  <label className="text-[13px] font-semibold text-fg block mb-1">
                    Kilometraje (opcional)
                  </label>
                  <input
                    type="number"
                    value={intakeMileage}
                    onChange={(e) => setIntakeMileage(e.target.value)}
                    placeholder="87450"
                    className="field text-[13px]"
                  />
                </div>
              </div>

              <button
                onClick={handleRunIntake}
                disabled={!intakeComplaint.trim() || intakeLoading}
                className="btn btn-primary w-full py-2.5 flex items-center justify-center gap-2"
              >
                {intakeLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>SmartMec está analizando síntomas...</span>
                  </>
                ) : (
                  <>
                    <Icon name="spark" size={16} duotone />
                    <span>Clasificar con SmartMec (Gemini)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Right */}
          <div className="card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-line pb-3">
                <div className="text-[15px] font-bold text-fg">Diagnóstico Estructurado</div>
                {intakeResult && (
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
                      intakeResult.nivel_urgencia === "ALTO"
                        ? "bg-rose-100 text-rose-700 ring-1 ring-rose-300"
                        : intakeResult.nivel_urgencia === "MEDIO"
                        ? "bg-amber-100 text-amber-700 ring-1 ring-amber-300"
                        : "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300"
                    }`}
                  >
                    URGENCIA {intakeResult.nivel_urgencia}
                  </span>
                )}
              </div>

              {intakeError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-[13px] text-rose-700 mb-4">
                  ⚠️ {intakeError}
                </div>
              )}

              {intakeResult ? (
                <div className="space-y-4 animate-fade-in text-[13px]">
                  {/* System & Subsystem */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-canvas p-3 border border-line">
                      <div className="text-[11px] font-medium text-fg-3 uppercase">Sistema Afectado</div>
                      <div className="font-bold text-fg text-[14px] mt-0.5">
                        {intakeResult.sistema_afectado}
                      </div>
                    </div>
                    <div className="rounded-lg bg-canvas p-3 border border-line">
                      <div className="text-[11px] font-medium text-fg-3 uppercase">Subsistema</div>
                      <div className="font-bold text-fg text-[14px] mt-0.5">
                        {intakeResult.subsistema}
                      </div>
                    </div>
                  </div>

                  {/* Reason for urgency */}
                  <div className="rounded-lg bg-amber-50/60 border border-amber-200/60 p-3">
                    <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">
                      Criterio de Urgencia
                    </div>
                    <p className="text-amber-900 mt-1">{intakeResult.razon_urgencia}</p>
                  </div>

                  {/* Extracted Symptoms */}
                  <div>
                    <div className="text-[12px] font-bold text-fg-2 uppercase tracking-wide mb-1.5">
                      Síntomas Identificados
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {intakeResult.sintomas_extraidos.map((s, idx) => (
                        <span
                          key={idx}
                          className="rounded-md bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-[12px] font-medium text-indigo-800"
                        >
                          • {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Diagnostics */}
                  <div>
                    <div className="text-[12px] font-bold text-fg-2 uppercase tracking-wide mb-1.5">
                      Pruebas de Taller Recomendadas
                    </div>
                    <ul className="space-y-1.5 rounded-lg border border-line bg-canvas p-3">
                      {intakeResult.diagnosticos_recomendados.map((d, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-fg">
                          <span className="text-brand-600 font-bold">✓</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tech note */}
                  <div className="rounded-lg bg-neutral-900 text-neutral-100 p-3 font-mono text-[12px]">
                    <div className="text-[10px] text-neutral-400 uppercase font-semibold mb-1">
                      Nota de Taller para Mecánico
                    </div>
                    {intakeResult.nota_mecanico}
                  </div>
                </div>
              ) : !intakeLoading ? (
                <div className="flex h-64 flex-col items-center justify-center text-center text-fg-3">
                  <div className="mb-3">
                    <SmartMecLogo size={48} glow />
                  </div>
                  <p className="text-[14px] font-medium text-fg">Ingresa la queja o selecciona una OT para clasificar</p>
                  <p className="text-[12px] text-fg-3 mt-1 max-w-sm">
                    SmartMec procesará el relato y generará el informe técnico estructurado mediante Gemini.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PREVENTIVE MAINTENANCE IA */}
      {activeTab === "preventive" && (
        <div className="space-y-6">
          {/* Top Controls */}
          <div className="card p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-[16px] font-bold text-fg">Plan de Mantenimiento Preventivo Inteligente</h2>
                <p className="text-[13px] text-fg-3">
                  SmartMec calcula los intervalos de fábrica y alerta sobre piezas críticas según kilometraje y desgaste estimado.
                </p>
              </div>

              {/* Pick Vehicle from Fleet */}
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-medium text-fg-3 shrink-0">Seleccionar Vehículo:</span>
                <select
                  value={prevVehicleId}
                  onChange={(e) => handlePrevVehicleChange(e.target.value)}
                  className="field py-1.5 text-[13px] max-w-[260px]"
                >
                  <option value="">Ingreso manual...</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plate} · {v.make} {v.model} ({v.mileage.toLocaleString()} km)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="text-[12px] font-semibold text-fg block mb-1">Marca</label>
                <input
                  type="text"
                  value={prevMake}
                  onChange={(e) => setPrevMake(e.target.value)}
                  className="field text-[13px]"
                />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-fg block mb-1">Modelo</label>
                <input
                  type="text"
                  value={prevModel}
                  onChange={(e) => setPrevModel(e.target.value)}
                  className="field text-[13px]"
                />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-fg block mb-1">Año</label>
                <input
                  type="number"
                  value={prevYear}
                  onChange={(e) => setPrevYear(Number(e.target.value))}
                  className="field text-[13px]"
                />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-fg block mb-1">Kilometraje Actual</label>
                <input
                  type="number"
                  value={prevMileage}
                  onChange={(e) => setPrevMileage(Number(e.target.value))}
                  className="field text-[13px]"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleRunPreventive}
                  disabled={prevLoading}
                  className="btn btn-primary w-full py-2 flex items-center justify-center gap-2"
                >
                  {prevLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Calculando...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="spark" size={15} duotone />
                      <span>Calcular Plan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          {prevError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-[13px] text-rose-700">
              ⚠️ {prevError}
            </div>
          )}

          {prevResults && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
              {prevResults.map((item, idx) => {
                const isUrgent = item.prioridad === "URGENTE";
                const isRec = item.prioridad === "RECOMENDADO";
                return (
                  <div
                    key={idx}
                    className={`card p-5 flex flex-col justify-between border-t-4 ${
                      isUrgent
                        ? "border-t-rose-500 bg-rose-50/15"
                        : isRec
                        ? "border-t-amber-500 bg-amber-50/10"
                        : "border-t-blue-500 bg-blue-50/10"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            isUrgent
                              ? "bg-rose-100 text-rose-800"
                              : isRec
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {item.prioridad}
                        </span>
                        <span className="font-mono text-[11px] text-fg-3">
                          Int: {item.km_intervalo_fabricante?.toLocaleString()} km
                        </span>
                      </div>

                      <h3 className="text-[15px] font-bold text-fg mb-1.5">{item.servicio}</h3>
                      <p className="text-[13px] text-fg-2 leading-relaxed mb-3">{item.razon}</p>
                    </div>

                    <div className="border-t border-line pt-2 text-[11px] text-fg-3 flex items-center justify-between">
                      <span>Criticidad: <strong>{item.criticidad}</strong></span>
                      <span className="font-mono">Km actual: {prevMileage.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!prevResults && !prevLoading && (
            <div className="rounded-2xl border border-dashed border-line-strong bg-canvas p-12 text-center text-fg-3">
              <div className="mx-auto mb-3 flex items-center justify-center">
                <SmartMecLogo size={52} glow />
              </div>
              <div className="font-display text-[16px] font-bold text-fg">Calcula el plan preventivo con SmartMec</div>
              <div className="text-[13px] text-fg-3 mt-1">
                Selecciona cualquier vehículo del taller o ingresa kilometraje para ver el cronograma por IA.
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: DELIVERY REPORT GENERATOR */}
      {activeTab === "report" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Controls Left */}
          <div className="card p-6 space-y-4">
            <div>
              <h2 className="text-[16px] font-bold text-fg">Redactor de Informe de Entrega</h2>
              <p className="text-[13px] text-fg-3">
                SmartMec convierte notas breves de los técnicos en informes formales, comprensibles y transparentes para el cliente.
              </p>
            </div>

            {/* Quick load from work order */}
            <div className="rounded-xl border border-line bg-canvas/60 p-3">
              <label className="text-[12px] font-semibold text-fg-2 block mb-1">
                Autocompletar desde Orden de Trabajo:
              </label>
              <select
                value={reportOrderId}
                onChange={(e) => handleReportOrderChange(e.target.value)}
                className="field text-[13px]"
              >
                <option value="">Seleccionar orden...</option>
                {orders.map((ot) => (
                  <option key={ot.id} value={ot.id}>
                    {ot.number} · {ot.client.name} ({ot.vehicle.make} {ot.vehicle.plate})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-semibold text-fg block mb-1">Nombre del Cliente</label>
                <input
                  type="text"
                  value={reportClient}
                  onChange={(e) => setReportClient(e.target.value)}
                  placeholder="Carlos Mendoza"
                  className="field text-[13px]"
                />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-fg block mb-1">Vehículo y Placa</label>
                <input
                  type="text"
                  value={reportVehicle}
                  onChange={(e) => setReportVehicle(e.target.value)}
                  placeholder="Toyota Hilux 2019 · BCDF42"
                  className="field text-[13px]"
                />
              </div>
            </div>

            <div>
              <label className="text-[12px] font-semibold text-fg block mb-1">Diagnóstico Inicial</label>
              <input
                type="text"
                value={reportDiagnosis}
                onChange={(e) => setReportDiagnosis(e.target.value)}
                placeholder="Desgaste severo en pastillas y discos delanteros"
                className="field text-[13px]"
              />
            </div>

            <div>
              <label className="text-[12px] font-semibold text-fg block mb-1">Trabajos realizados y notas</label>
              <textarea
                value={reportNotes}
                onChange={(e) => setReportNotes(e.target.value)}
                placeholder="Se instalaron discos y pastillas nuevas. Purga de líquido DOT4 completada. Prueba de ruta impecable."
                rows={3}
                className="field text-[13px]"
              />
            </div>

            <div>
              <label className="text-[12px] font-semibold text-fg block mb-1">Repuestos instalados (separados por coma)</label>
              <input
                type="text"
                value={reportParts}
                onChange={(e) => setReportParts(e.target.value)}
                placeholder="Juego de pastillas cerámicas, Discos delanteros ventilados, Líquido de frenos DOT4"
                className="field text-[13px]"
              />
            </div>

            <div className="flex items-center gap-4 pt-1">
              <span className="text-[13px] font-semibold text-fg">Tono de redacción:</span>
              <label className="flex items-center gap-1.5 text-[13px] text-fg cursor-pointer">
                <input
                  type="radio"
                  name="tone"
                  checked={reportTone === "cliente"}
                  onChange={() => setReportTone("cliente")}
                />
                <span>Para el Cliente (Claro y amigable)</span>
              </label>
              <label className="flex items-center gap-1.5 text-[13px] text-fg cursor-pointer">
                <input
                  type="radio"
                  name="tone"
                  checked={reportTone === "tecnico"}
                  onChange={() => setReportTone("tecnico")}
                />
                <span>Técnico (Exhaustivo para archivo)</span>
              </label>
            </div>

            <button
              onClick={handleGenerateReport}
              disabled={reportLoading}
              className="btn btn-primary w-full py-2.5 flex items-center justify-center gap-2 mt-2"
            >
              {reportLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>SmartMec está redactando el informe...</span>
                </>
              ) : (
                <>
                  <Icon name="spark" size={16} duotone />
                  <span>Redactar Informe con SmartMec</span>
                </>
              )}
            </button>
          </div>

          {/* Report Preview Right */}
          <div className="card p-6 flex flex-col justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4 border-b border-line pb-3">
                <div className="text-[15px] font-bold text-fg">Borrador del Informe</div>
                {generatedReport && (
                  <button
                    onClick={copyToClipboard}
                    className="btn btn-secondary btn-sm flex items-center gap-1.5 text-[12px]"
                  >
                    {copied ? (
                      <>
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        <span>Copiar informe</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {reportError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-[13px] text-rose-700 mb-4">
                  ⚠️ {reportError}
                </div>
              )}

              {generatedReport ? (
                <div className="rounded-xl border border-line bg-canvas p-5 text-[13.5px] leading-relaxed text-fg whitespace-pre-wrap font-sans max-h-[500px] overflow-y-auto animate-fade-in shadow-inner">
                  {generatedReport}
                </div>
              ) : !reportLoading ? (
                <div className="flex h-64 flex-col items-center justify-center text-center text-fg-3">
                  <div className="mb-3">
                    <SmartMecLogo size={48} glow />
                  </div>
                  <p className="font-display text-[15px] font-bold text-fg">Completa los campos o selecciona una orden</p>
                  <p className="text-[12px] text-fg-3 mt-1 max-w-sm">
                    SmartMec estructurará un informe de entrega listo para entregar o enviar por WhatsApp/correo al cliente.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
