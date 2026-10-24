"use client";

import { usePathname } from 'next/navigation';
import { useGlobal } from '@/lib/context';
import { Icon } from '@/components/ui/Icon';

const VIEW_LABELS: Record<string, string> = {
  '/': 'Dashboard',
  '/work-orders': 'Órdenes de Trabajo',
  '/clients': 'Clientes y Vehículos',
  '/catalog': 'Catálogo',
  '/ai': 'Asistente IA',
  '/architecture': 'Arquitectura',
};

export default function TopBar() {
  const pathname = usePathname();
  const { role, user, logout, setPaletteOpen, setReceptionOpen } = useGlobal();

  // Find the closest title match for the pathname (or default to dashboard)
  let title = VIEW_LABELS[pathname];
  if (!title) {
    if (pathname.startsWith('/work-orders')) title = 'Órdenes de Trabajo';
    else title = 'TallerSmart';
  }

  return (
    <header className="flex h-[56px] shrink-0 items-center justify-between bg-surface px-5 shadow-e0">
      <div className="flex items-center gap-4">
        <h1 className="text-[15px] font-semibold tracking-[-0.01em] text-fg">{title}</h1>
        <div className="h-4 w-px bg-line" />
        <button
          onClick={() => setPaletteOpen(true)}
          className="flex h-8 items-center gap-2 rounded-md bg-canvas px-2.5 text-[13px] text-fg-3 transition-colors hover:bg-line"
        >
          <Icon name="search" size={16} />
          <span>Buscar por patente, OT o cliente...</span>
          <span className="kbd ml-2">?K</span>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-[12px] font-medium text-fg">{user?.name}</div>
          <div className="text-[10px] text-fg-3">{user?.email}</div>
        </div>
        <button onClick={() => void logout()} className="btn btn-secondary btn-sm">Cerrar sesión</button>

        {role !== 'technician' && (
          <button onClick={() => setReceptionOpen(true)} className="btn btn-primary ml-2 h-8">
            <Icon name="plus" size={16} />
            Nueva Recepción
          </button>
        )}
      </div>
    </header>
  );
}
