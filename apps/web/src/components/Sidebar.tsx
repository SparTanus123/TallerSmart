"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGlobal } from '@/lib/context';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Avatar } from '@/components/ui/primitives';
import { SmartMecLogo } from '@/components/ai/SmartMecLogo';

const NAV_GROUPS: { label: string; items: { href: string; label: string; icon: IconName }[] }[] = [
  {
    label: 'Operación',
    items: [
      { href: '/', label: 'Dashboard', icon: 'dashboard' },
      { href: '/work-orders', label: 'Órdenes de Trabajo', icon: 'board' },
      { href: '/clients', label: 'Clientes y Vehículos', icon: 'car' },
    ],
  },
  {
    label: 'Inteligencia',
    items: [{ href: '/ai', label: 'Asistente IA', icon: 'spark' }],
  },
  {
    label: 'Gestión',
    items: [
      { href: '/catalog', label: 'Catálogo', icon: 'catalog' },
      { href: '/users', label: 'Usuarios y permisos', icon: 'user' },
    ],
  },
];

function Logo({ collapsed }: { collapsed?: boolean }) {
  if (collapsed) {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#14283a] shadow-sm ring-1 ring-[#176b9b]/20">
        <Image
          src="/tallersmart-icon-sidebar.png"
          alt="TallerSmart Logo"
          width={36}
          height={36}
          className="h-8 w-8 object-contain"
          priority
        />
      </div>
    );
  }
  return (
    <div className="flex items-center min-w-0">
      <Image
        src="/tallersmart-logo.png"
        alt="TallerSmart Logo"
        width={160}
        height={42}
        className="h-8 w-auto max-w-[170px] object-contain"
        priority
      />
    </div>
  );
}

export default function Sidebar({
  collapsed,
  onToggleCollapse,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const pathname = usePathname();
  const { persona, orders, role, user, logout } = useGlobal();
  const activeCount = orders.filter((o) => o.status !== 'delivered' && o.status !== 'completed').length;

  // State for user profile popover & logout confirmation
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close on outside click or Escape key
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
        setConfirmingLogout(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setConfirmingLogout(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  const userName = user?.name || persona.name;
  const userEmail = user?.email || 'admin@tallersmart.local';

  return (
    <aside
      className="relative z-10 hidden h-screen shrink-0 flex-col border-r border-line bg-surface md:flex"
      style={{
        width: collapsed ? 72 : 232,
        transition: 'width 220ms cubic-bezier(0.2,0,0,1)',
        boxShadow: 'inset -1px 0 0 rgba(23,33,43,0.04)',
      }}
    >
      <div className={`flex h-14 items-center ${collapsed ? 'justify-center' : 'px-5'}`} style={{ boxShadow: 'inset 0 -1px 0 rgba(23,33,43,0.08)' }}>
        <Logo collapsed={collapsed} />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-5">
            {collapsed ? (
              <div className="mx-auto mb-2 h-px w-6 bg-line" />
            ) : (
              <div className="mb-2 px-3 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-fg-3">{group.label}</div>
            )}
            <div className="flex flex-col gap-0.5">
              {group.items.filter(item => item.href !== '/users' || role === 'admin').map((item) => {
                const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    aria-current={active ? 'page' : undefined}
                    className={`group relative flex h-9 items-center gap-3 rounded-md text-[13.5px] transition-colors duration-150 ${
                      collapsed ? 'justify-center' : 'px-3'
                    } ${active ? 'bg-brand-50 text-fg' : 'text-fg-2 hover:bg-surface-2 hover:text-fg'}`}
                    style={active ? { boxShadow: 'inset 0 0 0 1px rgba(23,33,43,0.05)' } : undefined}
                  >
                    {item.href === '/ai' ? (
                      <SmartMecLogo size={20} className="rounded-md border border-auto-blue/30" />
                    ) : (
                      <Icon name={item.icon} size={20} duotone={active} />
                    )}
                    {!collapsed && <span className={`flex-1 text-left ${active ? 'font-medium' : ''}`}>{item.label}</span>}
                    {!collapsed && item.href === '/work-orders' && (
                      <span className="font-mono text-[11px] text-fg-3 tnum">{activeCount}</span>
                    )}
                    {active && (
                      <span
                        className={`absolute h-1.5 w-1.5 rounded-full bg-brand-500 ${collapsed ? 'right-1.5 top-1.5' : 'right-2'}`}
                        style={{ boxShadow: '0 0 0 3px rgba(243,199,68,0.18)', display: !collapsed && item.href === '/work-orders' ? 'none' : undefined }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Section at bottom (Image 1 & Image 2) */}
      <div className="relative p-3" style={{ boxShadow: 'inset 0 1px 0 rgba(23,33,43,0.08)' }}>
        {/* Popover / Dropdown Menu */}
        {menuOpen && (
          <div
            ref={popoverRef}
            className={`absolute z-50 rounded-xl border border-line bg-surface p-4 text-fg shadow-e4 animate-pop-in ${
              collapsed
                ? 'bottom-2 left-[78px] w-[270px]'
                : 'bottom-[64px] left-3 right-3'
            }`}
            style={{
              boxShadow: '0 12px 30px -4px rgba(23, 33, 43, 0.16), 0 0 0 1px rgba(23, 33, 43, 0.06)',
            }}
          >
            {/* Header matching Image 2 */}
            <div className="flex items-start justify-between gap-3 border-b border-line pb-3">
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14px] font-bold text-fg">
                  {userName}
                </div>
                <div className="truncate text-[12px] text-fg-3 mt-0.5 font-sans">
                  {userEmail}
                </div>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="font-mono text-[10.5px] font-semibold uppercase text-fg-2">
                    {persona.label}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  setConfirmingLogout(false);
                }}
                className="flex h-6 w-6 items-center justify-center rounded-md text-fg-3 hover:bg-canvas hover:text-fg transition-colors"
                title="Cerrar ventana"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Logout Choice Section */}
            <div className="pt-3">
              {!confirmingLogout ? (
                <div className="space-y-2.5">
                  <div className="text-[12px] text-fg-2">
                    ¿Deseas cerrar tu sesión en TallerSmart?
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setConfirmingLogout(true)}
                      className="btn btn-secondary btn-sm flex-1 text-danger hover:border-danger hover:bg-danger-50 transition-colors"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Cerrar sesión
                    </button>
                    <button
                      onClick={() => setMenuOpen(false)}
                      className="btn btn-ghost btn-sm text-[12px]"
                    >
                      Permanecer
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 animate-fade-in">
                  <div className="text-[12px] font-semibold text-fg text-center">
                    ¿Confirmas que deseas salir?
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setConfirmingLogout(false)}
                      className="btn btn-secondary btn-sm text-[12px]"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => void logout()}
                      className="btn btn-sm bg-danger text-white hover:bg-red-700 font-semibold"
                    >
                      Sí, salir
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Trigger row: Avatar + Name/Role + Sidebar Toggle */}
        <div className={`flex items-center gap-1.5 ${collapsed ? 'flex-col' : ''}`}>
          <button
            ref={triggerRef}
            onClick={() => {
              setMenuOpen((prev) => !prev);
              setConfirmingLogout(false);
            }}
            title="Administración Taller · Clic para opciones de cuenta y cierre de sesión"
            className={`group flex flex-1 items-center gap-2.5 rounded-lg p-1.5 transition-all text-left ${
              menuOpen
                ? 'bg-surface-2 ring-1 ring-line'
                : 'hover:bg-surface-2'
            } ${collapsed ? 'justify-center w-full' : 'min-w-0'}`}
          >
            <Avatar name={userName} size={30} />
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium text-fg group-hover:text-fg transition-colors">
                  {userName}
                </div>
                <div className="truncate font-mono text-[10.5px] text-fg-3">
                  {persona.label}
                </div>
              </div>
            )}
          </button>

          <button
            onClick={onToggleCollapse}
            title={collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-fg-3 transition-colors hover:bg-surface-2 hover:text-fg"
          >
            <Icon name="sidebar" size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
