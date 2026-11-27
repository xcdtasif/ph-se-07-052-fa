import Link from "next/link"
import type { ReactNode } from "react"

import { PILL_COLORS } from "@/components/shared/pill-colors"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { authFetch, getCurrentUser } from "@/lib/auth-fetch"
import type { Application, ApplicationStatus, JobPosting } from "@/lib/types"

import { ApplyDialog } from "./apply-dialog"
import { PayButton } from "./pay-button"

const STATUSES: Record<ApplicationStatus, { label: string; className: string }> = {
  PAYMENT_PENDING: { label: "Waiting for the fee", className: PILL_COLORS.amber },
  SUBMITTED: { label: "Submitted", className: PILL_COLORS.blue },
  SHORTLISTED: { label: "Shortlisted", className: PILL_COLORS.violet },
  HIRED: { label: "Hired", className: PILL_COLORS.emerald },
  REJECTED: { label: "Not selected", className: PILL_COLORS.gray },
}

const smallButton = (variant: "default" | "outline" = "default") =>
  buttonVariants({ variant, size: "sm", className: "text-sm" })

// In place of the button, at its height
const Note = ({ children }: { children: ReactNode }) => (
  <p className="text-muted-foreground flex min-h-7 items-center text-center text-sm">{children}</p>
)

// The user's application: its status, their CV, and the fee while it's unpaid
function YourApplication({
  application,
  posting,
}: {
  application: Application
  posting: JobPosting
}) {
  const { label, className } = STATUSES[application.status]
  const unpaid = application.status === "PAYMENT_PENDING"

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="flex items-center gap-2 text-sm">
        Your application
        <Badge className={className}>{label}</Badge>
      </p>
      {unpaid && posting.status === "CLOSED" && (
        <Note>The posting closed before the fee was paid.</Note>
      )}
      <div className="flex gap-2">
        <a
          href={application.cvUrl}
          target="_blank"
          rel="noreferrer"
          className={smallButton("outline")}
        >
          View CV
        </a>
        {unpaid && posting.status === "OPEN" && (
          <PayButton applicationId={application.id} fee={posting.applicationFee} />
        )}
      </div>
    </div>
  )
}

/*
What the visitor can do on this posting: log in, apply, pay, or follow their application. Reads
the session cookie, so it sits inside <Suspense>
*/
export async function ApplyAction({ posting }: { posting: JobPosting }) {
  const me = await getCurrentUser()

  if (!me.success) {
    // Logged out (or the session ended): log in, then come back to this page
    if (me.statusCode === 401) {
      return posting.status === "OPEN" ? (
        <Link
          href={`/login?redirectTo=${encodeURIComponent(`/jobs/${posting.id}`)}`}
          className={smallButton()}
        >
          Log in to apply
        </Link>
      ) : (
        <Note>Applications are closed</Note>
      )
    }

    return <Note>{me.message}</Note>
  }

  if (me.data.employee) {
    return <Note>Employees can&apos;t apply for jobs</Note>
  }

  const result = await authFetch<Application[]>(
    `/applications/me?jobPostingId=${encodeURIComponent(posting.id)}&limit=1`,
  )

  if (!result.success) {
    return <Note>{result.message}</Note>
  }

  const application = result.data[0]

  if (application) {
    return <YourApplication application={application} posting={posting} />
  }

  if (posting.status === "CLOSED") {
    return <Note>Applications are closed</Note>
  }

  return (
    <ApplyDialog jobPostingId={posting.id} title={posting.title} fee={posting.applicationFee} />
  )
}
