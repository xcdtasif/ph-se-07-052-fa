import { CircleAlert, CircleCheck, CircleX, LoaderCircle } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { buttonVariants } from "@/components/ui/button"
import { authFetch } from "@/lib/auth-fetch"
import { formatTaka } from "@/lib/format"
import type { Payment } from "@/lib/types"

import { PaymentNote, PaymentOutcome } from "../_components/payment-outcome"
import { PaymentPoller } from "./_components/payment-poller"

export const metadata: Metadata = {
  title: "Payment",
}

const actionClassName = buttonVariants({ size: "sm" })

function PaymentDetails({ payment }: { payment: Payment }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <p className="font-medium">{payment.application.jobPosting.title}</p>
      <p className="text-2xl font-semibold">{formatTaka(payment.amount)}</p>
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

    return (
      <div role="alert" className="empty-state">
        {result.message}
      </div>
    )
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

export default function PaymentSuccessPage({ searchParams }: PageProps<"/payments/success">) {
  return (
    <section className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Payment</h1>
      {/* Screen readers hear the new status when polling swaps the card */}
      <div aria-live="polite">
        <Suspense fallback={<p className="text-muted-foreground text-sm">Loading…</p>}>
          <PaymentResult searchParams={searchParams} />
        </Suspense>
      </div>
    </section>
  )
}
