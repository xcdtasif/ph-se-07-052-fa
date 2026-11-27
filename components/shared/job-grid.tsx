import type { JobPosting } from "@/lib/types"

import { JobCard, JobCardSkeleton } from "./job-card"

const GRID_CLASS = "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"

export function JobGrid({ postings }: { postings: JobPosting[] }) {
  return (
    <ul className={GRID_CLASS}>
      {postings.map((posting) => (
        <li key={posting.id} className="flex">
          <JobCard posting={posting} />
        </li>
      ))}
    </ul>
  )
}

export function JobGridSkeleton({ count }: { count: number }) {
  return (
    <div className={GRID_CLASS} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex">
          <JobCardSkeleton />
        </div>
      ))}
    </div>
  )
}
