import { z } from "zod"

import { nameSchema } from "@/lib/schemas"

// Mirrors PATCH /users/me in the backend docs/api-docs/user.md: only the name can change
export const profileSchema = z.object({ name: nameSchema })

export type ProfileField = keyof z.infer<typeof profileSchema>
