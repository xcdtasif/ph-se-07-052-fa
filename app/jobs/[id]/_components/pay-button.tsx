"use client"

import { Button } from "@/components/ui/button"
import { useFormAction } from "@/hooks/use-form-action"
import { formatBdt } from "@/lib/format"

import { payAction } from "../_actions/application-actions"

// `compact` is the short outline form for a table row, which shows the fee in its own column
export function PayButton({
  applicationId,
  fee,
  compact = false,
}: {
  applicationId: string
  fee: number
  compact?: boolean
}) {
  const [, formAction, pending] = useFormAction(() => payAction(applicationId))
  const label = `Pay ${formatBdt(fee)}`

  return (
    <form action={formAction}>
      <Button
        type="submit"
        size={compact ? "xs" : "sm"}
        variant={compact ? "outline" : "default"}
        disabled={pending}
        aria-label={compact ? label : undefined}
        className={compact ? undefined : "text-sm"}
      >
        {pending ? (compact ? "Opening…" : "Opening payment…") : compact ? "Pay" : label}
      </Button>
    </form>
  )
}
