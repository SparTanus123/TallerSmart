"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api-client"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("admin@tallersmart.local")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError("")
    try { await api.login({ email, password }); router.replace("/"); router.refresh() }
    catch (e) { setError(e instanceof Error && e.message === "INVALID_CREDENTIALS" ? "Correo o contraseña incorrectos." : "No se pudo conectar con la API.") }
    finally { setBusy(false) }
  }

  return <main className="flex min-h-screen items-center justify-center bg-canvas px-4">
    <form onSubmit={handleSubmit} className="card w-full max-w-md p-8 shadow-e1">
      <div className="mb-7"><p className="eyebrow">TallerSmart</p><h1 className="mt-2 text-2xl font-semibold text-fg">Iniciar sesión</h1><p className="mt-2 text-sm text-fg-3">Ingresa con tu cuenta del taller.</p></div>
      <label className="mb-4 block text-sm font-medium text-fg-2">Correo<input className="field mt-1 h-10 w-full" type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required /></label>
      <label className="mb-5 block text-sm font-medium text-fg-2">Contraseña<input className="field mt-1 h-10 w-full" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} minLength={8} required /></label>
      {error && <p role="alert" className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <button className="btn btn-primary h-10 w-full justify-center" disabled={busy}>{busy ? "Validando…" : "Entrar"}</button>
    </form>
  </main>
}
