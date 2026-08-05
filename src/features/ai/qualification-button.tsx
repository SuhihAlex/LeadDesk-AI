"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import {
  qualifyLeadAction,
} from "@/features/ai/qualification-actions"
import {
  initialQualifyLeadActionState,
} from "@/features/ai/qualification-state"

type QualificationButtonProps = {
  leadId: string
  isProcessing: boolean
  hasQualification: boolean
}

export function QualificationButton({
  leadId,
  isProcessing,
  hasQualification,
}: QualificationButtonProps) {
  const [state, formAction, isPending] =
    useActionState(
      qualifyLeadAction,
      initialQualifyLeadActionState,
    )

  return (
    <form action={formAction} className="space-y-3">
      <input
        type="hidden"
        name="leadId"
        value={leadId}
      />

      <Button
        type="submit"
        disabled={isPending || isProcessing}
      >
        {isPending || isProcessing
          ? "Processing..."
          : hasQualification
            ? "Run again"
            : "Run AI qualification"}
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