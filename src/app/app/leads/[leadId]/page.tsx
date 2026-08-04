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
import { LeadPriorityBadge } from "@/features/leads/lead-priority-badge"
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
  const lead = await getLeadDetails(leadId)

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