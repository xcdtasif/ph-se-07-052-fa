import Link from "next/link"
import { Suspense } from "react"

import { ApiError } from "@/components/shared/api-error"
import { JobGrid, JobGridSkeleton } from "@/components/shared/job-grid"
import { buttonVariants } from "@/components/ui/button"
import { getOpenJobPostings } from "@/lib/jobs"

const FEATURED_COUNT = 3

async function LatestJobs() {
  const result = await getOpenJobPostings()

  // Only this section shows the failure; the rest of the home page still works
  if (!result.success) {
    return <ApiError error={result} />
  }

  // The nearest deadlines first
  const postings = result.data.slice(0, FEATURED_COUNT)

  if (postings.length === 0) {
    return <p className="empty-state">No open jobs right now. Check back soon.</p>
  }

  return <JobGrid postings={postings} />
}

export default function HomePage() {
  return (
    <div className="flex flex-col gap-16">
      <section className="flex flex-col items-center gap-4 py-12 text-center sm:py-20">
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Power outages, tracked to the fix
        </h1>
        <p className="text-muted-foreground max-w-xl text-lg text-pretty">
          Follow outages in your area until the power is back, and join the crews who keep the
          lights on.
        </p>
        <Link href="/jobs" className={buttonVariants({ size: "lg" })}>
          Browse jobs
        </Link>
      </section>

      <section aria-labelledby="jobs-heading" className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <h2 id="jobs-heading" className="text-2xl font-semibold tracking-tight">
            Closing soon
          </h2>
          <Link
            href="/jobs"
            className={buttonVariants({ variant: "outline", size: "sm", className: "text-sm" })}
          >
            View all
          </Link>
        </div>
        <Suspense fallback={<JobGridSkeleton count={FEATURED_COUNT} />}>
          <LatestJobs />
        </Suspense>
      </section>
    </div>
  )
}
