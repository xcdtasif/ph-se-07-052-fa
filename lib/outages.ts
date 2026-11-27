import "server-only"
import { cacheLife } from "next/cache"

import { apiFetch } from "@/lib/api"
import type { Outage } from "@/lib/types"

/*
One outage for its public status page. The backend caches it and drops that copy on every change,
so this keeps it only for seconds: the page and its metadata share one fetch, and a reload soon
shows the new status. 404 for a missing outage, 400 for a malformed id
*/
export const getOutage = async (id: string) => {
  "use cache"
  cacheLife("seconds")

  return apiFetch<Outage>(`/outages/${encodeURIComponent(id)}`)
}
