import Link from "next/link"
import type { ReactNode } from "react"

import { PayButton } from "@/app/jobs/[id]/_components/pay-button"
import { ApiError } from "@/components/shared/api-error"
import {
  ApplicationStatusBadge,
  applicationStatusColors,
  applicationStatusLabel,
} from "@/components/shared/application-status-badge"
import { ClippedWords } from "@/components/shared/clipped-words"
import { Pagination, PaginationSkeleton } from "@/components/shared/pagination"
import { SkeletonText } from "@/components/shared/skeleton-text"
import { StatusFilter } from "@/components/shared/status-filter"
import { buttonVariants } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { authFetch } from "@/lib/auth-fetch"
import { applicationsHref } from "@/lib/dashboard"
import { formatBdt, formatDateTime } from "@/lib/format"
import { ROLE_LABELS } from "@/lib/jobs"
import { APPLICATION_STATUSES, type Application, type ApplicationStatus } from "@/lib/types"

const PAGE_SIZE = 10

/*
Every column but the job is a fixed width that fits its widest value ("27 Sept 2026, 23:59",
"Zone Manager", "BDT 10,000", "Waiting for the fee", the CV and Pay buttons) with the cell's
padding; the job takes what's left. Below 57rem the table scrolls sideways. The header row is for
screen readers only, like RentNest's payments
*/
const COLUMNS = [
  { label: "Applied", width: "w-44" },
  { label: "Job", width: undefined },
  { label: "Role", width: "w-32" },
  { label: "Fee", width: "w-28" },
  { label: "Status", width: "w-44" },
  { label: "Actions", width: "w-40" },
]

function ApplicationsFrame({ children }: { children: ReactNode }) {
  return (
    <div className="bg-card overflow-hidden rounded-xl border">
      <Table className="min-w-228 table-fixed [&_td]:truncate [&_td]:px-4">
        <colgroup>
          {COLUMNS.map(({ label, width }) => (
            <col key={label} className={width} />
          ))}
        </colgroup>
        <TableHeader className="sr-only">
          <TableRow>
            {COLUMNS.map(({ label }) => (
              <TableHead key={label}>{label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>{children}</TableBody>
      </Table>
    </div>
  )
}

export function ApplicationStatusFilter({ status }: { status?: ApplicationStatus }) {
  return (
    <StatusFilter
      label="Filter applications by status"
      statuses={APPLICATION_STATUSES}
      status={status}
      href={(option) => applicationsHref(option)}
      statusLabel={applicationStatusLabel}
      statusColors={applicationStatusColors}
      listId="applications"
    />
  )
}

export function MyApplicationsSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <ApplicationsFrame>
        {Array.from({ length: PAGE_SIZE }, (_, index) => (
          <TableRow key={index} className="h-12 hover:bg-transparent">
            <TableCell>
              <SkeletonText className="w-28" />
            </TableCell>
            <TableCell>
              <SkeletonText className="w-3/4" />
            </TableCell>
            <TableCell>
              <SkeletonText className="w-20" />
            </TableCell>
            <TableCell>
              <SkeletonText className="w-16" />
            </TableCell>
            <TableCell>
              <div className="skeleton h-5 w-24 rounded-4xl" />
            </TableCell>
            <TableCell>
              <div className="skeleton h-6 w-9 rounded-md" />
            </TableCell>
          </TableRow>
        ))}
      </ApplicationsFrame>
      <PaginationSkeleton />
    </div>
  )
}

const smallButton = (variant: "default" | "outline" = "default") =>
  buttonVariants({ variant, size: "sm", className: "text-sm" })

// A row's buttons are the shorter size, so they don't crowd the row
const rowButton = buttonVariants({ variant: "outline", size: "xs" })

// Per-user, uncached: reads cookies, so it sits inside <Suspense>
export async function MyApplications({
  page,
  status,
}: {
  page: number
  status?: ApplicationStatus
}) {
  const result = await authFetch<Application[]>(
    `/applications/me?page=${page}&limit=${PAGE_SIZE}${status ? `&status=${status}` : ""}`,
  )

  if (!result.success) {
    return <ApiError error={result} />
  }

  const { data: applications, meta } = result
  const total = meta?.total ?? applications.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  if (applications.length === 0) {
    // Past the last page, none with this status, or no applications at all
    return (
      <div className="text-muted-foreground empty-state flex flex-col items-center gap-4">
        {total > 0 ? (
          <>
            <p>There are no applications on this page.</p>
            <Link href={applicationsHref(status)} className={smallButton("outline")}>
              Go to the first page
            </Link>
          </>
        ) : status ? (
          <p>No applications marked {applicationStatusLabel(status).toLowerCase()}.</p>
        ) : (
          <>
            <p>No applications yet.</p>
            <Link href="/jobs" className={smallButton("outline")}>
              Browse jobs
            </Link>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <ApplicationsFrame>
        {applications.map((application) => {
          const { jobPosting } = application

          return (
            <TableRow key={application.id} className="h-12">
              <TableCell className="text-muted-foreground tabular-nums">
                {formatDateTime(application.createdAt)}
              </TableCell>
              <TableCell className="font-medium">
                <Link href={`/jobs/${jobPosting.id}`} title={jobPosting.title} className="group">
                  <ClippedWords text={jobPosting.title} underline />
                </Link>
              </TableCell>
              <TableCell>{ROLE_LABELS[jobPosting.role]}</TableCell>
              <TableCell className="tabular-nums">{formatBdt(jobPosting.applicationFee)}</TableCell>
              <TableCell>
                <ApplicationStatusBadge status={application.status} />
              </TableCell>
              <TableCell>
                <div className="flex gap-4">
                  <a
                    href={application.cvUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="View CV"
                    className={rowButton}
                  >
                    CV
                  </a>
                  {application.status === "PAYMENT_PENDING" && (
                    <PayButton
                      applicationId={application.id}
                      fee={jobPosting.applicationFee}
                      compact
                    />
                  )}
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </ApplicationsFrame>
      <Pagination
        label="Applications pagination"
        page={page}
        totalPages={totalPages}
        href={(target) => applicationsHref(status, target)}
        scrollTo="applications"
      />
    </div>
  )
}
