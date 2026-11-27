"use client"

import { GoogleOAuthProvider, useGoogleLogin, useGoogleOAuth } from "@react-oauth/google"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { safeRedirectPath } from "@/lib/redirect"

import { googleLoginAction } from "../_actions/auth-actions"
import { TextSeparator } from "./text-separator"

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""

// Google's "G" in its four colours, as its branding guidelines ask for on a custom button
function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  )
}

/*
Our own "Continue with Google" button, drawn with the page, so it's there from the start. A click
opens Google's account picker in a popup, which hands back a one-time code; the server action
sends it to the backend, which trades it with Google for the user's identity. Google's sign-in
stands in for the bot check here
*/
function GoogleButton() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  // The popup needs Google's script, which loads a moment after the page
  const { scriptLoadedSuccessfully } = useGoogleOAuth()

  const login = useGoogleLogin({
    flow: "auth-code",
    onSuccess: ({ code }) =>
      startTransition(async () => {
        const state = await googleLoginAction(code)

        if (!state.success) {
          toast.error(state.message)

          return
        }

        toast.success(state.message)
        router.push(safeRedirectPath(new URLSearchParams(window.location.search).get("redirectTo")))
      }),
    onError: () => toast.error("Google sign-in failed, try again"),
    // Closing the popup is the visitor changing their mind, not an error
    onNonOAuthError: ({ type }) => {
      if (type === "popup_failed_to_open") {
        toast.error("Allow popups for this site to continue with Google")
      }
    },
  })

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => login()}
      disabled={!scriptLoadedSuccessfully || pending}
    >
      <GoogleIcon />
      {pending ? "Signing in…" : "Continue with Google"}
    </Button>
  )
}

export function GoogleLoginButton() {
  return (
    <div className="flex flex-col gap-4">
      <TextSeparator>Or</TextSeparator>
      {/* English like the rest of the site, whatever the browser's or Google account's language */}
      <GoogleOAuthProvider clientId={CLIENT_ID} locale="en">
        <GoogleButton />
      </GoogleOAuthProvider>
    </div>
  )
}
