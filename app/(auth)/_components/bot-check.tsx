"use client"

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile"
import { useEffect, useRef, useState, type ReactNode } from "react"

import { Field, FieldError } from "@/components/ui/field"
import { cn } from "@/lib/utils"

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""

// How long the widget's "Success!" stays on screen before the field closes
const CLOSE_DELAY_MS = 1000

/*
The Cloudflare Turnstile widget and the token it produces once it has checked the visitor. A
token works once, so `reset` gets a new one after every submit, whether it succeeded or not.
Several forms on a page can share one widget by sending its token
*/
export const useBotCheck = () => {
  const ref = useRef<TurnstileInstance>(null)
  const [token, setToken] = useState("")
  // Whether Cloudflare is showing the widget, i.e. waiting for the visitor to click
  const [visible, setVisible] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(closeTimer.current), [])

  const show = () => {
    clearTimeout(closeTimer.current)
    setVisible(true)
  }

  // Waits a moment so the visitor sees the check pass before the field closes
  const hide = () => {
    clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setVisible(false), CLOSE_DELAY_MS)
  }

  const reset = () => {
    setToken("")
    ref.current?.reset()
  }

  const widget = (
    <Turnstile
      ref={ref}
      siteKey={SITE_KEY}
      onSuccess={setToken}
      onExpire={() => setToken("")}
      onError={() => setToken("")}
      onBeforeInteractive={show}
      onAfterInteractive={hide}
      options={{
        size: "flexible",
        // Stays hidden unless Cloudflare needs the visitor to click; most visitors never see it
        appearance: "interaction-only",
        // Follows the device's light or dark mode, like the site
        theme: "auto",
        language: "en",
        // The token travels in the forms' own hidden inputs
        responseField: false,
      }}
    />
  )

  return { token, visible, reset, widget }
}

type BotCheckFieldProps = {
  botCheck: { widget: ReactNode; token: string; visible: boolean }
  // The bot check's errors from the last submit
  errors?: string[]
}

/*
The widget in a form, with its token as a hidden input. While the widget is hidden the field
takes no room. It opens and closes with a short animation rather than jumping, so the fields
below it slide instead of flashing: the grid row grows from 0 to the widget's height, and the
negative margin cancels the form's gap above it while it's closed
*/
export function BotCheckField({ botCheck, errors }: BotCheckFieldProps) {
  const open = botCheck.visible || Boolean(errors?.length)

  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out",
        open ? "grid-rows-[1fr] opacity-100" : "-mt-5 grid-rows-[0fr] opacity-0",
      )}
    >
      <div className="min-h-0 overflow-hidden">
        <Field data-invalid={Boolean(errors?.length)}>
          {botCheck.widget}
          <input type="hidden" name="turnstileToken" value={botCheck.token} />
          <FieldError errors={errors?.map((message) => ({ message }))} />
        </Field>
      </div>
    </div>
  )
}

// Wraps a form action so the bot check gets a new token once the action has used this one
export const withBotCheckReset =
  <Result,>(action: (formData: FormData) => Promise<Result>, reset: () => void) =>
  async (formData: FormData) => {
    try {
      return await action(formData)
    } finally {
      reset()
    }
  }
