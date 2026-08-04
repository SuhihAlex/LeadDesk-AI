import Link from "next/link"
import {
  ArrowUpDown,
  Inbox,
  Search,
  SlidersHorizontal,
  UserRound,
} from "lucide-react"

import { AppShell } from "@/components/layout/app-shell"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  leadBudgetRangeLabels,
  leadProjectTypeLabels,
  leadSourceLabels,
  leadStageLabels,
} from "@/features/leads/constants"
import { getInboxLeads } from "@/features/leads/get-inbox-leads"
import { LeadPriorityBadge } from "@/features/leads/lead-priority-badge"
import { formatDate } from "@/lib/format-date"
import { getInitials } from "@/lib/get-initials"

export default async function InboxPage() {
  const { leads, total } = await getInboxLeads()

  return (
    <AppShell
      title="Inbox"
      description="Review, qualify and assign new website inquiries."
    >
      <div className="space-y-6">
        <Card>
          <CardHeader className="border-b">
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
                  {total} {total === 1 ? "lead" : "leads"} in the current
                  workspace
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative min-w-0 sm:w-72">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />

                  <Input
                    placeholder="Search leads..."
                    className="pl-9"
                    disabled
                  />
                </div>

                <Button variant="outline" disabled>
                  <SlidersHorizontal
                    className="size-4"
                    aria-hidden="true"
                  />
                  Filters
                </Button>

                <Button variant="outline" disabled>
                  <ArrowUpDown
                    className="size-4"
                    aria-hidden="true"
                  />
                  Sort
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {leads.length === 0 ? (
              <div className="flex min-h-96 items-center justify-center px-6 py-16">
                <div className="max-w-md text-center">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Inbox className="size-6" aria-hidden="true" />
                  </div>

                  <h3 className="mt-5 text-xl font-semibold">
                    No leads yet
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    New inquiries submitted through the public lead form will
                    appear here automatically.
                  </p>

                  <Button className="mt-6" asChild>
                    <Link href="/demo">Open lead form demo</Link>
                  </Button>
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
                                lead.isUnread ? "Unread lead" : undefined
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
                            {leadProjectTypeLabels[lead.projectType]}
                          </p>

                          {lead.aiScore !== null && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              AI score: {lead.aiScore}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4 text-muted-foreground">
                          {leadBudgetRangeLabels[lead.budgetRange]}
                        </td>

                        <td className="px-5 py-4">
                          <LeadPriorityBadge priority={lead.priority} />
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