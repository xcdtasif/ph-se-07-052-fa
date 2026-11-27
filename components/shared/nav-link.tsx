"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Suspense, type ReactNode } from "react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { ActiveDot } from "./active-dot"

type NavLinkProps = {
  href: string
  className?: string
  children: ReactNode
}

function NavLinkBase({ href, className, children, active }: NavLinkProps & { active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={buttonVariants({ variant: "ghost", className: cn("relative", className) })}
    >
      {children}
      {active && <ActiveDot />}
    </Link>
  )
}

// Active on its own page only, not the pages below it (/jobs, not /jobs/[id])
function ActiveNavLink(props: NavLinkProps) {
  return <NavLinkBase {...props} active={usePathname() === props.href} />
}

/*
usePathname suspends while prerendering a route with an unknown param (/jobs/[id]),
so the plain link shows until the path is known, at the same size
*/
export function NavLink(props: NavLinkProps) {
  return (
    <Suspense fallback={<NavLinkBase {...props} active={false} />}>
      <ActiveNavLink {...props} />
    </Suspense>
  )
}
