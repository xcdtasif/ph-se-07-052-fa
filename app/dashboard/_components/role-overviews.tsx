import {
  Ban,
  Briefcase,
  CircleCheck,
  CircleDot,
  Clock,
  Hammer,
  Link2,
  ListChecks,
  MapPin,
  Network,
  ShieldCheck,
  UserCog,
  Users,
  Wallet,
  Wrench,
  X,
  Zap,
} from "lucide-react"
import type { ReactNode } from "react"

import { ApiError } from "@/components/shared/api-error"
import { SkeletonText } from "@/components/shared/skeleton-text"
import type { ApiFailure } from "@/lib/api"
import { authFetch } from "@/lib/auth-fetch"
import { applicationsHref, type DashboardRole } from "@/lib/dashboard"
import { formatBdt } from "@/lib/format"
import type { AdminStats, User } from "@/lib/types"

import { StatSections, type StatSection } from "./stat-cards"

/*
Each role's figures on `/dashboard`. A figure opens its list once that list has a page; until then
it's a plain card
*/
const SECTIONS: Record<DashboardRole, StatSection<string>[]> = {
  CUSTOMER: [
    {
      title: "Applications",
      stats: [
        {
          key: "unpaid",
          label: "Waiting for the fee",
          icon: Wallet,
          note: "Pay the fee to send them for review",
          href: applicationsHref("PAYMENT_PENDING"),
        },
        {
          key: "submitted",
          label: "Submitted",
          icon: Clock,
          note: "Paid, waiting for the poster's review",
          href: applicationsHref("SUBMITTED"),
        },
        {
          key: "shortlisted",
          label: "Shortlisted",
          icon: ListChecks,
          note: "On the shortlist, one step from a hire",
          href: applicationsHref("SHORTLISTED"),
        },
      ],
    },
  ],
  TECHNICIAN: [
    {
      title: "Your outages",
      stats: [
        { key: "assigned", label: "Assigned", icon: Wrench, note: "Waiting for you to start work" },
        { key: "inProgress", label: "In progress", icon: Hammer, note: "Being fixed now" },
        { key: "restored", label: "Restored", icon: CircleCheck, note: "Power back on" },
      ],
    },
  ],
  ZONE_MANAGER: [
    {
      title: "Outages in your zone",
      stats: [
        {
          key: "confirmed",
          label: "Unassigned",
          icon: Zap,
          note: "Confirmed, needing a technician",
        },
        { key: "assigned", label: "Assigned", icon: Wrench, note: "Waiting for the technician" },
        { key: "inProgress", label: "In progress", icon: Hammer, note: "Being fixed now" },
      ],
    },
    {
      title: "Outage reports",
      stats: [
        {
          key: "pending",
          label: "Pending",
          icon: CircleDot,
          note: "Waiting for you to confirm or dismiss",
        },
        { key: "linked", label: "Linked", icon: Link2, note: "Part of a confirmed outage" },
        { key: "dismissed", label: "Dismissed", icon: X, note: "Not an outage" },
      ],
    },
  ],
  ADMIN: [
    {
      title: "Users",
      stats: [
        { key: "users", label: "All", icon: Users, note: "Every account" },
        {
          key: "customers",
          label: "Customers",
          icon: MapPin,
          note: "With an electricity connection",
        },
        { key: "banned", label: "Banned", icon: Ban, note: "Locked out until they're unbanned" },
      ],
    },
    {
      title: "Staff",
      stats: [
        { key: "admins", label: "Admins", icon: ShieldCheck, note: "Running the company" },
        { key: "zoneManagers", label: "Zone Managers", icon: UserCog, note: "One per zone" },
        {
          key: "technicians",
          label: "Technicians",
          icon: Wrench,
          note: "Fixing outages in their zone",
        },
      ],
    },
    {
      title: "Grid",
      stats: [
        { key: "zones", label: "Zones", icon: Network, note: "Each with its own staff" },
        { key: "feeders", label: "Feeders", icon: Zap, note: "Lines that supply the areas" },
        { key: "areas", label: "Areas", icon: MapPin, note: "Where customers live" },
      ],
    },
    {
      title: "Outages",
      stats: [
        { key: "active", label: "Active", icon: Zap, note: "Not restored yet" },
        {
          key: "pendingReports",
          label: "Pending reports",
          icon: CircleDot,
          note: "Waiting for a Zone Manager",
        },
        { key: "restored", label: "Restored", icon: CircleCheck, note: "Power back on" },
      ],
    },
    {
      title: "Hiring",
      stats: [
        {
          key: "openPostings",
          label: "Open postings",
          icon: Briefcase,
          note: "Taking applications",
        },
        { key: "inReview", label: "In review", icon: ListChecks, note: "Submitted or shortlisted" },
        {
          key: "collected",
          label: "Fees collected",
          icon: Wallet,
          note: "From completed payments",
        },
      ],
    },
  ],
}

type Loaded = { values: Record<string, ReactNode> } | { failure: ApiFailure }

// Every figure of the role's sections as a skeleton line
export function RoleOverviewSkeleton({ role }: { role: DashboardRole }) {
  const figure = <SkeletonText className="w-24" />
  const values = Object.fromEntries(
    SECTIONS[role].flatMap(({ stats }) => stats.map(({ key }) => [key, figure])),
  )

  return (
    <div aria-hidden="true">
      <StatSections sections={SECTIONS[role]} values={values} />
    </div>
  )
}

// Each list's total, from a page of one, under the same keys; or the first failure
const totalsOf = async (paths: Record<string, string>): Promise<Loaded> => {
  const results = await Promise.all(
    Object.values(paths).map((path) =>
      authFetch<unknown[]>(`${path}${path.includes("?") ? "&" : "?"}limit=1`),
    ),
  )
  const values: Record<string, number> = {}

  for (const [index, key] of Object.keys(paths).entries()) {
    const result = results[index]

    if (!result.success) {
      return { failure: result }
    }

    values[key] = result.meta?.total ?? result.data.length
  }

  return { values }
}

// The admin's figures, all from one stats call
const adminValues = async (): Promise<Loaded> => {
  const result = await authFetch<AdminStats>("/admin/stats")

  if (!result.success) {
    return { failure: result }
  }

  const { users, grid, outages, reports, hiring, payments } = result.data

  return {
    values: {
      ...users,
      users: users.total,
      ...grid,
      active: outages.active,
      pendingReports: reports.PENDING,
      restored: outages.byStatus.RESTORED,
      openPostings: hiring.openPostings,
      inReview: hiring.applications.SUBMITTED + hiring.applications.SHORTLISTED,
      collected: formatBdt(payments.collected),
    },
  }
}

const loadValues = (user: User, role: DashboardRole): Promise<Loaded> => {
  switch (role) {
    case "ADMIN":
      return adminValues()
    case "ZONE_MANAGER": {
      const outages = `/outages?zoneId=${user.employee?.zoneId}`

      return totalsOf({
        confirmed: `${outages}&status=CONFIRMED`,
        assigned: `${outages}&status=ASSIGNED`,
        inProgress: `${outages}&status=IN_PROGRESS`,
        pending: "/outage-reports?status=PENDING",
        linked: "/outage-reports?status=LINKED",
        dismissed: "/outage-reports?status=DISMISSED",
      })
    }
    case "TECHNICIAN":
      return totalsOf({
        assigned: "/outages/assigned?status=ASSIGNED",
        inProgress: "/outages/assigned?status=IN_PROGRESS",
        restored: "/outages/assigned?status=RESTORED",
      })
    case "CUSTOMER":
      return totalsOf({
        unpaid: "/applications/me?status=PAYMENT_PENDING",
        submitted: "/applications/me?status=SUBMITTED",
        shortlisted: "/applications/me?status=SHORTLISTED",
      })
  }
}

// Per-user, uncached: reads cookies, so it sits inside <Suspense>
export async function RoleOverview({ user, role }: { user: User; role: DashboardRole }) {
  const loaded = await loadValues(user, role)

  if ("failure" in loaded) {
    return <ApiError error={loaded.failure} />
  }

  return <StatSections sections={SECTIONS[role]} values={loaded.values} />
}
