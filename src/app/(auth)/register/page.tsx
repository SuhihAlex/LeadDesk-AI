import Link from "next/link"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { RegisterForm } from "@/features/auth/register-form"

export default function RegisterPage() {
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
        <RegisterForm />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}