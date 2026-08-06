"use client"

import { Crown, UserMinus } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  removeWorkspaceMemberAction,
  transferWorkspaceOwnershipAction,
} from "@/features/workspace/actions"

type WorkspaceMemberActionsProps = {
  membershipId: string
  memberName: string
}

export function WorkspaceMemberActions({
  membershipId,
  memberName,
}: WorkspaceMemberActionsProps) {
  const [isRemoving, setIsRemoving] =
    useState(false)
  const [isTransferring, setIsTransferring] =
    useState(false)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form
        action={transferWorkspaceOwnershipAction}
        onSubmit={(event) => {
          const confirmed = window.confirm(
            `Transfer workspace ownership to ${memberName}? You will become a Member and lose access to billing and Owner-only settings.`,
          )

          if (!confirmed) {
            event.preventDefault()
            return
          }

          setIsTransferring(true)
        }}
      >
        <input
          type="hidden"
          name="membershipId"
          value={membershipId}
        />

        <Button
          type="submit"
          size="sm"
          variant="outline"
          disabled={isRemoving || isTransferring}
        >
          <Crown
            className="size-4"
            aria-hidden="true"
          />
          {isTransferring
            ? "Transferring..."
            : "Make Owner"}
        </Button>
      </form>

      <form
        action={removeWorkspaceMemberAction}
        onSubmit={(event) => {
          const confirmed = window.confirm(
            `Remove ${memberName} from this workspace? Their lead and task assignments will become unassigned.`,
          )

          if (!confirmed) {
            event.preventDefault()
            return
          }

          setIsRemoving(true)
        }}
      >
        <input
          type="hidden"
          name="membershipId"
          value={membershipId}
        />

        <Button
          type="submit"
          size="sm"
          variant="ghost"
          disabled={isRemoving || isTransferring}
          className="text-destructive hover:text-destructive"
        >
          <UserMinus
            className="size-4"
            aria-hidden="true"
          />
          {isRemoving ? "Removing..." : "Remove"}
        </Button>
      </form>
    </div>
  )
}