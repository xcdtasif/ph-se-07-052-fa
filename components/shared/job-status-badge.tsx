import { Badge } from "@/components/ui/badge"
import type { JobPostingStatus } from "@/lib/types"

import { PILL_COLORS } from "./pill-colors"

const STATUSES: Record<JobPostingStatus, { label: string; className: string }> = {
  OPEN: { label: "Open", className: PILL_COLORS.emerald },
  CLOSED: { label: "Closed", className: "bg-muted text-muted-foreground" },
}

export function JobStatusBadge({ status }: { status: JobPostingStatus }) {
  const { label, className } = STATUSES[status]

  return <Badge className={className}>{label}</Badge>
}
