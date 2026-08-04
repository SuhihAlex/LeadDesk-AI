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
  createdAt: string
  assignedTo: {
    id: string
    fullName: string
    avatarUrl: string | null
  } | null
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

export const initialPublicLeadFormState: PublicLeadFormState = {
  status: "idle",
  message: "",
}