"use client"

import { useActionState } from "react"
import { Flag, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  leadPriorityLabels,
} from "@/features/leads/constants"
import {
  updateLeadPriorityAction,
} from "@/features/leads/lead-priority-actions"
import {
  initialLeadPriorityActionState,
} from "@/features/leads/lead-priority-state"
import type {
  LeadPriority,
} from "@/features/leads/types"

type LeadPriorityFormProps = {
  leadId: string
  priority: LeadPriority
}

const leadPriorities: LeadPriority[] = [
  "low",
  "medium",
  "high",
  "urgent",
]

export function LeadPriorityForm({
  leadId,
  priority,
}: LeadPriorityFormProps) {
  const [state, formAction, isPending] =
    useActionState(
      updateLeadPriorityAction,
      initialLeadPriorityActionState,
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
        htmlFor={`lead-priority-${leadId}`}
        className="text-sm font-medium"
      >
        Lead priority
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Flag
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />

          <select
            id={`lead-priority-${leadId}`}
            name="priority"
            defaultValue={priority}
            disabled={isPending}
            className="h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-invalid={Boolean(
              state.fieldErrors?.priority,
            )}
          >
            {leadPriorities.map((value) => (
              <option
                key={value}
                value={value}
              >
                {leadPriorityLabels[value]}
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
            : "Save priority"}
        </Button>
      </div>

      {state.fieldErrors?.priority?.map(
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