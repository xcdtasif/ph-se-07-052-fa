import Link from "next/link"
import { Suspense } from "react"

import { SessionCard } from "./_components/session-card"

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-semibold">GridLine</h1>
      {/* Reads the session cookie, so it renders per request */}
      <Suspense fallback={<p className="text-muted-foreground text-sm">Loading…</p>}>
        <SessionCard />
      </Suspense>
      <Link href="/jobs" className="text-sm underline underline-offset-4">
        Open jobs
      </Link>
    </div>
  )
}
