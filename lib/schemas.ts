import { z } from "zod"

// Field rules shared by more than one form. They mirror the backend's rules

export const nameSchema = z
  .string()
  .trim()
  .min(2, { error: "Name must be at least 2 characters" })
  .max(100, { error: "Name must be at most 100 characters" })
