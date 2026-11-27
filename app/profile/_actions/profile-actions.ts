"use server"

import { refresh } from "next/cache"
import { z } from "zod"

import { authFetch } from "@/lib/auth-fetch"
import { formText, toFormError, type FormState } from "@/lib/form"
import type { User } from "@/lib/types"

import { profileSchema, type ProfileField } from "../_schemas/profile-schema"

export const updateProfileAction = async (formData: FormData): Promise<FormState<ProfileField>> => {
  const values = { name: formText(formData, "name") }
  const parsed = profileSchema.safeParse(values)

  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the highlighted fields",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    }
  }

  const result = await authFetch<User>("/users/me", { method: "PATCH", body: parsed.data })

  if (!result.success) {
    return toFormError(result, values)
  }

  // Re-render the page so the navbar and profile show the new name
  refresh()

  return { success: true, message: result.message, values: { name: result.data.name } }
}
