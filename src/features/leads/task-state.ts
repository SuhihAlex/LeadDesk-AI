import type { CreateLeadTaskState } from "@/features/leads/task-actions"

export const initialCreateLeadTaskState: CreateLeadTaskState = {
  status: "idle",
  message: "",
}