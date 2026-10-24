"use client"

import { useCallback, useEffect, useState, type FormEvent } from "react"
import { api } from "@/lib/api-client"

type UserItem = { id: string; name: string; email: string; role: "ADMIN" | "ADVISOR" | "TECHNICIAN"; active: boolean }
const roleName: Record<UserItem["role"], string> = { ADMIN: "Administrador", ADVISOR: "Asesor", TECHNICIAN: "Técnico" }

export default function Users() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [currentId, setCurrentId] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const load = useCallback(async () => { try { const [list, session] = await Promise.all([api.users(), api.me()]); setUsers(list); setCurrentId(session.user.id); setError("") } catch { setError("No se pudo cargar la lista de usuarios.") } }, [])
  useEffect(() => { void load() }, [load])
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("")
    const form = new FormData(event.currentTarget)
    try { await api.createUser({ name: String(form.get("name")), email: String(form.get("email")), password: String(form.get("password")), role: String(form.get("role")) as UserItem["role"] }); setShowForm(false); await load() }
    catch (e) { setError(e instanceof Error ? e.message : "No se pudo crear el usuario.") }
    finally { setBusy(false) }
  }
  async function toggle(user: UserItem) {
    setError("")
    try { await api.updateUser(user.id, { active: !user.active }); await load() }
    catch (e) { setError(e instanceof Error ? e.message : "No se pudo actualizar el usuario.") }
  }
  return <section className="mx-auto max-w-5xl p-6 lg:p-8">
    <div className="mb-6 flex items-end justify-between gap-4"><div><p className="eyebrow">Acceso al sistema</p><h1 className="mt-1 text-2xl font-semibold text-fg">Usuarios y permisos</h1><p className="mt-1 text-sm text-fg-3">Cada integrante inicia sesión con su propio rol.</p></div><button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>Nuevo usuario</button></div>
    {error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {showForm && <form onSubmit={create} className="card mb-5 grid gap-3 p-4 md:grid-cols-2"><input className="field h-10" name="name" placeholder="Nombre" minLength={2} required /><input className="field h-10" name="email" type="email" placeholder="Correo" required /><input className="field h-10" name="password" type="password" minLength={12} autoComplete="new-password" placeholder="Contraseña (mínimo 12 caracteres)" required /><select className="field h-10" name="role"><option value="ADVISOR">Asesor</option><option value="TECHNICIAN">Técnico</option><option value="ADMIN">Administrador</option></select><div className="flex gap-2 md:col-span-2"><button className="btn btn-primary" disabled={busy}>{busy ? "Creando…" : "Crear usuario"}</button><button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button></div></form>}
    <div className="card divide-y divide-line">{users.map(user => <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="font-medium text-fg">{user.name}{user.id === currentId ? " (tú)" : ""}</p><p className="text-sm text-fg-3">{user.email} · {roleName[user.role]}</p></div><div className="flex items-center gap-3"><span className={"text-xs " + (user.active ? "text-emerald-700" : "text-fg-3")}>{user.active ? "Activo" : "Desactivado"}</span><button className="btn btn-secondary btn-sm" disabled={user.id === currentId} onClick={() => void toggle(user)}>{user.active ? "Desactivar" : "Activar"}</button></div></div>)}{!users.length && <p className="p-8 text-center text-sm text-fg-3">No hay usuarios.</p>}</div>
  </section>
}
