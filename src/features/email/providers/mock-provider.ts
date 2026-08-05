import { randomUUID } from "node:crypto"

import type {
  EmailProvider,
  SendEmailInput,
  SendEmailResult,
} from "@/features/email/providers/types"

export class MockEmailProvider
  implements EmailProvider
{
  readonly name = "mock"

  async send(
    input: SendEmailInput,
  ): Promise<SendEmailResult> {
    if (
      process.env.EMAIL_MOCK_FORCE_FAILURE ===
      "true"
    ) {
      throw new Error(
        "Mock email provider failure.",
      )
    }

    console.info("[mock-email]", {
      to: input.to,
      subject: input.subject,
      bodyLength: input.body.length,
      idempotencyKey: input.idempotencyKey,
    })

    return {
      providerMessageId:
        `mock_${randomUUID()}`,
    }
  }
}