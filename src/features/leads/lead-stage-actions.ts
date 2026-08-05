"use server"

import { z } from "zod"

import { changeLeadStageAction } from "@/features/leads/pipeline-actions"
import type { LeadStageActionState } from "@/features/leads/lead-stage-state"

const updateLeadStageSchema = z.object({
  leadId: z.string().uuid(),
  stage: z.enum([
    "new",
    "qualified",
    "contacted",
    "proposal",
    "won",
    "lost",
  ]),
})

function getStringValue(
  formData: FormData,
  key: string,
): string {
  const value = formData.get(key)

  return typeof value === "string" ? value : ""
}

export async function updateLeadStageAction(
  _previousState: LeadStageActionState,
  formData: FormData,
): Promise<LeadStageActionState> {
  const parsed = updateLeadStageSchema.safeParse({
    leadId: getStringValue(formData, "leadId"),
    stage: getStringValue(formData, "stage"),
  })

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the selected stage.",
      fieldErrors:
        parsed.error.flatten().fieldErrors,
    }
  }

  const result = await changeLeadStageAction(
    parsed.data,
  )

  if (result.status === "error") {
    return {
      status: "error",
      message: result.message,
    }
  }

  return {
    status: "success",
    message: result.changed
      ? "Lead stage updated."
      : "Lead stage is unchanged.",
  }
}