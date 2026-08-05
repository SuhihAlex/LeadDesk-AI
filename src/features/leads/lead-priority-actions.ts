"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import type { LeadPriorityActionState } from "@/features/leads/lead-priority-state"
import { createClient } from "@/lib/supabase/server"

const updateLeadPrioritySchema = z.object({
  leadId: z.string().uuid(),
  priority: z.enum([
    "low",
    "medium",
    "high",
    "urgent",
  ]),
})

function getStringValue(
  formData: FormData,
  key: string,
): string {
  const value = formData.get(key)

  return typeof value === "string" ? value : ""
}

export async function updateLeadPriorityAction(
  _previousState: LeadPriorityActionState,
  formData: FormData,
): Promise<LeadPriorityActionState> {
  const parsed = updateLeadPrioritySchema.safeParse({
    leadId: getStringValue(formData, "leadId"),
    priority: getStringValue(formData, "priority"),
  })

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the selected priority.",
      fieldErrors:
        parsed.error.flatten().fieldErrors,
    }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.rpc(
    "update_lead_priority",
    {
      target_lead_id: parsed.data.leadId,
      target_priority: parsed.data.priority,
    },
  )

  if (error) {
    return {
      status: "error",
      message:
        error.message ||
        "The lead priority could not be updated.",
    }
  }

  revalidatePath("/app")
  revalidatePath("/app/inbox")
  revalidatePath("/app/pipeline")
  revalidatePath(
    `/app/leads/${parsed.data.leadId}`,
  )

  return {
    status: "success",
    message:
      data === false
        ? "Lead priority is unchanged."
        : "Lead priority updated.",
  }
}