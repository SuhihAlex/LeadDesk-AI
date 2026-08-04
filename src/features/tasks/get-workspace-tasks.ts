import "server-only"

import { getCurrentWorkspace } from "@/features/workspace/get-current-workspace"
import type {
  TaskFilters,
  TaskStatus,
  WorkspaceTask,
  WorkspaceTasksResult,
} from "@/features/tasks/types"
import { createClient } from "@/lib/supabase/server"

type WorkspaceTaskRow = {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  due_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
  lead:
    | {
        id: string
        full_name: string
        company: string | null
      }
    | {
        id: string
        full_name: string
        company: string | null
      }[]
    | null
  assigned_profile:
    | {
        id: string
        full_name: string
        avatar_url: string | null
      }
    | {
        id: string
        full_name: string
        avatar_url: string | null
      }[]
    | null
  creator_profile:
    | {
        id: string
        full_name: string
        avatar_url: string | null
      }
    | {
        id: string
        full_name: string
        avatar_url: string | null
      }[]
    | null
}

function getSingleRelation<T>(
  value: T | T[] | null,
): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value
}

export async function getWorkspaceTasks(
  filters: TaskFilters,
): Promise<WorkspaceTasksResult> {
  const context = await getCurrentWorkspace()
  const supabase = await createClient()
  const now = new Date().toISOString()

  let query = supabase
    .from("tasks")
    .select(
      `
        id,
        title,
        description,
        status,
        due_at,
        completed_at,
        created_at,
        updated_at,
        lead:leads!tasks_lead_id_fkey (
          id,
          full_name,
          company
        ),
        assigned_profile:profiles!tasks_assigned_to_fkey (
          id,
          full_name,
          avatar_url
        ),
        creator_profile:profiles!tasks_created_by_fkey (
          id,
          full_name,
          avatar_url
        )
      `,
      {
        count: "exact",
      },
    )
    .eq("workspace_id", context.workspace.id)

  const workspaceCountQuery = supabase
    .from("tasks")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("workspace_id", context.workspace.id)

  const overdueCountQuery = supabase
    .from("tasks")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("workspace_id", context.workspace.id)
    .neq("status", "completed")
    .lt("due_at", now)

  if (filters.status) {
    query = query.eq("status", filters.status)
  }

  if (filters.assigneeId) {
    query = query.eq(
      "assigned_to",
      filters.assigneeId,
    )
  }

  if (filters.overdueOnly) {
    query = query
      .neq("status", "completed")
      .lt("due_at", now)
  }

  if (filters.sort === "newest") {
    query = query.order("created_at", {
      ascending: false,
    })
  } else if (filters.sort === "oldest") {
    query = query.order("created_at", {
      ascending: true,
    })
  } else {
    query = query
      .order("due_at", {
        ascending: true,
        nullsFirst: false,
      })
      .order("created_at", {
        ascending: false,
      })
  }

  query = query.limit(100)

  const [
    { data, error, count },
    {
      error: workspaceCountError,
      count: workspaceTotal,
    },
    {
      error: overdueCountError,
      count: overdueTotal,
    },
  ] = await Promise.all([
    query,
    workspaceCountQuery,
    overdueCountQuery,
  ])

  if (error) {
    throw new Error(
      `Workspace tasks could not be loaded: ${error.message}`,
    )
  }

  if (workspaceCountError) {
    throw new Error(
      `Workspace task count could not be loaded: ${workspaceCountError.message}`,
    )
  }

  if (overdueCountError) {
    throw new Error(
      `Overdue task count could not be loaded: ${overdueCountError.message}`,
    )
  }

  const rows = (data ?? []) as WorkspaceTaskRow[]

  const tasks: WorkspaceTask[] = rows.flatMap(
    (task) => {
      const lead = getSingleRelation(task.lead)
      const assignedProfile = getSingleRelation(
        task.assigned_profile,
      )
      const creatorProfile = getSingleRelation(
        task.creator_profile,
      )

      if (!creatorProfile) {
        return []
      }

      return [
        {
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          dueAt: task.due_at,
          completedAt: task.completed_at,
          createdAt: task.created_at,
          updatedAt: task.updated_at,
          isOverdue:
            task.status !== "completed" &&
            task.due_at !== null &&
            new Date(task.due_at).getTime() <
              Date.now(),
          lead: lead
            ? {
                id: lead.id,
                fullName: lead.full_name,
                company: lead.company,
              }
            : null,
          assignedTo: assignedProfile
            ? {
                id: assignedProfile.id,
                fullName: assignedProfile.full_name,
                avatarUrl:
                  assignedProfile.avatar_url,
              }
            : null,
          createdBy: {
            id: creatorProfile.id,
            fullName: creatorProfile.full_name,
            avatarUrl: creatorProfile.avatar_url,
          },
        },
      ]
    },
  )

  return {
    tasks,
    total: count ?? tasks.length,
    workspaceTotal: workspaceTotal ?? 0,
    overdueTotal: overdueTotal ?? 0,
  }
}