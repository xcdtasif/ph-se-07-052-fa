import type { Metadata } from "next"
import { Suspense } from "react"

import { ApiError } from "@/components/shared/api-error"
import { JobGrid, JobGridSkeleton } from "@/components/shared/job-grid"
import { PageHeader } from "@/components/shared/page-header"
import { getOpenJobPostings } from "@/lib/jobs"

export const metadata: Metadata = {
  title: "Jobs",
}

// Open postings, the nearest deadline first
async function OpenJobs() {
  const result = await getOpenJobPostings()

  if (!result.success) {
    return <ApiError error={result} />
  }

  if (result.data.length === 0) {
    return <p className="empty-state">No open jobs right now. Check back soon.</p>
  }

  return <JobGrid postings={result.data} />
}

export default function JobsPage() {
  return (
    <section className="flex flex-col gap-6">
      <PageHeader title="Jobs" />
      <Suspense fallback={<JobGridSkeleton count={6} />}>
        <OpenJobs />
      </Suspense>
    </section>
  )
}
