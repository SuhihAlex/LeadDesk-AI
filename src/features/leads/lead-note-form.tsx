"use client"

import {
  useActionState,
  useEffect,
  useRef,
} from "react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createLeadNoteAction } from "@/features/leads/note-actions"
import { initialCreateLeadNoteState } from "@/features/leads/note-state"

type LeadNoteFormProps = {
  leadId: string
}

export function LeadNoteForm({
  leadId,
}: LeadNoteFormProps) {
  const [state, formAction, isPending] = useActionState(
    createLeadNoteAction,
    initialCreateLeadNoteState,
  )

  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset()
    }
  }, [state.status])

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-3"
    >
      <input
        type="hidden"
        name="leadId"
        value={leadId}
      />

      <label className="grid gap-2">
        <span className="text-sm font-medium">
          Add note
        </span>

        <Textarea
          name="content"
          placeholder="Write an internal note about this lead..."
          maxLength={5000}
          rows={4}
          disabled={isPending}
          aria-invalid={
            state.fieldErrors?.content ? true : undefined
          }
          aria-describedby={
            state.fieldErrors?.content
              ? "lead-note-content-error"
              : undefined
          }
        />
      </label>

      {state.fieldErrors?.content?.[0] && (
        <p
          id="lead-note-content-error"
          className="text-sm text-destructive"
        >
          {state.fieldErrors.content[0]}
        </p>
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
              : "text-sm text-success"
          }
        >
          {state.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={isPending}
      >
        {isPending ? "Adding..." : "Add note"}
      </Button>
    </form>
  )
}