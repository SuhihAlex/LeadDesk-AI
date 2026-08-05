import { z } from "zod"

import type { InboxFilters } from "@/features/leads/types"

const inboxStageSchema = z.enum([
  "new",
  "qualified",
  "contacted",
  "proposal",
  "won",
  "lost",
])

const inboxPrioritySchema = z.enum([
  "low",
  "medium",
  "high",
  "urgent",
])

const inboxAiStatusSchema = z.enum([
  "pending",
  "processing",
  "completed",
  "failed",
])

const inboxServiceFitSchema = z.enum([
  "poor",
  "partial",
  "good",
  "excellent",
])

const inboxSourceSchema = z.enum([
  "website_form",
  "referral",
  "email",
  "manual",
])

const inboxSortSchema = z.enum([
  "newest",
  "oldest",
  "priority",
  "score",
])

const inboxSearchParamsSchema = z.object({
  q: z.string().optional(),
  stage: z.string().optional(),
  priority: z.string().optional(),
  source: z.string().optional(),
  aiStatus: z.string().optional(),
  serviceFit: z.string().optional(),
  unread: z.string().optional(),
  sort: z.string().optional(),
})

export type InboxSearchParams = Record<
  string,
  string | string[] | undefined
>

function getSingleValue(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

function normalizeQuery(value: string | undefined): string | undefined {
  if (!value) {
    return undefined
  }

  const normalized = value.trim().slice(0, 100)

  return normalized.length > 0 ? normalized : undefined
}

export function parseInboxSearchParams(
  searchParams: InboxSearchParams,
): InboxFilters {
  const rawParams = {
    q: getSingleValue(searchParams.q),
    stage: getSingleValue(searchParams.stage),
    priority: getSingleValue(searchParams.priority),
    source: getSingleValue(searchParams.source),
    aiStatus: getSingleValue(
      searchParams.aiStatus,
    ),
    serviceFit: getSingleValue(
      searchParams.serviceFit,
    ),
    unread: getSingleValue(searchParams.unread),
    sort: getSingleValue(searchParams.sort),
  }

  const parsed = inboxSearchParamsSchema.safeParse(rawParams)

  if (!parsed.success) {
    return {
      unreadOnly: false,
      sort: "newest",
    }
  }

  const stageResult = inboxStageSchema.safeParse(parsed.data.stage)
  const priorityResult = inboxPrioritySchema.safeParse(
    parsed.data.priority,
  )
  const aiStatusResult =
    inboxAiStatusSchema.safeParse(
      parsed.data.aiStatus,
    )

  const serviceFitResult =
    inboxServiceFitSchema.safeParse(
      parsed.data.serviceFit,
    )
  const sourceResult = inboxSourceSchema.safeParse(parsed.data.source)
  const sortResult = inboxSortSchema.safeParse(parsed.data.sort)

  return {
    query: normalizeQuery(parsed.data.q),
    stage: stageResult.success ? stageResult.data : undefined,
    priority: priorityResult.success
      ? priorityResult.data
      : undefined,
    aiStatus: aiStatusResult.success
      ? aiStatusResult.data
      : undefined,

    serviceFit: serviceFitResult.success
      ? serviceFitResult.data
      : undefined,
    source: sourceResult.success ? sourceResult.data : undefined,
    unreadOnly: parsed.data.unread === "true",
    sort: sortResult.success ? sortResult.data : "newest",
  }
}

export function hasActiveInboxFilters(
  filters: InboxFilters,
): boolean {
  return Boolean(
    filters.query ||
      filters.stage ||
      filters.priority ||
      filters.source ||
      filters.aiStatus ||
      filters.serviceFit ||
      filters.unreadOnly ||
      filters.sort !== "newest",
  )
}