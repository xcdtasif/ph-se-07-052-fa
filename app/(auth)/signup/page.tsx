import type { Metadata } from "next"

import { AuthLink } from "@/components/shared/auth-link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { SignupFlow } from "../_components/signup-flow"

export const metadata: Metadata = {
  title: "Sign up",
}

export default function SignupPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>
          <h1>Sign up</h1>
        </CardTitle>
        <CardDescription>
          Already have an account?{" "}
          <AuthLink href="/login" className="text-foreground link-underline">
            Log in
          </AuthLink>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignupFlow />
      </CardContent>
    </Card>
  )
}
