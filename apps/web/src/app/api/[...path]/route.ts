import { NextRequest } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

type Context = { params: Promise<{ path: string[] }> }

async function proxy(request: NextRequest, context: Context) {
  const origin = request.headers.get("origin")
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host")
  const protocol = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "")
  const appOrigin = host ? `${protocol}://${host}` : request.nextUrl.origin
  if (origin && origin !== appOrigin) return Response.json({ error: "ORIGIN_NOT_ALLOWED" }, { status: 403 })
  const { path } = await context.params
  const target = (process.env.API_PROXY_TARGET ?? "http://localhost:3001").replace(/\/$/, "")
  const search = request.nextUrl.search
  const headers = new Headers(request.headers)
  for (const name of ["host", "origin", "connection", "content-length", "accept-encoding"]) headers.delete(name)
  const hasBody = !["GET", "HEAD"].includes(request.method)
  const upstream = await fetch(`${target}/api/${path.map(encodeURIComponent).join("/")}${search}`, {
    method: request.method,
    headers,
    body: hasBody ? await request.arrayBuffer() : undefined,
    cache: "no-store",
    redirect: "manual",
  })
  const responseHeaders = new Headers(upstream.headers)
  for (const name of ["content-encoding", "content-length", "transfer-encoding", "connection"]) responseHeaders.delete(name)
  const getSetCookie = (upstream.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie
  if (getSetCookie) {
    responseHeaders.delete("set-cookie")
    for (const cookie of getSetCookie.call(upstream.headers)) responseHeaders.append("set-cookie", cookie)
  }
  return new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers: responseHeaders })
}

export const GET = proxy
export const POST = proxy
export const PUT = proxy
export const PATCH = proxy
export const DELETE = proxy
