import "server-only"

import { cache } from "react"
import { redirect } from "next/navigation"

import type { CurrentWorkspaceContext } from "@/features/workspace/types"
import { getInitials } from "@/lib/get-initials"
import { createClient } from "@/lib/supabase/server"

export const getCurrentWorkspace = cache(
  async (): Promise<CurrentWorkspaceContext> => {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      redirect("/login")
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      throw new Error("The authenticated user profile could not be loaded.")
    }

    const { data: membership, error: membershipError } = await supabase
      .from("workspace_members")
      .select(
        `
          role,
          workspace:workspaces!inner (
            id,
            name,
            slug,
            logo_url
          )
        `,
      )
      .eq("user_id", user.id)
      .order("joined_at", {
        ascending: true,
      })
      .limit(1)
      .single()

    if (membershipError || !membership) {
      throw new Error("The current workspace membership could not be loaded.")
    }

    const workspace = Array.isArray(membership.workspace)
      ? membership.workspace[0]
      : membership.workspace

    if (!workspace) {
      throw new Error("The current workspace could not be loaded.")
    }

    const email = user.email ?? ""
    const fullName =
      profile.full_name.trim() ||
      email.split("@")[0] ||
      "LeadDesk User"

    return {
      user: {
        id: user.id,
        email,
        fullName,
        initials: getInitials(fullName),
        avatarUrl: profile.avatar_url,
      },
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        logoUrl: workspace.logo_url,
        role: membership.role,
      },
    }
  },
)