import { Badge } from "@/components/ui/badge"
import type { ApplicationStatus } from "@/lib/types"

import { PILL_COLORS } from "./pill-colors"

// Waiting on the applicant is amber, on the poster blue or violet; hired is green
const STATUSES: Record<ApplicationStatus, { label: string; className: string }> = {
  PAYMENT_PENDING: { label: "Waiting for the fee", className: PILL_COLORS.amber },
  SUBMITTED: { label: "Submitted", className: PILL_COLORS.blue },
  SHORTLISTED: { label: "Shortlisted", className: PILL_COLORS.violet },
  HIRED: { label: "Hired", className: PILL_COLORS.emerald },
  REJECTED: { label: "Not selected", className: PILL_COLORS.red },
}

export const applicationStatusLabel = (status: ApplicationStatus) => STATUSES[status].label

export const applicationStatusColors = (status: ApplicationStatus) => STATUSES[status].className

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  return <Badge className={applicationStatusColors(status)}>{applicationStatusLabel(status)}</Badge>
}
