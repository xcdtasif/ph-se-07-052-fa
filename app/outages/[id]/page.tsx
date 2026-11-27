import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDateTime } from "@/lib/format"
import { getOutage } from "@/lib/outages"
import type { Outage, OutageCause, OutageStatus } from "@/lib/types"

const STATUS_LABELS: Record<OutageStatus, string> = {
  CONFIRMED: "Confirmed",
  ASSIGNED: "Technician assigned",
  IN_PROGRESS: "Repair in progress",
  RESTORED: "Power restored",
}

const STATUS_CLASSES: Record<OutageStatus, string> = {
  CONFIRMED: "bg-red-500/10 text-red-700 dark:text-red-400",
  ASSIGNED: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  IN_PROGRESS: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  RESTORED: "bg-green-500/10 text-green-700 dark:text-green-400",
}

const CAUSE_LABELS: Record<OutageCause, string> = {
  TRANSFORMER_FAULT: "Transformer fault",
  CABLE_DAMAGE: "Cable damage",
  EMERGENCY_MAINTENANCE: "Emergency maintenance",
  TEMPORARY_TRIP: "Temporary trip",
  OTHER: "Other",
}

/*
Each step with its time, or null while the outage hasn't got there. A restored outage drops the
steps it skipped: a temporary trip can be restored without work starting
*/
const timeline = (outage: Outage) =>
  [
    { label: "Confirmed", at: outage.confirmedAt },
    { label: "Technician assigned", at: outage.assignedAt },
    { label: "Work started", at: outage.startedAt },
    { label: "Power restored", at: outage.restoredAt },
  ].filter(({ at }) => at !== null || outage.status !== "RESTORED")

export async function generateMetadata({ params }: PageProps<"/outages/[id]">): Promise<Metadata> {
  const result = await getOutage((await params).id)

  return { title: result.success ? `Outage in ${result.data.zone.name}` : "Outage" }
}

// A missing or malformed id is a 404 page; other failures show in place
async function OutageDetails({ params }: Pick<PageProps<"/outages/[id]">, "params">) {
  const result = await getOutage((await params).id)

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

  const outage = result.data
  const details = [
    { label: "Zone", value: outage.zone.name },
    { label: "Cause", value: outage.cause ? CAUSE_LABELS[outage.cause] : "Not known yet" },
    { label: "Reports", value: String(outage.reportCount) },
    { label: "Last update", value: formatDateTime(outage.updatedAt) },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSES[outage.status]}`}
        >
          {STATUS_LABELS[outage.status]}
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">Outage in {outage.zone.name}</h1>
        {outage.note && <p className="text-muted-foreground">{outage.note}</p>}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="flex flex-col gap-3">
              {timeline(outage).map(({ label, at }) => (
                <li key={label} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className={`mt-1.5 size-2.5 shrink-0 rounded-full ${at ? "bg-foreground" : "ring-foreground/30 ring-1"}`}
                  />
                  <div className={at ? "" : "text-muted-foreground"}>
                    <p>{label}</p>
                    <p className="text-muted-foreground text-xs">
                      {at ? <time dateTime={at}>{formatDateTime(at)}</time> : "Pending"}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
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

      <Card>
        <CardHeader>
          <CardTitle>Affected areas</CardTitle>
          <CardDescription>
            {outage.areas.length} {outage.areas.length === 1 ? "area" : "areas"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {outage.areas.map((area) => (
              <li key={area.id} className="flex justify-between gap-4 py-2">
                <span>{area.name}</span>
                <span className="text-muted-foreground">
                  {area.feeder.name} ({area.feeder.code})
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

export default function OutagePage({ params }: PageProps<"/outages/[id]">) {
  return (
    <Suspense fallback={<p className="text-muted-foreground text-sm">Loading…</p>}>
      <OutageDetails params={params} />
    </Suspense>
  )
}
