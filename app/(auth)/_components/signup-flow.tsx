"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useFormAction } from "@/hooks/use-form-action"

import { signupAction, verifyEmailAction } from "../_actions/auth-actions"
import { BotCheckField, useBotCheck, withBotCheckReset } from "./bot-check"
import { GoogleLoginButton } from "./google-login"
import { useAuthForm } from "./use-auth-form"

const toErrors = (messages?: string[]) => messages?.map((message) => ({ message }))

/*
Signing up takes two steps: the details, which email a code, then the code, which creates the
account and logs in. No account exists until the code is entered (within 10 minutes). Google
skips both: it creates the account on the first sign-in
*/
export function SignupFlow() {
  const [email, setEmail] = useState<string | null>(null)

  return email ? (
    <VerifyEmailForm email={email} onBack={() => setEmail(null)} />
  ) : (
    <div className="flex flex-col gap-6">
      <SignupForm onCodeSent={setEmail} />
      <GoogleLoginButton />
    </div>
  )
}

function SignupForm({ onCodeSent }: { onCodeSent: (email: string) => void }) {
  const botCheck = useBotCheck()
  const [state, formAction, pending, formProps] = useFormAction(
    withBotCheckReset(signupAction, botCheck.reset),
    (state) => onCodeSent(state.values?.email ?? ""),
  )
  const errors = state.fieldErrors

  return (
    <form action={formAction} {...formProps} noValidate>
      <FieldGroup>
        <Field data-invalid={Boolean(errors?.name)}>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            defaultValue={state.values?.name}
            aria-invalid={Boolean(errors?.name)}
            required
          />
          <FieldError errors={toErrors(errors?.name)} />
        </Field>

        <Field data-invalid={Boolean(errors?.email)}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state.values?.email}
            aria-invalid={Boolean(errors?.email)}
            required
          />
          <FieldError errors={toErrors(errors?.email)} />
        </Field>

        <Field data-invalid={Boolean(errors?.password)}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors?.password)}
            required
          />
          <FieldError errors={toErrors(errors?.password)} />
        </Field>

        <BotCheckField botCheck={botCheck} errors={errors?.turnstileToken} />

        <Button type="submit" disabled={pending || !botCheck.token}>
          {pending ? "Sending code…" : botCheck.token ? "Sign up" : "Checking if you're human…"}
        </Button>
      </FieldGroup>
    </form>
  )
}

function VerifyEmailForm({ email, onBack }: { email: string; onBack: () => void }) {
  const [state, formAction, pending, formProps] = useAuthForm(verifyEmailAction)
  const errors = state.fieldErrors

  return (
    <form action={formAction} {...formProps} noValidate>
      <FieldGroup>
        <input type="hidden" name="email" value={email} />

        <Field data-invalid={Boolean(errors?.otp)}>
          <FieldLabel htmlFor="otp">Verification code</FieldLabel>
          <FieldDescription>6-digit code sent to {email}</FieldDescription>
          <Input
            id="otp"
            name="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            aria-invalid={Boolean(errors?.otp)}
            required
          />
          <FieldError errors={toErrors(errors?.otp)} />
        </Field>

        {/* Stacked buttons sit as close as the demo account buttons */}
        <div className="flex flex-col gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Verifying…" : "Verify and create account"}
          </Button>
          <Button type="button" variant="outline" onClick={onBack}>
            Use another email or send a new code
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
