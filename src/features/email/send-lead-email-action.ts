"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { getEmailProvider } from "@/features/email/get-email-provider"
import type { SendLeadEmailState } from "@/features/email/send-email-state"
import { createClient } from "@/lib/supabase/server"

const sendLeadEmailSchema = z.object({
  leadId: z.string().uuid(),
  draftId: z.string().uuid(),
})

function getStringValue(
  formData: FormData,
  key: string,
): string {
  const value = formData.get(key)

  return typeof value === "string" ? value : ""
}

export async function sendLeadEmailAction(
  _previousState: SendLeadEmailState,
  formData: FormData,
): Promise<SendLeadEmailState> {
  const parsed = sendLeadEmailSchema.safeParse({
    leadId: getStringValue(
      formData,
      "leadId",
    ),
    draftId: getStringValue(
      formData,
      "draftId",
    ),
  })

  if (!parsed.success) {
    return {
      status: "error",
      message:
        "The email request is invalid.",
    }
  }

  const provider = getEmailProvider()
  const supabase = await createClient()

  const {
    data: deliveryId,
    error: claimError,
  } = await supabase.rpc(
    "claim_lead_reply_delivery",
    {
      target_lead_id: parsed.data.leadId,
      target_draft_id:
        parsed.data.draftId,
      target_provider: provider.name,
    },
  )

  if (claimError || !deliveryId) {
    return {
      status: "error",
      message:
        claimError?.message ||
        "The email delivery could not be started.",
    }
  }

  const {
    data: delivery,
    error: deliveryError,
  } = await supabase
    .from("lead_email_deliveries")
    .select(
      `
        recipient_email,
        subject,
        body
      `,
    )
    .eq("id", deliveryId)
    .single()

  if (deliveryError || !delivery) {
    await supabase.rpc(
      "fail_lead_reply_delivery",
      {
        target_delivery_id: deliveryId,
        target_error_message:
          deliveryError?.message ||
          "Delivery payload could not be loaded.",
      },
    )

    return {
      status: "error",
      message:
        "The email payload could not be loaded.",
    }
  }

  try {
    const result = await provider.send({
      to: delivery.recipient_email,
      subject: delivery.subject,
      body: delivery.body,
    })

    const {
      data: completed,
      error: completionError,
    } = await supabase.rpc(
      "complete_lead_reply_delivery",
      {
        target_delivery_id:
          deliveryId,
        target_provider_message_id:
          result.providerMessageId,
      },
    )

    if (completionError) {
      throw new Error(
        completionError.message,
      )
    }

    if (completed !== true) {
      return {
        status: "error",
        message:
          "The email delivery was already completed.",
      }
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Email provider failed."

    await supabase.rpc(
      "fail_lead_reply_delivery",
      {
        target_delivery_id: deliveryId,
        target_error_message: message,
      },
    )

    return {
      status: "error",
      message:
        "Email delivery failed. The draft remains available.",
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
      provider.name === "mock"
        ? "Mock email sent successfully."
        : "Email sent successfully.",
  }
}