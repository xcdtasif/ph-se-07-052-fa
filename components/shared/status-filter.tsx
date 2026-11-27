import Link from "next/link"

import { ScrollFade } from "@/components/ui/scroll-fade"
import { cn } from "@/lib/utils"

import { ActiveDot } from "./active-dot"
import { FadeWhileLinkPending } from "./scroll-link"

type StatusFilterProps<Status extends string> = {
  // The nav's accessible name, e.g. "Filter requests by status"
  label: string
  statuses: readonly Status[]
  // The selected status, undefined for all
  status?: Status
  // The URL that shows `status` (undefined for all), from the first page
  href: (status?: Status) => string
  statusLabel: (status: Status) => string
  // The status badge's colours
  statusColors: (status: Status) => string
  // Off where a status is always selected
  showAll?: boolean
  // The id of the list the strip filters, faded while a status loads
  listId: string
}

/*
One line of status pills in the badges' colours ("All", if shown, white with a thin ring), the
selected one with the dot under it. On a phone it scrolls sideways within the content width instead
of wrapping (ScrollFade). Picking a status keeps the scroll position, and the list's current
cards stay, faded, until that status's cards replace them.
*/
export function StatusFilter<Status extends string>({
  label,
  statuses,
  status,
  href,
  statusLabel,
  statusColors,
  showAll = true,
  listId,
}: StatusFilterProps<Status>) {
  const options = showAll ? [undefined, ...statuses] : statuses

  return (
    <nav aria-label={label}>
      <ScrollFade>
        <ul className="flex w-max gap-2">
          {options.map((option) => {
            const selected = option === status

            return (
              // Room under the pill for the dot
              <li key={option ?? "ALL"} className="relative pb-2">
                <Link
                  href={href(option)}
                  scroll={false}
                  aria-current={selected ? "page" : undefined}
                  className={cn(
                    // The focus ring sits inside the pill; the scrolling row clips anything outside
                    "focus-visible:ring-ring flex h-7 items-center rounded-full px-3 text-sm font-medium whitespace-nowrap outline-none hover:brightness-95 focus-visible:ring-2 dark:hover:brightness-125 focus-visible:ring-inset",
                    option
                      ? statusColors(option)
                      : "bg-card text-foreground ring-foreground/15 ring-1 ring-inset",
                  )}
                >
                  {option ? statusLabel(option) : "All"}
                  <FadeWhileLinkPending id={listId} />
                </Link>
                {selected && <ActiveDot />}
              </li>
            )
          })}
        </ul>
      </ScrollFade>
    </nav>
  )
}
