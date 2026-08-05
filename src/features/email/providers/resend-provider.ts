import "server-only"

import { Resend } from "resend"

import type { ResendEnvironment } from "@/features/email/email-env"
import type {
  EmailProvider,
  SendEmailInput,
  SendEmailResult,
} from "@/features/email/providers/types"

export class ResendEmailProvider
  implements EmailProvider
{
  readonly name = "resend"

  private readonly client: Resend

  constructor(
    private readonly environment: ResendEnvironment,
  ) {
    this.client = new Resend(
      environment.RESEND_API_KEY,
    )
  }

  async send(
    input: SendEmailInput,
  ): Promise<SendEmailResult> {
    const { data, error } =
      await this.client.emails.send(
        {
          from: this.environment.EMAIL_FROM,
          to: [input.to],
          subject: input.subject,
          text: input.body,
          replyTo:
            this.environment.EMAIL_REPLY_TO,
        },
        {
          idempotencyKey:
            input.idempotencyKey,
        },
      )

    if (error) {
      throw new Error(
        error.message ||
          "Resend email delivery failed.",
      )
    }

    if (!data?.id) {
      throw new Error(
        "Resend did not return a message ID.",
      )
    }

    return {
      providerMessageId: data.id,
    }
  }
}