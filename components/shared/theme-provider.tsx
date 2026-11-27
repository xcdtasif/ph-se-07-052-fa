"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ReactNode } from "react"

/*
next-themes' script sets the theme's class before the page paints. Logging out re-creates the
root layout on the client, where React warns about any script it creates, since it won't run
there anyway. On the client the script is marked as data, which React doesn't warn about; the
server's copy keeps running, and the script ignores the mismatch in hydration
*/
const scriptProps = typeof window === "undefined" ? undefined : { type: "application/json" }

// The device's theme until the toggle picks one; no transitions while it switches
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      scriptProps={scriptProps}
    >
      {children}
    </NextThemesProvider>
  )
}
