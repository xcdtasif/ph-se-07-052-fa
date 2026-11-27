import type { Metadata } from "next"
import { Suspense } from "react"

import { PageHeader } from "@/components/shared/page-header"
import { parseStatus } from "@/lib/dashboard"
import { parsePage } from "@/lib/pagination"
import { APPLICATION_STATUSES } from "@/lib/types"

import {
  ApplicationStatusFilter,
  MyApplications,
  MyApplicationsSkeleton,
} from "./_components/my-applications"

export const metadata: Metadata = {
  title: "Applications",
}

/*
Reads the URL, so it renders at request time. A new status or page keeps the current rows, faded,
until the next ones swap in, so nothing above them moves
*/
async function ApplicationsList({
  searchParams,
}: Pick<PageProps<"/dashboard/applications">, "searchParams">) {
  const query = await searchParams
  const page = parsePage(query.page)
  const status = parseStatus(APPLICATION_STATUSES, query.status)

  return (
    <div className="flex flex-col gap-6">
      <ApplicationStatusFilter status={status} />
      {/* A page change jumps here, to the top of the table */}
      <div id="applications" className="jump-target-4">
        <Suspense fallback={<MyApplicationsSkeleton />}>
          <MyApplications page={page} status={status} />
        </Suspense>
      </div>
    </div>
  )
}

// The first load: the status pills' row too, so the table doesn't move down when it arrives
function ApplicationsPageSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <div className="skeleton h-9 w-full max-w-xl rounded-lg" />
      <MyApplicationsSkeleton />
    </div>
  )
}

export default function ApplicationsPage({ searchParams }: PageProps<"/dashboard/applications">) {
  return (
    <section className="flex flex-col gap-6">
      <PageHeader title="Applications" />
      <Suspense fallback={<ApplicationsPageSkeleton />}>
        <ApplicationsList searchParams={searchParams} />
      </Suspense>
    </section>
  )
}
