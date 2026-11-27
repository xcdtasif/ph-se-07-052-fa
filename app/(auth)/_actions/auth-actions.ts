"use server"

import { redirect } from "next/navigation"
import { z } from "zod"

import { env } from "@/config/env"
import { apiFetch } from "@/lib/api"
import { clearAuthCookies, setAuthCookies } from "@/lib/auth-cookies"
import { authFetch } from "@/lib/auth-fetch"
import { getClientIp } from "@/lib/client-ip"
import { formText, toFormError, type FormState } from "@/lib/form"
import type { Session } from "@/lib/types"

import {
  loginSchema,
  signupSchema,
  verifyEmailSchema,
  type LoginField,
  type SignupField,
  type VerifyEmailField,
} from "../_schemas/auth-schemas"

const INVALID_FIELDS_MESSAGE = "Please fix the highlighted fields"

const invalid = <Field extends string>(
  error: z.ZodError,
  values?: FormState<Field>["values"],
): FormState<Field> => ({
  success: false,
  message: INVALID_FIELDS_MESSAGE,
  fieldErrors: z.flattenError(error).fieldErrors as FormState<Field>["fieldErrors"],
  values,
})

// Calls a backend endpoint that returns a session and stores its tokens as cookies
const startSession = async <Field extends string>(
  path: string,
  body: unknown,
  values?: FormState<Field>["values"],
): Promise<FormState<Field>> => {
  const result = await apiFetch<Session>(path, {
    method: "POST",
    body,
    clientIp: await getClientIp(),
  })

  if (!result.success) {
    return toFormError(result, values)
  }

  await setAuthCookies(result.data)

  return { success: true, message: result.message }
}

export const loginAction = async (formData: FormData): Promise<FormState<LoginField>> => {
  const values = { email: formText(formData, "email") }
  const parsed = loginSchema.safeParse({
    ...values,
    password: formText(formData, "password"),
    turnstileToken: formText(formData, "turnstileToken"),
  })

  if (!parsed.success) {
    return invalid(parsed.error, values)
  }

  return startSession("/auth/login", parsed.data, values)
}

/*
The sample users the backend seeds, for testers to log in without typing. Their passwords are
public in the backend's README, and keeping them here, on the server, means the client only sends
which account it wants. The admin's comes from env, as the backend seeds it from env.
*/
const DEMO_PASSWORD = "1a2s3d4f"

const demoAccounts = () => ({
  customer: { email: "customer01@example.com", password: DEMO_PASSWORD },
  technician: { email: "technician01@example.com", password: DEMO_PASSWORD },
  zoneManager: { email: "zonemanager01@example.com", password: DEMO_PASSWORD },
  admin: { email: env.DEMO_ADMIN_EMAIL, password: env.DEMO_ADMIN_PASSWORD },
})

export const demoLoginAction = async (formData: FormData): Promise<FormState<never>> => {
  const accounts = demoAccounts()
  const account = formText(formData, "account")
  const turnstileToken = formText(formData, "turnstileToken")

  if (!Object.hasOwn(accounts, account)) {
    return { success: false, message: "Unknown demo account" }
  }

  if (!turnstileToken) {
    return { success: false, message: "Wait for the bot check to finish" }
  }

  return startSession("/auth/login", {
    ...accounts[account as keyof typeof accounts],
    turnstileToken,
  })
}

// Called with the one-time code from Google's sign-in popup; the backend trades it with Google
export const googleLoginAction = async (code: string): Promise<FormState<never>> =>
  startSession("/auth/google", { code })

// Emails a code; the account is created by verifyEmailAction
export const signupAction = async (formData: FormData): Promise<FormState<SignupField>> => {
  const values = { name: formText(formData, "name"), email: formText(formData, "email") }
  const parsed = signupSchema.safeParse({
    ...values,
    password: formText(formData, "password"),
    turnstileToken: formText(formData, "turnstileToken"),
  })

  if (!parsed.success) {
    return invalid(parsed.error, values)
  }

  const result = await apiFetch<{ email: string }>("/auth/register", {
    method: "POST",
    body: parsed.data,
    clientIp: await getClientIp(),
  })

  if (!result.success) {
    return toFormError(result, values)
  }

  // The email as the backend stored it, for the code form
  return { success: true, message: result.message, values: { email: result.data.email } }
}

export const verifyEmailAction = async (
  formData: FormData,
): Promise<FormState<VerifyEmailField>> => {
  const values = { email: formText(formData, "email"), otp: formText(formData, "otp") }
  const parsed = verifyEmailSchema.safeParse(values)

  if (!parsed.success) {
    return invalid(parsed.error, values)
  }

  return startSession("/auth/verify-email", parsed.data, values)
}

/*
Ends the session on the backend (every device, as the backend bumps the token version) and
deletes the cookies here. The cookies go even if the backend call fails, so the user is always
logged out on this device. Redirecting here, rather than on the client, re-renders the page
without the session.
*/
export const logoutAction = async () => {
  await authFetch("/auth/logout", { method: "POST" })
  await clearAuthCookies()
  redirect("/")
}
