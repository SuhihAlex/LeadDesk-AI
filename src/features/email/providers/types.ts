export type SendEmailInput = {
  to: string
  subject: string
  body: string
}

export type SendEmailResult = {
  providerMessageId: string
}

export interface EmailProvider {
  readonly name: string

  send(
    input: SendEmailInput,
  ): Promise<SendEmailResult>
}