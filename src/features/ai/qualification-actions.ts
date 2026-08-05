"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { qualifyLead } from "@/features/ai/qualify-lead"

const qualifyLeadActionSchema = z.object({
  leadId: z.string().uuid(),
})

export type QualifyLeadActionState = {
  status:
    | "idle"
    | "success"
    | "error"
    | "already_processing"
  message: string
}

function getStringValue(
  formData: FormData,
  key: string,
): string {
  const value = formData.get(key)

  return typeof value === "string" ? value : ""
}

export async function qualifyLeadAction(
  _previousState: QualifyLeadActionState,
  formData: FormData,
): Promise<QualifyLeadActionState> {
  const parsed =
    qualifyLeadActionSchema.safeParse({
      leadId: getStringValue(
        formData,
        "leadId",
      ),
    })

  if (!parsed.success) {
    return {
      status: "error",
      message: "The lead ID is invalid.",
    }
  }

  const result = await qualifyLead(
    parsed.data.leadId,
  )

  revalidatePath(
    `/app/leads/${parsed.data.leadId}`,
  )
  revalidatePath("/app/inbox")
  revalidatePath("/app/pipeline")

  if (result.status === "success") {
    return {
      status: "success",
      message:
        "AI qualification completed.",
    }
  }

  if (
    result.status === "already_processing"
  ) {
    return {
      status: "already_processing",
      message:
        "This lead is already being processed.",
    }
  }

  return {
    status: "error",
    message: result.message,
  }
}