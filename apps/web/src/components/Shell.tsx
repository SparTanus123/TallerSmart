"use client";

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import Reception from '@/components/Reception';
import CommandPalette from '@/components/CommandPalette';
import { useGlobal } from '@/lib/context';
import { useRouter } from 'next/navigation';

export default function Shell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { orders, setOrders, receptionOpen, setReceptionOpen, paletteOpen, setPaletteOpen } = useGlobal();
  const router = useRouter();

  return (
    <div className="flex h-screen overflow-hidden bg-canvas text-fg">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden animate-fade-in">
          {children}
        </main>
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
        onNavigate={(v) => router.push(v === 'dashboard' ? '/' : `/${v}`)}
        onOpenOrder={(id) => router.push(`/work-orders/${id}`)}
      />
    </div>
  );
}
