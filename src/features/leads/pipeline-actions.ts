"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { createClient } from "@/lib/supabase/server"

const changeLeadStageSchema = z.object({
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

export type ChangeLeadStageInput = z.infer<
  typeof changeLeadStageSchema
>

export type ChangeLeadStageResult =
  | {
      status: "success"
      changed: boolean
    }
  | {
      status: "error"
      message: string
    }

export async function changeLeadStageAction(
  input: ChangeLeadStageInput,
): Promise<ChangeLeadStageResult> {
  const parsed = changeLeadStageSchema.safeParse(input)

  if (!parsed.success) {
    return {
      status: "error",
      message: "The selected pipeline stage is invalid.",
    }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.rpc(
    "change_lead_stage",
    {
      target_lead_id: parsed.data.leadId,
      target_stage: parsed.data.stage,
    },
  )

  if (error) {
    return {
      status: "error",
      message:
        "The lead stage could not be updated. Please try again.",
    }
  }

  revalidatePath("/app")
  revalidatePath("/app/pipeline")
  revalidatePath("/app/inbox")
  revalidatePath(
    `/app/leads/${parsed.data.leadId}`,
  )

  return {
    status: "success",
    changed: data === true,
  }
}