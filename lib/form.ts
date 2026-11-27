import type { ApiFailure } from "@/lib/api"

// What a form's server action returns to the form
export type FormState<Field extends string> = {
  success: boolean
  message: string
  fieldErrors?: Partial<Record<Field, string[]>>
  // Submitted values, sent back so the form keeps them after a failed submit
  values?: Partial<Record<Field, string>>
}

/*
Turns a failed backend response into a form state. Each of the backend's `errors` whose path
names one of the form's fields shows under that field.
*/
export const toFormError = <Field extends string>(
  failure: ApiFailure,
  values?: FormState<Field>["values"],
): FormState<Field> => {
  const fieldErrors: Partial<Record<string, string[]>> = {}

  for (const { path, message } of failure.errors) {
    fieldErrors[path] = [...(fieldErrors[path] ?? []), message]
  }

  return {
    success: false,
    message: failure.message,
    fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
    values,
  }
}

// A text field's value from FormData, or "" when it is missing or a file
export const formText = (formData: FormData, name: string) => {
  const value = formData.get(name)

  return typeof value === "string" ? value : ""
}
