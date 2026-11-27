import Link from "next/link"

import { logoutAction } from "@/app/(auth)/_actions/auth-actions"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUser } from "@/lib/auth-fetch"

const ROLE_LABELS = { ADMIN: "Admin", ZONE_MANAGER: "Zone Manager", TECHNICIAN: "Technician" }

// Who is logged in, as the backend sees it (GET /users/me), or links to log in
export async function SessionCard() {
  const result = await getCurrentUser()

  if (!result.success) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Not logged in</CardTitle>
          <CardDescription>
            {result.statusCode === 401 ? "Sign up or log in to continue." : result.message}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Link
            href="/signup"
            className={buttonVariants({ variant: "outline", className: "flex-1" })}
          >
            Sign up
          </Link>
          <Link href="/login" className={buttonVariants({ className: "flex-1" })}>
            Log in
          </Link>
        </CardContent>
      </Card>
    )
  }

  const { name, email, employee } = result.data

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{email}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="text-muted-foreground">Role</dt>
          <dd>{employee ? ROLE_LABELS[employee.role] : "Customer"}</dd>
          {employee?.zoneId && (
            <>
              <dt className="text-muted-foreground">Zone</dt>
              <dd className="truncate font-mono text-xs leading-5">{employee.zoneId}</dd>
            </>
          )}
        </dl>
        <form action={logoutAction}>
          <Button type="submit" variant="outline" className="w-full">
            Log out
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
