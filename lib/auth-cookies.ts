import "server-only"
import { cookies } from "next/headers"

import { env } from "@/config/env"
import type { Tokens } from "@/lib/types"

export const AUTH_COOKIE_NAMES = ["accessToken", "refreshToken"] as const

export type AuthCookie = {
  name: (typeof AUTH_COOKIE_NAMES)[number]
  value: string
  options: { httpOnly: true; secure: boolean; sameSite: "lax"; path: "/"; expires?: Date }
}

/*
A JWT's expiry, read without verifying it (only the backend has the secret). It only decides
how long the browser keeps the cookie; the backend still checks the token on every request
*/
export const tokenExpiry = (token: string): Date | undefined => {
  try {
    const { exp } = JSON.parse(Buffer.from(token.split(".")[1] ?? "", "base64url").toString())

    return typeof exp === "number" ? new Date(exp * 1000) : undefined
  } catch {
    return undefined
  }
}

/*
The tokens as httpOnly cookies on this app's domain, so scripts in the browser can't read them.
Each cookie lasts as long as its token
*/
export const toAuthCookies = (tokens: Tokens): AuthCookie[] =>
  AUTH_COOKIE_NAMES.map((name) => ({
    name,
    value: tokens[name],
    options: {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: tokenExpiry(tokens[name]),
    },
  }))

// Stores the tokens from a login, signup or password change, from a server action
export const setAuthCookies = async (tokens: Tokens) => {
  const cookieStore = await cookies()

  for (const { name, value, options } of toAuthCookies(tokens)) {
    cookieStore.set(name, value, options)
  }
}

// Deletes both auth cookies on this domain
export const clearAuthCookies = async () => {
  const cookieStore = await cookies()

  for (const name of AUTH_COOKIE_NAMES) {
    cookieStore.delete({ name, path: "/" })
  }
}
