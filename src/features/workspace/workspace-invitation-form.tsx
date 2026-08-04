"use client"

import { useActionState } from "react"
import { LoaderCircle, UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createWorkspaceInvitationAction } from "@/features/workspace/actions"
import {
  initialWorkspaceInvitationActionState,
} from "@/features/workspace/types"
import { WorkspaceInvitationMessage } from "@/features/workspace/workspace-invitation-message"

export function WorkspaceInvitationForm() {
  const [state, formAction, pending] = useActionState(
    createWorkspaceInvitationAction,
    initialWorkspaceInvitationActionState,
  )

  return (
    <form action={formAction} className="space-y-4">
      <WorkspaceInvitationMessage state={state} />

      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="invitation-email">Member email</Label>

          <Input
            id="invitation-email"
            name="email"
            type="email"
            placeholder="member@example.com"
            autoComplete="email"
            disabled={pending}
            required
            aria-invalid={Boolean(state.fieldErrors?.email)}
            aria-describedby={
              state.fieldErrors?.email
                ? "invitation-email-error"
                : undefined
            }
          />

          {state.fieldErrors?.email?.[0] && (
            <p
              id="invitation-email-error"
              className="text-sm text-destructive"
              role="alert"
            >
              {state.fieldErrors.email[0]}
            </p>
          )}
        </div>

        <Button type="submit" disabled={pending}>
          {pending ? (
            <LoaderCircle
              className="size-4 animate-spin"
              aria-hidden="true"
            />
          ) : (
            <UserPlus className="size-4" aria-hidden="true" />
          )}

          {pending ? "Creating..." : "Create invitation"}
        </Button>
      </div>

      <p className="text-xs leading-5 text-muted-foreground">
        Invitations expire after seven days and grant the Member role.
      </p>
    </form>
  )
}