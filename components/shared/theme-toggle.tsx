"use client"

import { Moon, Sun, SunMoon } from "lucide-react"
import { useTheme } from "next-themes"
import { useSyncExternalStore } from "react"

import { Button } from "@/components/ui/button"

type Theme = "light" | "dark" | "system"

// Each press moves to the next choice: System, Light, Dark, then System again
const NEXT: Record<Theme, Theme> = { system: "light", light: "dark", dark: "system" }

const CHOICES: Record<Theme, { label: string; icon: typeof Sun }> = {
  system: { label: "System", icon: SunMoon },
  light: { label: "Light", icon: Sun },
  dark: { label: "Dark", icon: Moon },
}

// False on the server and while hydrating, true after: the saved choice is only known then
const subscribe = () => () => {}
const useMounted = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )

/*
One button cycling System, Light and Dark, showing the current choice: a sun and moon, a sun or
a moon, with the choice as its name and tooltip. next-themes keeps the choice in localStorage,
which the server can't read, so the button stays empty until the page is interactive
*/
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const mounted = useMounted()
  const current = mounted ? ((theme ?? "system") as Theme) : undefined
  const choice = current && CHOICES[current]

  return (
    <Button
      variant="ghost"
      size="icon"
      title={choice && `Theme: ${choice.label}`}
      onClick={() => current && setTheme(NEXT[current])}
    >
      {choice ? (
        <>
          <choice.icon className="size-5" aria-hidden="true" />
          <span className="sr-only">Theme: {choice.label}</span>
        </>
      ) : (
        <span className="sr-only">Theme</span>
      )}
    </Button>
  )
}
