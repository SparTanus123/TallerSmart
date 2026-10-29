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
  const { role, setPaletteOpen, setReceptionOpen } = useGlobal();

  // Find the closest title match for the pathname (or default to dashboard)
  let title = VIEW_LABELS[pathname];
  if (!title) {
    if (pathname.startsWith('/work-orders')) title = 'Órdenes de Trabajo';
    else title = 'TallerSmart';
  }

  return (
    <header className="flex h-[56px] shrink-0 items-center justify-between gap-2 bg-surface px-3 shadow-e0 sm:px-5">
      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        <h1 className="truncate text-[14px] font-semibold tracking-[-0.01em] text-fg sm:text-[15px]">{title}</h1>
        <div className="hidden h-4 w-px bg-line sm:block" />
        <button
          onClick={() => setPaletteOpen(true)}
          aria-label="Buscar por placa, orden de trabajo o cliente"
          className="flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-md text-fg-3 transition-colors hover:bg-surface-2 hover:text-fg sm:h-8 sm:w-auto sm:justify-start sm:bg-canvas sm:px-2.5 sm:text-[13px]"
        >
          <Icon name="search" size={16} />
          <span className="hidden md:inline">Buscar por placa, OT o cliente...</span>
          <span className="kbd ml-2 hidden lg:inline">?K</span>
        </button>
      </div>

      <div className="flex items-center gap-3">
        {role !== 'technician' && (
          <button onClick={() => setReceptionOpen(true)} aria-label="Registrar nueva recepción" className="btn btn-primary flex h-10 w-10 shrink-0 justify-center p-0 sm:h-8 sm:w-auto sm:justify-start sm:px-3">
            <Icon name="plus" size={16} />
            <span className="hidden sm:inline">Nueva Recepción</span>
          </button>
        )}
      </div>
    </header>
  );
}
