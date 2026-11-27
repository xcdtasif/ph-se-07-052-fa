import type { Metadata } from "next"
import Link from "next/link"

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
          <Link href="/signup" className="text-foreground link-underline">
            Sign up
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginPanel />
      </CardContent>
    </Card>
  )
}
