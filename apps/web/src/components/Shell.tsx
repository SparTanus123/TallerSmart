"use client"

import React, { useState } from "react"
import Sidebar from "@/components/Sidebar"
import TopBar from "@/components/TopBar"
import Reception from "@/components/Reception"
import CommandPalette from "@/components/CommandPalette"
import { useGlobal } from "@/lib/context"
import { useRouter } from "next/navigation"

export default function Shell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const {
    orders,
    createOrder,
    clients,
    vehicles,
    apiError,
    user,
    authLoading,
    receptionOpen,
    setReceptionOpen,
    paletteOpen,
    setPaletteOpen,
  } = useGlobal()
  const router = useRouter()

  if (authLoading) return <div className="flex min-h-screen items-center justify-center text-sm text-fg-3">Validando sesión…</div>
  if (!user) return <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-sm text-fg-2"><p>{apiError ?? "Inicia sesión para continuar."}</p><button className="btn btn-primary" onClick={() => router.replace("/login")}>Ir a iniciar sesión</button></div>

  return (
    <div className="flex h-screen overflow-hidden bg-canvas text-fg">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        {apiError && <div role="alert" className="border-b border-red-200 bg-red-50 px-4 py-1.5 text-center text-[11px] text-red-900">API sin conexión o cambio rechazado: {apiError}</div>}
        <main className="flex-1 overflow-y-auto overflow-x-hidden animate-fade-in">
          {children}
        </main>
      </div>

      <Reception
        open={receptionOpen}
        onClose={() => setReceptionOpen(false)}
        clients={clients}
        vehicles={vehicles}
        onCreate={async (input) => { await createOrder(input); setReceptionOpen(false) }}
        nextNumber={orders.length + 336}
      />
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        orders={orders}
        onNavigate={(v) =>
          router.push(
            v === "dashboard"
              ? "/"
              : v === "workorders"
                ? "/work-orders"
                : `/${v}`,
          )
        }
        onOpenOrder={(id) => router.push(`/work-orders/${id}`)}
      />
    </div>
  )
}
