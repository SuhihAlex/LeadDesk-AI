"use server"

import { redirect } from "next/navigation"

import { getCurrentWorkspaceSubscription } from "@/features/billing/get-current-workspace-subscription"
import { checkoutPlanSchema } from "@/features/billing/schemas"
import { getStripeClient } from "@/features/billing/stripe/client"
import { getStripePriceIds } from "@/features/billing/stripe/env"
import { getCurrentWorkspace } from "@/features/workspace/get-current-workspace"
import { getSiteUrl } from "@/lib/site-url"

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key)

  return typeof value === "string" ? value : ""
}

export async function createCheckoutSessionAction(
  formData: FormData,
) {
  const parsed = checkoutPlanSchema.safeParse(
    getStringValue(formData, "plan"),
  )

  if (!parsed.success) {
    redirect("/app/billing?error=invalid_plan")
  }

  const context = await getCurrentWorkspace()

  if (context.workspace.role !== "owner") {
    redirect("/app/billing?error=owner_required")
  }

  const subscription =
    await getCurrentWorkspaceSubscription()

  if (!subscription) {
    redirect("/app/billing?error=subscription_unavailable")
  }

  if (
    subscription.status === "active" ||
    subscription.status === "trialing" ||
    subscription.status === "past_due"
  ) {
    redirect("/app/billing?error=subscription_exists")
  }

  const stripe = getStripeClient()
  const priceIds = getStripePriceIds()
  const siteUrl = getSiteUrl()

  const metadata = {
    workspace_id: context.workspace.id,
    user_id: context.user.id,
    plan: parsed.data,
  }

  const customerDetails = subscription.stripeCustomerId
    ? {
        customer: subscription.stripeCustomerId,
      }
    : context.user.email
      ? {
          customer_email: context.user.email,
        }
      : {}

  let checkoutUrl: string | null = null

  try {
    const session =
      await stripe.checkout.sessions.create({
        mode: "subscription",

        line_items: [
          {
            price: priceIds[parsed.data],
            quantity: 1,
          },
        ],

        client_reference_id: context.workspace.id,

        metadata,

        subscription_data: {
          metadata,
        },

        success_url:
          `${siteUrl}/app/billing` +
          "?checkout=success" +
          "&session_id={CHECKOUT_SESSION_ID}",

        cancel_url:
          `${siteUrl}/app/billing` +
          "?checkout=canceled",

        ...customerDetails,
      })

    checkoutUrl = session.url
  } catch (error) {
    console.error(
      "Stripe Checkout Session could not be created.",
      error,
    )
  }

  if (!checkoutUrl) {
    redirect("/app/billing?error=checkout_failed")
  }

  redirect(checkoutUrl)
}