"use client"

import { Button } from "@/components/ui/button"
import { useFormAction } from "@/hooks/use-form-action"
import { formatTaka } from "@/lib/format"

import { payAction } from "../_actions/application-actions"

export function PayButton({ applicationId, fee }: { applicationId: string; fee: number }) {
  const [, formAction, pending] = useFormAction(() => payAction(applicationId))

  return (
    <form action={formAction}>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Opening payment…" : `Pay ${formatTaka(fee)}`}
      </Button>
    </form>
  )
}
