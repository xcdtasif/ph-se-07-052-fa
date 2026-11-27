import { CreditCard, FileText, type LucideIcon } from "lucide-react"

import type { ApplicationStatus, EmployeeRole, PaymentStatus, User } from "./types"

export type DashboardSection = {
  href: string
  label: string
  icon: LucideIcon
}

/*
Whose dashboard a user sees: their job's, or the customer's for everyone else (users without a
customer profile yet included). A user can hold both, and the job's pages are the ones they work in
*/
export type DashboardRole = EmployeeRole | "CUSTOMER"

export const dashboardRoleOf = (user: User): DashboardRole => user.employee?.role ?? "CUSTOMER"

/*
Each role's dashboard pages, shown as cards at the top of `/dashboard`. Employees can't apply for
jobs, so applications and payments are the customer's
*/
export const DASHBOARD_SECTIONS: Record<DashboardRole, DashboardSection[]> = {
  CUSTOMER: [
    { href: "/dashboard/applications", label: "Applications", icon: FileText },
    { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
  ],
  TECHNICIAN: [],
  ZONE_MANAGER: [],
  ADMIN: [],
}

// A list page's URL for a status filter and page, leaving defaults out of the query
const listHref = (path: string, status?: string, page = 1) => {
  const query = new URLSearchParams()

  if (status) {
    query.set("status", status)
  }

  if (page > 1) {
    query.set("page", String(page))
  }

  const text = query.toString()

  return text ? `${path}?${text}` : path
}

export const applicationsHref = (status?: ApplicationStatus, page?: number) =>
  listHref("/dashboard/applications", status, page)

export const paymentsHref = (status?: PaymentStatus, page?: number) =>
  listHref("/dashboard/payments", status, page)

// `?status=` as one of `statuses`, undefined (all) for anything else
export const parseStatus = <Status extends string>(
  statuses: readonly Status[],
  value: string | string[] | undefined,
) => statuses.find((status) => status === value)
