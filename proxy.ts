import { NextResponse, type NextRequest } from "next/server"

import { apiFetch } from "@/lib/api"
import { AUTH_COOKIE_NAMES, toAuthCookies, tokenExpiry, type AuthCookie } from "@/lib/auth-cookies"
import { safeRedirectPath } from "@/lib/redirect"
import type { Session, User } from "@/lib/types"

/*
Keeps the session going, sends logged-in users away from the login and signup pages and logged-out
ones from the dashboard to log in. It reads the access token's expiry without verifying it (the
secret stays on the backend), so it only decides when to refresh and where to send the user. The
backend still checks every request, a role's pages included.
*/

const GUEST_ONLY_ROUTES = ["/login", "/signup"]

// Pages for logged-in users; the status emails link to /dashboard
const PROTECTED_ROUTES = ["/dashboard", "/profile"]

// Refresh a little early so the token doesn't expire while the page renders
const EXPIRY_MARGIN_MS = 10_000

type SessionState = {
  loggedIn: boolean
  // New tokens from a refresh, to store on the response
  refreshed?: AuthCookie[]
  // The backend rejected the session, so both cookies are removed
  cleared?: boolean
}

const matches = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`)

const isGuestOnly = (pathname: string) =>
  GUEST_ONLY_ROUTES.some((route) => matches(pathname, route))

const isProtected = (pathname: string) => PROTECTED_ROUTES.some((route) => matches(pathname, route))

const isUnexpired = (token: string) =>
  (tokenExpiry(token)?.getTime() ?? 0) > Date.now() + EXPIRY_MARGIN_MS

// Vercel sets X-Forwarded-For to the visitor's address, replacing what the browser sent
const clientIpOf = (request: NextRequest) =>
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null

/*
Asks the backend whether the access token still works. Without this, a logged-out (on another
device), banned or deleted user with an unexpired token would be sent away from the login page
with no way to log in again until the token expires.
*/
const confirmAccessToken = async (
  accessToken: string,
  clientIp: string | null,
): Promise<SessionState> => {
  const result = await apiFetch<User>("/users/me", { accessToken, clientIp })

  if (result.success) {
    return { loggedIn: true }
  }

  // 401: session ended or token rejected, 403: account banned
  if (result.statusCode === 401 || result.statusCode === 403) {
    return { loggedIn: false, cleared: true }
  }

  // Backend unreachable or failing: keep trusting the token
  return { loggedIn: true }
}

const readSession = async (request: NextRequest): Promise<SessionState> => {
  const clientIp = clientIpOf(request)
  const accessToken = request.cookies.get("accessToken")?.value

  if (accessToken && isUnexpired(accessToken)) {
    // Only where the token would lock the user out; elsewhere the page asks the backend anyway
    return isGuestOnly(request.nextUrl.pathname)
      ? confirmAccessToken(accessToken, clientIp)
      : { loggedIn: true }
  }

  const refreshToken = request.cookies.get("refreshToken")?.value

  if (!refreshToken) {
    return { loggedIn: false }
  }

  const result = await apiFetch<Session>("/auth/refresh-token", {
    method: "POST",
    body: { refreshToken },
    clientIp,
  })

  if (result.success) {
    return { loggedIn: true, refreshed: toAuthCookies(result.data) }
  }

  // 401: refresh token expired, session ended or account gone, 403: account banned
  if (result.statusCode === 401 || result.statusCode === 403) {
    return { loggedIn: false, cleared: true }
  }

  // Backend unreachable or failing: treat as logged out for this request only
  return { loggedIn: false }
}

// Where to send the user instead of the requested page, or null to let them in
const redirectFor = (request: NextRequest, loggedIn: boolean): URL | null => {
  const { pathname, search, searchParams } = request.nextUrl

  if (loggedIn && isGuestOnly(pathname)) {
    return new URL(safeRedirectPath(searchParams.get("redirectTo")), request.url)
  }

  if (!loggedIn && isProtected(pathname)) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirectTo", `${pathname}${search}`)

    return loginUrl
  }

  return null
}

export async function proxy(request: NextRequest) {
  const { loggedIn, refreshed, cleared } = await readSession(request)

  // Update the request's cookies too, so this render already uses the new tokens
  for (const { name, value } of refreshed ?? []) {
    request.cookies.set(name, value)
  }

  if (cleared) {
    for (const name of AUTH_COOKIE_NAMES) {
      request.cookies.delete(name)
    }
  }

  const redirectUrl = redirectFor(request, loggedIn)
  const response = redirectUrl
    ? NextResponse.redirect(redirectUrl)
    : NextResponse.next({ request: { headers: request.headers } })

  for (const { name, value, options } of refreshed ?? []) {
    response.cookies.set(name, value, options)
  }

  if (cleared) {
    for (const name of AUTH_COOKIE_NAMES) {
      // Expires in the past rather than Max-Age=0, which Next drops when it passes cookies to the render
      response.cookies.delete({ name, path: "/" })
    }
  }

  return response
}

export const config = {
  // Every page, but not API routes, Next.js assets or files with an extension
  matcher: ["/((?!api/|_next/static|_next/image|.*\\..*).*)"],
}
