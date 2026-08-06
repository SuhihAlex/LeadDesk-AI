import "server-only"

type StripeEnvironmentKey =
  | "STRIPE_SECRET_KEY"
  | "STRIPE_WEBHOOK_SECRET"
  | "STRIPE_PRO_PRICE_ID"
  | "STRIPE_AGENCY_PRICE_ID"

function getRequiredStripeEnvironmentVariable(
  key: StripeEnvironmentKey,
) {
  const value = process.env[key]?.trim()

  if (!value) {
    throw new Error(
      `Missing required Stripe environment variable: ${key}`,
    )
  }

  return value
}

export function getStripeSecretKey() {
  return getRequiredStripeEnvironmentVariable(
    "STRIPE_SECRET_KEY",
  )
}

export function getStripeWebhookSecret() {
  return getRequiredStripeEnvironmentVariable(
    "STRIPE_WEBHOOK_SECRET",
  )
}

export function getStripePriceIds() {
  return {
    pro: getRequiredStripeEnvironmentVariable(
      "STRIPE_PRO_PRICE_ID",
    ),
    agency: getRequiredStripeEnvironmentVariable(
      "STRIPE_AGENCY_PRICE_ID",
    ),
  }
}