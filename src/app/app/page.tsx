import Link from "next/link"
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  CircleDollarSign,
  Clock3,
  Inbox,
  Sparkles,
  Target,
  Trophy,
  MailCheck,
  MailWarning,
  Send,
} from "lucide-react"

import { AppShell } from "@/components/layout/app-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  leadProjectTypeLabels,
  leadSourceLabels,
  leadStageLabels,
} from "@/features/leads/constants"
import { getDashboardAnalytics } from "@/features/dashboard/get-dashboard-analytics"
import type {
  DashboardMetric,
} from "@/features/dashboard/types"
import { formatDate } from "@/lib/format-date"

import { RetryEmailDeliveryButton } from "@/features/email/retry-email-delivery-button"

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(value)
}

function formatPercent(value: number): string {
  return `${formatNumber(value)}%`
}

function getChangeLabel(
  metric: DashboardMetric,
): string {
  if (metric.changePercent === null) {
    return "New"
  }

  const sign =
    metric.changePercent > 0 ? "+" : ""

  return `${sign}${formatNumber(
    metric.changePercent,
  )}%`
}

function getMetricTrend(
  metric: DashboardMetric,
): "up" | "down" | "neutral" {
  if (
    metric.changePercent === null ||
    metric.changePercent === 0
  ) {
    return "neutral"
  }

  return metric.changePercent > 0
    ? "up"
    : "down"
}

export default async function DashboardPage() {
  const analytics =
    await getDashboardAnalytics()

  const metrics = [
    {
      label: "New leads",
      value: formatNumber(
        analytics.metrics.newLeads.value,
      ),
      change: getChangeLabel(
        analytics.metrics.newLeads,
      ),
      trend: getMetricTrend(
        analytics.metrics.newLeads,
      ),
      icon: Inbox,
    },
    {
      label: "Qualified",
      value: formatNumber(
        analytics.metrics.qualifiedLeads.value,
      ),
      change: getChangeLabel(
        analytics.metrics.qualifiedLeads,
      ),
      trend: getMetricTrend(
        analytics.metrics.qualifiedLeads,
      ),
      icon: Target,
    },
    {
      label: "Conversion rate",
      value: formatPercent(
        analytics.metrics.conversionRate.value,
      ),
      change: getChangeLabel(
        analytics.metrics.conversionRate,
      ),
      trend: getMetricTrend(
        analytics.metrics.conversionRate,
      ),
      icon: Trophy,
    },
    {
      label: "Open pipeline",
      value: formatCurrency(
        analytics.metrics.openPipelineValue,
      ),
      change: `${analytics.metrics.overdueTasks} overdue`,
      trend:
        analytics.metrics.overdueTasks > 0
          ? "down"
          : "neutral",
      icon: CircleDollarSign,
    },
  ] as const

  const totalSources =
    analytics.sourceBreakdown.reduce(
      (total, item) => total + item.count,
      0,
    )

  return (
    <AppShell
      title="Dashboard"
      description="Real-time overview of lead activity, AI qualification and pipeline health."
    >
      <div className="space-y-6">
        <section
          aria-label="Dashboard metrics"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {metrics.map((metric) => {
            const Icon = metric.icon
            const TrendIcon =
              metric.trend === "up"
                ? ArrowUpRight
                : metric.trend === "down"
                  ? ArrowDownRight
                  : null

            return (
              <article
                key={metric.label}
                className="surface-panel p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon
                      className="size-5"
                      aria-hidden="true"
                    />
                  </div>

                  <span
                    className={
                      metric.trend === "up"
                        ? "inline-flex items-center gap-1 text-xs font-medium text-success"
                        : metric.trend === "down"
                          ? "inline-flex items-center gap-1 text-xs font-medium text-destructive"
                          : "inline-flex items-center gap-1 text-xs font-medium text-muted-foreground"
                    }
                  >
                    {TrendIcon && (
                      <TrendIcon
                        className="size-3.5"
                        aria-hidden="true"
                      />
                    )}

                    {metric.change}
                  </span>
                </div>

                <p className="mt-5 text-sm text-muted-foreground">
                  {metric.label}
                </p>

                <p className="mt-1 text-2xl font-semibold tracking-tight">
                  {metric.value}
                </p>
              </article>
            )
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <article className="surface-panel overflow-hidden">
            <div className="flex items-center justify-between border-b px-5 py-4 sm:px-6">
              <div>
                <h2 className="font-semibold">
                  Recent leads
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Latest inquiries received by your workspace.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <Link href="/app/inbox">
                  View inbox
                </Link>
              </Button>
            </div>

            {analytics.recentLeads.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-sm font-medium">
                  No leads yet
                </p>

                <p className="mt-2 text-sm text-muted-foreground">
                  New inquiries will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {analytics.recentLeads.map(
                  (lead) => (
                    <Link
                      key={lead.id}
                      href={`/app/leads/${lead.id}`}
                      className="grid gap-4 px-5 py-4 transition-colors hover:bg-muted/40 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:px-6"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {lead.fullName}
                        </p>

                        <p className="mt-1 truncate text-sm text-muted-foreground">
                          {lead.company ||
                            "No company"}{" "}
                          ·{" "}
                          {
                            leadProjectTypeLabels[
                              lead.projectType
                            ]
                          }
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDate(
                            lead.createdAt,
                          )}
                        </p>
                      </div>

                      <Badge variant="outline">
                        {
                          leadStageLabels[
                            lead.stage
                          ]
                        }
                      </Badge>

                      <div className="text-left sm:text-right">
                        <p className="text-xs text-muted-foreground">
                          AI score
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {lead.aiScore !== null
                            ? lead.aiScore
                            : "—"}
                        </p>
                      </div>
                    </Link>
                  ),
                )}
              </div>
            )}
          </article>

          <article className="surface-panel p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-warning/15 text-warning-foreground">
                <Clock3
                  className="size-5"
                  aria-hidden="true"
                />
              </div>

              <div>
                <h2 className="font-semibold">
                  Workspace health
                </h2>

                <p className="text-sm text-muted-foreground">
                  Tasks and AI processing
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              <div className="rounded-xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle
                      className="size-4 text-destructive"
                      aria-hidden="true"
                    />

                    <span className="text-sm font-medium">
                      Overdue tasks
                    </span>
                  </div>

                  <span className="text-lg font-semibold">
                    {
                      analytics.metrics
                        .overdueTasks
                    }
                  </span>
                </div>
              </div>

              <div className="rounded-xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Bot
                      className="size-4 text-primary"
                      aria-hidden="true"
                    />

                    <span className="text-sm font-medium">
                      AI completed
                    </span>
                  </div>

                  <span className="text-lg font-semibold">
                    {
                      analytics.metrics
                        .aiCompleted
                    }
                  </span>
                </div>
              </div>

              <div className="rounded-xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles
                      className="size-4 text-destructive"
                      aria-hidden="true"
                    />

                    <span className="text-sm font-medium">
                      AI failed
                    </span>
                  </div>

                  <span className="text-lg font-semibold">
                    {
                      analytics.metrics
                        .aiFailed
                    }
                  </span>
                </div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <MailCheck
                      className="size-4 text-success"
                      aria-hidden="true"
                    />

                    <span className="text-sm font-medium">
                      Emails sent
                    </span>
                  </div>

                  <span className="text-lg font-semibold">
                    {analytics.metrics.emailSent}
                  </span>
                </div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <MailWarning
                      className="size-4 text-destructive"
                      aria-hidden="true"
                    />

                    <span className="text-sm font-medium">
                      Emails failed
                    </span>
                  </div>

                  <span className="text-lg font-semibold">
                    {analytics.metrics.emailFailed}
                  </span>
                </div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Send
                      className="size-4 text-primary"
                      aria-hidden="true"
                    />

                    <span className="text-sm font-medium">
                      Email success rate
                    </span>
                  </div>

                  <span className="text-lg font-semibold">
                    {formatPercent(
                      analytics.metrics
                        .emailSuccessRate,
                    )}
                  </span>
                </div>

                {analytics.metrics.emailProcessing >
                  0 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {
                      analytics.metrics
                        .emailProcessing
                    }{" "}
                    currently processing
                  </p>
                )}
              </div>
            </div>
          </article>
        </section>

        {analytics.recentEmailFailures.length >
          0 && (
          <section>
            <article className="surface-panel overflow-hidden">
              <div className="border-b px-5 py-4 sm:px-6">
                <div className="flex items-center gap-2">
                  <MailWarning
                    className="size-5 text-destructive"
                    aria-hidden="true"
                  />

                  <h2 className="font-semibold">
                    Recent email failures
                  </h2>
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  Latest delivery errors requiring
                  review or retry.
                </p>
              </div>

              <div className="divide-y">
                {analytics.recentEmailFailures.map(
                  (failure) => (
                    <div
                      key={failure.id}
                      className="grid gap-4 px-5 py-4 sm:grid-cols-[1fr_auto]"
                    >
                      <Link
                        href={`/app/leads/${failure.leadId}`}
                        className="min-w-0 rounded-md transition-opacity hover:opacity-80"
                      >
                        <p className="truncate text-sm font-medium">
                          {failure.subject}
                        </p>

                        <p className="mt-1 truncate text-sm text-muted-foreground">
                          {failure.recipientEmail} · {failure.provider}
                        </p>

                        <p className="mt-2 line-clamp-2 text-sm text-destructive">
                          {failure.errorMessage}
                        </p>

                        <p className="mt-2 text-xs text-muted-foreground">
                          {formatDate(failure.failedAt)}
                        </p>
                      </Link>

                      <div className="flex items-start justify-end">
                        <RetryEmailDeliveryButton
                          leadId={failure.leadId}
                          draftId={failure.draftId}
                        />
                      </div>
                    </div>
                  ),
                )}
              </div>
            </article>
          </section>
        )}

        <section className="grid gap-6 xl:grid-cols-2">
          <article className="surface-panel overflow-hidden">
            <div className="border-b px-5 py-4 sm:px-6">
              <h2 className="font-semibold">
                Pipeline by stage
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Lead volume and estimated value across the funnel.
              </p>
            </div>

            <div className="divide-y">
              {analytics.stageBreakdown.map(
                (item) => (
                  <div
                    key={item.stage}
                    className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-4 sm:px-6"
                  >
                    <span className="text-sm font-medium">
                      {
                        leadStageLabels[
                          item.stage
                        ]
                      }
                    </span>

                    <Badge variant="outline">
                      {item.count}
                    </Badge>

                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(
                        item.estimatedValue,
                      )}
                    </span>
                  </div>
                ),
              )}
            </div>
          </article>

          <article className="surface-panel overflow-hidden">
            <div className="border-b px-5 py-4 sm:px-6">
              <h2 className="font-semibold">
                Lead sources
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Distribution of inquiries by acquisition channel.
              </p>
            </div>

            <div className="divide-y">
              {analytics.sourceBreakdown.map(
                (item) => {
                  const percentage =
                    totalSources > 0
                      ? (item.count /
                          totalSources) *
                        100
                      : 0

                  return (
                    <div
                      key={item.source}
                      className="px-5 py-4 sm:px-6"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium">
                          {
                            leadSourceLabels[
                              item.source
                            ]
                          }
                        </span>

                        <span className="text-sm text-muted-foreground">
                          {item.count} ·{" "}
                          {formatPercent(
                            percentage,
                          )}
                        </span>
                      </div>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{
                            width: `${Math.min(
                              percentage,
                              100,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )
                },
              )}
            </div>
          </article>
        </section>
      </div>
    </AppShell>
  )
}