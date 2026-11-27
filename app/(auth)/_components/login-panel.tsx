"use client"

import { useBotCheck } from "./bot-check"
import { DemoLogin } from "./demo-login"
import { GoogleLoginButton } from "./google-login"
import { LoginForm } from "./login-form"

// The login form and the demo buttons share one bot check, so the page shows one widget
export function LoginPanel() {
  const botCheck = useBotCheck()

  return (
    <div className="flex flex-col gap-6">
      <LoginForm botCheck={botCheck} />
      <GoogleLoginButton />
      <DemoLogin botCheck={botCheck} />
    </div>
  )
}
