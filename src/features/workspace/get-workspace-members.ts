import "server-only"

import { cache } from "react"

import { getCurrentWorkspace } from "@/features/workspace/get-current-workspace"
import type { WorkspaceMember } from "@/features/workspace/types"
import { getInitials } from "@/lib/get-initials"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

type MembershipRow = {
  id: string
  user_id: string
  role: "owner" | "member"
  joined_at: string
  profile:
    | {
        full_name: string
        avatar_url: string | null
      }
    | {
        full_name: string
        avatar_url: string | null
      }[]
    | null
}

export const getWorkspaceMembers = cache(
  async (): Promise<WorkspaceMember[]> => {
    const context = await getCurrentWorkspace()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("workspace_members")
      .select(
        `
          id,
          user_id,
          role,
          joined_at,
          profile:profiles!workspace_members_user_id_fkey (
            full_name,
            avatar_url
          )
        `,
      )
      .eq("workspace_id", context.workspace.id)
      .order("joined_at", {
        ascending: true,
      })

    if (error) {
      throw new Error(`Workspace members could not be loaded: ${error.message}`)
    }

    const rows = (data ?? []) as MembershipRow[]
    const admin = createAdminClient()

    const members = await Promise.all(
      rows.map(async (membership) => {
        const profile = Array.isArray(membership.profile)
          ? membership.profile[0]
          : membership.profile

        const { data: userData, error: userError } =
          await admin.auth.admin.getUserById(membership.user_id)

        if (userError) {
          throw new Error(
            `Workspace member email could not be loaded: ${userError.message}`,
          )
        }

        const email = userData.user.email ?? ""
        const fullName =
          profile?.full_name?.trim() ||
          email.split("@")[0] ||
          "Workspace member"

        return {
          id: membership.id,
          userId: membership.user_id,
          fullName,
          email,
          avatarUrl: profile?.avatar_url ?? null,
          initials: getInitials(fullName),
          role: membership.role,
          joinedAt: membership.joined_at,
          isCurrentUser: membership.user_id === context.user.id,
        }
      }),
    )

    return members
  },
)