"use client"

import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useFormAction } from "@/hooks/use-form-action"
import { formatTaka } from "@/lib/format"

import { applyAction, type ApplyField } from "../_actions/application-actions"

const CV_MAX_BYTES = 2 * 1024 * 1024

const toErrors = (messages?: string[]) => messages?.map((message) => ({ message }))

// A CV over the limit is refused here, before its upload takes the user's time
const checkCv = (formData: FormData) => {
  const cv = formData.get("cv")

  return cv instanceof File && cv.size > CV_MAX_BYTES
    ? { success: false, message: "", fieldErrors: { cv: ["CV must be 2 MB or smaller"] } }
    : null
}

export function ApplyForm({ jobPostingId, fee }: { jobPostingId: string; fee: number }) {
  const [state, formAction, pending, formProps] = useFormAction<ApplyField>(
    async (formData) => checkCv(formData) ?? (await applyAction(jobPostingId, formData)),
  )
  const errors = state.fieldErrors

  return (
    <form action={formAction} {...formProps} noValidate>
      <FieldGroup>
        <Field data-invalid={Boolean(errors?.phone)}>
          <FieldLabel htmlFor="phone">Phone</FieldLabel>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="01712345678"
            defaultValue={state.values?.phone}
            aria-invalid={Boolean(errors?.phone)}
            required
          />
          <FieldError errors={toErrors(errors?.phone)} />
        </Field>

        <Field data-invalid={Boolean(errors?.cv)}>
          <FieldLabel htmlFor="cv">CV</FieldLabel>
          <FieldDescription>Max 2 MB, PDF</FieldDescription>
          <Input
            id="cv"
            name="cv"
            type="file"
            accept="application/pdf"
            aria-invalid={Boolean(errors?.cv)}
            required
          />
          <FieldError errors={toErrors(errors?.cv)} />
        </Field>

        <Button type="submit" disabled={pending}>
          {pending ? "Applying…" : `Apply and pay ${formatTaka(fee)}`}
        </Button>
      </FieldGroup>
    </form>
  )
}
