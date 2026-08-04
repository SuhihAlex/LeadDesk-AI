import Link from "next/link"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { LoginForm } from "@/features/auth/login-form"

export default function LoginPage() {
  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="px-6 pt-6 sm:px-8 sm:pt-8">
        <h1 className="text-3xl font-semibold tracking-[-0.03em]">
          Welcome back
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Sign in to manage leads, qualification, tasks, and pipeline activity.
        </p>
      </CardHeader>

      <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8">
        <LoginForm />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to LeadDesk AI?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}