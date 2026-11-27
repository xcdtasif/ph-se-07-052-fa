import type { Metadata } from "next"
import { Suspense } from "react"

import { ApiError } from "@/components/shared/api-error"
import { PageHeader } from "@/components/shared/page-header"
import { SkeletonText } from "@/components/shared/skeleton-text"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUser } from "@/lib/auth-fetch"
import { ROLE_LABELS } from "@/lib/jobs"
import type { User } from "@/lib/types"

import { ProfileForm } from "./_components/profile-form"

export const metadata: Metadata = {
  title: "Profile",
}

// A user can hold a customer profile and one job at once, or neither yet
const rolesOf = ({ employee, customer }: User) =>
  [employee && ROLE_LABELS[employee.role], customer && "Customer"].filter(Boolean).join(", ") ||
  "None yet"

async function ProfileDetails() {
  const result = await getCurrentUser()

  // The proxy lets the page through on an unverified token; the backend has the final say
  if (!result.success) {
    return <ApiError error={result} />
  }

  const user = result.data
  const details = [
    { label: "Name", value: user.name },
    { label: "Email", value: user.email },
    { label: "Roles", value: rolesOf(user) },
    ...(user.customer ? [{ label: "Meter number", value: user.customer.meterNumber ?? "—" }] : []),
  ]

  return (
    <>
      <Card>
        <CardContent>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            {details.map(({ label, value }) => (
              <div key={label} className="contents">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="truncate">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Edit profile</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm name={user.name} />
        </CardContent>
      </Card>
    </>
  )
}

// Both cards while the user loads: their frames, a line per detail, and the form's field and button
function ProfileDetailsSkeleton() {
  return (
    <>
      <Card aria-hidden="true">
        <CardContent className="flex flex-col gap-2">
          {Array.from({ length: 3 }, (_, index) => (
            <SkeletonText key={index} />
          ))}
        </CardContent>
      </Card>

      <Card aria-hidden="true">
        <CardHeader>
          <SkeletonText className="w-28 text-base leading-snug" />
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <SkeletonText className="w-12 leading-snug" />
            <div className="skeleton h-8 rounded-lg" />
          </div>
          <div className="skeleton h-7 w-28 self-center rounded-lg" />
        </CardContent>
      </Card>
    </>
  )
}

export default function ProfilePage() {
  return (
    <section className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <PageHeader title="Profile" />
      <Suspense fallback={<ProfileDetailsSkeleton />}>
        <ProfileDetails />
      </Suspense>
    </section>
  )
}
