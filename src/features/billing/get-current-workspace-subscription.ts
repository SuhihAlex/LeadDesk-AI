import "server-only"

import { cache } from "react"

import type { WorkspaceSubscription } from "@/features/billing/types"
import { getCurrentWorkspace } from "@/features/workspace/get-current-workspace"
import { createClient } from "@/lib/supabase/server"

export const getCurrentWorkspaceSubscription = cache(
  async (): Promise<WorkspaceSubscription | null> => {
    const context = await getCurrentWorkspace()

    if (context.workspace.role !== "owner") {
      return null
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("subscriptions")
      .select(
        `
          id,
          workspace_id,
          stripe_customer_id,
          stripe_subscription_id,
          stripe_price_id,
          plan,
          status,
          current_period_end,
          created_at,
          updated_at
        `,
      )
      .eq("workspace_id", context.workspace.id)
      .single()

    if (error || !data) {
      throw new Error(
        `Workspace subscription could not be loaded: ${
          error?.message ?? "Subscription record was not found."
        }`,
      )
    }

    return {
      id: data.id,
      workspaceId: data.workspace_id,
      stripeCustomerId: data.stripe_customer_id,
      stripeSubscriptionId: data.stripe_subscription_id,
      stripePriceId: data.stripe_price_id,
      plan: data.plan,
      status: data.status,
      currentPeriodEnd: data.current_period_end,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  },
)