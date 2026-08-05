import type {
  AiQualificationOutput,
} from "@/features/ai/qualification-schema"

export type AiLeadInput = {
  id: string
  fullName: string
  email: string
  company: string | null
  projectType: string
  budgetRange: string
  desiredTimeline: string
  description: string
  websiteUrl: string | null
  source: string
}

export type AiQualificationRequest = {
  lead: AiLeadInput
  studioContext: {
    name: string
    services: string[]
    responseLanguage: "English"
  }
}

export type AiQualificationResult = {
  output: AiQualificationOutput
  model: string
  promptVersion: string
  rawResponse: Record<string, unknown> | null
}

export interface AiQualificationProvider {
  qualifyLead(
    request: AiQualificationRequest,
  ): Promise<AiQualificationResult>
}