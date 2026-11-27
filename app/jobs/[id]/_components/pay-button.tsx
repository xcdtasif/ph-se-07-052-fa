"use client"

import { Button } from "@/components/ui/button"
import { useFormAction } from "@/hooks/use-form-action"
import { formatBdt } from "@/lib/format"

import { payAction } from "../_actions/application-actions"

export function PayButton({ applicationId, fee }: { applicationId: string; fee: number }) {
  const [, formAction, pending] = useFormAction(() => payAction(applicationId))

  return (
    <form action={formAction}>
      <Button type="submit" size="sm" disabled={pending} className="text-sm">
        {pending ? "Opening payment…" : `Pay ${formatBdt(fee)}`}
      </Button>
    </form>
  )
}
