import "server-only"
import { cookies } from "next/headers"
import { cache } from "react"

import { apiFetch, type ApiFetchOptions, type ApiResponse } from "@/lib/api"
import { getClientIp } from "@/lib/client-ip"
import type { User } from "@/lib/types"

/*
Calls the backend as the logged-in user with the access token from the cookie. Reads cookies,
so a component that calls it must sit inside <Suspense>. Without a token it answers 401 itself
instead of asking the backend.
*/
export const authFetch = async <T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<ApiResponse<T>> => {
  const accessToken = (await cookies()).get("accessToken")?.value

  if (!accessToken) {
    return { success: false, statusCode: 401, message: "Authentication required", errors: [] }
  }

  return apiFetch<T>(path, { ...options, accessToken, clientIp: await getClientIp() })
}

// The logged-in user, fetched at most once per request however many components ask
export const getCurrentUser = cache(() => authFetch<User>("/users/me"))
