import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { ThemeProvider } from "@/components/shared/theme-provider"
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
      {/* Browser extensions add attributes to the body before React loads */}
      <body className="flex min-h-dvh flex-col" suppressHydrationWarning>
        <ThemeProvider>
          <main id="main" className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8">
            {children}
          </main>
          <Toaster richColors position="top-center" duration={3000} />
        </ThemeProvider>
      </body>
    </html>
  )
}
