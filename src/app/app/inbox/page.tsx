import Link from "next/link"
import {
  Inbox,
  Search,
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
import { Input } from "@/components/ui/input"
import {
  leadBudgetRangeLabels,
  leadPriorityLabels,
  leadProjectTypeLabels,
  leadSourceLabels,
  leadStageLabels,
} from "@/features/leads/constants"
import { getInboxLeads } from "@/features/leads/get-inbox-leads"
import {
  hasActiveInboxFilters,
  type InboxSearchParams,
  parseInboxSearchParams,
} from "@/features/leads/inbox-search-params"
import { LeadPriorityBadge } from "@/features/leads/lead-priority-badge"
import type { InboxFilters } from "@/features/leads/types"
import { formatDate } from "@/lib/format-date"
import { getInitials } from "@/lib/get-initials"

type InboxPageProps = {
  searchParams: Promise<InboxSearchParams>
}

function getActiveFilterLabels(
  filters: InboxFilters,
): string[] {
  const labels: string[] = []

  if (filters.query) {
    labels.push(`Search: ${filters.query}`)
  }

  if (filters.stage) {
    labels.push(`Stage: ${leadStageLabels[filters.stage]}`)
  }

  if (filters.priority) {
    labels.push(
      `Priority: ${leadPriorityLabels[filters.priority]}`,
    )
  }

  if (filters.source) {
    labels.push(`Source: ${leadSourceLabels[filters.source]}`)
  }

  if (filters.unreadOnly) {
    labels.push("Unread only")
  }

  if (filters.sort !== "newest") {
    const sortLabels = {
      oldest: "Oldest first",
      priority: "Highest priority",
      score: "Highest AI score",
    } as const

    labels.push(`Sort: ${sortLabels[filters.sort]}`)
  }

  return labels
}

export default async function InboxPage({
  searchParams,
}: InboxPageProps) {
  const resolvedSearchParams = await searchParams
  const filters = parseInboxSearchParams(
    resolvedSearchParams,
  )

  const {
    leads,
    total,
    workspaceTotal,
  } = await getInboxLeads(filters)

  const hasActiveFilters = hasActiveInboxFilters(filters)
  const activeFilterLabels = getActiveFilterLabels(filters)

  return (
    <AppShell
      title="Inbox"
      description="Review, qualify and assign new website inquiries."
    >
      <div className="space-y-6">
        <Card>
          <CardHeader className="border-b">
            <div className="space-y-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Inbox
                      className="size-5 text-primary"
                      aria-hidden="true"
                    />

                    <h2 className="text-lg font-semibold">
                      Lead inbox
                    </h2>
                  </div>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {hasActiveFilters ? (
                      <>
                        {total}{" "}
                        {total === 1 ? "lead matches" : "leads match"}{" "}
                        the current filters
                      </>
                    ) : (
                      <>
                        {workspaceTotal}{" "}
                        {workspaceTotal === 1 ? "lead" : "leads"}{" "}
                        in the current workspace
                      </>
                    )}
                  </p>
                </div>

                {hasActiveFilters && (
                  <Button variant="outline" asChild>
                    <Link href="/app/inbox">
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
                action="/app/inbox"
                className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(240px,1.5fr)_repeat(4,minmax(140px,1fr))_auto]"
              >
                <div className="relative md:col-span-2 xl:col-span-1">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />

                  <Input
                    type="search"
                    name="q"
                    defaultValue={filters.query ?? ""}
                    placeholder="Search name, email or company..."
                    maxLength={100}
                    className="pl-9"
                    aria-label="Search leads"
                  />
                </div>

                <label className="grid gap-1.5">
                  <span className="sr-only">Stage</span>

                  <select
                    name="stage"
                    defaultValue={filters.stage ?? ""}
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    aria-label="Filter by stage"
                  >
                    <option value="">All stages</option>

                    {Object.entries(leadStageLabels).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label className="grid gap-1.5">
                  <span className="sr-only">Priority</span>

                  <select
                    name="priority"
                    defaultValue={filters.priority ?? ""}
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    aria-label="Filter by priority"
                  >
                    <option value="">All priorities</option>

                    {Object.entries(leadPriorityLabels).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label className="grid gap-1.5">
                  <span className="sr-only">Source</span>

                  <select
                    name="source"
                    defaultValue={filters.source ?? ""}
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    aria-label="Filter by source"
                  >
                    <option value="">All sources</option>

                    {Object.entries(leadSourceLabels).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label className="grid gap-1.5">
                  <span className="sr-only">Sort</span>

                  <select
                    name="sort"
                    defaultValue={filters.sort}
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    aria-label="Sort leads"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="priority">
                      Highest priority
                    </option>
                    <option value="score">
                      Highest AI score
                    </option>
                  </select>
                </label>

                <div className="flex flex-wrap items-center gap-3 md:col-span-2 xl:col-span-1">
                  <label className="flex h-9 cursor-pointer items-center gap-2 whitespace-nowrap rounded-md border border-input px-3 text-sm">
                    <input
                      type="checkbox"
                      name="unread"
                      value="true"
                      defaultChecked={filters.unreadOnly}
                      className="size-4 rounded border-input accent-primary"
                    />

                    Unread only
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
            {leads.length === 0 ? (
              <div className="flex min-h-96 items-center justify-center px-6 py-16">
                <div className="max-w-md text-center">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Inbox
                      className="size-6"
                      aria-hidden="true"
                    />
                  </div>

                  {workspaceTotal === 0 ? (
                    <>
                      <h3 className="mt-5 text-xl font-semibold">
                        No leads yet
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        New inquiries submitted through the public
                        lead form will appear here automatically.
                      </p>

                      <Button className="mt-6" asChild>
                        <Link href="/demo">
                          Open lead form demo
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <h3 className="mt-5 text-xl font-semibold">
                        No leads match your filters
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        Try changing the search query or removing
                        one or more active filters.
                      </p>

                      <Button
                        className="mt-6"
                        variant="outline"
                        asChild
                      >
                        <Link href="/app/inbox">
                          Clear filters
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-left">
                      <th className="px-5 py-3 font-medium text-muted-foreground">
                        Lead
                      </th>

                      <th className="px-5 py-3 font-medium text-muted-foreground">
                        Project
                      </th>

                      <th className="px-5 py-3 font-medium text-muted-foreground">
                        Budget
                      </th>

                      <th className="px-5 py-3 font-medium text-muted-foreground">
                        Priority
                      </th>

                      <th className="px-5 py-3 font-medium text-muted-foreground">
                        Stage
                      </th>

                      <th className="px-5 py-3 font-medium text-muted-foreground">
                        Assigned
                      </th>

                      <th className="px-5 py-3 font-medium text-muted-foreground">
                        Received
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {leads.map((lead) => (
                      <tr
                        key={lead.id}
                        className="transition-colors hover:bg-muted/30"
                      >
                        <td className="px-5 py-4">
                          <div className="flex min-w-0 items-start gap-3">
                            <span
                              className={
                                lead.isUnread
                                  ? "mt-2 size-2 shrink-0 rounded-full bg-primary"
                                  : "mt-2 size-2 shrink-0 rounded-full bg-transparent"
                              }
                              aria-label={
                                lead.isUnread
                                  ? "Unread lead"
                                  : undefined
                              }
                            />

                            <div className="min-w-0">
                              <p className="truncate font-semibold">
                                {lead.fullName}
                              </p>

                              <p className="mt-1 truncate text-xs text-muted-foreground">
                                {lead.company || lead.email}
                              </p>

                              <p className="mt-1 text-xs text-muted-foreground">
                                {leadSourceLabels[lead.source]}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-medium">
                            {
                              leadProjectTypeLabels[
                                lead.projectType
                              ]
                            }
                          </p>

                          {lead.aiScore !== null && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              AI score: {lead.aiScore}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4 text-muted-foreground">
                          {
                            leadBudgetRangeLabels[
                              lead.budgetRange
                            ]
                          }
                        </td>

                        <td className="px-5 py-4">
                          <LeadPriorityBadge
                            priority={lead.priority}
                          />
                        </td>

                        <td className="px-5 py-4">
                          <Badge variant="outline">
                            {leadStageLabels[lead.stage]}
                          </Badge>
                        </td>

                        <td className="px-5 py-4">
                          {lead.assignedTo ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="size-7">
                                {lead.assignedTo.avatarUrl && (
                                  <AvatarImage
                                    src={
                                      lead.assignedTo
                                        .avatarUrl
                                    }
                                    alt={
                                      lead.assignedTo
                                        .fullName
                                    }
                                  />
                                )}

                                <AvatarFallback className="text-xs">
                                  {getInitials(
                                    lead.assignedTo
                                      .fullName,
                                  )}
                                </AvatarFallback>
                              </Avatar>

                              <span className="max-w-32 truncate">
                                {lead.assignedTo.fullName}
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-2 text-muted-foreground">
                              <UserRound
                                className="size-4"
                                aria-hidden="true"
                              />
                              Unassigned
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-muted-foreground">
                          {formatDate(lead.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}