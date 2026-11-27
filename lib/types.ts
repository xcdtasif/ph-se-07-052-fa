export const EMPLOYEE_ROLES = ["ADMIN", "ZONE_MANAGER", "TECHNICIAN"] as const

export type EmployeeRole = (typeof EMPLOYEE_ROLES)[number]

// The user object every auth endpoint returns (backend docs/api-docs/auth.md#user-object)
export type User = {
  id: string
  name: string
  email: string
  // The active job at the company; null for a customer. zoneId is null for an admin
  employee: { id: string; role: EmployeeRole; zoneId: string | null } | null
}

export type Tokens = {
  accessToken: string
  refreshToken: string
}

// What logging in, signing up and refreshing return
export type Session = Tokens & { user: User }
