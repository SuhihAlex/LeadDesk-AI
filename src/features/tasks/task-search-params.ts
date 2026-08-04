import { z } from "zod"

import type {
  TaskFilters,
} from "@/features/tasks/types"

const taskStatusSchema = z.enum([
  "todo",
  "in_progress",
  "completed",
])

const taskSortSchema = z.enum([
  "due_soon",
  "newest",
  "oldest",
])

export type TaskSearchParams = Record<
  string,
  string | string[] | undefined
>

function getSingleValue(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export function parseTaskSearchParams(
  searchParams: TaskSearchParams,
): TaskFilters {
  const statusResult = taskStatusSchema.safeParse(
    getSingleValue(searchParams.status),
  )

  const assigneeValue = getSingleValue(
    searchParams.assignee,
  )

  const assigneeResult = z
    .string()
    .uuid()
    .safeParse(assigneeValue)

  const sortResult = taskSortSchema.safeParse(
    getSingleValue(searchParams.sort),
  )

  return {
    status: statusResult.success
      ? statusResult.data
      : undefined,
    assigneeId: assigneeResult.success
      ? assigneeResult.data
      : undefined,
    overdueOnly:
      getSingleValue(searchParams.overdue) === "true",
    sort: sortResult.success
      ? sortResult.data
      : "due_soon",
  }
}

export function hasActiveTaskFilters(
  filters: TaskFilters,
): boolean {
  return Boolean(
    filters.status ||
      filters.assigneeId ||
      filters.overdueOnly ||
      filters.sort !== "due_soon",
  )
}