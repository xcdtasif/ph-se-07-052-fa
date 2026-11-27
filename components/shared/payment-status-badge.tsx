import { Badge } from "@/components/ui/badge"
import type { PaymentStatus } from "@/lib/types"

import { PILL_COLORS } from "./pill-colors"

// Completed means paid, so it's green; failed means the checkout expired unpaid
const STATUSES: Record<PaymentStatus, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: PILL_COLORS.amber },
  COMPLETED: { label: "Completed", className: PILL_COLORS.emerald },
  FAILED: { label: "Failed", className: PILL_COLORS.red },
}

export const paymentStatusLabel = (status: PaymentStatus) => STATUSES[status].label

export const paymentStatusColors = (status: PaymentStatus) => STATUSES[status].className

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge className={paymentStatusColors(status)}>{paymentStatusLabel(status)}</Badge>
}
