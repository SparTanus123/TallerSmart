"use client"
// Keep the seeded demonstration data if browser storage is unavailable.
// The current demo remains usable for this session if storage is full or blocked.

import React, { createContext, useContext, useState, useEffect } from "react"
import { workOrders as initialOrders } from "@/data/mockData"
import type { UserRole, WorkOrder } from "@/types"
import { PERSONAS } from "@/lib/constants"

interface GlobalState {
  role: UserRole
  setRole: (role: UserRole) => void
  orders: WorkOrder[]
  setOrders: React.Dispatch<React.SetStateAction<WorkOrder[]>>
  receptionOpen: boolean
  setReceptionOpen: (open: boolean) => void
  paletteOpen: boolean
  setPaletteOpen: (open: boolean) => void
  persona: { name: string; label: string; techId?: string }
}

const GlobalContext = createContext<GlobalState | null>(null)

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>("admin")
  const [orders, setOrders] = useState<WorkOrder[]>(initialOrders)
  const [ordersLoaded, setOrdersLoaded] = useState(false)
  const [receptionOpen, setReceptionOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("tallersmart:work-orders:v1")
      if (saved) {
        const parsed: unknown = JSON.parse(saved)
        if (Array.isArray(parsed)) setOrders(parsed as WorkOrder[])
      }
    } catch {
    } finally {
      setOrdersLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!ordersLoaded) return
    try {
      window.localStorage.setItem(
        "tallersmart:work-orders:v1",
        JSON.stringify(orders),
      )
    } catch {}
  }, [orders, ordersLoaded])

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
  )
}

export function useGlobal() {
  const ctx = useContext(GlobalContext)
  if (!ctx) throw new Error("useGlobal must be used within GlobalProvider")
  return ctx
}
