import "server-only"
import { unstable_rethrow } from "next/navigation"

import { env } from "@/config/env"

export type ApiMeta = {
  page: number
  limit: number
  total: number
}

export type ApiSuccess<T> = {
  success: true
  statusCode: number
  message: string
  data: T
  meta?: ApiMeta
}

// One problem with the request, e.g. a field that failed validation (`path` is its name)
export type ApiError = {
  path: string
  message: string
}

export type ApiFailure = {
  success: false
  // HTTP status from the backend, or 0 when no usable response arrived
  statusCode: number
  message: string
  errors: ApiError[]
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure

export type ApiFetchOptions = Omit<RequestInit, "body"> & {
  // FormData is sent as multipart/form-data (e.g. a file upload); anything else as JSON
  body?: unknown
  // Sent as a Bearer token
  accessToken?: string
  // The visitor's IP, passed on so the backend's rate limits count them, not this server
  clientIp?: string | null
}

/*
The backend didn't answer this server. The visitor's own connection is fine (they
reached this page), so the message doesn't ask them to check it.
*/
const UNAVAILABLE_MESSAGE = "Service unavailable, try again later"
const BAD_RESPONSE_MESSAGE = "The server sent an unexpected response. Please try again."

const isApiResponse = (value: unknown): value is ApiResponse<unknown> =>
  typeof value === "object" &&
  value !== null &&
  "success" in value &&
  typeof value.success === "boolean" &&
  "message" in value &&
  typeof value.message === "string"

// Who is calling: the user's token, and the visitor's IP with the secret that makes the backend trust it
export const authHeaders = (accessToken?: string, clientIp?: string | null) => ({
  ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  ...(clientIp ? { "X-Client-IP": clientIp, "X-Frontend-Secret": env.FRONTEND_SECRET } : {}),
})

/*
Calls the backend from the server and always resolves to its response envelope.
A network failure or a non-JSON reply becomes an `ApiFailure`, so callers handle
every error the same way: check `success`, show `message`.

`path` is a backend path after /api/v1, including any query string.
*/
export const apiFetch = async <T>(
  path: string,
  { body, headers, accessToken, clientIp, ...init }: ApiFetchOptions = {},
): Promise<ApiResponse<T>> => {
  let res: Response
  const isForm = body instanceof FormData

  try {
    res = await fetch(`${env.API_URL}${path}`, {
      ...init,
      headers: {
        // fetch sets a FormData body's multipart type itself, with its boundary
        ...(body === undefined || isForm ? {} : { "Content-Type": "application/json" }),
        ...authHeaders(accessToken, clientIp),
        ...headers,
      },
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    })
  } catch (error) {
    /*
    Next.js's own signals aren't backend failures, e.g. a prerender that ended
    while this fetch was in flight (HANGING_PROMISE_REJECTION). Let Next.js handle them
    */
    unstable_rethrow(error)

    /*
    Nothing here aborts a fetch, so an abort means Next.js cancelled the render, e.g. the
    browser left or dropped a prefetch. Nobody is waiting for the answer, so it isn't a failure
    */
    if (error instanceof Error && error.name === "AbortError") {
      throw error
    }

    // The real cause (e.g. ECONNREFUSED) for the server log; visitors get the generic message
    console.error(`Backend unreachable: ${init.method ?? "GET"} ${env.API_URL}${path}`, error)

    return { success: false, statusCode: 0, message: UNAVAILABLE_MESSAGE, errors: [] }
  }

  const json: unknown = await res.json().catch(() => null)

  if (!isApiResponse(json)) {
    return { success: false, statusCode: res.status, message: BAD_RESPONSE_MESSAGE, errors: [] }
  }

  if (!json.success) {
    return { ...json, errors: Array.isArray(json.errors) ? json.errors : [] }
  }

  return json as ApiSuccess<T>
}
