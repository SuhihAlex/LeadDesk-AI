import type { ReactNode } from "react"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

type ApplicationLayoutProps = {
  children: ReactNode
}

export default async function ApplicationLayout({
  children,
}: ApplicationLayoutProps) {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/login")
  }

  return children
}