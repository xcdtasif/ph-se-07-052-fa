"use client"

import { useEffect } from "react"

import { Button } from "@/components/ui/button"

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="text-muted-foreground max-w-md">
        An unexpected error stopped this page from loading. Please try again.
      </p>
      <Button onClick={() => retry()}>Try again</Button>
    </section>
  )
}
