"use client"

import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { useFormAction } from "@/hooks/use-form-action"

import { demoLoginAction } from "../_actions/auth-actions"
import { withBotCheckReset } from "./bot-check"
import { TextSeparator } from "./text-separator"

const ACCOUNTS = [
  { value: "customer", label: "Customer 01" },
  { value: "technician", label: "Technician 01" },
  { value: "zoneManager", label: "Zone Manager 01" },
  { value: "admin", label: "Admin 01" },
]

type DemoLoginProps = {
  // The login form's bot check, whose token these buttons send too
  botCheck: { token: string; reset: () => void }
}

/*
Logs in as a sample user in one click; the clicked button's value names the account. It always
opens the dashboard rather than `?redirectTo=`, to show what that role can do
*/
export function DemoLogin({ botCheck }: DemoLoginProps) {
  const router = useRouter()
  const [, formAction, pending] = useFormAction(
    withBotCheckReset(demoLoginAction, botCheck.reset),
    () => router.push("/dashboard"),
  )

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <TextSeparator>Or try a demo account</TextSeparator>
      <input type="hidden" name="turnstileToken" value={botCheck.token} />
      <div className="grid grid-cols-2 gap-2">
        {ACCOUNTS.map(({ value, label }) => (
          <Button
            key={value}
            type="submit"
            name="account"
            value={value}
            variant="outline"
            disabled={pending || !botCheck.token}
          >
            {label}
          </Button>
        ))}
      </div>
    </form>
  )
}
