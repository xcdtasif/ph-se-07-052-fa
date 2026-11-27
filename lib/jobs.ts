import "server-only"
import { cacheLife } from "next/cache"

import { apiFetch } from "@/lib/api"
import type { EmployeeRole, JobPosting } from "@/lib/types"

/*
Public reads, kept for seconds like outages: the backend caches them too and drops its copy on
every change, so a reload soon shows a closed posting or a new one
*/
export const getOpenJobPostings = async () => {
  "use cache"
  cacheLife("seconds")

  return apiFetch<JobPosting[]>("/job-postings?status=OPEN&sortBy=deadline&sortOrder=asc&limit=50")
}

// 404 for a missing or deleted posting, 400 for a malformed id
export const getJobPosting = async (id: string) => {
  "use cache"
  cacheLife("seconds")

  return apiFetch<JobPosting>(`/job-postings/${encodeURIComponent(id)}`)
}

export const ROLE_LABELS: Record<EmployeeRole, string> = {
  ADMIN: "Admin",
  ZONE_MANAGER: "Zone Manager",
  TECHNICIAN: "Technician",
}
