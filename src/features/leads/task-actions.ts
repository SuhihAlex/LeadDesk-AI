"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { createClient } from "@/lib/supabase/server"

const createLeadTaskSchema = z.object({
  leadId: z.string().uuid(),
  title: z.string().trim().min(1).max(240),
  description: z.string().trim().max(5000).optional(),
  dueAt: z.string().optional(),
  assigneeId: z.union([
    z.string().uuid(),
    z.literal(""),
  ]),
})

const setTaskStatusSchema = z.object({
  leadId: z.string().uuid(),
  taskId: z.string().uuid(),
  status: z.enum([
    "todo",
    "in_progress",
    "completed",
  ]),
})

export type CreateLeadTaskState = {
  status: "idle" | "success" | "error"
  message: string
  fieldErrors?: {
    title?: string[]
    description?: string[]
    dueAt?: string[]
    assigneeId?: string[]
  }
}

function getStringValue(
  formData: FormData,
  key: string,
): string {
  const value = formData.get(key)

  return typeof value === "string" ? value : ""
}

export async function createLeadTaskAction(
  _previousState: CreateLeadTaskState,
  formData: FormData,
): Promise<CreateLeadTaskState> {
  const parsed = createLeadTaskSchema.safeParse({
    leadId: getStringValue(formData, "leadId"),
    title: getStringValue(formData, "title"),
    description:
      getStringValue(formData, "description") || undefined,
    dueAt:
      getStringValue(formData, "dueAt") || undefined,
    assigneeId: getStringValue(formData, "assigneeId"),
  })

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the task fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const dueAt = parsed.data.dueAt
    ? new Date(parsed.data.dueAt)
    : null

  if (dueAt && Number.isNaN(dueAt.getTime())) {
    return {
      status: "error",
      message: "Enter a valid due date.",
      fieldErrors: {
        dueAt: ["Enter a valid due date."],
      },
    }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.rpc(
    "create_lead_task",
    {
      target_lead_id: parsed.data.leadId,
      task_title: parsed.data.title,
      task_description:
        parsed.data.description || null,
      task_due_at: dueAt
        ? dueAt.toISOString()
        : null,
      target_assignee_id:
        parsed.data.assigneeId || null,
    },
  )

  if (error || typeof data !== "string") {
    return {
      status: "error",
      message:
        "The task could not be created. Please try again.",
    }
  }

  revalidatePath(`/app/leads/${parsed.data.leadId}`)
  revalidatePath("/app/tasks")

  return {
    status: "success",
    message: "Task created.",
  }
}

export async function setTaskStatusAction(
  formData: FormData,
): Promise<void> {
  const parsed = setTaskStatusSchema.safeParse({
    leadId: getStringValue(formData, "leadId"),
    taskId: getStringValue(formData, "taskId"),
    status: getStringValue(formData, "status"),
  })

  if (!parsed.success) {
    return
  }

  const supabase = await createClient()

  const { error } = await supabase.rpc(
    "set_task_status",
    {
      target_task_id: parsed.data.taskId,
      target_status: parsed.data.status,
    },
  )

  if (error) {
    throw new Error(
      "The task status could not be updated.",
    )
  }

  revalidatePath(`/app/leads/${parsed.data.leadId}`)
  revalidatePath("/app/tasks")
}