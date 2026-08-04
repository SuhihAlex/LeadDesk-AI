"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { createClient } from "@/lib/supabase/server"

const openLeadSchema = z.object({
  leadId: z.string().uuid(),
})

const assignLeadSchema = z.object({
  leadId: z.string().uuid(),
  assigneeId: z
    .union([
      z.string().uuid(),
      z.literal(""),
    ]),
})

function getStringValue(
  formData: FormData,
  key: string,
): string {
  const value = formData.get(key)

  return typeof value === "string" ? value : ""
}

export async function openLeadAction(
  formData: FormData,
): Promise<never> {
  const parsed = openLeadSchema.safeParse({
    leadId: getStringValue(formData, "leadId"),
  })

  if (!parsed.success) {
    redirect("/app/inbox")
  }

  const supabase = await createClient()

  const { error } = await supabase.rpc(
    "mark_lead_viewed",
    {
      target_lead_id: parsed.data.leadId,
    },
  )

  if (error) {
    throw new Error(
      "The lead could not be opened. Please try again.",
    )
  }

  redirect(`/app/leads/${parsed.data.leadId}`)
}

export async function assignLeadAction(
  formData: FormData,
): Promise<never> {
  const parsed = assignLeadSchema.safeParse({
    leadId: getStringValue(formData, "leadId"),
    assigneeId: getStringValue(
      formData,
      "assigneeId",
    ),
  })

  if (!parsed.success) {
    redirect("/app/inbox")
  }

  const supabase = await createClient()

  const { error } = await supabase.rpc(
    "assign_lead",
    {
      target_lead_id: parsed.data.leadId,
      target_assignee_id:
        parsed.data.assigneeId || null,
    },
  )

  if (error) {
    throw new Error(
      "The lead assignment could not be updated.",
    )
  }

  revalidatePath("/app/inbox")
  revalidatePath(
    `/app/leads/${parsed.data.leadId}`,
  )

  redirect(`/app/leads/${parsed.data.leadId}`)
}