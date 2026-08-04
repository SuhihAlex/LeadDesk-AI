import { NextResponse, type NextRequest } from "next/server"

import { ensureCurrentUserWorkspace } from "@/features/auth/ensure-workspace"
import { getSafeRedirectPath } from "@/features/auth/safe-redirect"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = getSafeRedirectPath(
    requestUrl.searchParams.get("next"),
    "/app",
  )
  const acceptingInvitation = next.startsWith("/invite/")

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=missing_confirmation_code", requestUrl.origin),
    )
  }

  const supabase = await createClient()

  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    return NextResponse.redirect(
      new URL("/login?error=confirmation_failed", requestUrl.origin),
    )
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.redirect(
      new URL("/login?error=session_failed", requestUrl.origin),
    )
  }

  if (!acceptingInvitation) {
    const company =
      typeof user.user_metadata.company === "string"
        ? user.user_metadata.company.trim()
        : ""

    try {
      await ensureCurrentUserWorkspace(
        supabase,
        company || `${user.email?.split("@")[0] ?? "LeadDesk"} Workspace`,
      )
    } catch {
      await supabase.auth.signOut()

      return NextResponse.redirect(
        new URL("/login?error=workspace_failed", requestUrl.origin),
      )
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin))
}