import "server-only"

import { z } from "zod"

export type EmailProviderName =
  | "mock"
  | "resend"
  | "unsupported"

export type EmailConfigurationStatus = {
  provider: EmailProviderName
  providerLabel: string
  isReady: boolean
  isRealDelivery: boolean
  sender: string | null
  replyTo: string | null
  apiKeyConfigured: boolean
  issues: string[]
}

const emailAddressSchema = z
  .string()
  .trim()
  .email()

function getConfiguredProvider(): string {
  return (
    process.env.EMAIL_PROVIDER
      ?.trim()
      .toLowerCase() || "mock"
  )
}

function getOptionalValue(
  value: string | undefined,
): string | null {
  const normalized = value?.trim()

  return normalized
    ? normalized
    : null
}

export function getEmailConfigurationStatus():
  EmailConfigurationStatus {
  const configuredProvider =
    getConfiguredProvider()

  if (configuredProvider === "mock") {
    return {
      provider: "mock",
      providerLabel: "Mock provider",
      isReady: true,
      isRealDelivery: false,
      sender: null,
      replyTo: null,
      apiKeyConfigured: false,
      issues: [],
    }
  }

  if (configuredProvider !== "resend") {
    return {
      provider: "unsupported",
      providerLabel:
        configuredProvider || "Unknown provider",
      isReady: false,
      isRealDelivery: false,
      sender: null,
      replyTo: null,
      apiKeyConfigured: false,
      issues: [
        `Unsupported email provider: ${configuredProvider}`,
      ],
    }
  }

  const apiKey = getOptionalValue(
    process.env.RESEND_API_KEY,
  )

  const sender = getOptionalValue(
    process.env.EMAIL_FROM,
  )

  const replyTo = getOptionalValue(
    process.env.EMAIL_REPLY_TO,
  )

  const issues: string[] = []

  if (!apiKey) {
    issues.push(
      "RESEND_API_KEY is not configured.",
    )
  }

  if (!sender) {
    issues.push(
      "EMAIL_FROM is not configured.",
    )
  }

  if (
    replyTo &&
    !emailAddressSchema.safeParse(replyTo)
      .success
  ) {
    issues.push(
      "EMAIL_REPLY_TO is not a valid email address.",
    )
  }

  return {
    provider: "resend",
    providerLabel: "Resend",
    isReady: issues.length === 0,
    isRealDelivery: true,
    sender,
    replyTo,
    apiKeyConfigured: Boolean(apiKey),
    issues,
  }
}