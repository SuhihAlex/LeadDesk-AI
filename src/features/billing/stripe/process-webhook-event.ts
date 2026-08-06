import "server-only"

import type Stripe from "stripe"

import type {
  SubscriptionStatus,
  WorkspacePlan,
} from "@/features/billing/types"
import { getStripeClient } from "@/features/billing/stripe/client"
import { getStripePriceIds } from "@/features/billing/stripe/env"
import { createAdminClient } from "@/lib/supabase/admin"

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type SupportedStripeEvent =
  | Stripe.CheckoutSessionCompletedEvent
  | Stripe.CustomerSubscriptionCreatedEvent
  | Stripe.CustomerSubscriptionUpdatedEvent
  | Stripe.CustomerSubscriptionDeletedEvent

type SubscriptionSyncInput = {
  eventId: string
  eventType: string
  workspaceId: string
  customerId: string
  subscriptionId: string
  priceId: string
  subscriptionPlan: Exclude<WorkspacePlan, "free">
  workspacePlan: WorkspacePlan
  status: SubscriptionStatus
  currentPeriodEnd: string | null
}

function getExpandableId(
  value:
    | string
    | { id: string }
    | null
    | undefined,
) {
  if (!value) {
    return null
  }

  return typeof value === "string"
    ? value
    : value.id
}

function getWorkspaceIdFromMetadata(
  metadata: Stripe.Metadata | null | undefined,
) {
  const workspaceId = metadata?.workspace_id?.trim()

  if (!workspaceId || !UUID_PATTERN.test(workspaceId)) {
    return null
  }

  return workspaceId
}

function getSubscriptionPriceId(
  subscription: Stripe.Subscription,
) {
  return subscription.items.data[0]?.price.id ?? null
}

function getCurrentPeriodEnd(
  subscription: Stripe.Subscription,
) {
  const periodEnds = subscription.items.data
    .map((item) => item.current_period_end)
    .filter((value): value is number => {
      return typeof value === "number"
    })

  if (periodEnds.length === 0) {
    return null
  }

  return new Date(
    Math.max(...periodEnds) * 1000,
  ).toISOString()
}

function getPlanFromPriceId(
  priceId: string,
): Exclude<WorkspacePlan, "free"> {
  const priceIds = getStripePriceIds()

  if (priceId === priceIds.pro) {
    return "pro"
  }

  if (priceId === priceIds.agency) {
    return "agency"
  }

  throw new Error(
    `Unsupported Stripe Price ID: ${priceId}`,
  )
}

function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status,
): SubscriptionStatus {
  switch (status) {
    case "trialing":
      return "trialing"

    case "active":
      return "active"

    case "past_due":
      return "past_due"

    case "canceled":
    case "unpaid":
    case "incomplete_expired":
      return "canceled"

    case "incomplete":
    case "paused":
      return "inactive"

    default:
      return "inactive"
  }
}

function getEffectiveWorkspacePlan(
  plan: Exclude<WorkspacePlan, "free">,
  status: SubscriptionStatus,
): WorkspacePlan {
  if (
    status === "active" ||
    status === "trialing" ||
    status === "past_due"
  ) {
    return plan
  }

  return "free"
}

async function findWorkspaceId(
  subscription: Stripe.Subscription,
) {
  const metadataWorkspaceId =
    getWorkspaceIdFromMetadata(subscription.metadata)

  if (metadataWorkspaceId) {
    return metadataWorkspaceId
  }

  const admin = createAdminClient()
  const customerId = getExpandableId(
    subscription.customer,
  )

  const bySubscription = await admin
    .from("subscriptions")
    .select("workspace_id")
    .eq("stripe_subscription_id", subscription.id)
    .maybeSingle()

  if (bySubscription.error) {
    throw bySubscription.error
  }

  if (bySubscription.data?.workspace_id) {
    return bySubscription.data.workspace_id
  }

  if (!customerId) {
    return null
  }

  const byCustomer = await admin
    .from("subscriptions")
    .select("workspace_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle()

  if (byCustomer.error) {
    throw byCustomer.error
  }

  return byCustomer.data?.workspace_id ?? null
}

async function synchronizeSubscription(
  input: SubscriptionSyncInput,
) {
  const admin = createAdminClient()

  const result = await admin.rpc(
    "process_stripe_subscription_event",
    {
      p_event_id: input.eventId,
      p_event_type: input.eventType,
      p_workspace_id: input.workspaceId,
      p_customer_id: input.customerId,
      p_subscription_id: input.subscriptionId,
      p_price_id: input.priceId,
      p_subscription_plan: input.subscriptionPlan,
      p_workspace_plan: input.workspacePlan,
      p_status: input.status,
      p_current_period_end: input.currentPeriodEnd,
    },
  )

  if (result.error) {
    throw result.error
  }

  return result.data === true
}

async function processSubscription(
  event: SupportedStripeEvent,
  subscription: Stripe.Subscription,
  explicitWorkspaceId?: string | null,
) {
  const workspaceId =
    explicitWorkspaceId ??
    (await findWorkspaceId(subscription))

  if (!workspaceId) {
    throw new Error(
      `Workspace could not be resolved for Stripe subscription ${subscription.id}.`,
    )
  }

  const customerId = getExpandableId(
    subscription.customer,
  )

  if (!customerId) {
    throw new Error(
      `Customer could not be resolved for Stripe subscription ${subscription.id}.`,
    )
  }

  const priceId = getSubscriptionPriceId(
    subscription,
  )

  if (!priceId) {
    throw new Error(
      `Price could not be resolved for Stripe subscription ${subscription.id}.`,
    )
  }

  const subscriptionPlan =
    getPlanFromPriceId(priceId)

  const status =
    event.type === "customer.subscription.deleted"
      ? "canceled"
      : mapStripeSubscriptionStatus(
          subscription.status,
        )

  return synchronizeSubscription({
    eventId: event.id,
    eventType: event.type,
    workspaceId,
    customerId,
    subscriptionId: subscription.id,
    priceId,
    subscriptionPlan,
    workspacePlan: getEffectiveWorkspacePlan(
      subscriptionPlan,
      status,
    ),
    status,
    currentPeriodEnd:
      getCurrentPeriodEnd(subscription),
  })
}

async function processCheckoutCompleted(
  event: Stripe.CheckoutSessionCompletedEvent,
) {
  const session = event.data.object

  if (session.mode !== "subscription") {
    return false
  }

  const subscriptionId = getExpandableId(
    session.subscription,
  )

  if (!subscriptionId) {
    throw new Error(
      `Checkout Session ${session.id} does not contain a subscription.`,
    )
  }

  const workspaceId =
    getWorkspaceIdFromMetadata(session.metadata) ??
    (session.client_reference_id &&
    UUID_PATTERN.test(session.client_reference_id)
      ? session.client_reference_id
      : null)

  if (!workspaceId) {
    throw new Error(
      `Workspace could not be resolved for Checkout Session ${session.id}.`,
    )
  }

  const stripe = getStripeClient()
  const subscription =
    await stripe.subscriptions.retrieve(
      subscriptionId,
    )

  return processSubscription(
    event,
    subscription,
    workspaceId,
  )
}

export function isSupportedStripeEvent(
  event: Stripe.Event,
): event is SupportedStripeEvent {
  return (
    event.type === "checkout.session.completed" ||
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  )
}

export async function processStripeWebhookEvent(
  event: SupportedStripeEvent,
) {
  if (event.type === "checkout.session.completed") {
    return processCheckoutCompleted(event)
  }

  return processSubscription(
    event,
    event.data.object,
  )
}
