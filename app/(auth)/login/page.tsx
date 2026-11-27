import type { Metadata } from "next"

import { AuthLink } from "@/components/shared/auth-link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { LoginPanel } from "../_components/login-panel"

export const metadata: Metadata = {
  title: "Log in",
}

export default function LoginPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>
          <h1>Log in</h1>
        </CardTitle>
        <CardDescription>
          New to GridLine?{" "}
          <AuthLink href="/signup" className="text-foreground link-underline">
            Sign up
          </AuthLink>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginPanel />
      </CardContent>
    </Card>
  )
}
