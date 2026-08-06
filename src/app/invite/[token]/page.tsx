import Link from "next/link"
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock3,
  Mail,
} from "lucide-react"

import { BrandLogo } from "@/components/layout/brand-logo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { acceptWorkspaceInvitationAction } from "@/features/workspace/actions"
import { getInvitationByToken } from "@/features/workspace/get-invitation-by-token"
import { formatDate } from "@/lib/format-date"
import { createClient } from "@/lib/supabase/server"

type InvitationPageProps = {
  params: Promise<{
    token: string
  }>
  searchParams: Promise<{
    error?: string
  }>
}

const errorMessages: Record<string, string> = {
  invalid: "The invitation link is invalid.",
  email_mismatch:
    "This invitation was issued to a different email address.",
  existing_workspace:
    "This account already belongs to another workspace. LeadDesk AI supports one workspace per user in the MVP.",
  member_limit:
    "This workspace has reached the Free plan limit of one member. The Owner must upgrade the workspace before another member can join.",
  expired: "This invitation has expired.",
  unavailable: "This invitation is no longer available.",
  accept_failed:
    "The invitation could not be accepted. Please try again.",
}

export default async function InvitationPage({
  params,
  searchParams,
}: InvitationPageProps) {
  const { token } = await params
  const query = await searchParams

  const invitation = await getInvitationByToken(token)
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!invitation) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <BrandLogo />
          </CardHeader>

          <CardContent className="py-12 text-center">
            <AlertCircle
              className="mx-auto size-10 text-destructive"
              aria-hidden="true"
            />

            <h1 className="mt-5 text-2xl font-semibold">
              Invitation not found
            </h1>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              The invitation link is invalid or has been removed.
            </p>

            <Button className="mt-6" asChild>
              <Link href="/">Return home</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  const expired = invitation.isExpired
  const available = invitation.status === "pending" && !expired
  const nextPath = `/invite/${token}`

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4 sm:p-6">
      <Card className="w-full max-w-xl">
        <CardHeader className="border-b">
          <BrandLogo />

          <div className="pt-5">
            <Badge variant={available ? "secondary" : "outline"}>
              {expired ? "Expired" : invitation.status}
            </Badge>

            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">
              Join {invitation.workspace.name}
            </h1>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              You have been invited to join this LeadDesk AI workspace as a
              Member.
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {query.error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm"
            >
              <AlertCircle
                className="mt-0.5 size-4 shrink-0 text-destructive"
                aria-hidden="true"
              />
              <p>
                {errorMessages[query.error] ??
                  errorMessages.accept_failed}
              </p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border p-4">
              <Building2
                className="size-5 text-primary"
                aria-hidden="true"
              />
              <p className="mt-3 text-xs text-muted-foreground">
                Workspace
              </p>
              <p className="mt-1 text-sm font-semibold">
                {invitation.workspace.name}
              </p>
            </div>

            <div className="rounded-xl border p-4">
              <Mail
                className="size-5 text-primary"
                aria-hidden="true"
              />
              <p className="mt-3 text-xs text-muted-foreground">
                Invited email
              </p>
              <p className="mt-1 break-all text-sm font-semibold">
                {invitation.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-muted/60 p-4">
            <Clock3
              className="size-5 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />

            <p className="text-sm text-muted-foreground">
              Valid until {formatDate(invitation.expiresAt)}
            </p>
          </div>

          {!available ? (
            <div className="text-center">
              <AlertCircle
                className="mx-auto size-8 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="mt-3 text-sm text-muted-foreground">
                This invitation can no longer be accepted.
              </p>
            </div>
          ) : user ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-success/25 bg-success/10 p-4">
                <CheckCircle2
                  className="mt-0.5 size-5 shrink-0 text-success"
                  aria-hidden="true"
                />
                <p className="text-sm leading-6">
                  Signed in as <strong>{user.email}</strong>
                </p>
              </div>

              <form action={acceptWorkspaceInvitationAction}>
                <input type="hidden" name="token" value={token} />

                <Button type="submit" size="lg" className="w-full">
                  Accept invitation
                </Button>
              </form>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <Button variant="outline" asChild>
                <Link
                  href={`/login?next=${encodeURIComponent(nextPath)}`}
                >
                  Log in to accept
                </Link>
              </Button>

              <Button asChild>
                <Link
                  href={`/register?next=${encodeURIComponent(nextPath)}`}
                >
                  Create account
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}