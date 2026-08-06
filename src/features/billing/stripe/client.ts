import "server-only"

import Stripe from "stripe"

import { getStripeSecretKey } from "@/features/billing/stripe/env"

let stripeClient: Stripe | null = null

export function getStripeClient() {
  if (stripeClient) {
    return stripeClient
  }

  stripeClient = new Stripe(getStripeSecretKey(), {
    appInfo: {
      name: "LeadDesk AI",
      version: "0.1.0",
    },
  })

  return stripeClient
}