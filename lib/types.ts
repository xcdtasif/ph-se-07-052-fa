export const EMPLOYEE_ROLES = ["ADMIN", "ZONE_MANAGER", "TECHNICIAN"] as const

export type EmployeeRole = (typeof EMPLOYEE_ROLES)[number]

// The user object every auth endpoint returns (backend docs/api-docs/auth.md#user-object)
export type User = {
  id: string
  name: string
  email: string
  // The electricity connection; null until the user creates one
  customer: { id: string; areaId: string; meterNumber: string | null } | null
  // The active job at the company; null for a non-employee. zoneId is null for an admin
  employee: { id: string; role: EmployeeRole; zoneId: string | null } | null
}

// The grid (backend docs/api-docs/grid.md): a zone has feeders, a feeder supplies areas
export type Zone = {
  id: string
  name: string
  code: string
}

export type Feeder = {
  id: string
  zoneId: string
  name: string
  code: string
}

// What GET /areas returns: the area with its feeder and zone
export type Area = {
  id: string
  name: string
  feeder: Omit<Feeder, "zoneId"> & { zone: Zone }
}

// A planned power cut on one feeder (backend docs/api-docs/schedule.md). Times are UTC ISO strings
export const SLOT_STATUSES = ["TENTATIVE", "CONFIRMED", "CANCELLED"] as const

export type SlotStatus = (typeof SLOT_STATUSES)[number]

export type Slot = {
  id: string
  feederId: string
  startsAt: string
  endsAt: string
  status: SlotStatus
}

// GET /schedules: slots on Dhaka days `from` to `to` (YYYY-MM-DD), each with its feeder
export type Schedule = {
  from: string
  to: string
  slots: (Slot & { feeder: Pick<Feeder, "name" | "code"> })[]
}

export const OUTAGE_REPORT_STATUSES = ["PENDING", "LINKED", "DISMISSED"] as const

export type OutageReportStatus = (typeof OUTAGE_REPORT_STATUSES)[number]

// What a customer sees of their own report
export type OutageReport = {
  id: string
  status: OutageReportStatus
  description: string | null
  dismissReason: string | null
  // Set when LINKED; the status page is /outages/:outageId
  outageId: string | null
  createdAt: string
  updatedAt: string
  area: Pick<Area, "id" | "name">
}

// What a Zone Manager sees: the area's feeder and who reported
export type ZoneOutageReport = Omit<OutageReport, "area"> & {
  area: Pick<Area, "id" | "name"> & { feeder: Pick<Feeder, "id" | "name" | "code"> }
  customer: { meterNumber: string | null; user: { name: string } }
}

// An unplanned power cut, as the public status page shows it (backend docs/api-docs/outage.md)
export const OUTAGE_STATUSES = ["CONFIRMED", "ASSIGNED", "IN_PROGRESS", "RESTORED"] as const

export type OutageStatus = (typeof OUTAGE_STATUSES)[number]

// Set by the technician; required to restore
export const OUTAGE_CAUSES = [
  "TRANSFORMER_FAULT",
  "CABLE_DAMAGE",
  "EMERGENCY_MAINTENANCE",
  "TEMPORARY_TRIP",
  "OTHER",
] as const

export type OutageCause = (typeof OUTAGE_CAUSES)[number]

export type Outage = {
  id: string
  status: OutageStatus
  cause: OutageCause | null
  note: string | null
  confirmedAt: string
  assignedAt: string | null
  startedAt: string | null
  restoredAt: string | null
  updatedAt: string
  zone: Pick<Zone, "id" | "name">
  areas: (Pick<Area, "id" | "name"> & { feeder: Pick<Feeder, "id" | "name" | "code"> })[]
  reportCount: number
}

export type Tokens = {
  accessToken: string
  refreshToken: string
}

// What logging in, signing up and refreshing return
export type Session = Tokens & { user: User }

// An active employment, as GET /employees lists it (backend docs/api-docs/employee.md)
export type Employee = {
  id: string
  role: EmployeeRole
  createdAt: string
  endedAt: string | null
  // null for an admin
  zone: Zone | null
  user: { id: string; name: string; email: string }
  // The technician's assigned or in-progress outage
  activeJob: { id: string; status: OutageStatus } | null
}

// A job opening in one zone (backend docs/api-docs/job-posting.md)
export const JOB_POSTING_STATUSES = ["OPEN", "CLOSED"] as const

// CLOSED also once the deadline day has ended in Dhaka
export type JobPostingStatus = (typeof JOB_POSTING_STATUSES)[number]

export type JobPosting = {
  id: string
  // Zone Managers post TECHNICIAN jobs, admins ZONE_MANAGER jobs
  role: Exclude<EmployeeRole, "ADMIN">
  title: string
  description: string
  vacancies: number
  // Whole taka
  applicationFee: number
  // The last day to apply, e.g. "2026-12-31" (Dhaka)
  deadline: string
  status: JobPostingStatus
  createdAt: string
  updatedAt: string
  zone: Pick<Zone, "id" | "name" | "code">
}

export const APPLICATION_STATUSES = [
  "PAYMENT_PENDING",
  "SUBMITTED",
  "SHORTLISTED",
  "HIRED",
  "REJECTED",
] as const

// PAYMENT_PENDING until the fee is paid, then SUBMITTED for the poster to review
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

export type Application = {
  id: string
  status: ApplicationStatus
  phone: string
  // The CV, a PDF on Cloudinary
  cvUrl: string
  createdAt: string
  updatedAt: string
  jobPosting: Pick<JobPosting, "id" | "title" | "role" | "applicationFee" | "zone">
}

export const PAYMENT_STATUSES = ["PENDING", "COMPLETED", "FAILED"] as const

// Only Stripe's webhook changes it; FAILED means the checkout expired unpaid
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

export type Payment = {
  id: string
  // Whole taka
  amount: number
  currency: string
  status: PaymentStatus
  paidAt: string | null
  createdAt: string
  updatedAt: string
  application: Pick<Application, "id" | "status"> & {
    jobPosting: Pick<JobPosting, "id" | "title" | "role" | "zone">
  }
}

// Pay Application Fee: open checkoutUrl to pay on Stripe
export type Checkout = Payment & { checkoutUrl: string }
