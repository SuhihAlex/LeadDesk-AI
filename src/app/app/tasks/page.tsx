import Link from "next/link"
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ListTodo,
  UserRound,
  X,
} from "lucide-react"

import { AppShell } from "@/components/layout/app-shell"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { getWorkspaceMembers } from "@/features/workspace/get-workspace-members"
import {
  taskSortLabels,
  taskStatusLabels,
} from "@/features/tasks/constants"
import { getWorkspaceTasks } from "@/features/tasks/get-workspace-tasks"
import {
  hasActiveTaskFilters,
  parseTaskSearchParams,
  type TaskSearchParams,
} from "@/features/tasks/task-search-params"
import { setTaskStatusAction } from "@/features/leads/task-actions"
import type { TaskFilters } from "@/features/tasks/types"
import { formatDate } from "@/lib/format-date"
import { getInitials } from "@/lib/get-initials"

type TasksPageProps = {
  searchParams: Promise<TaskSearchParams>
}

function getActiveFilterLabels(
  filters: TaskFilters,
  members: {
    userId: string
    fullName: string
  }[],
): string[] {
  const labels: string[] = []

  if (filters.status) {
    labels.push(
      `Status: ${taskStatusLabels[filters.status]}`,
    )
  }

  if (filters.assigneeId) {
    const member = members.find(
      (item) => item.userId === filters.assigneeId,
    )

    if (member) {
      labels.push(`Assignee: ${member.fullName}`)
    }
  }

  if (filters.overdueOnly) {
    labels.push("Overdue only")
  }

  if (filters.sort !== "due_soon") {
    labels.push(`Sort: ${taskSortLabels[filters.sort]}`)
  }

  return labels
}

export default async function TasksPage({
  searchParams,
}: TasksPageProps) {
  const resolvedSearchParams = await searchParams
  const filters = parseTaskSearchParams(
    resolvedSearchParams,
  )

  const [
    {
      tasks,
      total,
      workspaceTotal,
      overdueTotal,
    },
    members,
  ] = await Promise.all([
    getWorkspaceTasks(filters),
    getWorkspaceMembers(),
  ])

  const hasActiveFilters = hasActiveTaskFilters(filters)
  const activeFilterLabels = getActiveFilterLabels(
    filters,
    members,
  )

  return (
    <AppShell
      title="Tasks"
      description="Manage lead follow-up and team responsibilities."
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ListTodo
                  className="size-5"
                  aria-hidden="true"
                />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Total tasks
                </p>

                <p className="mt-1 text-2xl font-semibold">
                  {workspaceTotal}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CheckCircle2
                  className="size-5"
                  aria-hidden="true"
                />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Matching tasks
                </p>

                <p className="mt-1 text-2xl font-semibold">
                  {total}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <AlertTriangle
                  className="size-5"
                  aria-hidden="true"
                />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Overdue
                </p>

                <p className="mt-1 text-2xl font-semibold">
                  {overdueTotal}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="border-b">
            <div className="space-y-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    Workspace tasks
                  </h2>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Review deadlines, owners and completion status.
                  </p>
                </div>

                {hasActiveFilters && (
                  <Button variant="outline" asChild>
                    <Link href="/app/tasks">
                      <X
                        className="size-4"
                        aria-hidden="true"
                      />
                      Clear filters
                    </Link>
                  </Button>
                )}
              </div>

              <form
                method="get"
                action="/app/tasks"
                className="grid gap-3 md:grid-cols-2 xl:grid-cols-[repeat(3,minmax(160px,1fr))_auto]"
              >
                <label className="grid gap-1.5">
                  <span className="sr-only">Status</span>

                  <select
                    name="status"
                    defaultValue={filters.status ?? ""}
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    aria-label="Filter by status"
                  >
                    <option value="">All statuses</option>

                    {Object.entries(taskStatusLabels).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label className="grid gap-1.5">
                  <span className="sr-only">
                    Assignee
                  </span>

                  <select
                    name="assignee"
                    defaultValue={
                      filters.assigneeId ?? ""
                    }
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    aria-label="Filter by assignee"
                  >
                    <option value="">
                      All assignees
                    </option>

                    {members.map((member) => (
                      <option
                        key={member.userId}
                        value={member.userId}
                      >
                        {member.fullName}
                        {member.isCurrentUser
                          ? " (You)"
                          : ""}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-1.5">
                  <span className="sr-only">Sort</span>

                  <select
                    name="sort"
                    defaultValue={filters.sort}
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    aria-label="Sort tasks"
                  >
                    {Object.entries(taskSortLabels).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <div className="flex flex-wrap items-center gap-3 md:col-span-2 xl:col-span-1">
                  <label className="flex h-9 cursor-pointer items-center gap-2 whitespace-nowrap rounded-md border border-input px-3 text-sm">
                    <input
                      type="checkbox"
                      name="overdue"
                      value="true"
                      defaultChecked={filters.overdueOnly}
                      className="size-4 rounded border-input accent-primary"
                    />

                    Overdue only
                  </label>

                  <Button type="submit">
                    Apply
                  </Button>
                </div>
              </form>

              {activeFilterLabels.length > 0 && (
                <div
                  className="flex flex-wrap gap-2"
                  aria-label="Active filters"
                >
                  {activeFilterLabels.map((label) => (
                    <Badge
                      key={label}
                      variant="secondary"
                      className="font-normal"
                    >
                      {label}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {tasks.length === 0 ? (
              <div className="flex min-h-96 items-center justify-center px-6 py-16">
                <div className="max-w-md text-center">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <ListTodo
                      className="size-6"
                      aria-hidden="true"
                    />
                  </div>

                  {workspaceTotal === 0 ? (
                    <>
                      <h3 className="mt-5 text-xl font-semibold">
                        No tasks yet
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        Create a task from a lead details page to
                        start tracking follow-up work.
                      </p>

                      <Button className="mt-6" asChild>
                        <Link href="/app/inbox">
                          Open inbox
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <h3 className="mt-5 text-xl font-semibold">
                        No tasks match your filters
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        Change or clear the active filters to see
                        more tasks.
                      </p>

                      <Button
                        className="mt-6"
                        variant="outline"
                        asChild
                      >
                        <Link href="/app/tasks">
                          Clear filters
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="divide-y">
                {tasks.map((task) => (
                  <article
                    key={task.id}
                    className="p-5 transition-colors hover:bg-muted/20"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">
                            {task.title}
                          </h3>

                          <Badge
                            variant={
                              task.status === "completed"
                                ? "default"
                                : "outline"
                            }
                          >
                            {taskStatusLabels[task.status]}
                          </Badge>

                          {task.isOverdue && (
                            <Badge variant="destructive">
                              Overdue
                            </Badge>
                          )}
                        </div>

                        {task.description && (
                          <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                            {task.description}
                          </p>
                        )}

                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarClock
                              className="size-4"
                              aria-hidden="true"
                            />

                            {task.dueAt
                              ? `Due ${formatDate(task.dueAt)}`
                              : "No due date"}
                          </span>

                          {task.lead && (
                            <Link
                              href={`/app/leads/${task.lead.id}`}
                              className="hover:text-primary hover:underline"
                            >
                              {task.lead.fullName}
                              {task.lead.company
                                ? ` · ${task.lead.company}`
                                : ""}
                            </Link>
                          )}
                        </div>
                      </div>

                      <div className="flex min-w-56 flex-col gap-4">
                        {task.assignedTo ? (
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              {task.assignedTo.avatarUrl && (
                                <AvatarImage
                                  src={
                                    task.assignedTo.avatarUrl
                                  }
                                  alt={
                                    task.assignedTo.fullName
                                  }
                                />
                              )}

                              <AvatarFallback className="text-xs">
                                {getInitials(
                                  task.assignedTo.fullName,
                                )}
                              </AvatarFallback>
                            </Avatar>

                            <span className="truncate text-sm">
                              {task.assignedTo.fullName}
                            </span>
                          </div>
                        ) : (
                          <span className="flex items-center gap-2 text-sm text-muted-foreground">
                            <UserRound
                              className="size-4"
                              aria-hidden="true"
                            />
                            Unassigned
                          </span>
                        )}

                        {task.lead && (
                          <form
                            action={setTaskStatusAction}
                            className="flex gap-2"
                          >
                            <input
                              type="hidden"
                              name="leadId"
                              value={task.lead.id}
                            />

                            <input
                              type="hidden"
                              name="taskId"
                              value={task.id}
                            />

                            <select
                              name="status"
                              defaultValue={task.status}
                              className="h-9 min-w-0 flex-1 rounded-md border border-input bg-transparent px-3 text-sm"
                            >
                              <option value="todo">
                                Todo
                              </option>
                              <option value="in_progress">
                                In progress
                              </option>
                              <option value="completed">
                                Completed
                              </option>
                            </select>

                            <Button
                              type="submit"
                              size="sm"
                              variant="outline"
                            >
                              Save
                            </Button>
                          </form>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}