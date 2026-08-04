"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  Building2,
  GripVertical,
  UserRound,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import {
  leadBudgetRangeLabels,
  leadProjectTypeLabels,
  leadStageLabels,
  leadStages,
} from "@/features/leads/constants"
import { LeadPriorityBadge } from "@/features/leads/lead-priority-badge"
import { changeLeadStageAction } from "@/features/leads/pipeline-actions"
import type {
  LeadStage,
  PipelineColumn,
  PipelineLead,
} from "@/features/leads/types"
import { getInitials } from "@/lib/get-initials"

type PipelineBoardProps = {
  initialColumns: PipelineColumn[]
}

type PipelineCardProps = {
  lead: PipelineLead
  disabled: boolean
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

function isLeadStage(value: string): value is LeadStage {
  return leadStages.some((stage) => stage === value)
}

function moveLeadToStage(
  columns: PipelineColumn[],
  leadId: string,
  targetStage: LeadStage,
): PipelineColumn[] {
  const allLeads = columns.flatMap((column) => column.leads)

  const movedLead = allLeads.find((lead) => lead.id === leadId)

  if (!movedLead || movedLead.stage === targetStage) {
    return columns
  }

  const updatedLeads = allLeads.map((lead) =>
    lead.id === leadId
      ? {
          ...lead,
          stage: targetStage,
        }
      : lead,
  )

  return leadStages.map((stage) => {
    const stageLeads = updatedLeads.filter(
      (lead) => lead.stage === stage,
    )

    return {
      stage,
      leads: stageLeads,
      count: stageLeads.length,
      estimatedValue: stageLeads.reduce(
        (total, lead) =>
          total + (lead.estimatedValue ?? 0),
        0,
      ),
    }
  })
}

function PipelineLeadCard({
  lead,
  disabled,
}: PipelineCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: lead.id,
    disabled,
    data: {
      leadId: lead.id,
      stage: lead.stage,
    },
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={
        isDragging
          ? "rounded-xl border bg-background p-4 opacity-40 shadow-sm"
          : "rounded-xl border bg-background p-4 shadow-xs transition-shadow hover:shadow-sm"
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {lead.isUnread && (
              <span
                className="size-2 shrink-0 rounded-full bg-primary"
                aria-label="Unread lead"
              />
            )}

            <Link
              href={`/app/leads/${lead.id}`}
              className="truncate font-semibold hover:text-primary hover:underline"
            >
              {lead.fullName}
            </Link>
          </div>

          <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
            <Building2
              className="size-3.5 shrink-0"
              aria-hidden="true"
            />

            {lead.company || "No company"}
          </p>
        </div>

        <button
          type="button"
          className="cursor-grab rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={`Move ${lead.fullName}`}
          disabled={disabled}
          {...listeners}
          {...attributes}
        >
          <GripVertical
            className="size-4"
            aria-hidden="true"
          />
        </button>
      </div>

      <div className="mt-3">
        <LeadPriorityBadge priority={lead.priority} />
      </div>

      <div className="mt-4 space-y-2 text-xs text-muted-foreground">
        <p>
          {leadProjectTypeLabels[lead.projectType]}
        </p>

        <p>
          {leadBudgetRangeLabels[lead.budgetRange]}
        </p>

        {lead.aiScore !== null && (
          <p>AI score: {lead.aiScore}</p>
        )}
      </div>

      <div className="mt-4 border-t pt-3">
        {lead.assignedTo ? (
          <div className="flex items-center gap-2">
            <Avatar className="size-7">
              {lead.assignedTo.avatarUrl && (
                <AvatarImage
                  src={lead.assignedTo.avatarUrl}
                  alt={lead.assignedTo.fullName}
                />
              )}

              <AvatarFallback className="text-xs">
                {getInitials(
                  lead.assignedTo.fullName,
                )}
              </AvatarFallback>
            </Avatar>

            <span className="truncate text-xs">
              {lead.assignedTo.fullName}
            </span>
          </div>
        ) : (
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <UserRound
              className="size-4"
              aria-hidden="true"
            />
            Unassigned
          </span>
        )}
      </div>

      <form
        className="mt-4 border-t pt-3 md:hidden"
        action={async (formData) => {
          const stage = formData.get("stage")

          if (
            typeof stage !== "string" ||
            !isLeadStage(stage) ||
            stage === lead.stage
          ) {
            return
          }

          await changeLeadStageAction({
            leadId: lead.id,
            stage,
          })
        }}
      >
        <label className="grid gap-2">
          <span className="text-xs font-medium">
            Stage
          </span>

          <select
            name="stage"
            defaultValue={lead.stage}
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            disabled={disabled}
            onChange={(event) => {
              event.currentTarget.form?.requestSubmit()
            }}
          >
            {leadStages.map((stage) => (
              <option key={stage} value={stage}>
                {leadStageLabels[stage]}
              </option>
            ))}
          </select>
        </label>
      </form>
    </article>
  )
}

function PipelineColumnView({
  column,
  disabled,
}: {
  column: PipelineColumn
  disabled: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.stage,
    disabled,
  })

  return (
    <Card
      ref={setNodeRef}
      className={
        isOver
          ? "min-h-[520px] border-primary bg-primary/5"
          : "min-h-[520px] bg-muted/20"
      }
    >
      <CardHeader className="border-b px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold">
              {leadStageLabels[column.stage]}
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              {column.count}{" "}
              {column.count === 1 ? "lead" : "leads"}
            </p>
          </div>

          <Badge variant="outline">
            {formatCurrency(column.estimatedValue)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-3">
        {column.leads.length === 0 ? (
          <div className="rounded-lg border border-dashed px-4 py-8 text-center">
            <p className="text-sm font-medium">
              No leads
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Drop a lead here or change its stage.
            </p>
          </div>
        ) : (
          column.leads.map((lead) => (
            <PipelineLeadCard
              key={lead.id}
              lead={lead}
              disabled={disabled}
            />
          ))
        )}
      </CardContent>
    </Card>
  )
}

export function PipelineBoard({
  initialColumns,
}: PipelineBoardProps) {
  const [columns, setColumns] =
    useState<PipelineColumn[]>(initialColumns)
  const [activeLead, setActiveLead] =
    useState<PipelineLead | null>(null)
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  function handleDragEnd(event: DragEndEvent) {
    setActiveLead(null)

    const leadId = String(event.active.id)
    const targetStageValue = event.over?.id

    if (
      typeof targetStageValue !== "string" ||
      !isLeadStage(targetStageValue)
    ) {
      return
    }

    const sourceLead = columns
      .flatMap((column) => column.leads)
      .find((lead) => lead.id === leadId)

    if (
      !sourceLead ||
      sourceLead.stage === targetStageValue
    ) {
      return
    }

    const previousColumns = columns

    setErrorMessage(null)
    setColumns(
      moveLeadToStage(
        previousColumns,
        leadId,
        targetStageValue,
      ),
    )

    startTransition(async () => {
      const result = await changeLeadStageAction({
        leadId,
        stage: targetStageValue,
      })

      if (result.status === "error") {
        setColumns(previousColumns)
        setErrorMessage(result.message)
      }
    })
  }

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {errorMessage}
        </div>
      )}

      <DndContext
        sensors={sensors}
        onDragStart={(event) => {
          const lead = columns
            .flatMap((column) => column.leads)
            .find(
              (item) =>
                item.id === String(event.active.id),
            )

          setActiveLead(lead ?? null)
        }}
        onDragCancel={() => setActiveLead(null)}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-x-auto pb-4">
          <div className="grid min-w-[1680px] grid-cols-6 gap-4">
            {columns.map((column) => (
              <PipelineColumnView
                key={column.stage}
                column={column}
                disabled={isPending}
              />
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeLead ? (
            <div className="w-64 rounded-xl border bg-background p-4 shadow-xl">
              <p className="truncate font-semibold">
                {activeLead.fullName}
              </p>

              <p className="mt-1 truncate text-xs text-muted-foreground">
                {activeLead.company || "No company"}
              </p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}