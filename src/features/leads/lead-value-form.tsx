"use client"

import { useActionState } from "react"
import { CircleDollarSign, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { updateLeadValueAction } from "@/features/leads/lead-value-actions"
import { initialLeadValueActionState } from "@/features/leads/lead-value-state"

type LeadValueFormProps = {
  leadId: string
  estimatedValue: number | null
}

export function LeadValueForm({
  leadId,
  estimatedValue,
}: LeadValueFormProps) {
  const [state, formAction, isPending] =
    useActionState(
      updateLeadValueAction,
      initialLeadValueActionState,
    )

  return (
    <form
      action={formAction}
      className="space-y-3"
    >
      <input
        type="hidden"
        name="leadId"
        value={leadId}
      />

      <label
        htmlFor={`estimated-value-${leadId}`}
        className="text-sm font-medium"
      >
        Estimated value
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <CircleDollarSign
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />

          <Input
            id={`estimated-value-${leadId}`}
            name="estimatedValue"
            type="number"
            min="0"
            max="9999999999.99"
            step="0.01"
            defaultValue={
              estimatedValue ?? ""
            }
            placeholder="0.00"
            className="pl-9"
            disabled={isPending}
            aria-invalid={Boolean(
              state.fieldErrors
                ?.estimatedValue,
            )}
          />
        </div>

        <Button
          type="submit"
          disabled={isPending}
        >
          <Save
            className="size-4"
            aria-hidden="true"
          />

          {isPending
            ? "Saving..."
            : "Save value"}
        </Button>
      </div>

      {state.fieldErrors?.estimatedValue?.map(
        (error) => (
          <p
            key={error}
            className="text-sm text-destructive"
          >
            {error}
          </p>
        ),
      )}

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