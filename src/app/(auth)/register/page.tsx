import Link from "next/link"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { RegisterForm } from "@/features/auth/register-form"

type RegisterPageProps = {
  searchParams: Promise<{
    next?: string
  }>
}

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const params = await searchParams

  const nextPath =
    params.next?.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : undefined
  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="px-6 pt-6 sm:px-8 sm:pt-8">
        <h1 className="text-3xl font-semibold tracking-[-0.03em]">
          Create your workspace
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Start with a focused CRM built for website and SaaS project
          inquiries.
        </p>
      </CardHeader>

      <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8">
        <RegisterForm nextPath={nextPath} />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href={
              nextPath
                ? `/login?next=${encodeURIComponent(nextPath)}`
                : "/login"
            }
            className="font-medium text-primary hover:underline"
          >
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}