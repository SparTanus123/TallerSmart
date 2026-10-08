import { Icon } from './ui/Icon';
import type { UserRole } from '../types';

interface TopBarProps {
  title: string;
  onSearch: () => void;
  onNewReception: () => void;
  role: UserRole;
}

export default function TopBar({ title, onSearch, onNewReception, role }: TopBarProps) {
  return (
    <header className="flex h-[56px] shrink-0 items-center justify-between bg-surface px-5 shadow-e0">
      <div className="flex items-center gap-4">
        <h1 className="text-[15px] font-semibold tracking-[-0.01em] text-fg">{title}</h1>
        <div className="h-4 w-px bg-line" />
        <button
          onClick={onSearch}
          className="flex h-8 items-center gap-2 rounded-md bg-canvas px-2.5 text-[13px] text-fg-3 transition-colors hover:bg-line"
        >
          <Icon name="search" size={16} />
          <span>Buscar por patente, OT o cliente...</span>
          <span className="kbd ml-2">⌘K</span>
        </button>
      </div>

      <div className="flex items-center gap-3">
        {/* Mock AI Status */}
        <div className="flex items-center gap-2 px-2" title="Motor IA en línea">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75 animate-breathe" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
          </span>
          <span className="font-mono text-[11px] text-fg-3">IA LISTA</span>
        </div>

        <button className="flex h-8 w-8 items-center justify-center rounded-md text-fg-3 transition-colors hover:bg-canvas hover:text-fg">
          <Icon name="bell" size={20} />
        </button>

        {role !== 'technician' && (
          <button onClick={onNewReception} className="btn btn-primary ml-2 h-8">
            <Icon name="plus" size={16} />
            Nueva Recepción
          </button>
        )}
      </div>
    </header>
  );
}
