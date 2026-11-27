"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import type { MouseEvent, ReactNode } from "react"

const AUTH_PATHS = ["/login", "/signup"]

/*
The page to come back to after logging in: the page the link is on, or on the login and signup
pages, the one they were already sent back to. None from the home page, where they end up anyway.
*/
const returnPath = () => {
  const { pathname, search } = window.location

  if (AUTH_PATHS.includes(pathname)) {
    return new URLSearchParams(search).get("redirectTo")
  }

  return pathname === "/" ? null : `${pathname}${search}`
}

type AuthLinkProps = {
  href: "/login" | "/signup"
  className?: string
  // Runs too, e.g. to close the menu it sits in
  onClick?: () => void
  children: ReactNode
}

/*
A Log in or Sign up link that adds `?redirectTo=` for the current page when clicked. Read from
`window.location` at click time, so the link doesn't need `useSearchParams`, which would keep the
pages it's on out of the prerendered shell.
*/
export function AuthLink({ href, className, onClick, children }: AuthLinkProps) {
  const router = useRouter()

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.()

    // A new tab or window opens the plain link
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return
    }

    const path = returnPath()

    if (path) {
      event.preventDefault()
      router.push(`${href}?redirectTo=${encodeURIComponent(path)}`)
    }
  }

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  )
}
