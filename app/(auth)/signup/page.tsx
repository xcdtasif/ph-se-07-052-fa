import type { Metadata } from "next"
import Link from "next/link"

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
          <Link href="/login" className="text-foreground link-underline">
            Log in
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignupFlow />
      </CardContent>
    </Card>
  )
}
