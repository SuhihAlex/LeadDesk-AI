import "server-only"

import { getCurrentWorkspace } from "@/features/workspace/get-current-workspace"
import type {
  InboxFilters,
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

function normalizeSearchQuery(
  value: string,
): string | undefined {
  const normalized = value
    .replace(/[%_*,()\\]/g, " ")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100)

  return normalized.length > 0 ? normalized : undefined
}

export async function getInboxLeads(
  filters: InboxFilters,
): Promise<LeadInboxResult> {
  const context = await getCurrentWorkspace()
  const supabase = await createClient()

  const workspaceCountQuery = supabase
    .from("leads")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("workspace_id", context.workspace.id)

  let query = supabase
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

  if (filters.query) {
    const search = normalizeSearchQuery(filters.query)

    if (search) {
      query = query.or(
        [
          `full_name.ilike.%${search}%`,
          `email.ilike.%${search}%`,
          `company.ilike.%${search}%`,
        ].join(","),
      )
    }
  }

  if (filters.stage) {
    query = query.eq("stage", filters.stage)
  }

  if (filters.priority) {
    query = query.eq("priority", filters.priority)
  }

  if (filters.source) {
    query = query.eq("source", filters.source)
  }

  if (filters.unreadOnly) {
    query = query.eq("is_unread", true)
  }

  switch (filters.sort) {
    case "oldest":
      query = query.order("created_at", {
        ascending: true,
      })
      break

    case "priority":
      query = query.order("priority", {
        ascending: false,
      })
      break

    case "score":
      query = query
        .order("ai_score", {
          ascending: false,
          nullsFirst: false,
        })
        .order("created_at", {
          ascending: false,
        })
      break

    default:
      query = query.order("created_at", {
        ascending: false,
      })
  }

  query = query.limit(50)

  const [
    { data, error, count },
    { error: workspaceCountError, count: workspaceCount },
  ] = await Promise.all([
    query,
    workspaceCountQuery,
  ])

  if (error) {
    throw new Error(`Inbox leads could not be loaded: ${error.message}`)
  }

  if (workspaceCountError) {
    throw new Error(
      `Inbox lead count could not be loaded: ${workspaceCountError.message}`,
    )
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
    workspaceTotal: workspaceCount ?? 0,
  }
}