import { CalendarClock, MapPin } from "lucide-react"
import Link from "next/link"

import { SkeletonText } from "@/components/shared/skeleton-text"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate, formatBdt } from "@/lib/format"
import { ROLE_LABELS } from "@/lib/jobs"
import type { JobPosting } from "@/lib/types"

import { JobStatusBadge } from "./job-status-badge"

// The whole card is the link; its text (title first) is what screen readers announce
export function JobCard({ posting }: { posting: JobPosting }) {
  const { id, title, role, zone, deadline, applicationFee, vacancies, status } = posting

  return (
    <Link
      href={`/jobs/${id}`}
      className="focus-visible:ring-ring/50 flex w-full rounded-xl outline-none focus-visible:ring-3"
    >
      <Card className="w-full gap-0 py-0 transition-shadow hover:shadow-md">
        <CardContent className="flex flex-1 flex-col gap-2 p-4">
          {/* Role with the status on the right, like the fee and vacancies below */}
          <div className="flex items-center justify-between gap-2">
            <p className="text-muted-foreground line-clamp-1 text-xs font-medium tracking-wide uppercase">
              {ROLE_LABELS[role]}
            </p>
            <JobStatusBadge status={status} />
          </div>
          <h3 className="line-clamp-1 font-semibold">{title}</h3>
          <p className="text-muted-foreground flex items-center gap-1 text-sm">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            <span className="line-clamp-1">{zone.name}</span>
          </p>
          <p className="text-muted-foreground flex items-center gap-1 text-sm">
            <CalendarClock className="size-4 shrink-0" aria-hidden="true" />
            <span className="line-clamp-1">Apply by {formatDate(deadline)}</span>
          </p>
          <div className="mt-auto flex items-center justify-between pt-2">
            <p>
              <span className="font-semibold">{formatBdt(applicationFee)}</span>
              <span className="text-muted-foreground text-sm"> fee</span>
            </p>
            <p className="text-muted-foreground text-sm">
              {vacancies} {vacancies === 1 ? "vacancy" : "vacancies"}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

// The card while it loads: the same frame and rows, so it's as tall at every width
export function JobCardSkeleton() {
  return (
    <Card className="w-full gap-0 py-0">
      <CardContent className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <SkeletonText className="w-24 text-xs" />
          <div className="skeleton h-5 w-12 rounded-4xl" />
        </div>
        <SkeletonText className="w-3/4" />
        <SkeletonText className="w-1/2 text-sm" />
        <SkeletonText className="w-2/5 text-sm" />
        <div className="mt-auto flex items-center justify-between pt-2">
          <SkeletonText className="w-20" />
          <SkeletonText className="w-20 text-sm" />
        </div>
      </CardContent>
    </Card>
  )
}
