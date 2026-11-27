import type { Metadata } from "next"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Page not found",
}

export default function NotFound() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <p className="text-muted-foreground text-sm font-medium">404</p>
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-muted-foreground max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link href="/" className={buttonVariants()}>
        Back to home
      </Link>
    </section>
  )
}
