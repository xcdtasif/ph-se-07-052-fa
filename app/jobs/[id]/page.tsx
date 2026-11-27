import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate, formatTaka } from "@/lib/format"
import { getJobPosting, ROLE_LABELS } from "@/lib/jobs"

import { ApplyPanel } from "./_components/apply-panel"

export async function generateMetadata({ params }: PageProps<"/jobs/[id]">): Promise<Metadata> {
  const result = await getJobPosting((await params).id)

  return { title: result.success ? result.data.title : "Job" }
}

// A missing or malformed id is a 404 page; other failures show in place
async function JobDetails({ params }: Pick<PageProps<"/jobs/[id]">, "params">) {
  const result = await getJobPosting((await params).id)

  if (!result.success) {
    if (result.statusCode === 404 || result.statusCode === 400) {
      notFound()
    }

    return (
      <div role="alert" className="empty-state">
        {result.message}
      </div>
    )
  }

  const posting = result.data
  const open = posting.status === "OPEN"
  const details = [
    { label: "Role", value: ROLE_LABELS[posting.role] },
    { label: "Zone", value: posting.zone.name },
    { label: "Vacancies", value: String(posting.vacancies) },
    { label: "Application fee", value: formatTaka(posting.applicationFee) },
    { label: "Apply by", value: formatDate(posting.deadline) },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${open ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-muted text-muted-foreground"}`}
        >
          {open ? "Open" : "Closed"}
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">{posting.title}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_22rem]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>About the job</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{posting.description}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
                {details.map(({ label, value }) => (
                  <div key={label} className="contents">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        </div>

        <Suspense fallback={<p className="text-muted-foreground text-sm">Loading…</p>}>
          <ApplyPanel posting={posting} />
        </Suspense>
      </div>
    </div>
  )
}

export default function JobPage({ params }: PageProps<"/jobs/[id]">) {
  return (
    <Suspense fallback={<p className="text-muted-foreground text-sm">Loading…</p>}>
      <JobDetails params={params} />
    </Suspense>
  )
}
