import "server-only"

import { MockEmailProvider } from "@/features/email/providers/mock-provider"
import type { EmailProvider } from "@/features/email/providers/types"

export function getEmailProvider(): EmailProvider {
  const provider =
    process.env.EMAIL_PROVIDER?.trim() ||
    "mock"

  switch (provider) {
    case "mock":
      return new MockEmailProvider()

    default:
      throw new Error(
        `Unsupported email provider: ${provider}`,
      )
  }
}