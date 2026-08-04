import { Building2, ShieldCheck, UserRound } from "lucide-react"

import { AppShell } from "@/components/layout/app-shell"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { getCurrentWorkspace } from "@/features/workspace/get-current-workspace"
import { WorkspaceSettingsForm } from "@/features/workspace/workspace-settings-form"

export default async function SettingsPage() {
  const context = await getCurrentWorkspace()

  return (
    <AppShell
      title="Settings"
      description="Manage your profile and workspace identity."
    >
      <div className="mx-auto max-w-4xl space-y-6">
        <Card>
          <CardHeader className="border-b">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <UserRound
                    className="size-5 text-primary"
                    aria-hidden="true"
                  />

                  <h2 className="text-lg font-semibold">
                    Profile and workspace
                  </h2>
                </div>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Keep your personal details and company identity up to date.
                </p>
              </div>

              <Badge variant="outline" className="w-fit capitalize">
                {context.workspace.role}
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            <WorkspaceSettingsForm context={context} />
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="flex items-start gap-4 p-5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Building2 className="size-5" aria-hidden="true" />
              </div>

              <div>
                <p className="font-semibold">Workspace slug</p>
                <p className="mt-1 break-all text-sm text-muted-foreground">
                  {context.workspace.slug}
                </p>
                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  Slug editing is excluded from the MVP to preserve stable
                  workspace identifiers.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-start gap-4 p-5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
                <ShieldCheck className="size-5" aria-hidden="true" />
              </div>

              <div>
                <p className="font-semibold">Workspace isolation</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Access is restricted through Supabase Auth and PostgreSQL
                  Row Level Security.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}