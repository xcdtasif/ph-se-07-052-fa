"use client"

import { useRouter } from "next/navigation"

import { useFormAction } from "@/hooks/use-form-action"
import type { FormState } from "@/lib/form"
import { safeRedirectPath } from "@/lib/redirect"

/*
Runs an auth server action from a form and, once the user is logged in, goes to the page in
`?redirectTo=` (set by the proxy when it sent them to log in, or by the Log in and Sign up links)
or to the home page. The query is read from `window.location` at submit time so the form doesn't
need `useSearchParams`, which would keep it out of the prerendered page.
*/
export const useAuthForm = <Field extends string>(
  action: (formData: FormData) => Promise<FormState<Field>>,
) => {
  const router = useRouter()

  return useFormAction(action, () =>
    router.push(safeRedirectPath(new URLSearchParams(window.location.search).get("redirectTo"))),
  )
}
