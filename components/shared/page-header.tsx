import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

type PageHeaderProps = {
  // A button or link on the right, e.g. Add job posting
  action?: ReactNode
} & (
  | {
      // The page's heading
      title: string
      back?: undefined
    }
  | {
      // A link back to the list the page belongs to, in place of the heading
      back: { href: string; label: string }
      // A heading for screen readers, for a page with no visible one
      title?: string
    }
)

/*
Every page's top row: its heading, or a link back to its list, on the left and an optional
action on the right. The row is as tall as the heading (text-2xl, 2rem) with both centred in it,
so a back link's row is as tall as another page's heading and the top-right buttons sit in the
same place on every page.
*/
export function PageHeader({ title, back, action }: PageHeaderProps) {
  return (
    <div className="flex h-8 items-center justify-between gap-4">
      {back ? (
        <>
          {title && <h1 className="sr-only">{title}</h1>}
          <Link
            href={back.href}
            className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1 text-sm"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {back.label}
          </Link>
        </>
      ) : (
        <h1 className="truncate text-2xl font-semibold tracking-tight">{title}</h1>
      )}
      {action}
    </div>
  )
}
