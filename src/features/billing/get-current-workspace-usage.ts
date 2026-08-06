import "server-only"

import { cache } from "react"

import { getCurrentWorkspace } from "@/features/workspace/get-current-workspace"
import { createClient } from "@/lib/supabase/server"

export type WorkspaceBillingUsage = {
  leads: number
  aiGenerations: number
  emails: number
  members: number
}

type WorkspaceBillingUsageRow = {
  lead_count: number
  ai_generation_count: number
  email_count: number
  member_count: number
}

export const getCurrentWorkspaceUsage = cache(
  async (): Promise<WorkspaceBillingUsage | null> => {
    const context = await getCurrentWorkspace()

    if (context.workspace.role !== "owner") {
      return null
    }

    const supabase = await createClient()

    const { data, error } = await supabase.rpc(
      "get_workspace_monthly_usage",
      {
        target_workspace_id: context.workspace.id,
      },
    )

    if (error) {
      console.error(
        "Workspace billing usage could not be loaded.",
        error,
      )

      return null
    }

    const row = Array.isArray(data)
      ? (data[0] as WorkspaceBillingUsageRow | undefined)
      : null

    if (!row) {
      return null
    }

    return {
      leads: Number(row.lead_count),
      aiGenerations: Number(
        row.ai_generation_count,
      ),
      emails: Number(row.email_count),
      members: Number(row.member_count),
    }
  },
)
