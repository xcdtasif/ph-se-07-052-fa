"use server"

import { refresh } from "next/cache"
import { redirect } from "next/navigation"

import { authFetch } from "@/lib/auth-fetch"
import { formText, toFormError, type FormState } from "@/lib/form"
import type { Application, Checkout } from "@/lib/types"

export type ApplyField = "phone" | "cv"

/*
Opens a Stripe Checkout for the application's fee and sends the user there. While one is open the
backend returns the same URL, so a retry or a double click doesn't start a second checkout
*/
const goToCheckout = async (applicationId: string): Promise<FormState<never>> => {
  const result = await authFetch<Checkout>(`/applications/${applicationId}/pay`, {
    method: "POST",
  })

  if (!result.success) {
    // A 409 means the application or posting changed, so show where it stands now
    if (result.statusCode === 409) {
      refresh()
    }

    return toFormError(result)
  }

  redirect(result.data.checkoutUrl)
}

/*
Applies with the phone number and CV, then goes straight on to paying the fee. If the checkout
can't open, the application stays and the page shows its Pay button
*/
export const applyAction = async (
  jobPostingId: string,
  formData: FormData,
): Promise<FormState<ApplyField>> => {
  const phone = formText(formData, "phone")
  const cv = formData.get("cv")

  const body = new FormData()
  body.set("phone", phone)

  // An empty file input still sends a nameless, empty file; leaving it out gets "Attach your CV"
  if (cv instanceof File && cv.size > 0) {
    body.set("cv", cv, cv.name)
  }

  const result = await authFetch<Application>(
    `/job-postings/${encodeURIComponent(jobPostingId)}/applications`,
    { method: "POST", body },
  )

  if (!result.success) {
    // Already applied or the posting closed: show the page as it is now
    if (result.statusCode === 409) {
      refresh()
    }

    return toFormError(result, { phone })
  }

  const payment = await goToCheckout(result.data.id)
  refresh()

  return { ...payment, message: `Applied, but the payment page didn't open: ${payment.message}` }
}

// The Pay button on an application waiting for its fee
export const payAction = async (applicationId: string) => goToCheckout(applicationId)
