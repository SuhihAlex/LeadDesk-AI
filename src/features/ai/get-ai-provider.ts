import "server-only"

import { getAiEnvironment } from "@/features/ai/env"
import type {
  AiQualificationProvider,
} from "@/features/ai/providers/types"
import { MockAiQualificationProvider } from "@/features/ai/providers/mock-provider"

export function getAiQualificationProvider(): AiQualificationProvider {
  const environment = getAiEnvironment()

  if (environment.provider === "mock") {
    return new MockAiQualificationProvider()
  }

  throw new Error(
    "The OpenAI provider has not been configured yet.",
  )
}