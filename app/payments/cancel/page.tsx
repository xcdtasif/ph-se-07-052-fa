import { CircleSlash } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { PageHeader } from "@/components/shared/page-header"
import { buttonVariants } from "@/components/ui/button"

import { PaymentNote, PaymentOutcome } from "../_components/payment-outcome"

export const metadata: Metadata = {
  title: "Payment",
}

/*
Stripe sends the user here from the checkout's back link. The checkout stays open, and the job
page's Pay button returns to it until it expires
*/
export default function PaymentCancelPage() {
  return (
    <section className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <PageHeader title="Payment" />
      <PaymentOutcome
        icon={CircleSlash}
        iconClassName="text-muted-foreground"
        title="Payment cancelled"
        action={
          <Link href="/jobs" className={buttonVariants({ size: "sm", className: "text-sm" })}>
            View jobs
          </Link>
        }
      >
        <PaymentNote>
          You weren&apos;t charged. Your application waits for the fee; pay it from the job&apos;s
          page while the posting is open.
        </PaymentNote>
      </PaymentOutcome>
    </section>
  )
}
