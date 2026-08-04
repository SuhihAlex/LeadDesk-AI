import "server-only"

import type { PublicWorkspaceInvitation } from "@/features/workspace/types"
import { createAdminClient } from "@/lib/supabase/admin"

type InvitationRow = {
  token: string
  email: string
  status: "pending" | "accepted" | "revoked" | "expired"
  expires_at: string
  workspace:
    | {
        id: string
        name: string
      }
    | {
        id: string
        name: string
      }[]
    | null
}

export async function getInvitationByToken(
  token: string,
): Promise<PublicWorkspaceInvitation | null> {
  if (!/^[a-f0-9]{48}$/.test(token)) {
    return null
  }

  const admin = createAdminClient()

  const { data, error } = await admin
    .from("workspace_invitations")
    .select(
      `
        token,
        email,
        status,
        expires_at,
        workspace:workspaces!inner (
          id,
          name
        )
      `,
    )
    .eq("token", token)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  const row = data as InvitationRow

  const workspace = Array.isArray(row.workspace)
    ? row.workspace[0]
    : row.workspace

  if (!workspace) {
    return null
  }

  const expiresAt = row.expires_at

  return {
    token: row.token,
    email: row.email,
    status: row.status,
    expiresAt,
    isExpired: new Date(expiresAt).getTime() <= Date.now(),
    workspace,
  }
}