import { z } from "zod"

import { nameSchema } from "@/lib/schemas"

// These mirror the backend rules in docs/api-docs/auth.md

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "Enter a valid email address" }))

// Filled in by the Turnstile widget once it has checked the visitor
const turnstileToken = z.string().min(1, { error: "Wait for the bot check to finish" })

export const loginSchema = z.object({
  email,
  password: z.string().min(1, { error: "Enter your password" }),
  turnstileToken,
})

export const signupSchema = z.object({
  name: nameSchema,
  email,
  // bcrypt reads only the first 72 bytes, so the backend refuses longer passwords
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters" })
    .refine((value) => new TextEncoder().encode(value).length <= 72, {
      error: "Password is too long",
    }),
  turnstileToken,
})

export const verifyEmailSchema = z.object({
  email,
  otp: z.string().regex(/^\d{6}$/, { error: "Enter the 6-digit code" }),
})

export type LoginField = keyof z.infer<typeof loginSchema>
export type SignupField = keyof z.infer<typeof signupSchema>
export type VerifyEmailField = keyof z.infer<typeof verifyEmailSchema>
