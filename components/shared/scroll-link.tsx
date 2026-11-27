"use client"

import Link, { useLinkStatus } from "next/link"
import { useEffect, useLayoutEffect, type ComponentProps } from "react"

// The list to scroll once the page a ScrollLink opened has rendered
let pending: { id: string; href: string } | null = null

type ScrollLinkProps = Omit<ComponentProps<typeof Link>, "scroll" | "onClick" | "href"> & {
  href: string
  // The id of the list to bring into view
  scrollTo: string
}

/*
A link that, instead of Next's scroll to the top of the page, scrolls the list it
updates so its first card sits one card gap below the navbar (the list's jump-target-N
class). The scroll waits for the new page's list (ScrollOnArrival), so a skeleton of a
different height in between doesn't make it jump twice.
*/
export function ScrollLink({ scrollTo, href, children, ...props }: ScrollLinkProps) {
  return (
    <Link
      {...props}
      href={href}
      scroll={false}
      onClick={() => {
        pending = { id: scrollTo, href }
      }}
    >
      {children}
      <FadeWhileLinkPending id={scrollTo} />
    </Link>
  )
}

/*
Marks the list with this id data-pending while `pending`, which fades its current cards (the
jump-target-N class) until the next ones replace them. For any in-page change that keeps the
current cards on screen instead of showing a skeleton: a page link, a status pill, a filter.
*/
export function useFadeWhilePending(id: string, pending: boolean) {
  useEffect(() => {
    const list = document.getElementById(id)

    if (!pending || !list) {
      return
    }

    list.setAttribute("data-pending", "")

    return () => list.removeAttribute("data-pending")
  }, [id, pending])
}

// Fades the list while the link it sits in loads; inside the link, as useLinkStatus requires
export function FadeWhileLinkPending({ id }: { id: string }) {
  const { pending } = useLinkStatus()

  useFadeWhilePending(id, pending)

  return null
}

/*
Rendered with a list's real content (in its Pagination), so it runs when the new page's
list commits, not a skeleton. Before paint, so the list shows in place right away. After
every render, since a page change can update the list in place without remounting it.
*/
export function ScrollOnArrival({ id }: { id: string }) {
  useLayoutEffect(() => {
    if (pending?.id !== id || pending.href !== location.pathname + location.search) {
      return
    }

    pending = null
    document.getElementById(id)?.scrollIntoView({ block: "start" })
  })

  return null
}
