"use client"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useFormAction } from "@/hooks/use-form-action"
import { NO_AUTOFILL } from "@/lib/form"

import { updateProfileAction } from "../_actions/profile-actions"

const toErrors = (messages?: string[]) => messages?.map((message) => ({ message }))

export function ProfileForm({ name }: { name: string }) {
  const [state, formAction, pending, formProps] = useFormAction(updateProfileAction)
  const errors = state.fieldErrors

  return (
    <form action={formAction} {...formProps} noValidate>
      <FieldGroup>
        <Field data-invalid={Boolean(errors?.name)}>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input
            id="name"
            name="name"
            {...NO_AUTOFILL}
            defaultValue={state.values?.name ?? name}
            aria-invalid={Boolean(errors?.name)}
            required
          />
          <FieldError errors={toErrors(errors?.name)} />
        </Field>

        <Button type="submit" size="sm" disabled={pending} className="self-center text-sm">
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </FieldGroup>
    </form>
  )
}
