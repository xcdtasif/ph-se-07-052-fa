import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate, formatTaka } from "@/lib/format"
import { getOpenJobPostings, ROLE_LABELS } from "@/lib/jobs"

export const metadata: Metadata = {
  title: "Jobs",
}

// Open postings, the nearest deadline first
async function OpenJobs() {
  const result = await getOpenJobPostings()

  if (!result.success) {
    return (
      <div role="alert" className="empty-state">
        {result.message}
      </div>
    )
  }

  if (result.data.length === 0) {
    return <div className="empty-state">No open jobs right now.</div>
  }

  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {result.data.map((posting) => (
        <li key={posting.id}>
          <Link href={`/jobs/${posting.id}`} className="block rounded-xl focus-visible:outline-2">
            <Card className="hover:bg-muted/50 h-full transition-colors">
              <CardHeader>
                <CardTitle>{posting.title}</CardTitle>
                <CardDescription>
                  {ROLE_LABELS[posting.role]} · {posting.zone.name} · Apply by{" "}
                  {formatDate(posting.deadline)} · Fee {formatTaka(posting.applicationFee)}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default function JobsPage() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Open jobs</h1>
      <Suspense fallback={<p className="text-muted-foreground text-sm">Loading…</p>}>
        <OpenJobs />
      </Suspense>
    </section>
  )
}
