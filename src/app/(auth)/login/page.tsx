import Link from "next/link"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { LoginForm } from "@/features/auth/login-form"

type LoginPageProps = {
  searchParams: Promise<{
    error?: string
    password?: string
  }>
}

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const params = await searchParams

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
        {params.password === "updated" && (
          <div
            role="status"
            className="mb-5 rounded-lg border border-success/25 bg-success/10 px-4 py-3 text-sm"
          >
            Your password has been updated. Log in with the new password.
          </div>
        )}

        {params.error && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm"
          >
            The confirmation link could not be completed. Request a new link or try
            logging in again.
          </div>
        )}
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