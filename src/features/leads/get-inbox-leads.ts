import "server-only"

import { getCurrentWorkspace } from "@/features/workspace/get-current-workspace"
import type {
  LeadBudgetRange,
  LeadInboxResult,
  LeadListItem,
  LeadPriority,
  LeadProjectType,
  LeadSource,
  LeadStage,
  LeadTimeline,
} from "@/features/leads/types"
import { createClient } from "@/lib/supabase/server"

type LeadRow = {
  id: string
  full_name: string
  email: string
  company: string | null
  project_type: LeadProjectType
  budget_range: LeadBudgetRange
  desired_timeline: LeadTimeline
  source: LeadSource
  stage: LeadStage
  priority: LeadPriority
  is_unread: boolean
  estimated_value: number | string | null
  ai_score: number | null
  created_at: string
  assigned_profile:
    | {
        id: string
        full_name: string
        avatar_url: string | null
      }
    | {
        id: string
        full_name: string
        avatar_url: string | null
      }[]
    | null
}

function normalizeEstimatedValue(
  value: number | string | null,
) {
  if (value === null) {
    return null
  }

  const parsed = typeof value === "number" ? value : Number(value)

  return Number.isFinite(parsed) ? parsed : null
}

export async function getInboxLeads(): Promise<LeadInboxResult> {
  const context = await getCurrentWorkspace()
  const supabase = await createClient()

  const { data, error, count } = await supabase
    .from("leads")
    .select(
      `
        id,
        full_name,
        email,
        company,
        project_type,
        budget_range,
        desired_timeline,
        source,
        stage,
        priority,
        is_unread,
        estimated_value,
        ai_score,
        created_at,
        assigned_profile:profiles!leads_assigned_to_fkey (
          id,
          full_name,
          avatar_url
        )
      `,
      {
        count: "exact",
      },
    )
    .eq("workspace_id", context.workspace.id)
    .order("created_at", {
      ascending: false,
    })
    .limit(50)

  if (error) {
    throw new Error(`Inbox leads could not be loaded: ${error.message}`)
  }

  const rows = (data ?? []) as LeadRow[]

  const leads: LeadListItem[] = rows.map((row) => {
    const assignedProfile = Array.isArray(row.assigned_profile)
      ? row.assigned_profile[0]
      : row.assigned_profile

    return {
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      company: row.company,
      projectType: row.project_type,
      budgetRange: row.budget_range,
      desiredTimeline: row.desired_timeline,
      source: row.source,
      stage: row.stage,
      priority: row.priority,
      isUnread: row.is_unread,
      estimatedValue: normalizeEstimatedValue(row.estimated_value),
      aiScore: row.ai_score,
      createdAt: row.created_at,
      assignedTo: assignedProfile
        ? {
            id: assignedProfile.id,
            fullName: assignedProfile.full_name,
            avatarUrl: assignedProfile.avatar_url,
          }
        : null,
    }
  })

  return {
    leads,
    total: count ?? leads.length,
  }
}