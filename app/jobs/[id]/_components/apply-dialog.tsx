"use client"

import { useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useFormAction } from "@/hooks/use-form-action"
import { NO_AUTOFILL } from "@/lib/form"
import { formatBdt } from "@/lib/format"
import { cn } from "@/lib/utils"

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

type ApplyDialogProps = {
  jobPostingId: string
  title: string
  fee: number
}

/*
Applying goes straight on to Stripe, so the dialog only closes by leaving the page. If the
checkout can't open, the page refreshes with the application and its Pay button in its place
*/
export function ApplyDialog({ jobPostingId, title, fee }: ApplyDialogProps) {
  const [open, setOpen] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const [state, formAction, pending, formProps] = useFormAction<ApplyField>(
    async (formData) => checkCv(formData) ?? (await applyAction(jobPostingId, formData)),
  )
  const errors = state.fieldErrors

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="text-sm" />}>Apply</DialogTrigger>
      {/* Focuses the dialog itself, not the first field, so the placeholder shows until a click */}
      <DialogContent ref={popupRef} initialFocus={popupRef} className="grid-cols-1 sm:max-w-md">
        <form
          action={formAction}
          {...formProps}
          onReset={() => setFileName(null)}
          noValidate
          className="grid grid-cols-1 gap-4"
        >
          <DialogTitle className="sr-only">{`Apply for ${title}`}</DialogTitle>

          <FieldGroup>
            <Field data-invalid={Boolean(errors?.phone)}>
              <FieldLabel htmlFor="phone">Phone</FieldLabel>
              <Input
                id="phone"
                name="phone"
                type="tel"
                {...NO_AUTOFILL}
                placeholder="01712345678"
                defaultValue={state.values?.phone}
                aria-invalid={Boolean(errors?.phone)}
                className="text-center"
                required
              />
              <FieldError errors={toErrors(errors?.phone)} />
            </Field>

            <Field data-invalid={Boolean(errors?.cv)}>
              <FieldLabel htmlFor="cv">CV</FieldLabel>
              <FieldDescription className="text-center">Max 2 MB, PDF</FieldDescription>
              {/*
              The native picker can't be centred or relabelled, so it's hidden (still focusable and
              announced by the label above) and this box, styled like the inputs, shows its file
              */}
              <input
                id="cv"
                name="cv"
                type="file"
                accept="application/pdf"
                {...NO_AUTOFILL}
                aria-invalid={Boolean(errors?.cv)}
                onChange={(event) => setFileName(event.target.files?.[0]?.name ?? null)}
                className="peer sr-only"
                required
              />
              <label
                htmlFor="cv"
                aria-hidden="true"
                data-invalid={Boolean(errors?.cv) || undefined}
                className={cn(
                  "border-input dark:bg-input/30 flex h-8 w-full cursor-pointer items-center justify-center rounded-lg border px-2.5 text-sm transition-colors",
                  "peer-focus-visible:border-ring peer-focus-visible:ring-ring/50 peer-focus-visible:ring-3",
                  "data-invalid:border-destructive data-invalid:ring-destructive/20 dark:data-invalid:border-destructive/50 dark:data-invalid:ring-destructive/40 data-invalid:ring-3",
                )}
              >
                <span className={cn("truncate", !fileName && "font-medium")}>
                  {fileName ?? "Choose file"}
                </span>
              </label>
              <FieldError errors={toErrors(errors?.cv)} />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? "Applying…" : `Apply and pay ${formatBdt(fee)}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
