import type { View } from '../App';
import type { UserRole } from '../types';
import { Icon, type IconName } from './ui/Icon';
import { Avatar } from './ui/primitives';

interface SidebarProps {
  activeView: View;
  onViewChange: (v: View) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  role: UserRole;
  onRoleChange: (r: UserRole) => void;
  persona: { name: string; label: string };
  activeCount: number;
}

const NAV_GROUPS: { label: string; items: { id: View; label: string; icon: IconName }[] }[] = [
  {
    label: 'Operación',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
      { id: 'workorders', label: 'Órdenes de Trabajo', icon: 'board' },
      { id: 'clients', label: 'Clientes y Vehículos', icon: 'car' },
    ],
  },
  {
    label: 'Inteligencia',
    items: [{ id: 'ai', label: 'Asistente IA', icon: 'spark' }],
  },
  {
    label: 'Gestión',
    items: [
      { id: 'catalog', label: 'Catálogo', icon: 'catalog' },
      { id: 'architecture', label: 'Arquitectura', icon: 'code' },
    ],
  },
];

const ROLES: { id: UserRole; label: string }[] = [
  { id: 'admin', label: 'Admin' },
  { id: 'advisor', label: 'Asesor' },
  { id: 'technician', label: 'Técnico' },
];

function Logo() {
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
      style={{ background: 'linear-gradient(145deg, #F06A3A, #C94A1F)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 12px -4px rgba(229,90,43,0.6)' }}
    >
      {/* Monogram: T built from a slotted bar + piston stem */}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 6.5h5M14 6.5h5" />
        <path d="M12 6.5v12" />
        <circle cx="12" cy="6.5" r="1.4" fill="#fff" stroke="none" />
        <path d="M9.5 18.5h5" strokeWidth="2" />
      </svg>
    </div>
  );
}

export default function Sidebar({
  activeView, onViewChange, collapsed, onToggleCollapse, role, onRoleChange, persona, activeCount,
}: SidebarProps) {
  return (
    <aside
      className="relative z-10 flex h-screen shrink-0 flex-col bg-ink-900"
      style={{
        width: collapsed ? 72 : 232,
        transition: 'width 220ms cubic-bezier(0.2,0,0,1)',
        boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.06)',
      }}
    >
      {/* Brand */}
      <div className={`flex h-14 items-center gap-3 ${collapsed ? 'justify-center' : 'px-5'}`} style={{ boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.06)' }}>
        <Logo />
        {!collapsed && (
          <div className="min-w-0 animate-fade-in">
            <div className="text-[15px] font-semibold leading-none tracking-[-0.01em] text-[#F8FAFC]">TallerSmart</div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#64748B]">Workshop OS · Beta</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-5">
            {collapsed ? (
              <div className="mx-auto mb-2 h-px w-6 bg-white/10" />
            ) : (
              <div className="mb-2 px-3 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[#475569]">{group.label}</div>
            )}
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    title={collapsed ? item.label : undefined}
                    aria-current={active ? 'page' : undefined}
                    className={`group relative flex h-9 items-center gap-3 rounded-md text-[13.5px] transition-colors duration-150 ${
                      collapsed ? 'justify-center' : 'px-3'
                    } ${active ? 'bg-white/[0.07] text-[#F8FAFC]' : 'text-[#94A3B8] hover:bg-white/[0.04] hover:text-[#E2E8F0]'}`}
                    style={active ? { boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)' } : undefined}
                  >
                    <Icon name={item.icon} size={20} duotone={active} style={{ color: active && item.id === 'ai' ? '#C4B5FD' : undefined }} />
                    {!collapsed && <span className={`flex-1 text-left ${active ? 'font-medium' : ''}`}>{item.label}</span>}
                    {!collapsed && item.id === 'workorders' && (
                      <span className="font-mono text-[11px] text-[#64748B] tnum">{activeCount}</span>
                    )}
                    {active && (
                      <span
                        className={`absolute h-1.5 w-1.5 rounded-full bg-brand-500 ${collapsed ? 'right-1.5 top-1.5' : 'right-2'}`}
                        style={{ boxShadow: '0 0 8px rgba(229,90,43,0.8)', display: !collapsed && item.id === 'workorders' ? 'none' : undefined }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer: role switcher + user */}
      <div className="p-3" style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)' }}>
        {!collapsed && (
          <div className="mb-3 animate-fade-in">
            <div className="mb-1.5 px-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#475569]">Vista por rol</div>
            <div className="flex gap-0.5 rounded-md bg-white/[0.04] p-[3px]">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => onRoleChange(r.id)}
                  aria-pressed={role === r.id}
                  className={`h-7 flex-1 rounded-sm text-[12px] font-medium transition-colors duration-150 ${
                    role === r.id ? 'bg-white/[0.10] text-white' : 'text-[#64748B] hover:text-[#CBD5E1]'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className={`flex items-center gap-2.5 ${collapsed ? 'flex-col' : ''}`}>
          <Avatar name={persona.name} size={30} />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium text-[#E2E8F0]">{persona.name}</div>
              <div className="truncate font-mono text-[10.5px] text-[#64748B]">{persona.label}</div>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            title={collapsed ? 'Expandir' : 'Colapsar'}
            className="flex h-7 w-7 items-center justify-center rounded-sm text-[#64748B] transition-colors hover:bg-white/[0.06] hover:text-[#E2E8F0]"
          >
            <Icon name="sidebar" size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
