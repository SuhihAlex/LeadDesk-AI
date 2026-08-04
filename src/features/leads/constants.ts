import type {
  LeadBudgetRange,
  LeadPriority,
  LeadProjectType,
  LeadSource,
  LeadStage,
  LeadTimeline,
} from "@/features/leads/types"

export const leadStageLabels: Record<LeadStage, string> = {
  new: "New",
  qualified: "Qualified",
  contacted: "Contacted",
  proposal: "Proposal",
  won: "Won",
  lost: "Lost",
}

export const leadPriorityLabels: Record<LeadPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
}

export const leadSourceLabels: Record<LeadSource, string> = {
  website_form: "Website form",
  referral: "Referral",
  email: "Email",
  manual: "Manual",
}

export const leadProjectTypeLabels: Record<LeadProjectType, string> = {
  marketing_website: "Marketing website",
  ecommerce: "E-commerce",
  saas_mvp: "SaaS MVP",
  web_application: "Web application",
  redesign: "Website redesign",
  other: "Other",
}

export const leadBudgetRangeLabels: Record<LeadBudgetRange, string> = {
  under_3000: "Under $3,000",
  "3000_7000": "$3,000–$7,000",
  "7000_15000": "$7,000–$15,000",
  "15000_30000": "$15,000–$30,000",
  over_30000: "Over $30,000",
  not_sure: "Not sure",
}

export const leadTimelineLabels: Record<LeadTimeline, string> = {
  asap: "As soon as possible",
  one_month: "Within one month",
  one_to_two_months: "1–2 months",
  three_to_six_months: "3–6 months",
  flexible: "Flexible",
}