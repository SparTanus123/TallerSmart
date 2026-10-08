"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { workOrders as initialOrders } from '@/data/mockData';
import type { UserRole, WorkOrder } from '@/types';
import { PERSONAS } from '@/lib/constants';

interface GlobalState {
  role: UserRole;
  setRole: (role: UserRole) => void;
  orders: WorkOrder[];
  setOrders: React.Dispatch<React.SetStateAction<WorkOrder[]>>;
  receptionOpen: boolean;
  setReceptionOpen: (open: boolean) => void;
  paletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;
  persona: { name: string; label: string; techId?: string };
}

const GlobalContext = createContext<GlobalState | null>(null);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>('admin');
  const [orders, setOrders] = useState<WorkOrder[]>(initialOrders);
  const [receptionOpen, setReceptionOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <GlobalContext.Provider
      value={{
        role,
        setRole,
        orders,
        setOrders,
        receptionOpen,
        setReceptionOpen,
        paletteOpen,
        setPaletteOpen,
        persona: PERSONAS[role],
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobal() {
  const ctx = useContext(GlobalContext);
  if (!ctx) throw new Error('useGlobal must be used within GlobalProvider');
  return ctx;
}
