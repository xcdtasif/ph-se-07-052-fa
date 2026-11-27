"use client"

import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { loginAction } from "../_actions/auth-actions"
import { BotCheckField, withBotCheckReset } from "./bot-check"
import { useAuthForm } from "./use-auth-form"

const toErrors = (messages?: string[]) => messages?.map((message) => ({ message }))

type LoginFormProps = {
  // The shared bot check's widget, current token and reset
  botCheck: { widget: ReactNode; token: string; visible: boolean; reset: () => void }
}

export function LoginForm({ botCheck }: LoginFormProps) {
  const [state, formAction, pending, formProps] = useAuthForm(
    withBotCheckReset(loginAction, botCheck.reset),
  )
  const errors = state.fieldErrors

  return (
    <form action={formAction} {...formProps} noValidate>
      <FieldGroup>
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
            autoComplete="current-password"
            aria-invalid={Boolean(errors?.password)}
            required
          />
          <FieldError errors={toErrors(errors?.password)} />
        </Field>

        <BotCheckField botCheck={botCheck} errors={errors?.turnstileToken} />

        <Button type="submit" disabled={pending || !botCheck.token}>
          {pending ? "Logging in…" : botCheck.token ? "Log in" : "Checking if you're human…"}
        </Button>
      </FieldGroup>
    </form>
  )
}
