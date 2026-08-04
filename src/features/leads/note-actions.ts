"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import type { CreateLeadNoteState } from "@/features/leads/note-state"

import { createClient } from "@/lib/supabase/server"

const createLeadNoteSchema = z.object({
  leadId: z.string().uuid(),
  content: z
    .string()
    .trim()
    .min(1, "Enter a note.")
    .max(5000, "The note is too long."),
})

function getStringValue(
  formData: FormData,
  key: string,
): string {
  const value = formData.get(key)

  return typeof value === "string" ? value : ""
}

export async function createLeadNoteAction(
  _previousState: CreateLeadNoteState,
  formData: FormData,
): Promise<CreateLeadNoteState> {
  const parsed = createLeadNoteSchema.safeParse({
    leadId: getStringValue(formData, "leadId"),
    content: getStringValue(formData, "content"),
  })

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the note content.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.rpc(
    "create_lead_note",
    {
      target_lead_id: parsed.data.leadId,
      note_content: parsed.data.content,
    },
  )

  if (error || typeof data !== "string") {
    return {
      status: "error",
      message:
        "The note could not be added. Please try again.",
    }
  }

  revalidatePath(`/app/leads/${parsed.data.leadId}`)

  return {
    status: "success",
    message: "Note added.",
  }
}