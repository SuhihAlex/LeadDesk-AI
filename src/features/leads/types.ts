import type { WorkspaceTask } from "@/features/tasks/types"

export type LeadStage =
  | "new"
  | "qualified"
  | "contacted"
  | "proposal"
  | "won"
  | "lost"

export type LeadPriority =
  | "low"
  | "medium"
  | "high"
  | "urgent"

export type LeadSource =
  | "website_form"
  | "referral"
  | "email"
  | "manual"

export type LeadProjectType =
  | "marketing_website"
  | "ecommerce"
  | "saas_mvp"
  | "web_application"
  | "redesign"
  | "other"

export type LeadBudgetRange =
  | "under_3000"
  | "3000_7000"
  | "7000_15000"
  | "15000_30000"
  | "over_30000"
  | "not_sure"

export type LeadTimeline =
  | "asap"
  | "one_month"
  | "one_to_two_months"
  | "three_to_six_months"
  | "flexible"

export type LeadListItem = {
  id: string
  fullName: string
  email: string
  company: string | null
  projectType: LeadProjectType
  budgetRange: LeadBudgetRange
  desiredTimeline: LeadTimeline
  source: LeadSource
  stage: LeadStage
  priority: LeadPriority
  isUnread: boolean
  estimatedValue: number | null
  aiScore: number | null
  aiStatus: AiProcessingStatus
  aiServiceFit: AiServiceFit | null
  createdAt: string
  assignedTo: {
    id: string
    fullName: string
    avatarUrl: string | null
  } | null
}

export type PipelineLead = {
  id: string
  fullName: string
  company: string | null
  projectType: LeadProjectType
  budgetRange: LeadBudgetRange
  estimatedValue: number | null
  priority: LeadPriority
  stage: LeadStage
  aiScore: number | null
  aiStatus: AiProcessingStatus
  aiServiceFit: AiServiceFit | null
  isUnread: boolean
  createdAt: string
  assignedTo: {
    id: string
    fullName: string
    avatarUrl: string | null
  } | null
}

export type PipelineColumn = {
  stage: LeadStage
  leads: PipelineLead[]
  count: number
  estimatedValue: number
}

export type PipelineResult = {
  columns: PipelineColumn[]
  totalLeads: number
  totalEstimatedValue: number
}

export type PipelineStageChange = {
  leadId: string
  stage: LeadStage
}

export type LeadActivityType =
  | "lead_created"
  | "lead_viewed"
  | "ai_qualification_started"
  | "stage_changed"
  | "assignment_changed"
  | "note_added"
  | "task_created"
  | "task_completed"
  | "email_sent"
  | "ai_qualification_completed"
  | "ai_qualification_failed"
  | "lead_value_updated"
  | "lead_priority_updated"

export type LeadActivityItem = {
  id: string
  type: LeadActivityType
  title: string
  details: Record<string, unknown>
  createdAt: string
  actor: {
    id: string
    fullName: string
    avatarUrl: string | null
  } | null
}

export type LeadNote = {
  id: string
  content: string
  createdAt: string
  updatedAt: string
  author: {
    id: string
    fullName: string
    avatarUrl: string | null
  }
}

export type LeadDetails = {
  id: string
  fullName: string
  email: string
  company: string | null
  websiteUrl: string | null
  description: string
  projectType: LeadProjectType
  budgetRange: LeadBudgetRange
  desiredTimeline: LeadTimeline
  source: LeadSource
  stage: LeadStage
  priority: LeadPriority
  isUnread: boolean
  estimatedValue: number | null
  aiScore: number | null
  aiSummary: string | null
  aiCompletenessScore: number | null
  aiProcessedAt: string | null
  aiStatus: AiProcessingStatus
  aiLastError: string | null
  qualification: LeadQualification | null
  replyDraft: LeadReplyDraft | null
  consentGiven: boolean
  createdAt: string
  updatedAt: string
  assignedTo: {
    id: string
    fullName: string
    avatarUrl: string | null
  } | null
  notes: LeadNote[]
  tasks: WorkspaceTask[]
  activities: LeadActivityItem[]
}

export type InboxSort =
  | "newest"
  | "oldest"
  | "priority"
  | "score"

export type InboxFilters = {
  query?: string
  stage?: LeadStage
  priority?: LeadPriority
  source?: LeadSource
  aiStatus?: AiProcessingStatus
  serviceFit?: AiServiceFit
  unreadOnly: boolean
  sort: InboxSort
}

export type LeadInboxResult = {
  leads: LeadListItem[]
  total: number
  workspaceTotal: number
}

export type PublicLeadFormState = {
  status: "idle" | "success" | "error"
  message: string
  leadId?: string
  fieldErrors?: Partial<
    Record<
      | "fullName"
      | "email"
      | "company"
      | "projectType"
      | "budgetRange"
      | "desiredTimeline"
      | "description"
      | "websiteUrl"
      | "consent",
      string[]
    >
  >
}

export type AiProcessingStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"

export type AiServiceFit =
  | "poor"
  | "partial"
  | "good"
  | "excellent"

export type LeadQualification = {
  id: string
  summary: string
  score: number
  completenessScore: number
  priority: LeadPriority
  serviceFit: "poor" | "partial" | "good" | "excellent"
  urgency: "low" | "medium" | "high"
  extractedProjectType: string | null
  extractedServices: string[]
  extractedBudget: string | null
  extractedTimeline: string | null
  extractedCompanyContext: string | null
  extractedMainGoal: string | null
  missingInformation: string[]
  risks: string[]
  scoreBreakdown: {
    total: number
    budget: number
    timeline: number
    completeness: number
    serviceFit: number
    urgency: number
    descriptionQuality: number
    explanation: string[]
  }
  model: string
  promptVersion: string
  createdAt: string
  updatedAt: string
}

export type LeadReplyDraft = {
  id: string
  subject: string
  body: string
  status: "ai_generated" | "edited" | "sent"
  generatedByModel: string | null
  createdAt: string
  updatedAt: string
}

export const initialPublicLeadFormState: PublicLeadFormState = {
  status: "idle",
  message: "",
}