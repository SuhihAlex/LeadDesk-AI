import {
  Bot,
  CheckCircle2,
  CircleUserRound,
  Eye,
  FileText,
  Mail,
  MessageSquareText,
  MoveRight,
  UserRoundCheck,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  leadStageLabels,
} from "@/features/leads/constants"
import type {
  LeadActivityItem,
  LeadActivityType,
  LeadStage,
} from "@/features/leads/types"
import { formatDate } from "@/lib/format-date"

type LeadActivityTimelineProps = {
  activities: LeadActivityItem[]
}

type ActivityPresentation = {
  label: string
  description: string | null
  icon: typeof Eye
}

const activityPresentation: Record<
  LeadActivityType,
  {
    label: string
    icon: typeof Eye
  }
> = {
  lead_created: {
    label: "Lead created",
    icon: FileText,
  },
  lead_viewed: {
    label: "Lead viewed",
    icon: Eye,
  },
  stage_changed: {
    label: "Stage changed",
    icon: MoveRight,
  },
  assignment_changed: {
    label: "Assignment changed",
    icon: UserRoundCheck,
  },
  note_added: {
    label: "Note added",
    icon: MessageSquareText,
  },
  task_created: {
    label: "Task created",
    icon: CircleUserRound,
  },
  task_completed: {
    label: "Task completed",
    icon: CheckCircle2,
  },
  email_sent: {
    label: "Email sent",
    icon: Mail,
  },
  ai_qualification_completed: {
    label: "AI qualification completed",
    icon: Bot,
  },
}

function getStringMetadata(
  details: Record<string, unknown>,
  key: string,
): string | null {
  const value = details[key]

  return typeof value === "string" && value.length > 0
    ? value
    : null
}

function isLeadStage(value: string): value is LeadStage {
  return value in leadStageLabels
}

function getStageLabel(
  value: string | null,
): string | null {
  if (!value || !isLeadStage(value)) {
    return null
  }

  return leadStageLabels[value]
}

function getActivityDescription(
  activity: LeadActivityItem,
): string | null {
  switch (activity.type) {
    case "stage_changed": {
      const previousStage = getStageLabel(
        getStringMetadata(
          activity.details,
          "previousStage",
        ),
      )
      const stage = getStageLabel(
        getStringMetadata(activity.details, "stage"),
      )

      if (previousStage && stage) {
        return `${previousStage} → ${stage}`
      }

      return stage
        ? `Moved to ${stage}`
        : null
    }

    case "assignment_changed": {
      const assigneeName = getStringMetadata(
        activity.details,
        "assigneeName",
      )

      return assigneeName
        ? `Assigned to ${assigneeName}`
        : "Lead became unassigned"
    }

    case "task_created":
    case "task_completed": {
      const taskTitle = getStringMetadata(
        activity.details,
        "taskTitle",
      )

      return taskTitle
    }

    case "email_sent": {
      const subject = getStringMetadata(
        activity.details,
        "subject",
      )

      return subject
        ? `Subject: ${subject}`
        : null
    }

    default:
      return null
  }
}

function getActivityPresentation(
  activity: LeadActivityItem,
): ActivityPresentation {
  const presentation =
    activityPresentation[activity.type]

  return {
    label: presentation.label,
    description: getActivityDescription(activity),
    icon: presentation.icon,
  }
}

export function LeadActivityTimeline({
  activities,
}: LeadActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm font-medium">
          No activity yet
        </p>

        <p className="mt-2 text-sm text-muted-foreground">
          Lead events will appear here as the team processes
          this inquiry.
        </p>
      </div>
    )
  }

  return (
    <ol className="space-y-1">
      {activities.map((activity, index) => {
        const presentation =
          getActivityPresentation(activity)
        const Icon = presentation.icon
        const isLast =
          index === activities.length - 1

        return (
          <li
            key={activity.id}
            className="relative flex gap-4 pb-6"
          >
            {!isLast && (
              <span
                className="absolute left-4 top-9 h-[calc(100%-1.25rem)] w-px bg-border"
                aria-hidden="true"
              />
            )}

            <div className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border bg-background text-muted-foreground">
              <Icon
                className="size-4"
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0 flex-1 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium">
                  {presentation.label}
                </p>

                {activity.actor ? (
                  <Badge
                    variant="secondary"
                    className="font-normal"
                  >
                    {activity.actor.fullName}
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="font-normal"
                  >
                    System
                  </Badge>
                )}
              </div>

              {presentation.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {presentation.description}
                </p>
              )}

              <p className="mt-1 text-xs text-muted-foreground">
                {formatDate(activity.createdAt)}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}