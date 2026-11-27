import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { ApiError } from "@/components/shared/api-error"
import { PILL_COLORS } from "@/components/shared/pill-colors"
import { SkeletonText } from "@/components/shared/skeleton-text"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatDateTime } from "@/lib/format"
import { getOutage } from "@/lib/outages"
import type { Outage, OutageCause, OutageStatus } from "@/lib/types"

const STATUSES: Record<OutageStatus, { label: string; className: string }> = {
  CONFIRMED: { label: "Confirmed", className: PILL_COLORS.red },
  ASSIGNED: { label: "Technician assigned", className: PILL_COLORS.amber },
  IN_PROGRESS: { label: "Repair in progress", className: PILL_COLORS.blue },
  RESTORED: { label: "Power restored", className: PILL_COLORS.emerald },
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

// The grid both the details and their skeleton use
const GRID_CLASS = "grid gap-x-8 gap-y-6 lg:grid-cols-[minmax(0,1fr)_20rem]"

// A missing or malformed id is a 404 page; other failures show in place
async function OutageDetails({ params }: Pick<PageProps<"/outages/[id]">, "params">) {
  const result = await getOutage((await params).id)

  if (!result.success) {
    if (result.statusCode === 404 || result.statusCode === 400) {
      notFound()
    }

    return <ApiError error={result} />
  }

  const outage = result.data
  const status = STATUSES[outage.status]
  const details = [
    { label: "Cause", value: outage.cause ? CAUSE_LABELS[outage.cause] : "Not known yet" },
    { label: "Reports", value: String(outage.reportCount) },
    { label: "Areas", value: String(outage.areas.length) },
    { label: "Last update", value: formatDateTime(outage.updatedAt) },
  ]

  /*
  Phones read top to bottom: the title, the details card, then progress and areas. Desktop has
  two columns, the card on the right
  */
  return (
    <div className={GRID_CLASS}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Outage
          </p>
          <Badge className={status.className}>{status.label}</Badge>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Outage in {outage.zone.name}</h1>
        {outage.note && <p className="text-muted-foreground">{outage.note}</p>}
      </div>

      {/*
      Sticks at the same offset it starts at, so it never shifts while scrolling:
      navbar (3.5rem + 1px border) and main's top padding (2rem)
      */}
      <aside className="lg:sticky lg:top-22.25 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
        <Card>
          <CardContent>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              {details.map(({ label, value }) => (
                <div key={label} className="contents">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="truncate text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </aside>

      <div className="flex flex-col gap-8 lg:col-start-1">
        <section aria-labelledby="progress-heading" className="flex flex-col gap-4">
          <h2 id="progress-heading" className="text-lg font-semibold">
            Progress
          </h2>
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
        </section>

        <section aria-labelledby="areas-heading" className="flex flex-col gap-4">
          <h2 id="areas-heading" className="text-lg font-semibold">
            Affected areas
          </h2>
          <Card className="py-0">
            <ul className="divide-y">
              {outage.areas.map((area) => (
                <li key={area.id} className="flex justify-between gap-4 px-4 py-3 text-sm">
                  <span>{area.name}</span>
                  <span className="text-muted-foreground text-right">
                    {area.feeder.name} ({area.feeder.code})
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      </div>
    </div>
  )
}

// The page while the outage loads, in the same grid: title block, details card, progress, areas
function OutageDetailsSkeleton() {
  return (
    <div className={GRID_CLASS} aria-hidden="true">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <SkeletonText className="w-14 text-xs" />
          <div className="skeleton h-5 w-20 rounded-4xl" />
        </div>
        <SkeletonText className="w-2/3 text-2xl" />
      </div>

      <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
        <Card>
          <CardContent className="flex flex-col gap-2 text-sm">
            {Array.from({ length: 4 }, (_, index) => (
              <SkeletonText key={index} />
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-8 lg:col-start-1">
        <div className="flex flex-col gap-4">
          <SkeletonText className="w-24 text-lg" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index}>
                <SkeletonText className="w-40" />
                <SkeletonText className="w-28 text-xs" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <SkeletonText className="w-32 text-lg" />
          <div className="skeleton h-24 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export default function OutagePage({ params }: PageProps<"/outages/[id]">) {
  return (
    <Suspense fallback={<OutageDetailsSkeleton />}>
      <OutageDetails params={params} />
    </Suspense>
  )
}
