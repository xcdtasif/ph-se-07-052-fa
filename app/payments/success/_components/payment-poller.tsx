"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"

import { Button } from "@/components/ui/button"

const POLL_INTERVAL_MS = 3000
// Two minutes; the webhook usually arrives within seconds
const POLL_LIMIT = 40

/*
Re-renders the page on the server every few seconds while the payment is PENDING; the next check
waits for the previous one, so a slow server never gets two at once. The page drops this once the
status changes. After the last check it offers to start again
*/
export function PaymentPoller() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [polls, setPolls] = useState(0)

  useEffect(() => {
    if (pending || polls >= POLL_LIMIT) {
      return
    }

    const timer = setTimeout(() => {
      setPolls((count) => count + 1)
      startTransition(() => router.refresh())
    }, POLL_INTERVAL_MS)

    return () => clearTimeout(timer)
  }, [pending, polls, router])

  if (polls < POLL_LIMIT) {
    return (
      <p className="text-muted-foreground flex min-h-8 items-center text-sm">
        Checking for confirmation…
      </p>
    )
  }

  return (
    <Button size="sm" onClick={() => setPolls(0)}>
      Check again
    </Button>
  )
}
