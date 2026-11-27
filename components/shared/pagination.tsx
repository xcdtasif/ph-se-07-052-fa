import { ChevronLeft, ChevronRight } from "lucide-react"
import type { ReactNode } from "react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { ActiveDot } from "./active-dot"
import { ScrollLink, ScrollOnArrival } from "./scroll-link"

// Page numbers shown at once; an odd count keeps the current page in the middle
const WINDOW = 5

type PaginationProps = {
  page: number
  totalPages: number
  // The URL of a page, keeping the rest of the current query
  href: (page: number) => string
  // The id of the list the pages belong to, scrolled into view on a page change
  scrollTo: string
  label?: string
}

const linkClass = buttonVariants({
  variant: "ghost",
  size: "icon-sm",
  className: "relative text-sm",
})

/*
< 3 4 5 6 7 >, the current page centred when there are pages on both sides, marked
with a dot. Each link prefetches its page (prefetch={true} resolves the URL's
searchParams ahead of the click), so cached pages swap in without a skeleton.
*/
export function Pagination({
  page,
  totalPages,
  href,
  scrollTo,
  label = "Pagination",
}: PaginationProps) {
  const first = Math.max(1, Math.min(page - (WINDOW - 1) / 2, totalPages - WINDOW + 1))
  const last = Math.min(totalPages, first + WINDOW - 1)
  const pages = Array.from({ length: last - first + 1 }, (_, index) => first + index)

  // Previous or Next, or a disabled look-alike at either end
  const stepLink = (target: number, ariaLabel: string, icon: ReactNode) =>
    target < 1 || target > totalPages ? (
      <span aria-disabled="true" className={cn(linkClass, "pointer-events-none opacity-50")}>
        {icon}
      </span>
    ) : (
      <ScrollLink
        href={href(target)}
        prefetch={true}
        scrollTo={scrollTo}
        aria-label={ariaLabel}
        className={linkClass}
      >
        {icon}
      </ScrollLink>
    )

  return (
    <nav aria-label={label} className="flex items-center justify-center gap-0.5">
      {stepLink(page - 1, "Previous page", <ChevronLeft aria-hidden="true" />)}
      {pages.map((target) => (
        <ScrollLink
          key={target}
          href={href(target)}
          prefetch={true}
          scrollTo={scrollTo}
          aria-label={`Page ${target}`}
          aria-current={target === page ? "page" : undefined}
          className={linkClass}
        >
          {target}
          {target === page && <ActiveDot />}
        </ScrollLink>
      ))}
      {stepLink(page + 1, "Next page", <ChevronRight aria-hidden="true" />)}
      <ScrollOnArrival id={scrollTo} />
    </nav>
  )
}

// The page links' row while its list loads, as tall as the links, so nothing below moves when they arrive
export function PaginationSkeleton() {
  return (
    <div className="flex justify-center" aria-hidden="true">
      <div className="skeleton h-7 w-32 rounded-lg" />
    </div>
  )
}
