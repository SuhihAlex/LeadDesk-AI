import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  ExternalLink,
  Mail,
  UserRound,
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
import {
  leadBudgetRangeLabels,
  leadProjectTypeLabels,
  leadSourceLabels,
  leadStageLabels,
  leadTimelineLabels,
} from "@/features/leads/constants"
import { getLeadDetails } from "@/features/leads/get-lead-details"
import { assignLeadAction } from "@/features/leads/management-actions"
import { getWorkspaceMembers } from "@/features/workspace/get-workspace-members"
import { LeadPriorityBadge } from "@/features/leads/lead-priority-badge"
import { LeadNoteForm } from "@/features/leads/lead-note-form"
import { LeadTaskForm } from "@/features/leads/lead-task-form"
import { setTaskStatusAction } from "@/features/leads/task-actions"
import { formatDate } from "@/lib/format-date"
import { getInitials } from "@/lib/get-initials"

type LeadDetailsPageProps = {
  params: Promise<{
    leadId: string
  }>
}

function formatEstimatedValue(
  value: number | null,
): string {
  if (value === null) {
    return "Not calculated"
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

export default async function LeadDetailsPage({
  params,
}: LeadDetailsPageProps) {
  const { leadId } = await params

  const [lead, members] = await Promise.all([
    getLeadDetails(leadId),
    getWorkspaceMembers(),
  ])

  if (!lead) {
    notFound()
  }

  return (
    <AppShell
      title={lead.fullName}
      description="Review lead details, qualification data and activity."
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" asChild>
            <Link href="/app/inbox">
              <ArrowLeft
                className="size-4"
                aria-hidden="true"
              />
              Back to inbox
            </Link>
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            <LeadPriorityBadge priority={lead.priority} />

            <Badge variant="outline">
              {leadStageLabels[lead.stage]}
            </Badge>

            {lead.isUnread && (
              <Badge variant="secondary">
                Unread
              </Badge>
            )}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
          <div className="space-y-6">
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-start gap-4">
                  <Avatar className="size-12">
                    <AvatarFallback>
                      {getInitials(lead.fullName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-semibold">
                      {lead.fullName}
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {lead.company || "No company provided"}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="grid gap-5 p-6 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium">
                    Email
                  </p>

                  <a
                    href={`mailto:${lead.email}`}
                    className="mt-2 inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Mail
                      className="size-4"
                      aria-hidden="true"
                    />
                    {lead.email}
                  </a>
                </div>

                <div>
                  <p className="text-sm font-medium">
                    Company
                  </p>

                  <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2
                      className="size-4"
                      aria-hidden="true"
                    />
                    {lead.company || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium">
                    Website
                  </p>

                  {lead.websiteUrl ? (
                    <a
                      href={lead.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-2 break-all text-sm text-primary hover:underline"
                    >
                      <ExternalLink
                        className="size-4 shrink-0"
                        aria-hidden="true"
                      />
                      {lead.websiteUrl}
                    </a>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Not provided
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium">
                    Source
                  </p>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {leadSourceLabels[lead.source]}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b">
                <h2 className="text-lg font-semibold">
                  Project request
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  Original information submitted by the lead.
                </p>
              </CardHeader>

              <CardContent className="space-y-6 p-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium">
                      Project type
                    </p>

                    <p className="mt-2 text-sm text-muted-foreground">
                      {
                        leadProjectTypeLabels[
                          lead.projectType
                        ]
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      Budget range
                    </p>

                    <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <CircleDollarSign
                        className="size-4"
                        aria-hidden="true"
                      />
                      {
                        leadBudgetRangeLabels[
                          lead.budgetRange
                        ]
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      Desired timeline
                    </p>

                    <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock3
                        className="size-4"
                        aria-hidden="true"
                      />
                      {
                        leadTimelineLabels[
                          lead.desiredTimeline
                        ]
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      Submitted
                    </p>

                    <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarDays
                        className="size-4"
                        aria-hidden="true"
                      />
                      {formatDate(lead.createdAt)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium">
                    Project description
                  </p>

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                    {lead.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b">
                <h2 className="text-lg font-semibold">
                  Qualification
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  AI qualification will be completed during Stage 6.
                </p>
              </CardHeader>

              <CardContent className="grid gap-5 p-6 sm:grid-cols-3">
                <div>
                  <p className="text-sm font-medium">
                    AI score
                  </p>

                  <p className="mt-2 text-2xl font-semibold">
                    {lead.aiScore ?? "—"}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium">
                    Completeness
                  </p>

                  <p className="mt-2 text-2xl font-semibold">
                    {lead.aiCompletenessScore ?? "—"}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium">
                    Estimated value
                  </p>

                  <p className="mt-2 text-lg font-semibold">
                    {formatEstimatedValue(
                      lead.estimatedValue,
                    )}
                  </p>
                </div>

                <div className="sm:col-span-3">
                  <p className="text-sm font-medium">
                    AI summary
                  </p>

                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {lead.aiSummary ||
                      "This lead has not been qualified by AI yet."}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b">
                <h2 className="text-lg font-semibold">
                  Notes
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  Internal workspace notes for this lead.
                </p>
              </CardHeader>

              <CardContent className="space-y-6 p-6">
                <LeadNoteForm leadId={lead.id} />

                {lead.notes.length === 0 ? (
                  <div className="rounded-xl border border-dashed px-4 py-8 text-center">
                    <p className="text-sm font-medium">
                      No notes yet
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Add the first internal note for this lead.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 border-t pt-6">
                    {lead.notes.map((note) => (
                      <article
                        key={note.id}
                        className="rounded-xl border bg-muted/20 p-4"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            {note.author.avatarUrl && (
                              <AvatarImage
                                src={note.author.avatarUrl}
                                alt={note.author.fullName}
                              />
                            )}

                            <AvatarFallback className="text-xs">
                              {getInitials(
                                note.author.fullName,
                              )}
                            </AvatarFallback>
                          </Avatar>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {note.author.fullName}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {formatDate(note.createdAt)}
                            </p>
                          </div>
                        </div>

                        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                          {note.content}
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="border-b">
                <h2 className="text-lg font-semibold">
                  Tasks
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  Create and track follow-up work for this lead.
                </p>
              </CardHeader>

              <CardContent className="space-y-6 p-6">
                <LeadTaskForm
                  leadId={lead.id}
                  members={members.map((member) => ({
                    userId: member.userId,
                    fullName: member.fullName,
                    isCurrentUser: member.isCurrentUser,
                  }))}
                />

                {lead.tasks.length === 0 ? (
                  <div className="rounded-xl border border-dashed px-4 py-8 text-center">
                    <p className="text-sm font-medium">
                      No tasks yet
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Create the first task for this lead.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 border-t pt-6">
                    {lead.tasks.map((task) => (
                      <article
                        key={task.id}
                        className="rounded-xl border bg-muted/20 p-4"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="font-medium">
                              {task.title}
                            </p>

                            {task.description && (
                              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                                {task.description}
                              </p>
                            )}

                            <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                              <span>
                                Created {formatDate(task.createdAt)}
                              </span>

                              {task.dueAt && (
                                <span>
                                  Due {formatDate(task.dueAt)}
                                </span>
                              )}

                              {task.assignedTo && (
                                <span>
                                  Assigned to {task.assignedTo.fullName}
                                </span>
                              )}
                            </div>
                          </div>

                          <Badge
                            variant={
                              task.status === "completed"
                                ? "default"
                                : "outline"
                            }
                            className="capitalize"
                          >
                            {task.status.replace("_", " ")}
                          </Badge>
                        </div>

                        <form
                          action={setTaskStatusAction}
                          className="mt-4 flex flex-wrap gap-2 border-t pt-4"
                        >
                          <input
                            type="hidden"
                            name="leadId"
                            value={lead.id}
                          />

                          <input
                            type="hidden"
                            name="taskId"
                            value={task.id}
                          />

                          <select
                            name="status"
                            defaultValue={task.status}
                            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                          >
                            <option value="todo">Todo</option>
                            <option value="in_progress">
                              In progress
                            </option>
                            <option value="completed">
                              Completed
                            </option>
                          </select>

                          <Button
                            type="submit"
                            variant="outline"
                            size="sm"
                          >
                            Update status
                          </Button>
                        </form>
                      </article>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="border-b">
                <h2 className="text-lg font-semibold">
                  Management
                </h2>
              </CardHeader>

              <CardContent className="space-y-5 p-6">
                <div>
                  <p className="text-sm font-medium">
                    Assigned to
                  </p>

                  {lead.assignedTo ? (
                    <div className="mt-3 flex items-center gap-3">
                      <Avatar className="size-9">
                        {lead.assignedTo.avatarUrl && (
                          <AvatarImage
                            src={lead.assignedTo.avatarUrl}
                            alt={lead.assignedTo.fullName}
                          />
                        )}

                        <AvatarFallback>
                          {getInitials(
                            lead.assignedTo.fullName,
                          )}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <p className="text-sm font-medium">
                          {lead.assignedTo.fullName}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          Workspace member
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                      <UserRound
                        className="size-4"
                        aria-hidden="true"
                      />
                      Unassigned
                    </p>
                  )}

                  <form
                    action={assignLeadAction}
                    className="mt-4 space-y-3"
                  >
                    <input
                      type="hidden"
                      name="leadId"
                      value={lead.id}
                    />

                    <label className="grid gap-2">
                      <span className="sr-only">
                        Assign lead
                      </span>

                      <select
                        name="assigneeId"
                        defaultValue={
                          lead.assignedTo?.id ?? ""
                        }
                        className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        aria-label="Assign lead to workspace member"
                      >
                        <option value="">Unassigned</option>

                        {members.map((member) => (
                          <option
                            key={member.userId}
                            value={member.userId}
                          >
                            {member.fullName}
                            {member.isCurrentUser ? " (You)" : ""}
                          </option>
                        ))}
                      </select>
                    </label>

                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Update assignment
                    </Button>
                  </form>
                </div>

                <div>
                  <p className="text-sm font-medium">
                    Current stage
                  </p>

                  <div className="mt-3">
                    <Badge variant="outline">
                      {leadStageLabels[lead.stage]}
                    </Badge>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium">
                    Last updated
                  </p>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {formatDate(lead.updatedAt)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium">
                    Consent
                  </p>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {lead.consentGiven
                      ? "Consent recorded"
                      : "Consent not recorded"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b">
                <h2 className="text-lg font-semibold">
                  Activity
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  Latest events for this lead.
                </p>
              </CardHeader>

              <CardContent className="p-6">
                {lead.activities.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm font-medium">
                      No activity yet
                    </p>

                    <p className="mt-2 text-sm text-muted-foreground">
                      Lead events will appear here as the team
                      processes this inquiry.
                    </p>
                  </div>
                ) : (
                  <ol className="space-y-5">
                    {lead.activities.map((activity) => (
                      <li
                        key={activity.id}
                        className="relative border-l pl-5"
                      >
                        <span className="absolute -left-1.5 top-1.5 size-3 rounded-full border-2 border-background bg-primary" />

                        <p className="text-sm font-medium">
                          {activity.title}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {activity.actor
                            ? activity.actor.fullName
                            : "System"}{" "}
                          · {formatDate(activity.createdAt)}
                        </p>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  )
}