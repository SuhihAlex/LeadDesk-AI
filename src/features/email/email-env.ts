import "server-only"

import { z } from "zod"

const resendEnvironmentSchema = z.object({
  RESEND_API_KEY: z
    .string({
      error: "RESEND_API_KEY is required.",
    })
    .trim()
    .min(1, "RESEND_API_KEY is required."),

  EMAIL_FROM: z
    .string({
      error: "EMAIL_FROM is required.",
    })
    .trim()
    .min(3, "EMAIL_FROM is required."),

  EMAIL_REPLY_TO: z
    .string()
    .trim()
    .email(
      "EMAIL_REPLY_TO must be a valid email address.",
    )
    .optional(),
})

export type ResendEnvironment = z.infer<
  typeof resendEnvironmentSchema
>

export function getResendEnvironment(): ResendEnvironment {
  const parsed =
    resendEnvironmentSchema.safeParse({
      RESEND_API_KEY:
        process.env.RESEND_API_KEY,
      EMAIL_FROM:
        process.env.EMAIL_FROM,
      EMAIL_REPLY_TO:
        process.env.EMAIL_REPLY_TO ||
        undefined,
    })

  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => issue.message)
      .join(" ")

    throw new Error(
      `Invalid Resend configuration. ${message}`,
    )
  }

  return parsed.data
}