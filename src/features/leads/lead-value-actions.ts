"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import type { LeadValueActionState } from "@/features/leads/lead-value-state"
import { createClient } from "@/lib/supabase/server"

const updateLeadValueSchema = z.object({
  leadId: z.string().uuid(),
  estimatedValue: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" ||
        (!Number.isNaN(Number(value)) &&
          Number(value) >= 0 &&
          Number(value) <= 9999999999.99),
      "Enter a value between 0 and 9,999,999,999.99.",
    ),
})

function getStringValue(
  formData: FormData,
  key: string,
): string {
  const value = formData.get(key)

  return typeof value === "string" ? value : ""
}

export async function updateLeadValueAction(
  _previousState: LeadValueActionState,
  formData: FormData,
): Promise<LeadValueActionState> {
  const parsed = updateLeadValueSchema.safeParse({
    leadId: getStringValue(formData, "leadId"),
    estimatedValue: getStringValue(
      formData,
      "estimatedValue",
    ),
  })

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the estimated value.",
      fieldErrors:
        parsed.error.flatten().fieldErrors,
    }
  }

  const estimatedValue =
    parsed.data.estimatedValue === ""
      ? null
      : Number(parsed.data.estimatedValue)

  const supabase = await createClient()

  const { data, error } = await supabase.rpc(
    "update_lead_estimated_value",
    {
      target_lead_id: parsed.data.leadId,
      target_estimated_value:
        estimatedValue,
    },
  )

  if (error) {
    return {
      status: "error",
      message:
        error.message ||
        "The estimated value could not be updated.",
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
        ? "Estimated value is unchanged."
        : estimatedValue === null
          ? "Estimated value cleared."
          : "Estimated value updated.",
  }
}