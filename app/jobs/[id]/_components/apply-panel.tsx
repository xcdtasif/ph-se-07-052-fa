import Link from "next/link"
import type { ReactNode } from "react"

import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authFetch, getCurrentUser } from "@/lib/auth-fetch"
import { formatDateTime } from "@/lib/format"
import type { Application, ApplicationStatus, JobPosting } from "@/lib/types"

import { ApplyForm } from "./apply-form"
import { PayButton } from "./pay-button"

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  PAYMENT_PENDING: "Waiting for the fee",
  SUBMITTED: "Submitted",
  SHORTLISTED: "Shortlisted",
  HIRED: "Hired",
  REJECTED: "Not selected",
}

function Panel({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children?: ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  )
}

function YourApplication({
  application,
  posting,
}: {
  application: Application
  posting: JobPosting
}) {
  const unpaid = application.status === "PAYMENT_PENDING"

  return (
    <Panel
      title="Your application"
      description={`${STATUS_LABELS[application.status]} · sent ${formatDateTime(application.createdAt)}`}
    >
      <div className="flex flex-col gap-4">
        <a
          href={application.cvUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm underline underline-offset-4"
        >
          View your CV
        </a>
        {unpaid && posting.status === "OPEN" && (
          <PayButton applicationId={application.id} fee={posting.applicationFee} />
        )}
        {unpaid && posting.status === "CLOSED" && (
          <p className="text-muted-foreground text-sm">
            The posting closed before the fee was paid, so this application wasn&apos;t submitted.
          </p>
        )}
      </div>
    </Panel>
  )
}

/*
What the visitor can do on this posting: log in, apply, pay, or follow their application. Reads
the session cookie, so it renders per request inside <Suspense>
*/
export async function ApplyPanel({ posting }: { posting: JobPosting }) {
  const me = await getCurrentUser()

  if (!me.success) {
    if (me.statusCode !== 401) {
      return <Panel title="Apply" description={me.message} />
    }

    return (
      <Panel title="Apply" description="Log in to apply for this job.">
        <Link
          href={`/login?redirectTo=${encodeURIComponent(`/jobs/${posting.id}`)}`}
          className={buttonVariants({ className: "w-full" })}
        >
          Log in
        </Link>
      </Panel>
    )
  }

  if (me.data.employee) {
    return <Panel title="Apply" description="Employees can't apply for jobs." />
  }

  const result = await authFetch<Application[]>(
    `/applications/me?jobPostingId=${encodeURIComponent(posting.id)}&limit=1`,
  )

  if (!result.success) {
    return <Panel title="Apply" description={result.message} />
  }

  const application = result.data[0]

  if (application) {
    return <YourApplication application={application} posting={posting} />
  }

  if (posting.status === "CLOSED") {
    return <Panel title="Apply" description="Applications for this job are closed." />
  }

  return (
    <Panel title="Apply">
      <ApplyForm jobPostingId={posting.id} fee={posting.applicationFee} />
    </Panel>
  )
}
