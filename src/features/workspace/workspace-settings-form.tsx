"use client"

import { useActionState } from "react"
import { LoaderCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateWorkspaceSettingsAction } from "@/features/workspace/actions"
import {
  initialWorkspaceSettingsActionState,
  type CurrentWorkspaceContext,
} from "@/features/workspace/types"
import { WorkspaceSettingsMessage } from "@/features/workspace/workspace-settings-message"

type WorkspaceSettingsFormProps = {
  context: CurrentWorkspaceContext
}

function FieldError({ errors }: { errors?: string[] }) {
  const message = errors?.[0]

  if (!message) {
    return null
  }

  return (
    <p className="text-sm text-destructive" role="alert">
      {message}
    </p>
  )
}

export function WorkspaceSettingsForm({
  context,
}: WorkspaceSettingsFormProps) {
  const [state, formAction, pending] = useActionState(
    updateWorkspaceSettingsAction,
    initialWorkspaceSettingsActionState,
  )

  const isOwner = context.workspace.role === "owner"

  return (
    <form action={formAction} className="space-y-6">
      <WorkspaceSettingsMessage state={state} />

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="full-name">Full name</Label>

          <Input
            id="full-name"
            name="fullName"
            defaultValue={context.user.fullName}
            autoComplete="name"
            disabled={pending}
            required
            aria-invalid={Boolean(state.fieldErrors?.fullName)}
            aria-describedby={
              state.fieldErrors?.fullName
                ? "settings-full-name-error"
                : undefined
            }
          />

          <div id="settings-full-name-error">
            <FieldError errors={state.fieldErrors?.fullName} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="account-email">Email address</Label>

          <Input
            id="account-email"
            value={context.user.email}
            disabled
            readOnly
          />

          <p className="text-xs leading-5 text-muted-foreground">
            Email changes are not included in the MVP.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="workspace-name">Company name</Label>

        <Input
          id="workspace-name"
          name="workspaceName"
          defaultValue={context.workspace.name}
          autoComplete="organization"
          disabled={pending || !isOwner}
          required
          aria-invalid={Boolean(state.fieldErrors?.workspaceName)}
          aria-describedby={
            state.fieldErrors?.workspaceName
              ? "settings-workspace-name-error"
              : undefined
          }
        />

        {!isOwner && (
          <input
            type="hidden"
            name="workspaceName"
            value={context.workspace.name}
          />
        )}

        <div id="settings-workspace-name-error">
          <FieldError errors={state.fieldErrors?.workspaceName} />
        </div>

        {!isOwner && (
          <p className="text-xs leading-5 text-muted-foreground">
            Only the workspace Owner can change the company name.
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending && (
            <LoaderCircle
              className="size-4 animate-spin"
              aria-hidden="true"
            />
          )}

          {pending ? "Saving changes..." : "Save changes"}
        </Button>
      </div>
    </form>
  )
}