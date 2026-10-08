import { useState, useEffect } from 'react';
import type { WorkOrder } from '../types';
import type { View } from '../App';
import { VIEW_LABELS } from '../App';
import { Icon } from './ui/Icon';
import { Plate, StatusBadge } from './ui/primitives';

export default function CommandPalette({
  open, onClose, orders, onNavigate, onOpenOrder,
}: {
  open: boolean; onClose: () => void; orders: WorkOrder[];
  onNavigate: (v: View) => void; onOpenOrder: (id: string) => void;
}) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) setQuery('');
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); /* handled by parent or just prevents default here if we add global listener */ }
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const results = query.length > 1
    ? orders.filter(o => o.number.toLowerCase().includes(query.toLowerCase()) || o.client.name.toLowerCase().includes(query.toLowerCase()) || o.vehicle.plate.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
    : [];

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-xl overflow-hidden rounded-xl bg-surface shadow-e4 animate-pop-in">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Icon name="search" size={18} className="text-fg-4" />
          <input
            autoFocus
            className="h-14 flex-1 bg-transparent text-[15px] text-fg outline-none placeholder:text-fg-4"
            placeholder="Buscar patente, cliente, OT, o saltar a..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <kbd className="kbd">ESC</kbd>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {query.length > 1 ? (
            results.length > 0 ? (
              <div className="flex flex-col gap-1">
                <div className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-fg-4">Órdenes de Trabajo</div>
                {results.map(ot => (
                  <button
                    key={ot.id}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-surface-2"
                    onClick={() => { onOpenOrder(ot.id); onClose(); }}
                  >
                    <div className="flex items-center gap-3">
                      <Plate value={ot.vehicle.plate} />
                      <div>
                        <div className="text-[13px] font-medium text-fg">{ot.client.name}</div>
                        <div className="text-[12px] text-fg-3">{ot.vehicle.make} {ot.vehicle.model}</div>
                      </div>
                    </div>
                    <StatusBadge status={ot.status} />
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-[13px] text-fg-3">No se encontraron resultados para "{query}"</div>
            )
          ) : (
            <div className="flex flex-col gap-1">
              <div className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-fg-4">Navegación Rápida</div>
              {(Object.entries(VIEW_LABELS) as [View, string][]).map(([v, label]) => (
                <button
                  key={v}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-fg-2 hover:bg-surface-2 hover:text-fg"
                  onClick={() => { onNavigate(v); onClose(); }}
                >
                  <Icon name={v === 'workorders' ? 'board' : v === 'dashboard' ? 'dashboard' : v === 'clients' ? 'car' : v === 'catalog' ? 'catalog' : v === 'ai' ? 'spark' : 'code'} size={16} />
                  Ir a {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
