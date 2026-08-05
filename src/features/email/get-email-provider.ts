import "server-only"

import {
  getResendEnvironment,
} from "@/features/email/email-env"
import { MockEmailProvider } from "@/features/email/providers/mock-provider"
import { ResendEmailProvider } from "@/features/email/providers/resend-provider"
import type { EmailProvider } from "@/features/email/providers/types"

export function getEmailProvider(): EmailProvider {
  const provider =
    process.env.EMAIL_PROVIDER
      ?.trim()
      .toLowerCase() || "mock"

  switch (provider) {
    case "mock":
      return new MockEmailProvider()

    case "resend":
      return new ResendEmailProvider(
        getResendEnvironment(),
      )

    default:
      throw new Error(
        `Unsupported email provider: ${provider}`,
      )
  }
}