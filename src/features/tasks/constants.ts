import type {
  TaskSort,
  TaskStatus,
} from "@/features/tasks/types"

export const taskStatusLabels: Record<
  TaskStatus,
  string
> = {
  todo: "Todo",
  in_progress: "In progress",
  completed: "Completed",
}

export const taskSortLabels: Record<
  TaskSort,
  string
> = {
  due_soon: "Due soon",
  newest: "Newest first",
  oldest: "Oldest first",
}