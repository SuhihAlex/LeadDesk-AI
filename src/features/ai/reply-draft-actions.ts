"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import type {
  ReplyDraftActionState,
} from "@/features/ai/reply-draft-state"
import { createClient } from "@/lib/supabase/server"

const updateReplyDraftSchema = z.object({
  leadId: z.string().uuid(),
  draftId: z.string().uuid(),

  subject: z
    .string()
    .trim()
    .min(1, "Subject is required.")
    .max(
      240,
      "Subject must contain no more than 240 characters.",
    ),

  body: z
    .string()
    .trim()
    .min(1, "Reply body is required.")
    .max(
      10000,
      "Reply body must contain no more than 10,000 characters.",
    ),
})

function getStringValue(
  formData: FormData,
  key: string,
): string {
  const value = formData.get(key)

  return typeof value === "string" ? value : ""
}

export async function updateReplyDraftAction(
  _previousState: ReplyDraftActionState,
  formData: FormData,
): Promise<ReplyDraftActionState> {
  const parsed = updateReplyDraftSchema.safeParse({
    leadId: getStringValue(formData, "leadId"),
    draftId: getStringValue(formData, "draftId"),
    subject: getStringValue(formData, "subject"),
    body: getStringValue(formData, "body"),
  })

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the reply draft fields.",
      fieldErrors:
        parsed.error.flatten().fieldErrors,
    }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.rpc(
    "update_lead_reply_draft",
    {
      target_lead_id: parsed.data.leadId,
      target_draft_id: parsed.data.draftId,
      draft_subject: parsed.data.subject,
      draft_body: parsed.data.body,
    },
  )

  if (error || data !== true) {
    return {
      status: "error",
      message:
        error?.message ||
        "The reply draft could not be saved.",
    }
  }

  revalidatePath(
    `/app/leads/${parsed.data.leadId}`,
  )

  return {
    status: "success",
    message: "Reply draft saved.",
  }
}