"use client"

import { useActionState } from "react"
import { Columns3, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  leadStageLabels,
  leadStages,
} from "@/features/leads/constants"
import { updateLeadStageAction } from "@/features/leads/lead-stage-actions"
import { initialLeadStageActionState } from "@/features/leads/lead-stage-state"
import type { LeadStage } from "@/features/leads/types"

type LeadStageFormProps = {
  leadId: string
  stage: LeadStage
}

export function LeadStageForm({
  leadId,
  stage,
}: LeadStageFormProps) {
  const [state, formAction, isPending] =
    useActionState(
      updateLeadStageAction,
      initialLeadStageActionState,
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
        htmlFor={`lead-stage-${leadId}`}
        className="text-sm font-medium"
      >
        Lead stage
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Columns3
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />

          <select
            id={`lead-stage-${leadId}`}
            name="stage"
            defaultValue={stage}
            disabled={isPending}
            className="h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-invalid={Boolean(
              state.fieldErrors?.stage,
            )}
          >
            {leadStages.map((value) => (
              <option
                key={value}
                value={value}
              >
                {leadStageLabels[value]}
              </option>
            ))}
          </select>
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
            : "Save stage"}
        </Button>
      </div>

      {state.fieldErrors?.stage?.map(
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