import { useCallback, useState } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './components/Dashboard';
import WorkOrders from './components/WorkOrders';
import Clients from './components/Clients';
import Catalog from './components/Catalog';
import AIAssistant from './components/AIAssistant';
import Architecture from './components/Architecture';
import Reception from './components/Reception';
import CommandPalette from './components/CommandPalette';
import { ToastProvider } from './components/ui/primitives';
import { workOrders as initialOrders } from './data/mockData';
import type { UserRole, WorkOrder } from './types';

export type View = 'dashboard' | 'workorders' | 'clients' | 'catalog' | 'ai' | 'architecture';

export const VIEW_LABELS: Record<View, string> = {
  dashboard: 'Dashboard',
  workorders: 'Órdenes de Trabajo',
  clients: 'Clientes y Vehículos',
  catalog: 'Catálogo',
  ai: 'Asistente IA',
  architecture: 'Arquitectura',
};

/** Demo personas — switching role changes dashboard & density. */
export const PERSONAS: Record<UserRole, { name: string; label: string; techId?: string }> = {
  admin: { name: 'Carlos Mendoza', label: 'Administrador' },
  advisor: { name: 'Camila Rojas', label: 'Asesora de recepción' },
  technician: { name: 'Felipe Núñez', label: 'Técnico · Frenos', techId: 't2' },
};

export default function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState<UserRole>('admin');
  const [orders, setOrders] = useState<WorkOrder[]>(initialOrders);
  const [openOtId, setOpenOtId] = useState<string | null>(null);
  const [receptionOpen, setReceptionOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const openOrder = useCallback((id: string) => {
    setActiveView('workorders');
    setOpenOtId(id);
  }, []);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard orders={orders} role={role} persona={PERSONAS[role]} onOpenOrder={openOrder} onNewReception={() => setReceptionOpen(true)} onOrdersChange={setOrders} />;
      case 'workorders':
        return <WorkOrders orders={orders} onOrdersChange={setOrders} openOtId={openOtId} onOpenOtChange={setOpenOtId} role={role} />;
      case 'clients':      return <Clients />;
      case 'catalog':      return <Catalog />;
      case 'ai':           return <AIAssistant />;
      case 'architecture': return <Architecture />;
    }
  };

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-canvas">
        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
          role={role}
          onRoleChange={setRole}
          persona={PERSONAS[role]}
          activeCount={orders.filter((o) => o.status !== 'delivered' && o.status !== 'completed').length}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar
            title={VIEW_LABELS[activeView]}
            onSearch={() => setPaletteOpen(true)}
            onNewReception={() => setReceptionOpen(true)}
            role={role}
          />
          <main key={activeView} className="flex-1 overflow-y-auto overflow-x-hidden animate-fade-in">
            {renderView()}
          </main>
        </div>
      </div>

      <Reception
        open={receptionOpen}
        onClose={() => setReceptionOpen(false)}
        onCreate={(ot) => {
          setOrders((s) => [ot, ...s]);
          setReceptionOpen(false);
        }}
        nextNumber={orders.length + 336}
      />
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        orders={orders}
        onNavigate={(v) => setActiveView(v)}
        onOpenOrder={openOrder}
      />
    </ToastProvider>
  );
}
