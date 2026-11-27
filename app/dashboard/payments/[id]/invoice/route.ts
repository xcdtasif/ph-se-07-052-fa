import { cookies } from "next/headers"
import type { NextRequest } from "next/server"

import { env } from "@/config/env"
import { authHeaders } from "@/lib/api"
import { getClientIp } from "@/lib/client-ip"

/*
Downloads a completed payment's invoice PDF. The token is in an httpOnly cookie the browser
can't send to the backend, so this asks for the PDF and passes it on, filename and all. A failure
passes on the backend's status and message as text
*/
export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/dashboard/payments/[id]/invoice">,
) {
  const { id } = await ctx.params
  const accessToken = (await cookies()).get("accessToken")?.value

  if (!accessToken) {
    return new Response("Authentication required", { status: 401 })
  }

  let res: Response

  try {
    res = await fetch(`${env.API_URL}/payments/${encodeURIComponent(id)}/invoice`, {
      headers: authHeaders(accessToken, await getClientIp()),
    })
  } catch (error) {
    console.error(`Backend unreachable: GET ${env.API_URL}/payments/${id}/invoice`, error)

    return new Response("Service unavailable, try again later", { status: 503 })
  }

  if (!res.ok) {
    const json: unknown = await res.json().catch(() => null)
    const message =
      typeof json === "object" &&
      json !== null &&
      "message" in json &&
      typeof json.message === "string"
        ? json.message
        : "Couldn't download the invoice"

    return new Response(message, { status: res.status })
  }

  return new Response(res.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": res.headers.get("Content-Disposition") ?? "attachment",
      "Cache-Control": "private, no-store",
    },
  })
}
