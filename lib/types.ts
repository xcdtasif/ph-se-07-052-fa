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

export type Tokens = {
  accessToken: string
  refreshToken: string
}

// What logging in, signing up and refreshing return
export type Session = Tokens & { user: User }
