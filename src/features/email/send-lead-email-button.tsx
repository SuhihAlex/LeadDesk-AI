"use client"

import { useActionState } from "react"
import { MailCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { sendLeadEmailAction } from "@/features/email/send-lead-email-action"
import { initialSendLeadEmailState } from "@/features/email/send-email-state"

type SendLeadEmailButtonProps = {
  leadId: string
  draftId: string
  isSent: boolean
}

export function SendLeadEmailButton({
  leadId,
  draftId,
  isSent,
}: SendLeadEmailButtonProps) {
  const [state, formAction, isPending] =
    useActionState(
      sendLeadEmailAction,
      initialSendLeadEmailState,
    )

  return (
    <form
      action={formAction}
      className="space-y-2"
    >
      <input
        type="hidden"
        name="leadId"
        value={leadId}
      />

      <input
        type="hidden"
        name="draftId"
        value={draftId}
      />

      <Button
        type="submit"
        variant="outline"
        disabled={isPending || isSent}
      >
        <MailCheck
          className="size-4"
          aria-hidden="true"
        />

        {isPending
          ? "Sending..."
          : isSent
            ? "Email sent"
            : "Send email"}
      </Button>

      {state.message && (
        <p
          role={
            state.status === "error"
              ? "alert"
              : "status"
          }
          className={
            state.status === "error"
              ? "text-sm text-destructive"
              : "text-sm text-muted-foreground"
          }
        >
          {state.message}
        </p>
      )}
    </form>
  )
}