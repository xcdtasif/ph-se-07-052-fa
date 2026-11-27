import type { ReactNode } from "react"

import { loginAgainAction, logoutAction } from "@/app/(auth)/_actions/auth-actions"
import { Button } from "@/components/ui/button"
import type { ApiFailure } from "@/lib/api"

import { RetryButton } from "./retry-button"

// Styled like the empty states: a dashed frame, muted text and a small outline button
function ErrorFrame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div
      role="alert"
      className="text-muted-foreground empty-state flex flex-col items-center gap-4"
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </div>
  )
}

// As RetryButton and the empty states' actions look
const ACTION_PROPS = { variant: "outline", size: "sm", className: "text-sm" } as const

/*
Shows a failed backend read on the page itself. Errors thrown from a Server
Component reach error.tsx with a generic message in production, so expected
failures are rendered here instead, with the backend's own message.
*/
export function ApiError({ error }: { error: ApiFailure }) {
  // Account deleted or token rejected: say why, then start a fresh session
  if (error.statusCode === 401) {
    return (
      <ErrorFrame title="Your session has ended">
        <p className="max-w-md">{error.message}</p>
        <form action={loginAgainAction}>
          <Button type="submit" {...ACTION_PROPS}>
            Log in again
          </Button>
        </form>
      </ErrorFrame>
    )
  }

  // Banned, or not allowed: retrying won't help, logging out lets them switch account
  if (error.statusCode === 403) {
    return (
      <ErrorFrame title="You can't access this page">
        <p className="max-w-md">{error.message}</p>
        <form action={logoutAction}>
          <Button type="submit" {...ACTION_PROPS}>
            Log out
          </Button>
        </form>
      </ErrorFrame>
    )
  }

  return (
    <ErrorFrame title={error.statusCode === 0 ? "Service unavailable" : "Something went wrong"}>
      <p className="max-w-md">
        {/* The frame has room for more than the short toast text in `message` */}
        {error.statusCode === 0
          ? "This is usually temporary. Please try again in a moment."
          : error.message}
      </p>
      <RetryButton />
    </ErrorFrame>
  )
}
