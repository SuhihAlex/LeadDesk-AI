import "server-only"

import { z } from "zod"

const aiEnvironmentSchema = z
  .object({
    AI_PROVIDER: z
      .enum(["mock", "openai"])
      .default("mock"),

    OPENAI_API_KEY: z
      .string()
      .trim()
      .min(1)
      .optional(),

    OPENAI_MODEL: z
      .string()
      .trim()
      .min(1)
      .default("gpt-4.1-mini"),
  })
  .superRefine((environment, context) => {
    if (
      environment.AI_PROVIDER === "openai" &&
      !environment.OPENAI_API_KEY
    ) {
      context.addIssue({
        code: "custom",
        path: ["OPENAI_API_KEY"],
        message:
          "OPENAI_API_KEY is required when AI_PROVIDER=openai.",
      })
    }
  })

export type AiProviderName = "mock" | "openai"

export type AiEnvironment = {
  provider: AiProviderName
  openAiApiKey: string | null
  openAiModel: string
}

let cachedEnvironment: AiEnvironment | null = null

export function getAiEnvironment(): AiEnvironment {
  if (cachedEnvironment) {
    return cachedEnvironment
  }

  const parsed = aiEnvironmentSchema.safeParse({
    AI_PROVIDER: process.env.AI_PROVIDER,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
  })

  if (!parsed.success) {
    throw new Error(
      `Invalid AI environment configuration: ${parsed.error.message}`,
    )
  }

  cachedEnvironment = {
    provider: parsed.data.AI_PROVIDER,
    openAiApiKey:
      parsed.data.OPENAI_API_KEY ?? null,
    openAiModel: parsed.data.OPENAI_MODEL,
  }

  return cachedEnvironment
}