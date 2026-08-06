export const workspacePlans = [
  "free",
  "pro",
  "agency",
] as const

export type WorkspacePlan = (typeof workspacePlans)[number]

export const subscriptionStatuses = [
  "inactive",
  "trialing",
  "active",
  "past_due",
  "canceled",
] as const

export type SubscriptionStatus =
  (typeof subscriptionStatuses)[number]

export type WorkspaceSubscription = {
  id: string
  workspaceId: string
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  stripePriceId: string | null
  plan: WorkspacePlan
  status: SubscriptionStatus
  currentPeriodEnd: string | null
  createdAt: string
  updatedAt: string
}