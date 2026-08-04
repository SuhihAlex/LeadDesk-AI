export type TaskStatus =
  | "todo"
  | "in_progress"
  | "completed"

export type TaskSort =
  | "due_soon"
  | "newest"
  | "oldest"

export type TaskFilters = {
  status?: TaskStatus
  assigneeId?: string
  overdueOnly: boolean
  sort: TaskSort
}

export type TaskPerson = {
  id: string
  fullName: string
  avatarUrl: string | null
}

export type WorkspaceTask = {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  dueAt: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
  isOverdue: boolean
  lead: {
    id: string
    fullName: string
    company: string | null
  } | null
  assignedTo: TaskPerson | null
  createdBy: TaskPerson
}

export type WorkspaceTasksResult = {
  tasks: WorkspaceTask[]
  total: number
  workspaceTotal: number
  overdueTotal: number
}