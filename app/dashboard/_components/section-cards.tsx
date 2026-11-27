import Link from "next/link"

import type { DashboardSection } from "@/lib/dashboard"
import { cn } from "@/lib/utils"

import { CARD_LINK } from "./stat-cards"

/*
The role's dashboard pages as cards under a Pages heading, like the figures' sections: the name
and icon. Three to a row on desktop, else two
*/
export function SectionCards({ sections }: { sections: DashboardSection[] }) {
  return (
    <nav aria-labelledby="dashboard-pages" className="flex flex-col gap-4">
      <h2 id="dashboard-pages" className="text-lg font-semibold tracking-tight">
        Pages
      </h2>
      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {sections.map(({ href, label, icon: Icon }) => (
          <li key={href} className="flex">
            <Link
              href={href}
              className={cn(CARD_LINK, "items-center justify-between gap-2 font-medium")}
            >
              {label}
              <Icon className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
