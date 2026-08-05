import type {
  AiProcessingStatus,
  LeadPriority,
  LeadProjectType,
  LeadSource,
  LeadStage,
} from "@/features/leads/types"

export type DashboardMetric = {
  value: number
  previousValue: number
  changePercent: number | null
}

export type DashboardRecentLead = {
  id: string
  fullName: string
  company: string | null
  projectType: LeadProjectType
  stage: LeadStage
  priority: LeadPriority
  aiScore: number | null
  aiStatus: AiProcessingStatus
  createdAt: string
}

export type DashboardStageBreakdownItem = {
  stage: LeadStage
  count: number
  estimatedValue: number
}

export type DashboardSourceBreakdownItem = {
  source: LeadSource
  count: number
}

export type DashboardEmailFailure = {
  id: string
  leadId: string
  draftId: string
  recipientEmail: string
  subject: string
  provider: string
  errorMessage: string
  failedAt: string
}

export type DashboardAnalytics = {
  period: {
    currentStart: string
    previousStart: string
    currentEnd: string
  }

  metrics: {
    newLeads: DashboardMetric
    qualifiedLeads: DashboardMetric
    wonLeads: DashboardMetric
    conversionRate: DashboardMetric
    averageAiScore: DashboardMetric
    openPipelineValue: number
    wonValue: number
    overdueTasks: number
    aiCompleted: number
    aiFailed: number
    emailSent: number
    emailFailed: number
    emailProcessing: number
    emailSuccessRate: number
  }

  recentLeads: DashboardRecentLead[]
  stageBreakdown: DashboardStageBreakdownItem[]
  sourceBreakdown: DashboardSourceBreakdownItem[]
  recentEmailFailures: DashboardEmailFailure[]
}