import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

// One figure on an overview: its label and icon, what it counts, and the list it opens, if any
export type Stat<Key extends string> = {
  key: Key
  label: string
  icon: LucideIcon
  note: string
  href?: string
}

/*
A card that opens a page, for the stat cards and the dashboard's section cards. On hover it
mixes in the text colour, 4% (7% in dark mode), a step past the page behind it, and its border
darkens to the outline buttons'
*/
export const CARD_LINK =
  "bg-card focus-visible:ring-ring/50 hover:border-foreground/25 flex flex-1 rounded-xl border p-4 transition-colors outline-none hover:bg-[color-mix(in_oklch,var(--card),var(--foreground)_4%)] focus-visible:ring-3 dark:hover:bg-[color-mix(in_oklch,var(--card),var(--foreground)_7%)]"

// The label and icon on top, the figure, then what it counts
function StatContent({ stat, value }: { stat: Stat<string>; value: ReactNode }) {
  const Icon = stat.icon

  return (
    <>
      <p className="text-muted-foreground flex items-center justify-between gap-2 text-sm">
        {stat.label}
        <Icon className="size-4 shrink-0" aria-hidden="true" />
      </p>
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      <p className="text-muted-foreground text-xs">{stat.note}</p>
    </>
  )
}

// One card per stat, with its figure; three to a row on desktop, two on a tablet, one on a phone
export function StatCards<Key extends string>({
  stats,
  values,
}: {
  stats: Stat<Key>[]
  values: Record<Key, ReactNode>
}) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <li key={stat.key} className="flex">
          {stat.href ? (
            <Link href={stat.href} className={cn(CARD_LINK, "flex-col gap-1")}>
              <StatContent stat={stat} value={values[stat.key]} />
            </Link>
          ) : (
            <div className="bg-card flex flex-1 flex-col gap-1 rounded-xl border p-4">
              <StatContent stat={stat} value={values[stat.key]} />
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

// A list's total from its first page of one
export const totalOf = <T,>(result: { data: T[]; meta?: { total: number } }) =>
  result.meta?.total ?? result.data.length

// A row of figures under its heading, e.g. Users or Outages
export type StatSection<Key extends string> = { title: string; stats: Stat<Key>[] }

export function StatSections<Key extends string>({
  sections,
  values,
}: {
  sections: StatSection<Key>[]
  values: Record<Key, ReactNode>
}) {
  return (
    <div className="flex flex-col gap-10">
      {sections.map(({ title, stats }) => (
        <section key={title} className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <StatCards stats={stats} values={values} />
        </section>
      ))}
    </div>
  )
}
