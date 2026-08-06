import {
  CreditCard,
  ShieldCheck,
} from "lucide-react"

import { AppShell } from "@/components/layout/app-shell"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { getCurrentWorkspaceSubscription } from "@/features/billing/get-current-workspace-subscription"
import type {
  SubscriptionStatus,
  WorkspacePlan,
} from "@/features/billing/types"
import { getCurrentWorkspace } from "@/features/workspace/get-current-workspace"
import { formatDate } from "@/lib/format-date"

const planNames: Record<WorkspacePlan, string> = {
  free: "Free",
  pro: "Pro",
  agency: "Agency",
}

const statusNames: Record<SubscriptionStatus, string> = {
  inactive: "Inactive",
  trialing: "Trialing",
  active: "Active",
  past_due: "Past due",
  canceled: "Canceled",
}

function getStatusVariant(
  status: SubscriptionStatus,
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "active" || status === "trialing") {
    return "default"
  }

  if (status === "past_due") {
    return "destructive"
  }

  if (status === "canceled") {
    return "outline"
  }

  return "secondary"
}

export default async function BillingPage() {
  const context = await getCurrentWorkspace()
  const isOwner = context.workspace.role === "owner"

  const subscription = isOwner
    ? await getCurrentWorkspaceSubscription()
    : null

  return (
    <AppShell
      title="Billing"
      description="Manage the workspace plan and Stripe test subscription."
    >
      <div className="mx-auto max-w-5xl space-y-6">
        {!isOwner ? (
          <Card>
            <CardContent className="flex items-start gap-4 p-6">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShieldCheck
                  className="size-5"
                  aria-hidden="true"
                />
              </div>

              <div>
                <h2 className="font-semibold">
                  Owner access required
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Only workspace Owners can view subscription details,
                  change plans, or manage Stripe billing.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : subscription ? (
          <>
            <Card>
              <CardHeader className="border-b">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CreditCard
                        className="size-5 text-primary"
                        aria-hidden="true"
                      />

                      <h2 className="text-lg font-semibold">
                        Current subscription
                      </h2>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Billing details for {context.workspace.name}.
                    </p>
                  </div>

                  <Badge
                    variant={getStatusVariant(subscription.status)}
                  >
                    {statusNames[subscription.status]}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Current plan
                  </p>

                  <p className="mt-2 text-2xl font-semibold">
                    {planNames[subscription.plan]}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Subscription status
                  </p>

                  <p className="mt-2 font-semibold">
                    {statusNames[subscription.status]}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Current period ends
                  </p>

                  <p className="mt-2 font-semibold">
                    {subscription.currentPeriodEnd
                      ? formatDate(subscription.currentPeriodEnd)
                      : "Not scheduled"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-start gap-4 p-6">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck
                    className="size-5"
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <p className="font-semibold">
                    Stripe test mode
                  </p>

                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Checkout, Customer Portal and webhook synchronization
                    will be connected in the next billing step. No real
                    payments will be processed.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="p-6">
              <p className="font-semibold">
                Subscription unavailable
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                The workspace subscription record could not be loaded.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  )
}