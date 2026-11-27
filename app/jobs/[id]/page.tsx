import { MapPin } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { ApiError } from "@/components/shared/api-error"
import { JobStatusBadge } from "@/components/shared/job-status-badge"
import { PageHeader } from "@/components/shared/page-header"
import { SkeletonText } from "@/components/shared/skeleton-text"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate, formatBdt } from "@/lib/format"
import { getJobPosting, ROLE_LABELS } from "@/lib/jobs"

import { ApplyAction } from "./_components/apply-action"

export async function generateMetadata({ params }: PageProps<"/jobs/[id]">): Promise<Metadata> {
  const result = await getJobPosting((await params).id)

  return { title: result.success ? result.data.title : "Job" }
}

// The grid both the details and their skeleton use
const GRID_CLASS = "grid gap-x-8 gap-y-6 lg:grid-cols-[minmax(0,1fr)_20rem]"

// A missing or malformed id is a 404 page; other failures show in place
async function JobDetails({ params }: Pick<PageProps<"/jobs/[id]">, "params">) {
  const result = await getJobPosting((await params).id)

  if (!result.success) {
    if (result.statusCode === 404 || result.statusCode === 400) {
      notFound()
    }

    return <ApiError error={result} />
  }

  const posting = result.data
  const details = [
    { label: "Role", value: ROLE_LABELS[posting.role] },
    { label: "Zone", value: posting.zone.name },
    { label: "Vacancies", value: String(posting.vacancies) },
    { label: "Apply by", value: formatDate(posting.deadline) },
  ]

  /*
  Phones read top to bottom: the title, the fee card, then the description. Desktop has two
  columns: the title and description on the left, the card on the right beside them
  */
  return (
    <div className={GRID_CLASS}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {ROLE_LABELS[posting.role]}
          </p>
          <JobStatusBadge status={posting.status} />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{posting.title}</h1>
        <p className="text-muted-foreground flex items-center gap-1 text-sm">
          <MapPin className="size-4 shrink-0" aria-hidden="true" />
          {posting.zone.name}
        </p>
      </div>

      {/*
      Sticks at the same offset it starts at, so it never shifts while scrolling:
      navbar (3.5rem + 1px border), main's top padding (2rem), the back link's row (2rem),
      gap (2rem)
      */}
      <aside className="lg:sticky lg:top-38.25 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
        <Card>
          <CardContent className="flex flex-col gap-4">
            <p className="text-2xl">
              <span className="font-semibold">{formatBdt(posting.applicationFee)}</span>
              <span className="text-muted-foreground text-sm"> application fee</span>
            </p>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              {details.map(({ label, value }) => (
                <div key={label} className="contents">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="truncate text-right">{value}</dd>
                </div>
              ))}
            </dl>
            {/* mt-2 on top of the 1rem gap is 1.5rem above the line, 1rem below */}
            <div className="divider-dashed mt-2 flex justify-center pt-4">
              <Suspense fallback={<div className="skeleton h-7 w-32 rounded-lg" />}>
                <ApplyAction posting={posting} />
              </Suspense>
            </div>
          </CardContent>
        </Card>
      </aside>

      <section aria-labelledby="description-heading" className="flex flex-col gap-2 lg:col-start-1">
        <h2 id="description-heading" className="text-lg font-semibold">
          About the job
        </h2>
        <p className="text-muted-foreground whitespace-pre-line">{posting.description}</p>
      </section>
    </div>
  )
}

// The page while the posting loads, in the same grid: title block, fee card, description
function JobDetailsSkeleton() {
  return (
    <div className={GRID_CLASS} aria-hidden="true">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <SkeletonText className="w-24 text-xs" />
          <div className="skeleton h-5 w-12 rounded-4xl" />
        </div>
        <SkeletonText className="w-2/3 text-2xl" />
        <SkeletonText className="w-40 text-sm" />
      </div>

      <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
        <Card>
          <CardContent className="flex flex-col gap-4">
            <SkeletonText className="w-48 text-2xl" />
            <div className="flex flex-col gap-2 text-sm">
              {Array.from({ length: 4 }, (_, index) => (
                <SkeletonText key={index} />
              ))}
            </div>
            <div className="divider-dashed mt-2 flex justify-center pt-4">
              <div className="skeleton h-7 w-32 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-2 lg:col-start-1">
        <SkeletonText className="w-32 text-lg" />
        <div>
          <SkeletonText />
          <SkeletonText />
          <SkeletonText className="w-1/2" />
        </div>
      </div>
    </div>
  )
}

export default function JobPage({ params }: PageProps<"/jobs/[id]">) {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader back={{ href: "/jobs", label: "All jobs" }} />
      <Suspense fallback={<JobDetailsSkeleton />}>
        <JobDetails params={params} />
      </Suspense>
    </div>
  )
}
