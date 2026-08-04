import "server-only"

import { cache } from "react"

import { getCurrentWorkspace } from "@/features/workspace/get-current-workspace"
import type { WorkspaceInvitation } from "@/features/workspace/types"
import { createClient } from "@/lib/supabase/server"

export const getWorkspaceInvitations = cache(
  async (): Promise<WorkspaceInvitation[]> => {
    const context = await getCurrentWorkspace()

    if (context.workspace.role !== "owner") {
      return []
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("workspace_invitations")
      .select(
        `
          id,
          email,
          role,
          token,
          status,
          expires_at,
          created_at
        `,
      )
      .eq("workspace_id", context.workspace.id)
      .eq("status", "pending")
      .order("created_at", {
        ascending: false,
      })

    if (error) {
      throw new Error(
        `Workspace invitations could not be loaded: ${error.message}`,
      )
    }

    return (data ?? []).map((invitation) => ({
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      token: invitation.token,
      status: invitation.status,
      expiresAt: invitation.expires_at,
      createdAt: invitation.created_at,
    }))
  },
)