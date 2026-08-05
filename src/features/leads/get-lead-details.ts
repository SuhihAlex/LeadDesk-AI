import "server-only"

import { getCurrentWorkspace } from "@/features/workspace/get-current-workspace"
import type {
  AiProcessingStatus,
  LeadActivityItem,
  LeadActivityType,
  LeadBudgetRange,
  LeadDetails,
  LeadNote,
  LeadPriority,
  LeadProjectType,
  LeadQualification,
  LeadReplyDraft,
  LeadSource,
  LeadStage,
  LeadTimeline,
} from "@/features/leads/types"
import { createClient } from "@/lib/supabase/server"

import type {
  TaskStatus,
  WorkspaceTask,
} from "@/features/tasks/types"

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
  ai_status: AiProcessingStatus
  ai_last_error: string | null
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

type LeadTaskRow = {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  due_at: string | null
  completed_at: string | null
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
  creator_profile:
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

type LeadQualificationRow = {
  id: string
  summary: string
  score: number
  completeness_score: number
  priority: LeadPriority
  service_fit: "poor" | "partial" | "good" | "excellent"
  urgency: "low" | "medium" | "high"
  extracted_project_type: string | null
  extracted_services: unknown
  extracted_budget: string | null
  extracted_timeline: string | null
  extracted_company_context: string | null
  extracted_main_goal: string | null
  missing_information: unknown
  risks: unknown
  score_breakdown: unknown
  model: string
  prompt_version: string
  created_at: string
  updated_at: string
}

type LeadReplyDraftRow = {
  id: string
  subject: string
  body: string
  status: "ai_generated" | "edited" | "sent"
  generated_by_model: string | null
  created_at: string
  updated_at: string
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

function normalizeStringArray(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter(
    (item): item is string =>
      typeof item === "string",
  )
}

function getNumberValue(
    value: unknown,
    fallback = 0,
  ): number {
    return typeof value === "number"
      ? value
      : fallback
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
    { data: taskData, error: taskError },
    {
      data: qualificationData,
      error: qualificationError,
    },
    {
      data: replyDraftData,
      error: replyDraftError,
    },
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
          ai_status,
          ai_last_error,
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
      .from("tasks")
      .select(
        `
          id,
          title,
          description,
          status,
          due_at,
          completed_at,
          created_at,
          updated_at,
          assigned_profile:profiles!tasks_assigned_to_fkey (
            id,
            full_name,
            avatar_url
          ),
          creator_profile:profiles!tasks_created_by_fkey (
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
      .from("lead_qualifications")
      .select(
        `
          id,
          summary,
          score,
          completeness_score,
          priority,
          service_fit,
          urgency,
          extracted_project_type,
          extracted_services,
          extracted_budget,
          extracted_timeline,
          extracted_company_context,
          extracted_main_goal,
          missing_information,
          risks,
          score_breakdown,
          model,
          prompt_version,
          created_at,
          updated_at
        `,
      )
      .eq("workspace_id", context.workspace.id)
      .eq("lead_id", leadId)
      .maybeSingle(),

    supabase
      .from("lead_reply_drafts")
      .select(
        `
          id,
          subject,
          body,
          status,
          generated_by_model,
          created_at,
          updated_at
        `,
      )
      .eq("workspace_id", context.workspace.id)
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),

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

  if (taskError) {
    throw new Error(
      `Lead tasks could not be loaded: ${taskError.message}`,
    )
  }

  if (qualificationError) {
    throw new Error(
      `Lead qualification could not be loaded: ${qualificationError.message}`,
    )
  }

  if (replyDraftError) {
    throw new Error(
      `Lead reply draft could not be loaded: ${replyDraftError.message}`,
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

  const tasks: WorkspaceTask[] = (
    (taskData ?? []) as LeadTaskRow[]
  ).flatMap((task) => {
    const assignedProfile = getSingleRelation(
      task.assigned_profile,
    )
    const creatorProfile = getSingleRelation(
      task.creator_profile,
    )

    if (!creatorProfile) {
      return []
    }

    return [
      {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        dueAt: task.due_at,
        completedAt: task.completed_at,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        isOverdue:
          task.status !== "completed" &&
          task.due_at !== null &&
          new Date(task.due_at).getTime() < Date.now(),
        lead: {
          id: lead.id,
          fullName: lead.full_name,
          company: lead.company,
        },
        assignedTo: assignedProfile
          ? {
              id: assignedProfile.id,
              fullName: assignedProfile.full_name,
              avatarUrl: assignedProfile.avatar_url,
            }
          : null,
        createdBy: {
          id: creatorProfile.id,
          fullName: creatorProfile.full_name,
          avatarUrl: creatorProfile.avatar_url,
        },
      },
    ]
  })

  const qualificationRow =
    qualificationData as LeadQualificationRow | null

  const qualificationScoreBreakdown =
    qualificationRow
      ? normalizeDetails(
          qualificationRow.score_breakdown,
        )
      : {}

  const qualification: LeadQualification | null =
    qualificationRow
      ? {
          id: qualificationRow.id,
          summary: qualificationRow.summary,
          score: qualificationRow.score,
          completenessScore:
            qualificationRow.completeness_score,
          priority: qualificationRow.priority,
          serviceFit: qualificationRow.service_fit,
          urgency: qualificationRow.urgency,
          extractedProjectType:
            qualificationRow.extracted_project_type,
          extractedServices: normalizeStringArray(
            qualificationRow.extracted_services,
          ),
          extractedBudget:
            qualificationRow.extracted_budget,
          extractedTimeline:
            qualificationRow.extracted_timeline,
          extractedCompanyContext:
            qualificationRow.extracted_company_context,
          extractedMainGoal:
            qualificationRow.extracted_main_goal,
          missingInformation: normalizeStringArray(
            qualificationRow.missing_information,
          ),
          risks: normalizeStringArray(
            qualificationRow.risks,
          ),
          scoreBreakdown: {
            total: getNumberValue(
              qualificationScoreBreakdown.total,
              qualificationRow.score,
            ),
            budget: getNumberValue(
              qualificationScoreBreakdown.budget,
            ),
            timeline: getNumberValue(
              qualificationScoreBreakdown.timeline,
            ),
            completeness: getNumberValue(
              qualificationScoreBreakdown.completeness,
            ),
            serviceFit: getNumberValue(
              qualificationScoreBreakdown.serviceFit,
            ),
            urgency: getNumberValue(
              qualificationScoreBreakdown.urgency,
            ),
            descriptionQuality: getNumberValue(
              qualificationScoreBreakdown.descriptionQuality,
            ),
            explanation: normalizeStringArray(
              qualificationScoreBreakdown.explanation,
            ),
          },
          model: qualificationRow.model,
          promptVersion:
            qualificationRow.prompt_version,
          createdAt: qualificationRow.created_at,
          updatedAt: qualificationRow.updated_at,
        }
      : null

  const replyDraftRow =
    replyDraftData as LeadReplyDraftRow | null

  const replyDraft: LeadReplyDraft | null =
    replyDraftRow
      ? {
          id: replyDraftRow.id,
          subject: replyDraftRow.subject,
          body: replyDraftRow.body,
          status: replyDraftRow.status,
          generatedByModel:
            replyDraftRow.generated_by_model,
          createdAt: replyDraftRow.created_at,
          updatedAt: replyDraftRow.updated_at,
        }
      : null

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
    aiStatus: lead.ai_status,
    aiLastError: lead.ai_last_error,
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
    tasks,
    qualification,
    replyDraft,
    activities,
  }
}