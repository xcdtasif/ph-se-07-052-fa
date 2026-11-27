import { CircleAlert, CircleCheck, CircleX, LoaderCircle } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { ApiError } from "@/components/shared/api-error"
import { PageHeader } from "@/components/shared/page-header"
import { SkeletonText } from "@/components/shared/skeleton-text"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { authFetch } from "@/lib/auth-fetch"
import { formatBdt } from "@/lib/format"
import type { Payment } from "@/lib/types"

import { PaymentNote, PaymentOutcome } from "../_components/payment-outcome"
import { PaymentPoller } from "./_components/payment-poller"

export const metadata: Metadata = {
  title: "Payment",
}

const actionClassName = buttonVariants({ size: "sm", className: "text-sm" })

function PaymentDetails({ payment }: { payment: Payment }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-base font-medium">{payment.application.jobPosting.title}</p>
      <p className="text-2xl font-semibold">{formatBdt(payment.amount)}</p>
      <p className="text-muted-foreground">Application fee</p>
    </div>
  )
}

const jobLink = (payment: Payment, label: string) => (
  <Link href={`/jobs/${payment.application.jobPosting.id}`} className={actionClassName}>
    {label}
  </Link>
)

// A missing or unknown session_id, e.g. a typed or shortened link, or another user's payment
function PaymentNotFound() {
  return (
    <PaymentOutcome
      icon={CircleAlert}
      iconClassName="text-muted-foreground"
      title="Payment not found"
      action={
        <Link href="/jobs" className={actionClassName}>
          View jobs
        </Link>
      }
    >
      <PaymentNote>We couldn&apos;t find a payment of yours matching this link.</PaymentNote>
    </PaymentOutcome>
  )
}

/*
Stripe sends the user here as soon as they pay, but only the webhook changes the payment's status,
so it may still be PENDING on arrival
*/
async function PaymentResult({
  searchParams,
}: Pick<PageProps<"/payments/success">, "searchParams">) {
  const { session_id: sessionId } = await searchParams

  if (typeof sessionId !== "string" || sessionId.trim() === "") {
    return <PaymentNotFound />
  }

  // Only the user's own payments, so someone else's session finds nothing
  const result = await authFetch<Payment[]>(
    `/payments/me?sessionId=${encodeURIComponent(sessionId)}&limit=1`,
  )

  if (!result.success) {
    if (result.statusCode === 401) {
      const here = `/payments/success?session_id=${encodeURIComponent(sessionId)}`

      return (
        <PaymentOutcome
          icon={CircleAlert}
          iconClassName="text-muted-foreground"
          title="Log in to see this payment"
          action={
            <Link
              href={`/login?redirectTo=${encodeURIComponent(here)}`}
              className={actionClassName}
            >
              Log in
            </Link>
          }
        />
      )
    }

    return <ApiError error={result} />
  }

  const payment = result.data[0]

  if (!payment) {
    return <PaymentNotFound />
  }

  if (payment.status === "PENDING") {
    return (
      <PaymentOutcome
        icon={LoaderCircle}
        iconClassName="text-muted-foreground animate-spin"
        title="Confirming your payment"
        action={<PaymentPoller />}
      >
        <PaymentDetails payment={payment} />
        <PaymentNote>Stripe usually confirms within a few seconds.</PaymentNote>
      </PaymentOutcome>
    )
  }

  // Only an unpaid checkout fails, so this is an old link to one that expired
  if (payment.status === "FAILED") {
    return (
      <PaymentOutcome
        icon={CircleX}
        iconClassName="text-red-600 dark:text-red-400"
        title="Payment not completed"
        action={jobLink(payment, "Back to the job")}
      >
        <PaymentDetails payment={payment} />
        <PaymentNote>The checkout expired, so you weren&apos;t charged.</PaymentNote>
      </PaymentOutcome>
    )
  }

  return (
    <PaymentOutcome
      icon={CircleCheck}
      iconClassName="text-emerald-600 dark:text-emerald-400"
      title="Payment successful"
      action={jobLink(payment, "View your application")}
    >
      <PaymentDetails payment={payment} />
      <PaymentNote>Your application is submitted.</PaymentNote>
    </PaymentOutcome>
  )
}

// The successful card while the payment loads: icon, heading, the details, note and the button
function PaymentResultSkeleton() {
  return (
    <Card aria-hidden="true">
      <CardContent className="flex flex-col items-center gap-4 pt-4">
        <div className="skeleton size-10 rounded-full" />
        <SkeletonText className="w-44 text-lg" />
        <div className="flex w-full flex-col items-center gap-1">
          <SkeletonText className="w-56 text-base" />
          <SkeletonText className="w-28 text-2xl" />
          <SkeletonText className="w-28" />
        </div>
        <SkeletonText className="w-52" />
        <div className="divider-dashed mt-2 flex w-full justify-center pt-4">
          <div className="skeleton h-7 w-40 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function PaymentSuccessPage({ searchParams }: PageProps<"/payments/success">) {
  return (
    <section className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <PageHeader title="Payment" />
      {/* Screen readers hear the new status when polling swaps the card */}
      <div aria-live="polite">
        <Suspense fallback={<PaymentResultSkeleton />}>
          <PaymentResult searchParams={searchParams} />
        </Suspense>
      </div>
    </section>
  )
}
