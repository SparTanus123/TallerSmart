import { useState, useEffect } from 'react';
import type { WorkOrder } from '../types';
import { classifySymptoms, predictMaintenance, NOW, type SymptomMatch, type Prediction, suggestTechnician, money, km } from '../lib/workshop';
import { vehicles, clients } from '../data/mockData';
import { AILabel, ConfidenceMeter, Drawer, Plate } from './ui/primitives';
import { Icon } from './ui/Icon';

export default function Reception({
  open, onClose, onCreate, nextNumber,
}: {
  open: boolean; onClose: () => void; onCreate: (ot: WorkOrder) => void; nextNumber: number;
}) {
  // Mock selecting the first client/vehicle
  const vehicle = vehicles[0];
  const client = clients[0];

  const [complaint, setComplaint] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [symptoms, setSymptoms] = useState<SymptomMatch[]>([]);
  const [predictions] = useState<Prediction[]>(() => predictMaintenance(vehicle, []));
  
  // AI Debounce scanner
  useEffect(() => {
    if (!complaint || complaint.length < 10) {
      setSymptoms([]);
      setIsScanning(false);
      return;
    }
    setIsScanning(true);
    const t = setTimeout(() => {
      setSymptoms(classifySymptoms(complaint));
      setIsScanning(false);
    }, 600); // 600ms debounce
    return () => clearTimeout(t);
  }, [complaint]);

  const recommendedTech = suggestTechnician(symptoms);

  const handleSave = () => {
    const newOT: WorkOrder = {
      id: `ot-${Date.now()}`,
      number: `OT-2025-${String(nextNumber).padStart(4, '0')}`,
      status: 'received',
      urgency: symptoms.some(s => s.code === 'FRN') ? 'high' : 'medium',
      vehicle,
      client,
      technicianId: recommendedTech?.id ?? 't1',
      technicianName: recommendedTech?.name ?? 'Rodrigo Vargas',
      complaint,
      items: [],
      total: 0,
      createdAt: NOW.toISOString(),
      updatedAt: NOW.toISOString(),
      estimatedDelivery: '2025-09-26',
      mileageIn: vehicle.mileage,
      notes: '',
    };
    onCreate(newOT);
  };

  return (
    <Drawer open={open} onClose={onClose} width={720}>
      <div className="flex shrink-0 items-center justify-between border-b border-line px-6 py-4">
        <h2 className="text-[16px] font-semibold text-fg">Nueva Recepción</h2>
        <button onClick={onClose} className="text-fg-4 hover:text-fg"><Icon name="x" size={20} /></button>
      </div>

      <div className="flex-1 overflow-y-auto bg-canvas p-6 flex flex-col gap-6">
        {/* Client & Vehicle Context */}
        <div className="card p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Plate value={vehicle.plate} size="lg" />
            <div>
              <div className="font-semibold text-[15px]">{vehicle.make} {vehicle.model} <span className="font-normal text-fg-3">{vehicle.year}</span></div>
              <div className="text-[13px] text-fg-2">{client.name} · {km(vehicle.mileage)}</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm">Cambiar</button>
        </div>

        {/* AI Symptom Scanner */}
        <div className="flex flex-col gap-2">
          <div className="eyebrow flex items-center justify-between">
            <span>Motivo de Ingreso</span>
            {isScanning && <span className="text-brand-500 flex items-center gap-1"><Icon name="spark" size={12} duotone /> Analizando...</span>}
          </div>
          
          <div className="relative overflow-hidden rounded-xl bg-surface shadow-e1 focus-within:shadow-[0_0_0_2px_#E55A2B]">
            <textarea
              className="w-full resize-none border-none bg-transparent p-4 text-[14px] leading-relaxed text-fg focus:outline-none min-h-[100px]"
              placeholder="Describe lo que reporta el cliente. Ej: Cuando freno en la mañana hace un ruido metálico..."
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
            />
            {isScanning && <div className="scan-line" />}
          </div>

          {/* Extracted Symptoms */}
          {symptoms.length > 0 && (
            <div className="ai-surface mt-2 p-4 animate-rise-in">
              <div className="flex items-center justify-between mb-3">
                <AILabel>Síntomas Detectados</AILabel>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {symptoms.map(s => (
                  <div key={s.code} className="rounded-lg bg-surface p-3 shadow-e1 border-l-2 border-brand-500">
                    <div className="flex items-start justify-between mb-1">
                      <div className="font-mono text-[11px] font-medium text-fg-3">{s.code} · {s.system}</div>
                      <ConfidenceMeter value={s.confidence} showLabel={false} />
                    </div>
                    <div className="text-[13px] font-medium text-fg">{s.symptom}</div>
                  </div>
                ))}
              </div>
              {recommendedTech && (
                <div className="mt-4 pt-3 border-t border-line/50 flex items-center gap-2 text-[12px] text-fg-2">
                  <Icon name="user" size={14} /> Sugerencia de asignación: <span className="font-medium text-fg">{recommendedTech.name}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Predictive Maintenance Ruler */}
        <div className="flex flex-col gap-2">
          <div className="eyebrow">Mantenimiento Predictivo</div>
          <div className="card p-5">
            {/* Ruler visualization */}
            <div className="mb-8 relative pt-2">
              <div className="absolute left-0 right-0 top-3.5 h-1 bg-line rounded-full" />
              <div className="absolute top-2 left-0 h-4 w-[2px] bg-fg" />
              <div className="absolute top-8 left-0 font-mono text-[11px] text-fg font-bold">{km(vehicle.mileage)} (Hoy)</div>
              
              {predictions.map((p, i) => {
                const percent = Math.min(100, Math.max(10, ((p.atKm - vehicle.mileage) / 30000) * 100));
                return (
                  <div key={p.id} className="absolute top-2" style={{ left: `${percent}%` }}>
                    <div className="h-4 w-[2px] bg-brand-500" />
                    <div className="absolute top-6 -translate-x-1/2 whitespace-nowrap text-center">
                      <div className="font-mono text-[10px] text-brand-600">{km(p.atKm)}</div>
                      <div className="text-[11px] text-fg-3 mt-0.5">{p.title.split(' ')[0]}...</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Prediction Cards */}
            <div className="flex flex-col gap-3 mt-12">
              {predictions.map(p => (
                <div key={p.id} className="rounded-lg border border-line p-3 flex gap-4">
                  <div className="pt-0.5"><Icon name="alert" size={16} className="text-brand-500" /></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium text-[13px]">{p.title}</div>
                      <div className="font-mono text-[12px] text-fg-3">{money(p.costMin)} – {money(p.costMax)}</div>
                    </div>
                    <div className="text-[12px] text-fg-2 mb-2 line-clamp-1">{p.reasons[0]}</div>
                    <div className="flex gap-2">
                      <button className="btn btn-secondary btn-sm text-[11px] h-7">Cotizar</button>
                      <button className="btn btn-ghost btn-sm text-[11px] h-7">Descartar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <div className="flex shrink-0 items-center justify-end gap-3 border-t border-line bg-surface p-4">
        <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" onClick={handleSave}>Crear Orden (OT-{String(nextNumber).padStart(4,'0')})</button>
      </div>
    </Drawer>
  );
}
