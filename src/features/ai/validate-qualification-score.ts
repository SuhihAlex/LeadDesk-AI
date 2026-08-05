import type {
  AiPriority,
  AiQualificationOutput,
  AiScoreBreakdown,
} from "@/features/ai/qualification-schema"

function getPriorityFromScore(
  score: number,
): AiPriority {
  if (score >= 80) {
    return "urgent"
  }

  if (score >= 60) {
    return "high"
  }

  if (score >= 35) {
    return "medium"
  }

  return "low"
}

export function calculateScoreTotal(
  score: AiScoreBreakdown,
): number {
  return (
    score.budget +
    score.timeline +
    score.completeness +
    score.serviceFit +
    score.urgency +
    score.descriptionQuality
  )
}

export function normalizeQualificationScore(
  output: AiQualificationOutput,
): AiQualificationOutput {
  const calculatedTotal = calculateScoreTotal(
    output.score,
  )

  const calculatedPriority =
    getPriorityFromScore(calculatedTotal)

  const priority =
    calculatedPriority === "urgent" &&
    !(
      output.qualification.serviceFit ===
        "excellent" &&
      output.qualification.completenessScore >=
        70 &&
      output.qualification.urgency === "high"
    )
      ? "high"
      : calculatedPriority

  return {
    ...output,
    qualification: {
      ...output.qualification,
      priority,
    },
    score: {
      ...output.score,
      total: calculatedTotal,
    },
  }
}