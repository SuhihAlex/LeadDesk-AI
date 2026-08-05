import "server-only"

import { leadStages } from "@/features/leads/constants"
import type {
  AiProcessingStatus,
  AiServiceFit,
  LeadBudgetRange,
  LeadPriority,
  LeadProjectType,
  LeadStage,
  PipelineColumn,
  PipelineLead,
  PipelineResult,
} from "@/features/leads/types"
import { getCurrentWorkspace } from "@/features/workspace/get-current-workspace"
import { createClient } from "@/lib/supabase/server"

type PipelineLeadRow = {
  id: string
  full_name: string
  company: string | null
  project_type: LeadProjectType
  budget_range: LeadBudgetRange
  estimated_value: number | string | null
  priority: LeadPriority
  stage: LeadStage
  ai_score: number | null
  ai_status: AiProcessingStatus
  qualification:
    | {
        service_fit: AiServiceFit
      }
    | {
        service_fit: AiServiceFit
      }[]
    | null
  is_unread: boolean
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
): number | null {
  if (value === null) {
    return null
  }

  const parsed =
    typeof value === "number"
      ? value
      : Number(value)

  return Number.isFinite(parsed) ? parsed : null
}

function getSingleRelation<T>(
  value: T | T[] | null,
): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value
}

export async function getPipelineLeads(): Promise<PipelineResult> {
  const context = await getCurrentWorkspace()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("leads")
    .select(
      `
        id,
        full_name,
        company,
        project_type,
        budget_range,
        estimated_value,
        priority,
        stage,
        ai_score,
        ai_status,
        qualification:lead_qualifications!lead_qualifications_lead_id_fkey (
          service_fit
        ),
        is_unread,
        created_at,
        assigned_profile:profiles!leads_assigned_to_fkey (
          id,
          full_name,
          avatar_url
        )
      `,
    )
    .eq("workspace_id", context.workspace.id)
    .order("created_at", {
      ascending: false,
    })
    .limit(200)

  if (error) {
    throw new Error(
      `Pipeline leads could not be loaded: ${error.message}`,
    )
  }

  const rows = (data ?? []) as PipelineLeadRow[]

  const leads: PipelineLead[] = rows.map((row) => {
    const assignedProfile = getSingleRelation(
      row.assigned_profile,
    )

    const qualification = getSingleRelation(
      row.qualification,
    )

    return {
      id: row.id,
      fullName: row.full_name,
      company: row.company,
      projectType: row.project_type,
      budgetRange: row.budget_range,
      estimatedValue: normalizeEstimatedValue(
        row.estimated_value,
      ),
      priority: row.priority,
      stage: row.stage,
      aiScore: row.ai_score,
      aiStatus: row.ai_status,
      aiServiceFit:
        qualification?.service_fit ?? null,
      isUnread: row.is_unread,
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

  const columns: PipelineColumn[] = leadStages.map((stage) => {
    const stageLeads = leads.filter(
      (lead) => lead.stage === stage,
    )

    return {
      stage,
      leads: stageLeads,
      count: stageLeads.length,
      estimatedValue: stageLeads.reduce(
        (total, lead) =>
          total + (lead.estimatedValue ?? 0),
        0,
      ),
    }
  })

  return {
    columns,
    totalLeads: leads.length,
    totalEstimatedValue: leads.reduce(
      (total, lead) =>
        total + (lead.estimatedValue ?? 0),
      0,
    ),
  }
}