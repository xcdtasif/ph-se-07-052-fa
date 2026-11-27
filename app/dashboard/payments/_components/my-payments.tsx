import Link from "next/link"
import type { ReactNode } from "react"

import { ApiError } from "@/components/shared/api-error"
import { ClippedWords } from "@/components/shared/clipped-words"
import { Pagination, PaginationSkeleton } from "@/components/shared/pagination"
import {
  PaymentStatusBadge,
  paymentStatusColors,
  paymentStatusLabel,
} from "@/components/shared/payment-status-badge"
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
import { applicationsHref, paymentsHref } from "@/lib/dashboard"
import { formatBdt, formatDateTime } from "@/lib/format"
import { PAYMENT_STATUSES, type Payment, type PaymentStatus } from "@/lib/types"

const PAGE_SIZE = 10

/*
Every column but the job is a fixed width that fits its widest value ("27 Sept 2026, 23:59",
"BDT 10,000", "GL-20261127-AF1B0647", "Completed", the Invoice button) with the cell's padding;
the job takes what's left. Below 58rem the table scrolls sideways
*/
const COLUMNS = [
  { label: "Date", width: "w-44" },
  { label: "Job", width: undefined },
  { label: "Amount", width: "w-28" },
  { label: "Invoice number", width: "w-56" },
  { label: "Status", width: "w-32" },
  { label: "Invoice", width: "w-32" },
]

function PaymentsFrame({ children }: { children: ReactNode }) {
  return (
    <div className="bg-card overflow-hidden rounded-xl border">
      <Table className="min-w-232 table-fixed [&_td]:truncate [&_td]:px-4">
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

export function PaymentStatusFilter({ status }: { status?: PaymentStatus }) {
  return (
    <StatusFilter
      label="Filter payments by status"
      statuses={PAYMENT_STATUSES}
      status={status}
      href={(option) => paymentsHref(option)}
      statusLabel={paymentStatusLabel}
      statusColors={paymentStatusColors}
      listId="payments"
    />
  )
}

export function MyPaymentsSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <PaymentsFrame>
        {Array.from({ length: PAGE_SIZE }, (_, index) => (
          <TableRow key={index} className="h-12 hover:bg-transparent">
            <TableCell>
              <SkeletonText className="w-28" />
            </TableCell>
            <TableCell>
              <SkeletonText className="w-3/4" />
            </TableCell>
            <TableCell>
              <SkeletonText className="w-16" />
            </TableCell>
            <TableCell>
              <SkeletonText className="w-36" />
            </TableCell>
            <TableCell>
              <div className="skeleton h-5 w-20 rounded-4xl" />
            </TableCell>
            <TableCell>
              <div className="skeleton h-6 w-16 rounded-md" />
            </TableCell>
          </TableRow>
        ))}
      </PaymentsFrame>
      <PaginationSkeleton />
    </div>
  )
}

const outlineButton = buttonVariants({ variant: "outline", size: "sm", className: "text-sm" })

// A row's button is the shorter size, so it doesn't crowd the row
const rowButton = buttonVariants({ variant: "outline", size: "xs" })

// Per-user, uncached: reads cookies, so it sits inside <Suspense>
export async function MyPayments({ page, status }: { page: number; status?: PaymentStatus }) {
  const result = await authFetch<Payment[]>(
    `/payments/me?page=${page}&limit=${PAGE_SIZE}${status ? `&status=${status}` : ""}`,
  )

  if (!result.success) {
    return <ApiError error={result} />
  }

  const { data: payments, meta } = result
  const total = meta?.total ?? payments.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  if (payments.length === 0) {
    // Past the last page, none with this status, or no payments at all
    return (
      <div className="text-muted-foreground empty-state flex flex-col items-center gap-4">
        {total > 0 ? (
          <>
            <p>There are no payments on this page.</p>
            <Link href={paymentsHref(status)} className={outlineButton}>
              Go to the first page
            </Link>
          </>
        ) : status ? (
          <p>No {paymentStatusLabel(status).toLowerCase()} payments.</p>
        ) : (
          <>
            <p>No payments yet.</p>
            <Link href={applicationsHref("PAYMENT_PENDING")} className={outlineButton}>
              View unpaid applications
            </Link>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PaymentsFrame>
        {payments.map((payment) => {
          const { jobPosting } = payment.application

          return (
            <TableRow key={payment.id} className="h-12">
              <TableCell className="text-muted-foreground tabular-nums">
                {formatDateTime(payment.paidAt ?? payment.createdAt)}
              </TableCell>
              <TableCell className="font-medium">
                <Link href={`/jobs/${jobPosting.id}`} title={jobPosting.title} className="group">
                  <ClippedWords text={jobPosting.title} underline />
                </Link>
              </TableCell>
              <TableCell className="tabular-nums">{formatBdt(payment.amount)}</TableCell>
              <TableCell className="text-muted-foreground font-mono text-xs">
                {payment.invoiceNumber ?? "—"}
              </TableCell>
              <TableCell>
                <PaymentStatusBadge status={payment.status} />
              </TableCell>
              <TableCell>
                {/* A file, not a page, so a plain link the browser downloads */}
                {payment.status === "COMPLETED" && (
                  <a
                    href={`/dashboard/payments/${payment.id}/invoice`}
                    download
                    className={rowButton}
                  >
                    Invoice
                  </a>
                )}
              </TableCell>
            </TableRow>
          )
        })}
      </PaymentsFrame>
      <Pagination
        label="Payments pagination"
        page={page}
        totalPages={totalPages}
        href={(target) => paymentsHref(status, target)}
        scrollTo="payments"
      />
    </div>
  )
}
