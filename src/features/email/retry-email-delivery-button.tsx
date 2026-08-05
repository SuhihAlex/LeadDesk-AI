"use client"

import { useActionState } from "react"
import {
  LoaderCircle,
  RotateCcw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { sendLeadEmailAction } from "@/features/email/send-lead-email-action"
import { initialSendLeadEmailState } from "@/features/email/send-email-state"

type RetryEmailDeliveryButtonProps = {
  leadId: string
  draftId: string
}

export function RetryEmailDeliveryButton({
  leadId,
  draftId,
}: RetryEmailDeliveryButtonProps) {
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
        size="sm"
        disabled={isPending}
      >
        {isPending ? (
          <LoaderCircle
            className="size-4 animate-spin"
            aria-hidden="true"
          />
        ) : (
          <RotateCcw
            className="size-4"
            aria-hidden="true"
          />
        )}

        {isPending
          ? "Retrying..."
          : "Retry"}
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
              ? "max-w-64 text-xs text-destructive"
              : "max-w-64 text-xs text-muted-foreground"
          }
        >
          {state.message}
        </p>
      )}
    </form>
  )
}