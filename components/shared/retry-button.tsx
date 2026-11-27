"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"

import { Button } from "@/components/ui/button"

/*
Re-renders the current page on the server, fetching its data again. It matches ApiError's
other buttons.
*/
export function RetryButton() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <Button
      variant="outline"
      size="sm"
      className="text-sm"
      onClick={() => startTransition(() => router.refresh())}
      disabled={pending}
    >
      {pending ? "Trying again…" : "Try again"}
    </Button>
  )
}
