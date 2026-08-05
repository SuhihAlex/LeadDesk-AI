import "server-only"

import {
  leadSources,
  leadStages,
} from "@/features/leads/constants"
import type {
  AiProcessingStatus,
  LeadPriority,
  LeadProjectType,
  LeadSource,
  LeadStage,
} from "@/features/leads/types"
import type {
  DashboardAnalytics,
  DashboardEmailFailure,
  DashboardMetric,
  DashboardRecentLead,
  DashboardSourceBreakdownItem,
  DashboardStageBreakdownItem,
} from "@/features/dashboard/types"
import { getCurrentWorkspace } from "@/features/workspace/get-current-workspace"
import { createClient } from "@/lib/supabase/server"

type DashboardLeadRow = {
  id: string
  full_name: string
  company: string | null
  project_type: LeadProjectType
  source: LeadSource
  stage: LeadStage
  priority: LeadPriority
  estimated_value: number | string | null
  ai_score: number | null
  ai_status: AiProcessingStatus
  created_at: string
}

type DashboardTaskRow = {
  id: string
  status: "todo" | "in_progress" | "completed"
  due_at: string | null
}

type DashboardEmailDeliveryRow = {
  id: string
  lead_id: string
  recipient_email: string
  subject: string
  provider: string
  draft_id: string
  status:
    | "processing"
    | "sent"
    | "failed"
  error_message: string | null
  created_at: string
  sent_at: string | null
  failed_at: string | null
}

const DAY_IN_MS = 24 * 60 * 60 * 1000
const DASHBOARD_PERIOD_DAYS = 30

function normalizeEstimatedValue(
  value: number | string | null,
): number {
  if (value === null) {
    return 0
  }

  const parsed =
    typeof value === "number"
      ? value
      : Number(value)

  return Number.isFinite(parsed) ? parsed : 0
}

function calculateChangePercent(
  currentValue: number,
  previousValue: number,
): number | null {
  if (previousValue === 0) {
    return currentValue === 0 ? 0 : null
  }

  return (
    ((currentValue - previousValue) /
      previousValue) *
    100
  )
}

function createMetric(
  currentValue: number,
  previousValue: number,
): DashboardMetric {
  return {
    value: currentValue,
    previousValue,
    changePercent: calculateChangePercent(
      currentValue,
      previousValue,
    ),
  }
}

function isWithinRange(
  value: string,
  start: Date,
  end: Date,
): boolean {
  const timestamp = new Date(value).getTime()

  return (
    timestamp >= start.getTime() &&
    timestamp < end.getTime()
  )
}

function calculateAverage(
  values: number[],
): number {
  if (values.length === 0) {
    return 0
  }

  return (
    values.reduce(
      (total, value) => total + value,
      0,
    ) / values.length
  )
}

export async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
  const context = await getCurrentWorkspace()
  const supabase = await createClient()

  const currentEnd = new Date()
  const currentStart = new Date(
    currentEnd.getTime() -
      DASHBOARD_PERIOD_DAYS * DAY_IN_MS,
  )
  const previousStart = new Date(
    currentStart.getTime() -
      DASHBOARD_PERIOD_DAYS * DAY_IN_MS,
  )

  const [
    { data: leadData, error: leadError },
    { data: taskData, error: taskError },
    {
      data: emailDeliveryData,
      error: emailDeliveryError,
    },
  ] = await Promise.all([
    supabase
      .from("leads")
      .select(
        `
          id,
          full_name,
          company,
          project_type,
          source,
          stage,
          priority,
          estimated_value,
          ai_score,
          ai_status,
          created_at
        `,
      )
      .eq("workspace_id", context.workspace.id)
      .order("created_at", {
        ascending: false,
      })
      .limit(500),

    supabase
      .from("tasks")
      .select(
        `
          id,
          status,
          due_at
        `,
      )
      .eq("workspace_id", context.workspace.id)
      .neq("status", "completed"),

    supabase
      .from("lead_email_deliveries")
      .select(
        `
          id,
          lead_id,
          draft_id,
          recipient_email,
          subject,
          provider,
          status,
          error_message,
          created_at,
          sent_at,
          failed_at
        `,
      )
      .eq("workspace_id", context.workspace.id)
      .order("created_at", {
        ascending: false,
      })
      .limit(500),
  ])

  if (leadError) {
    throw new Error(
      `Dashboard leads could not be loaded: ${leadError.message}`,
    )
  }

  if (taskError) {
    throw new Error(
      `Dashboard tasks could not be loaded: ${taskError.message}`,
    )
  }

  if (emailDeliveryError) {
    throw new Error(
      `Dashboard email deliveries could not be loaded: ${emailDeliveryError.message}`,
    )
  }

  const leads =
    (leadData ?? []) as DashboardLeadRow[]

  const tasks =
    (taskData ?? []) as DashboardTaskRow[]

  const emailDeliveries =
    (emailDeliveryData ??
      []) as DashboardEmailDeliveryRow[]

  const currentPeriodLeads = leads.filter(
    (lead) =>
      isWithinRange(
        lead.created_at,
        currentStart,
        currentEnd,
      ),
  )

  const previousPeriodLeads = leads.filter(
    (lead) =>
      isWithinRange(
        lead.created_at,
        previousStart,
        currentStart,
      ),
  )

  const currentQualified = currentPeriodLeads.filter(
    (lead) =>
      lead.stage === "qualified" ||
      lead.stage === "proposal" ||
      lead.stage === "won",
  )

  const previousQualified = previousPeriodLeads.filter(
    (lead) =>
      lead.stage === "qualified" ||
      lead.stage === "proposal" ||
      lead.stage === "won",
  )

  const currentWon = currentPeriodLeads.filter(
    (lead) => lead.stage === "won",
  )

  const previousWon = previousPeriodLeads.filter(
    (lead) => lead.stage === "won",
  )

  const currentConversionRate =
    currentPeriodLeads.length > 0
      ? (currentWon.length /
          currentPeriodLeads.length) *
        100
      : 0

  const previousConversionRate =
    previousPeriodLeads.length > 0
      ? (previousWon.length /
          previousPeriodLeads.length) *
        100
      : 0

  const currentAiScores = currentPeriodLeads
    .map((lead) => lead.ai_score)
    .filter(
      (score): score is number =>
        score !== null,
    )

  const previousAiScores = previousPeriodLeads
    .map((lead) => lead.ai_score)
    .filter(
      (score): score is number =>
        score !== null,
    )

  const openLeads = leads.filter(
    (lead) =>
      lead.stage !== "won" &&
      lead.stage !== "lost",
  )

  const wonLeads = leads.filter(
    (lead) => lead.stage === "won",
  )

  const overdueTasks = tasks.filter(
    (task) =>
      task.due_at !== null &&
      new Date(task.due_at).getTime() <
        currentEnd.getTime(),
  ).length

  const sentEmailDeliveries =
    emailDeliveries.filter(
      (delivery) =>
        delivery.status === "sent",
    )

  const failedEmailDeliveries =
    emailDeliveries.filter(
      (delivery) =>
        delivery.status === "failed",
    )

  const processingEmailDeliveries =
    emailDeliveries.filter(
      (delivery) =>
        delivery.status === "processing",
    )

  const completedEmailDeliveries =
    sentEmailDeliveries.length +
    failedEmailDeliveries.length

  const emailSuccessRate =
    completedEmailDeliveries > 0
      ? (sentEmailDeliveries.length /
          completedEmailDeliveries) *
        100
      : 0

  const recentLeads: DashboardRecentLead[] =
    leads.slice(0, 5).map((lead) => ({
      id: lead.id,
      fullName: lead.full_name,
      company: lead.company,
      projectType: lead.project_type,
      stage: lead.stage,
      priority: lead.priority,
      aiScore: lead.ai_score,
      aiStatus: lead.ai_status,
      createdAt: lead.created_at,
    }))

  const stageBreakdown: DashboardStageBreakdownItem[] =
    leadStages.map((stage) => {
      const stageLeads = leads.filter(
        (lead) => lead.stage === stage,
      )

      return {
        stage,
        count: stageLeads.length,
        estimatedValue: stageLeads.reduce(
          (total, lead) =>
            total +
            normalizeEstimatedValue(
              lead.estimated_value,
            ),
          0,
        ),
      }
    })

  const sourceBreakdown: DashboardSourceBreakdownItem[] =
    leadSources.map((source) => ({
      source,
      count: leads.filter(
        (lead) => lead.source === source,
      ).length,
    }))

  const recentEmailFailures:
    DashboardEmailFailure[] =
    failedEmailDeliveries
      .filter(
        (
          delivery,
        ): delivery is DashboardEmailDeliveryRow & {
          error_message: string
          failed_at: string
        } =>
          delivery.error_message !== null &&
          delivery.failed_at !== null,
      )
      .slice(0, 5)
      .map((delivery) => ({
        id: delivery.id,
        leadId: delivery.lead_id,
        draftId: delivery.draft_id,
        recipientEmail:
          delivery.recipient_email,
        subject: delivery.subject,
        provider: delivery.provider,
        errorMessage:
          delivery.error_message,
        failedAt: delivery.failed_at,
      }))

  return {
    period: {
      currentStart:
        currentStart.toISOString(),
      previousStart:
        previousStart.toISOString(),
      currentEnd: currentEnd.toISOString(),
    },

    metrics: {
      newLeads: createMetric(
        currentPeriodLeads.length,
        previousPeriodLeads.length,
      ),

      qualifiedLeads: createMetric(
        currentQualified.length,
        previousQualified.length,
      ),

      wonLeads: createMetric(
        currentWon.length,
        previousWon.length,
      ),

      conversionRate: createMetric(
        currentConversionRate,
        previousConversionRate,
      ),

      averageAiScore: createMetric(
        calculateAverage(currentAiScores),
        calculateAverage(previousAiScores),
      ),

      openPipelineValue: openLeads.reduce(
        (total, lead) =>
          total +
          normalizeEstimatedValue(
            lead.estimated_value,
          ),
        0,
      ),

      wonValue: wonLeads.reduce(
        (total, lead) =>
          total +
          normalizeEstimatedValue(
            lead.estimated_value,
          ),
        0,
      ),

      overdueTasks,

      aiCompleted: leads.filter(
        (lead) =>
          lead.ai_status === "completed",
      ).length,

      aiFailed: leads.filter(
        (lead) =>
          lead.ai_status === "failed",
      ).length,

      emailSent: sentEmailDeliveries.length,

      emailFailed:
        failedEmailDeliveries.length,

      emailProcessing:
        processingEmailDeliveries.length,

      emailSuccessRate,
    },

    recentLeads,
    stageBreakdown,
    sourceBreakdown,
    recentEmailFailures,
  }
}