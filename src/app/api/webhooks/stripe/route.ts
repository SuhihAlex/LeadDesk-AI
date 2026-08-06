import { NextResponse } from "next/server"

import {
  isSupportedStripeEvent,
  processStripeWebhookEvent,
} from "@/features/billing/stripe/process-webhook-event"
import { getStripeClient } from "@/features/billing/stripe/client"
import { getStripeWebhookSecret } from "@/features/billing/stripe/env"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const signature = request.headers.get(
    "stripe-signature",
  )

  if (!signature) {
    return NextResponse.json(
      {
        error: "Missing Stripe signature.",
      },
      {
        status: 400,
      },
    )
  }

  let event

  try {
    const payload = await request.text()

    event = getStripeClient().webhooks.constructEvent(
      payload,
      signature,
      getStripeWebhookSecret(),
    )
  } catch (error) {
    console.error(
      "Stripe webhook signature verification failed.",
      error,
    )

    return NextResponse.json(
      {
        error: "Invalid Stripe webhook signature.",
      },
      {
        status: 400,
      },
    )
  }

  if (!isSupportedStripeEvent(event)) {
    return NextResponse.json({
      received: true,
      handled: false,
    })
  }

  try {
    const processed =
      await processStripeWebhookEvent(event)

    return NextResponse.json({
      received: true,
      handled: true,
      processed,
    })
  } catch (error) {
    console.error(
      `Stripe webhook event ${event.id} could not be processed.`,
      error,
    )

    return NextResponse.json(
      {
        error: "Stripe webhook processing failed.",
      },
      {
        status: 500,
      },
    )
  }
}