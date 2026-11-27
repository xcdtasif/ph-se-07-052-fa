"use client"

import Link from "next/link"

// Next scrolls to the top when the page changes, but not when you're already on the home page
export function HomeLink({
  className,
  onClick,
}: {
  className?: string
  // Runs too, e.g. to close the menu it sits in
  onClick?: () => void
}) {
  return (
    <Link
      href="/"
      className={className}
      onClick={() => {
        if (location.pathname === "/") window.scrollTo(0, 0)
        onClick?.()
      }}
    >
      GridLine
    </Link>
  )
}
