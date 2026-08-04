import {
  Mail,
  ShieldCheck,
  Users,
  X,
} from "lucide-react"

import { AppShell } from "@/components/layout/app-shell"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { getCurrentWorkspace } from "@/features/workspace/get-current-workspace"
import { getWorkspaceMembers } from "@/features/workspace/get-workspace-members"
import { formatDate } from "@/lib/format-date"

import { CopyInvitationLinkButton } from "@/features/workspace/copy-invitation-link-button"
import { getWorkspaceInvitations } from "@/features/workspace/get-workspace-invitations"
import { revokeWorkspaceInvitationAction } from "@/features/workspace/actions"
import { WorkspaceInvitationForm } from "@/features/workspace/workspace-invitation-form"

export default async function TeamPage() {
  const [context, members, invitations] = await Promise.all([
    getCurrentWorkspace(),
    getWorkspaceMembers(),
    getWorkspaceInvitations(),
  ])

  const isOwner = context.workspace.role === "owner"

  return (
    <AppShell
      title="Team"
      description="Manage workspace members and simple Owner or Member roles."
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <Card>
          <CardHeader className="border-b">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Users
                    className="size-5 text-primary"
                    aria-hidden="true"
                  />

                  <h2 className="text-lg font-semibold">
                    Workspace members
                  </h2>
                </div>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  People with access to {context.workspace.name}.
                </p>
              </div>

              <Badge variant="outline">
                {members.length} {members.length === 1 ? "member" : "members"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {members.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <Users
                  className="mx-auto size-10 text-muted-foreground"
                  aria-hidden="true"
                />

                <h3 className="mt-4 font-semibold">
                  No workspace members found
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  The workspace does not currently contain any members.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {members.map((member) => (
                  <article
                    key={member.id}
                    className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:px-6"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <Avatar className="size-10">
                        {member.avatarUrl && (
                          <AvatarImage
                            src={member.avatarUrl}
                            alt={member.fullName}
                          />
                        )}

                        <AvatarFallback>
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold">
                            {member.fullName}
                          </p>

                          {member.isCurrentUser && (
                            <Badge variant="outline">You</Badge>
                          )}
                        </div>

                        <p className="mt-1 truncate text-sm text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-6 sm:justify-end">
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-muted-foreground">
                          Joined
                        </p>
                        <p className="mt-1 text-sm">
                          {formatDate(member.joinedAt)}
                        </p>
                      </div>

                      <Badge
                        variant={
                          member.role === "owner"
                            ? "default"
                            : "secondary"
                        }
                        className="capitalize"
                      >
                        {member.role === "owner" && (
                          <ShieldCheck
                            className="size-3.5"
                            aria-hidden="true"
                          />
                        )}

                        {member.role}
                      </Badge>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {isOwner && (
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center gap-2">
                <Mail className="size-5 text-primary" aria-hidden="true" />
                <h2 className="text-lg font-semibold">Member invitations</h2>
              </div>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Create a temporary invitation link for a new workspace Member.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <WorkspaceInvitationForm />

              {invitations.length > 0 && (
                <div className="space-y-3 border-t pt-6">
                  <div>
                    <h3 className="text-sm font-semibold">
                      Pending invitations
                    </h3>

                    <p className="mt-1 text-xs text-muted-foreground">
                      These links remain active until accepted, revoked, or expired.
                    </p>
                  </div>

                  <div className="divide-y rounded-xl border">
                    {invitations.map((invitation) => (
                      <article
                        key={invitation.id}
                        className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {invitation.email}
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            Expires {formatDate(invitation.expiresAt)}
                          </p>
                        </div>

                        <Badge variant="secondary" className="w-fit capitalize">
                          {invitation.role}
                        </Badge>

                        <div className="flex flex-wrap gap-2">
                          <CopyInvitationLinkButton token={invitation.token} />

                          <form action={revokeWorkspaceInvitationAction}>
                            <input
                              type="hidden"
                              name="invitationId"
                              value={invitation.id}
                            />

                            <Button
                              type="submit"
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                            >
                              <X className="size-4" aria-hidden="true" />
                              Revoke
                            </Button>
                          </form>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="flex items-start gap-4 p-5 sm:p-6">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </div>

            <div>
              <p className="font-semibold">Simple role model</p>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Owners manage workspace identity, members, invitations and
                billing. Members can process leads, tasks and pipeline
                activity.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}