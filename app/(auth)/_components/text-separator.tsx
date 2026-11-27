import type { ReactNode } from "react"

import { FieldSeparator } from "@/components/ui/field"

/*
A dashed line with text in its middle ("Or"), dashed like the dividers elsewhere (divider-dashed).
The text sits on the card's background, not the page's, so the line stops at its edges
*/
export function TextSeparator({ children }: { children: ReactNode }) {
  return (
    <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card *:data-[slot=separator]:divider-dashed *:data-[slot=separator]:h-0 *:data-[slot=separator]:bg-transparent">
      {children}
    </FieldSeparator>
  )
}
