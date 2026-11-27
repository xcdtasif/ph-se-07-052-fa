import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// How a checkout ended, centred in a card: an icon, a heading, any details, and the next step
export function PaymentOutcome({
  icon: Icon,
  iconClassName,
  title,
  children,
  action,
}: {
  icon: LucideIcon
  iconClassName?: string
  title: string
  children?: ReactNode
  action: ReactNode
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 pt-4 text-center">
        <Icon className={cn("size-10", iconClassName)} aria-hidden="true" />
        <h2 className="text-lg font-semibold">{title}</h2>
        {children}
        <div className="divider-dashed mt-2 flex w-full justify-center pt-4">{action}</div>
      </CardContent>
    </Card>
  )
}

export function PaymentNote({ children }: { children: ReactNode }) {
  return <p className="text-muted-foreground max-w-sm">{children}</p>
}
