import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { Footer } from "@/components/shared/footer"
import { Navbar } from "@/components/shared/navbar"
import { ThemeProvider } from "@/components/shared/theme-provider"
import { buttonVariants } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"

import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "GridLine",
    template: "%s | GridLine",
  },
  description: "Load shedding schedules and outage reports for your area.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    /*
    next-themes sets the theme's class on <html> before React loads, so its hydration warnings
    are off too
    */
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      {/*
      The body is at least the screen's height as it is now, address bar shown or hidden, so the
      footer stays at the bottom of a short page on phones. Browser extensions add attributes to
      it before React loads, so its hydration warnings are off
      */}
      <body className="flex min-h-dvh flex-col" suppressHydrationWarning>
        <ThemeProvider>
          {/*
          The first stop for the keyboard: hidden until focused, it jumps past the navbar. Showing
          it resets the button's height and padding, so they're set again, and without transitions
          it doesn't grow from the hidden 1px
          */}
          <a
            href="#main"
            className={buttonVariants({
              size: "sm",
              className:
                "sr-only text-sm transition-none focus:not-sr-only focus:fixed focus:top-3 focus:left-4 focus:z-50 focus:h-7 focus:px-2.5",
            })}
          >
            Skip to content
          </a>
          <Navbar />
          <main id="main" className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8">
            {children}
          </main>
          <Footer />
          {/* Offsets keep toasts below the sticky navbar; 3s instead of Sonner's 4s */}
          <Toaster
            richColors
            position="top-center"
            duration={3000}
            offset={64}
            mobileOffset={{ top: 64 }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
