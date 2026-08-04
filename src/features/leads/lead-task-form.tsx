"use client"

import {
  useActionState,
  useEffect,
  useRef,
} from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createLeadTaskAction } from "@/features/leads/task-actions"
import { initialCreateLeadTaskState } from "@/features/leads/task-state"

type LeadTaskFormProps = {
  leadId: string
  members: {
    userId: string
    fullName: string
    isCurrentUser: boolean
  }[]
}

export function LeadTaskForm({
  leadId,
  members,
}: LeadTaskFormProps) {
  const [state, formAction, isPending] = useActionState(
    createLeadTaskAction,
    initialCreateLeadTaskState,
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
      className="space-y-4"
    >
      <input
        type="hidden"
        name="leadId"
        value={leadId}
      />

      <label className="grid gap-2">
        <span className="text-sm font-medium">
          Title
        </span>

        <Input
          name="title"
          placeholder="Follow up with the lead"
          maxLength={240}
          disabled={isPending}
          aria-invalid={
            state.fieldErrors?.title ? true : undefined
          }
        />
      </label>

      {state.fieldErrors?.title?.[0] && (
        <p className="text-sm text-destructive">
          {state.fieldErrors.title[0]}
        </p>
      )}

      <label className="grid gap-2">
        <span className="text-sm font-medium">
          Description
        </span>

        <Textarea
          name="description"
          placeholder="Optional task details..."
          maxLength={5000}
          rows={3}
          disabled={isPending}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium">
            Due date
          </span>

          <Input
            type="datetime-local"
            name="dueAt"
            disabled={isPending}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">
            Assignee
          </span>

          <select
            name="assigneeId"
            defaultValue=""
            disabled={isPending}
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <option value="">Unassigned</option>

            {members.map((member) => (
              <option
                key={member.userId}
                value={member.userId}
              >
                {member.fullName}
                {member.isCurrentUser ? " (You)" : ""}
              </option>
            ))}
          </select>
        </label>
      </div>

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
        {isPending ? "Creating..." : "Create task"}
      </Button>
    </form>
  )
}