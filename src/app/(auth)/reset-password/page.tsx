import { redirect } from "next/navigation"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ResetPasswordForm } from "@/features/auth/reset-password-form"
import { createClient } from "@/lib/supabase/server"

export default async function ResetPasswordPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/forgot-password")
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="px-6 pt-6 sm:px-8 sm:pt-8">
        <h1 className="text-3xl font-semibold tracking-[-0.03em]">
          Choose a new password
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Create a new password for your LeadDesk AI account.
        </p>
      </CardHeader>

      <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8">
        <ResetPasswordForm />
      </CardContent>
    </Card>
  )
}