import "server-only"

import { getCurrentWorkspace } from "@/features/workspace/get-current-workspace"
import type {
  LeadActivityItem,
  LeadActivityType,
  LeadBudgetRange,
  LeadDetails,
  LeadNote,
  LeadPriority,
  LeadProjectType,
  LeadSource,
  LeadStage,
  LeadTimeline,
} from "@/features/leads/types"
import { createClient } from "@/lib/supabase/server"

type LeadDetailsRow = {
  id: string
  full_name: string
  email: string
  company: string | null
  website_url: string | null
  description: string
  project_type: LeadProjectType
  budget_range: LeadBudgetRange
  desired_timeline: LeadTimeline
  source: LeadSource
  stage: LeadStage
  priority: LeadPriority
  is_unread: boolean
  estimated_value: number | string | null
  ai_score: number | null
  ai_summary: string | null
  ai_completeness_score: number | null
  ai_processed_at: string | null
  consent_given: boolean
  created_at: string
  updated_at: string
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

type LeadActivityRow = {
  id: string
  activity_type: LeadActivityType
  title: string
  details: unknown
  created_at: string
  actor_profile:
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

type LeadNoteRow = {
  id: string
  content: string
  created_at: string
  updated_at: string
  author_profile:
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

function normalizeDetails(
  value: unknown,
): Record<string, unknown> {
  if (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  ) {
    return value as Record<string, unknown>
  }

  return {}
}

function getSingleRelation<T>(
  value: T | T[] | null,
): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value
}

export async function getLeadDetails(
  leadId: string,
): Promise<LeadDetails | null> {
  const context = await getCurrentWorkspace()
  const supabase = await createClient()

  const [
    { data: leadData, error: leadError },
    { data: noteData, error: noteError },
    { data: activityData, error: activityError },
  ] = await Promise.all([
    supabase
      .from("leads")
      .select(
        `
          id,
          full_name,
          email,
          company,
          website_url,
          description,
          project_type,
          budget_range,
          desired_timeline,
          source,
          stage,
          priority,
          is_unread,
          estimated_value,
          ai_score,
          ai_summary,
          ai_completeness_score,
          ai_processed_at,
          consent_given,
          created_at,
          updated_at,
          assigned_profile:profiles!leads_assigned_to_fkey (
            id,
            full_name,
            avatar_url
          )
        `,
      )
      .eq("workspace_id", context.workspace.id)
      .eq("id", leadId)
      .maybeSingle(),

    supabase
      .from("lead_notes")
      .select(
        `
          id,
          content,
          created_at,
          updated_at,
          author_profile:profiles!lead_notes_author_id_fkey (
            id,
            full_name,
            avatar_url
          )
        `,
      )
      .eq("workspace_id", context.workspace.id)
      .eq("lead_id", leadId)
      .order("created_at", {
        ascending: false,
      }),
    supabase
      .from("lead_activities")
      .select(
        `
          id,
          activity_type,
          title,
          details,
          created_at,
          actor_profile:profiles!lead_activities_actor_id_fkey (
            id,
            full_name,
            avatar_url
          )
        `,
      )
      .eq("workspace_id", context.workspace.id)
      .eq("lead_id", leadId)
      .order("created_at", {
        ascending: false,
      }),
  ])

  if (leadError) {
    throw new Error(
      `Lead details could not be loaded: ${leadError.message}`,
    )
  }

  if (!leadData) {
    return null
  }

  if (noteError) {
    throw new Error(
      `Lead notes could not be loaded: ${noteError.message}`,
    )
  }

  if (activityError) {
    throw new Error(
      `Lead activity could not be loaded: ${activityError.message}`,
    )
  }

  const lead = leadData as LeadDetailsRow
  const assignedProfile = getSingleRelation(
    lead.assigned_profile,
  )

  const notes: LeadNote[] = (
    (noteData ?? []) as LeadNoteRow[]
  ).flatMap((note) => {
    const authorProfile = getSingleRelation(
      note.author_profile,
    )

    if (!authorProfile) {
      return []
    }

    return [
      {
        id: note.id,
        content: note.content,
        createdAt: note.created_at,
        updatedAt: note.updated_at,
        author: {
          id: authorProfile.id,
          fullName: authorProfile.full_name,
          avatarUrl: authorProfile.avatar_url,
        },
      },
    ]
  })

  const activities: LeadActivityItem[] = (
    (activityData ?? []) as LeadActivityRow[]
  ).map((activity) => {
    const actorProfile = getSingleRelation(
      activity.actor_profile,
    )

    return {
      id: activity.id,
      type: activity.activity_type,
      title: activity.title,
      details: normalizeDetails(activity.details),
      createdAt: activity.created_at,
      actor: actorProfile
        ? {
            id: actorProfile.id,
            fullName: actorProfile.full_name,
            avatarUrl: actorProfile.avatar_url,
          }
        : null,
    }
  })

  return {
    id: lead.id,
    fullName: lead.full_name,
    email: lead.email,
    company: lead.company,
    websiteUrl: lead.website_url,
    description: lead.description,
    projectType: lead.project_type,
    budgetRange: lead.budget_range,
    desiredTimeline: lead.desired_timeline,
    source: lead.source,
    stage: lead.stage,
    priority: lead.priority,
    isUnread: lead.is_unread,
    estimatedValue: normalizeEstimatedValue(
      lead.estimated_value,
    ),
    aiScore: lead.ai_score,
    aiSummary: lead.ai_summary,
    aiCompletenessScore:
      lead.ai_completeness_score,
    aiProcessedAt: lead.ai_processed_at,
    consentGiven: lead.consent_given,
    createdAt: lead.created_at,
    updatedAt: lead.updated_at,
    assignedTo: assignedProfile
      ? {
          id: assignedProfile.id,
          fullName: assignedProfile.full_name,
          avatarUrl: assignedProfile.avatar_url,
        }
      : null,
    notes,
    activities,
  }
}