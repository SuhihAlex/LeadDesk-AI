import { ShieldCheck, UserPlus, Users } from "lucide-react"

import { AppShell } from "@/components/layout/app-shell"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { getCurrentWorkspace } from "@/features/workspace/get-current-workspace"
import { getWorkspaceMembers } from "@/features/workspace/get-workspace-members"
import { formatDate } from "@/lib/format-date"

export default async function TeamPage() {
  const [context, members] = await Promise.all([
    getCurrentWorkspace(),
    getWorkspaceMembers(),
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

              <Button disabled={!isOwner}>
                <UserPlus className="size-4" aria-hidden="true" />
                Invite member
              </Button>
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