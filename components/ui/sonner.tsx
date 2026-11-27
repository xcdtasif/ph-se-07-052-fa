"use client"

import { Loader2Icon } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect } from "react"
import { toast, Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  /*
  A click or tap on a toast closes the toasts; Sonner has no click option, and a toast's element
  doesn't say which toast it is, so all of them go (usually just the one in front)
  */
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if ((event.target as Element).closest("[data-sonner-toast]")) {
        toast.dismiss()
      }
    }

    document.addEventListener("click", onClick)

    return () => document.removeEventListener("click", onClick)
  }, [])

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      // Text-only toasts: null hides the type icon (the colour already shows the type)
      icons={{
        success: null,
        info: null,
        warning: null,
        error: null,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          // `!` beats Sonner's own unlayered 13px font size; the pointer shows a click closes it
          toast: "cn-toast cursor-pointer justify-center text-center text-sm!",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
