"use client"

import {
  useActionState,
  useState,
} from "react"
import {
  Check,
  Copy,
  Save,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  updateReplyDraftAction,
} from "@/features/ai/reply-draft-actions"
import {
  initialReplyDraftActionState,
} from "@/features/ai/reply-draft-state"

type ReplyDraftFormProps = {
  leadId: string
  draft: {
    id: string
    subject: string
    body: string
    status: "ai_generated" | "edited" | "sent"
  }
}

export function ReplyDraftForm({
  leadId,
  draft,
}: ReplyDraftFormProps) {
  const [state, formAction, isPending] =
    useActionState(
      updateReplyDraftAction,
      initialReplyDraftActionState,
    )

  const [subject, setSubject] =
    useState(draft.subject)
  const [body, setBody] =
    useState(draft.body)
  const [copied, setCopied] =
    useState(false)

  const isSent = draft.status === "sent"

  async function copyDraft() {
    const message = `Subject: ${subject}\n\n${body}`

    try {
      await navigator.clipboard.writeText(
        message,
      )

      setCopied(true)

      window.setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-xl border bg-muted/20 p-4"
    >
      <input
        type="hidden"
        name="leadId"
        value={leadId}
      />

      <input
        type="hidden"
        name="draftId"
        value={draft.id}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium">
            Reply draft
          </p>

          <p className="mt-1 text-xs capitalize text-muted-foreground">
            Status:{" "}
            {draft.status.replace("_", " ")}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={copyDraft}
        >
          {copied ? (
            <Check
              className="size-4"
              aria-hidden="true"
            />
          ) : (
            <Copy
              className="size-4"
              aria-hidden="true"
            />
          )}

          {copied ? "Copied" : "Copy"}
        </Button>
      </div>

      <div className="space-y-2">
        <label
          htmlFor={`reply-subject-${draft.id}`}
          className="text-sm font-medium"
        >
          Subject
        </label>

        <Input
          id={`reply-subject-${draft.id}`}
          name="subject"
          value={subject}
          onChange={(event) => {
            setSubject(event.target.value)
          }}
          maxLength={240}
          disabled={isPending || isSent}
          aria-invalid={
            Boolean(
              state.fieldErrors?.subject,
            )
          }
        />

        {state.fieldErrors?.subject?.map(
          (error) => (
            <p
              key={error}
              className="text-sm text-destructive"
            >
              {error}
            </p>
          ),
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor={`reply-body-${draft.id}`}
          className="text-sm font-medium"
        >
          Message
        </label>

        <Textarea
          id={`reply-body-${draft.id}`}
          name="body"
          value={body}
          onChange={(event) => {
            setBody(event.target.value)
          }}
          rows={12}
          maxLength={10000}
          disabled={isPending || isSent}
          className="min-h-64 resize-y"
          aria-invalid={
            Boolean(
              state.fieldErrors?.body,
            )
          }
        />

        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>
            {body.length.toLocaleString(
              "en-US",
            )}
            /10,000
          </span>

          {isSent && (
            <span>
              Sent drafts are read-only.
            </span>
          )}
        </div>

        {state.fieldErrors?.body?.map(
          (error) => (
            <p
              key={error}
              className="text-sm text-destructive"
            >
              {error}
            </p>
          ),
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          disabled={isPending || isSent}
        >
          <Save
            className="size-4"
            aria-hidden="true"
          />

          {isPending
            ? "Saving..."
            : "Save draft"}
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
      </div>
    </form>
  )
}