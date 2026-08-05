import type {
  AiPriority,
  AiQualificationOutput,
  AiServiceFit,
  AiUrgency,
} from "@/features/ai/qualification-schema"
import { normalizeQualificationScore } from "@/features/ai/validate-qualification-score"
import type {
  AiQualificationProvider,
  AiQualificationRequest,
  AiQualificationResult,
} from "@/features/ai/providers/types"

const MOCK_MODEL = "leaddesk-mock-v1"
const PROMPT_VERSION = "lead-qualification-v1"

const supportedProjectTypes = new Set([
  "marketing_website",
  "ecommerce",
  "saas_mvp",
  "web_application",
  "redesign",
])

const budgetPoints: Record<string, number> = {
  under_3000: 10,
  "3000_7000": 17,
  "7000_15000": 22,
  "15000_30000": 25,
  over_30000: 25,
  not_sure: 7,
}

function getTimelinePoints(
  timeline: string,
): number {
  switch (timeline) {
    case "one_month":
    case "one_to_two_months":
      return 15

    case "three_to_six_months":
      return 13

    case "flexible":
      return 11

    case "asap":
      return 8

    default:
      return 6
  }
}

function getUrgency(
  timeline: string,
): AiUrgency {
  if (timeline === "asap") {
    return "high"
  }

  if (
    timeline === "one_month" ||
    timeline === "one_to_two_months"
  ) {
    return "medium"
  }

  return "low"
}

function getServiceFit(
  projectType: string,
): AiServiceFit {
  if (supportedProjectTypes.has(projectType)) {
    return "excellent"
  }

  if (projectType === "other") {
    return "partial"
  }

  return "poor"
}

function getServiceFitPoints(
  serviceFit: AiServiceFit,
): number {
  switch (serviceFit) {
    case "excellent":
      return 20

    case "good":
      return 16

    case "partial":
      return 9

    case "poor":
      return 2
  }
}

function getUrgencyPoints(
  urgency: AiUrgency,
): number {
  switch (urgency) {
    case "high":
      return 10

    case "medium":
      return 7

    case "low":
      return 4
  }
}

function calculateCompletenessScore(
  request: AiQualificationRequest,
): number {
  const { lead } = request

  let score = 30

  if (lead.description.trim().length >= 100) {
    score += 20
  }

  if (lead.description.trim().length >= 300) {
    score += 10
  }

  if (lead.company) {
    score += 10
  }

  if (lead.websiteUrl) {
    score += 10
  }

  if (lead.budgetRange !== "not_sure") {
    score += 10
  }

  if (lead.desiredTimeline !== "flexible") {
    score += 10
  }

  return Math.min(score, 100)
}

function getDescriptionQualityPoints(
  description: string,
): number {
  const normalized = description.trim()

  if (normalized.length >= 500) {
    return 10
  }

  if (normalized.length >= 250) {
    return 8
  }

  if (normalized.length >= 120) {
    return 6
  }

  if (normalized.length >= 60) {
    return 4
  }

  return 2
}

function getPriority(
  total: number,
  serviceFit: AiServiceFit,
  completenessScore: number,
  urgency: AiUrgency,
): AiPriority {
  if (
    total >= 80 &&
    serviceFit === "excellent" &&
    completenessScore >= 70 &&
    urgency === "high"
  ) {
    return "urgent"
  }

  if (total >= 60) {
    return "high"
  }

  if (total >= 35) {
    return "medium"
  }

  return "low"
}

function getMissingInformation(
  request: AiQualificationRequest,
): string[] {
  const missing: string[] = []
  const { lead } = request

  if (!lead.company) {
    missing.push("Company or business name")
  }

  if (!lead.websiteUrl) {
    missing.push("Current website or product URL")
  }

  if (lead.budgetRange === "not_sure") {
    missing.push("Confirmed project budget")
  }

  if (lead.description.trim().length < 120) {
    missing.push(
      "More detailed scope, requirements and expected outcome",
    )
  }

  return missing
}

function getRisks(
  request: AiQualificationRequest,
): string[] {
  const risks: string[] = []
  const { lead } = request

  if (
    lead.desiredTimeline === "asap" &&
    lead.description.trim().length < 150
  ) {
    risks.push(
      "Urgent timeline with insufficient project detail",
    )
  }

  if (
    lead.budgetRange === "under_3000" &&
    ["saas_mvp", "web_application", "ecommerce"].includes(
      lead.projectType,
    )
  ) {
    risks.push(
      "Selected budget may not match the requested project scope",
    )
  }

  if (lead.projectType === "other") {
    risks.push(
      "Requested service requires manual fit assessment",
    )
  }

  return risks
}

function getRequestedServices(
  projectType: string,
): string[] {
  switch (projectType) {
    case "marketing_website":
      return [
        "UX/UI design",
        "Frontend development",
        "Website development",
      ]

    case "ecommerce":
      return [
        "E-commerce development",
        "Frontend development",
        "Checkout integration",
      ]

    case "saas_mvp":
      return [
        "SaaS MVP development",
        "Product design",
        "Frontend development",
      ]

    case "web_application":
      return [
        "Web application development",
        "Frontend development",
      ]

    case "redesign":
      return [
        "Website redesign",
        "UX/UI design",
        "Frontend development",
      ]

    default:
      return ["Project discovery"]
  }
}

function buildMockQualification(
  request: AiQualificationRequest,
): AiQualificationOutput {
  const { lead } = request

  const serviceFit = getServiceFit(
    lead.projectType,
  )
  const urgency = getUrgency(
    lead.desiredTimeline,
  )
  const completenessScore =
    calculateCompletenessScore(request)

  const score = {
    total: 0,
    budget:
      budgetPoints[lead.budgetRange] ?? 7,
    timeline: getTimelinePoints(
      lead.desiredTimeline,
    ),
    completeness: Math.round(
      completenessScore * 0.2,
    ),
    serviceFit:
      getServiceFitPoints(serviceFit),
    urgency: getUrgencyPoints(urgency),
    descriptionQuality:
      getDescriptionQualityPoints(
        lead.description,
      ),
    explanation: [
      `Budget contribution reflects the selected range: ${lead.budgetRange}.`,
      `Timeline contribution reflects the requested delivery window: ${lead.desiredTimeline}.`,
      `Completeness is based on the available project and business context.`,
      `Service fit is ${serviceFit} for the studio's supported services.`,
      `Description quality reflects the amount of actionable detail provided.`,
    ],
  }

  const total =
    score.budget +
    score.timeline +
    score.completeness +
    score.serviceFit +
    score.urgency +
    score.descriptionQuality

  const priority = getPriority(
    total,
    serviceFit,
    completenessScore,
    urgency,
  )

  const requestedServices =
    getRequestedServices(lead.projectType)

  return normalizeQualificationScore({
    summary:
      `${lead.fullName} is requesting ${requestedServices[0].toLowerCase()}. ` +
      `The request has a ${serviceFit} fit with the studio's services, ` +
      `a ${urgency} urgency level and a completeness score of ${completenessScore}/100.`,

    extracted: {
      projectType: lead.projectType,
      requestedServices,
      budget: lead.budgetRange,
      timeline: lead.desiredTimeline,
      companyContext: lead.company,
      mainGoal:
        lead.description.trim().slice(0, 500),
    },

    qualification: {
      serviceFit,
      urgency,
      completenessScore,
      priority,
    },

    missingInformation:
      getMissingInformation(request),

    risks: getRisks(request),

    score: {
      ...score,
      total,
    },

    replyDraft: {
      subject:
        `Re: Your ${requestedServices[0]} inquiry`,

      body:
        `Hi ${lead.fullName},\n\n` +
        `Thank you for sharing your project request. ` +
        `We understand that you are looking for ${requestedServices[0].toLowerCase()} and would be happy to review the scope in more detail.\n\n` +
        `Before we recommend the best next step, could you clarify the primary business goal, the most important required features, and whether the selected budget range is confirmed?\n\n` +
        `Once we have that information, we can suggest an appropriate discovery or planning call.\n\n` +
        `Best regards,\n${request.studioContext.name}`,
    },
  })
}

export class MockAiQualificationProvider
  implements AiQualificationProvider
{
  async qualifyLead(
    request: AiQualificationRequest,
  ): Promise<AiQualificationResult> {
    if (
      request.lead.description
        .toUpperCase()
        .includes("AI_FAIL")
    ) {
      throw new Error(
        "Mock AI provider failure requested by lead description.",
      )
    }

    if (
      request.lead.description
        .toUpperCase()
        .includes("AI_INVALID")
    ) {
      return {
        output: {
          invalid: true,
        } as unknown as AiQualificationOutput,
        model: MOCK_MODEL,
        promptVersion: PROMPT_VERSION,
        rawResponse: {
          invalid: true,
        },
      }
    }

    const output =
      buildMockQualification(request)

    return {
      output,
      model: MOCK_MODEL,
      promptVersion: PROMPT_VERSION,
      rawResponse: output as unknown as Record<
        string,
        unknown
      >,
    }
  }
}