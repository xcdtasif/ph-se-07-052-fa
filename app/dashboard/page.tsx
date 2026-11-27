import type { Metadata } from "next"
import { Suspense } from "react"

import { ApiError } from "@/components/shared/api-error"
import { PageHeader } from "@/components/shared/page-header"
import { SkeletonText } from "@/components/shared/skeleton-text"
import { getCurrentUser } from "@/lib/auth-fetch"
import { DASHBOARD_SECTIONS, dashboardRoleOf } from "@/lib/dashboard"

import { RoleOverview, RoleOverviewSkeleton } from "./_components/role-overviews"
import { SectionCards } from "./_components/section-cards"

export const metadata: Metadata = {
  title: "Dashboard",
}

/*
The user's role decides both rows: its pages as cards, when it has any yet, then its figures,
which stream in after the user. Per-user, so it sits inside <Suspense>
*/
async function RoleDashboard() {
  const me = await getCurrentUser()

  if (!me.success) {
    return <ApiError error={me} />
  }

  const role = dashboardRoleOf(me.data)
  const sections = DASHBOARD_SECTIONS[role]

  return (
    <div className="flex flex-col gap-10">
      {sections.length > 0 && <SectionCards sections={sections} />}
      <Suspense fallback={<RoleOverviewSkeleton role={role} />}>
        <RoleOverview user={me.data} role={role} />
      </Suspense>
    </div>
  )
}

// Before the role is known: a heading and a row of cards, the shape every role starts with
function RoleDashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      <SkeletonText className="w-32 text-lg" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="skeleton h-27 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

// The status emails link here
export default function DashboardPage() {
  return (
    <section className="flex flex-col gap-6">
      <PageHeader title="Dashboard" />
      <Suspense fallback={<RoleDashboardSkeleton />}>
        <RoleDashboard />
      </Suspense>
    </section>
  )
}
