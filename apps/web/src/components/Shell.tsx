"use client"

import React, { useState } from "react"
import Link from "next/link"
import Sidebar from "@/components/Sidebar"
import TopBar from "@/components/TopBar"
import Reception from "@/components/Reception"
import CommandPalette from "@/components/CommandPalette"
import { useGlobal } from "@/lib/context"
import { usePathname, useRouter } from "next/navigation"
import { Icon } from "@/components/ui/Icon"

export default function Shell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false)
  const {
    orders,
    createOrder,
    clients,
    vehicles,
    apiError,
    role,
    user,
    authLoading,
    receptionOpen,
    setReceptionOpen,
    paletteOpen,
    setPaletteOpen,
  } = useGlobal()
  const router = useRouter()
  const pathname = usePathname()

  if (authLoading) return <div className="flex min-h-screen items-center justify-center text-sm text-fg-3">Validando sesión…</div>
  if (!user) return <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-sm text-fg-2"><p>{apiError ?? "Inicia sesión para continuar."}</p><button className="btn btn-primary" onClick={() => router.replace("/login")}>Ir a iniciar sesión</button></div>

  return (
    <div className="flex h-dvh overflow-hidden bg-canvas text-fg">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        {apiError && <div role="alert" className="border-b border-danger/30 bg-danger-50 px-4 py-1.5 text-center text-[11px] text-danger">API sin conexión o cambio rechazado: {apiError}</div>}
        <main className="flex-1 overflow-y-auto overflow-x-hidden animate-fade-in">
          {children}
        </main>
        {mobileMoreOpen && <button type="button" aria-label="Cerrar navegación adicional" className="fixed inset-0 z-30 cursor-default bg-black/35 md:hidden" onClick={() => setMobileMoreOpen(false)} />}
        {mobileMoreOpen && <div className="absolute bottom-[4.5rem] right-2 z-40 w-56 rounded-xl border border-line bg-surface p-2 shadow-e4 md:hidden">
          {[
            { href: "/ai", label: "Asistente SmartMec", icon: "spark" as const },
            { href: "/catalog", label: "Catálogo", icon: "catalog" as const },
            ...(role === "admin" ? [{ href: "/users", label: "Usuarios y permisos", icon: "user" as const }] : []),
          ].map((item) => <Link key={item.href} href={item.href} onClick={() => setMobileMoreOpen(false)} className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-fg-2 hover:bg-surface-2 hover:text-fg"><Icon name={item.icon} size={18} />{item.label}</Link>)}
        </div>}
        <nav aria-label="Navegación principal" className="grid grid-cols-4 border-t border-line bg-surface px-2 pb-[env(safe-area-inset-bottom)] pt-1 md:hidden">
          {[
            { href: "/", label: "Inicio", icon: "dashboard" as const },
            { href: "/work-orders", label: "Órdenes", icon: "board" as const },
            { href: "/clients", label: "Clientes", icon: "car" as const },
          ].map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[11px] font-medium transition-colors ${active ? "text-brand-500" : "text-fg-3 hover:text-fg"}`}>
                <Icon name={item.icon} size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
          <button onClick={() => setMobileMoreOpen((open) => !open)} aria-expanded={mobileMoreOpen} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[11px] font-medium transition-colors ${mobileMoreOpen || pathname.startsWith("/ai") || pathname.startsWith("/catalog") || pathname.startsWith("/users") ? "text-brand-500" : "text-fg-3 hover:text-fg"}`}>
            <Icon name="dots" size={20} />
            <span>Más</span>
          </button>
        </nav>
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
