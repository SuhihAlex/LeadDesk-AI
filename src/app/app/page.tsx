import {
  ArrowDownRight,
  ArrowUpRight,
  Clock3,
  DollarSign,
  Inbox,
  Sparkles,
  Target,
} from "lucide-react"

import { AppShell } from "@/components/layout/app-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const metrics = [
  {
    label: "New leads",
    value: "12",
    change: "+18%",
    trend: "up",
    icon: Inbox,
  },
  {
    label: "Qualified",
    value: "8",
    change: "+12%",
    trend: "up",
    icon: Target,
  },
  {
    label: "Average score",
    value: "74",
    change: "+4.2%",
    trend: "up",
    icon: Sparkles,
  },
  {
    label: "Potential value",
    value: "$48.5k",
    change: "-3%",
    trend: "down",
    icon: DollarSign,
  },
] as const

const recentLeads = [
  {
    name: "Olivia Martin",
    company: "Northstar Labs",
    project: "SaaS marketing website",
    score: 86,
    stage: "Qualified",
  },
  {
    name: "Ethan Clark",
    company: "Atlas Commerce",
    project: "E-commerce redesign",
    score: 78,
    stage: "New",
  },
  {
    name: "Sophia Reed",
    company: "Lumina Health",
    project: "Web application MVP",
    score: 72,
    stage: "Contacted",
  },
]

export default function DashboardPage() {
  return (
    <AppShell
      title="Dashboard"
      description="Overview of your lead pipeline and team performance."
    >
      <div className="space-y-6">
        <section
          aria-label="Dashboard metrics"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {metrics.map((metric) => {
            const Icon = metric.icon
            const TrendIcon =
              metric.trend === "up" ? ArrowUpRight : ArrowDownRight

            return (
              <article key={metric.label} className="surface-panel p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>

                  <span
                    className={
                      metric.trend === "up"
                        ? "inline-flex items-center gap-1 text-xs font-medium text-success"
                        : "inline-flex items-center gap-1 text-xs font-medium text-destructive"
                    }
                  >
                    <TrendIcon className="size-3.5" aria-hidden="true" />
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
                <h2 className="font-semibold">Recent leads</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Latest inquiries received by your workspace.
                </p>
              </div>

              <Button variant="outline" size="sm">
                View inbox
              </Button>
            </div>

            <div className="divide-y">
              {recentLeads.map((lead) => (
                <div
                  key={`${lead.name}-${lead.company}`}
                  className="grid gap-4 px-5 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:px-6"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {lead.name}
                    </p>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {lead.company} · {lead.project}
                    </p>
                  </div>

                  <Badge variant="outline">{lead.stage}</Badge>

                  <div className="text-left sm:text-right">
                    <p className="text-xs text-muted-foreground">AI score</p>
                    <p className="mt-1 text-sm font-semibold">{lead.score}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="surface-panel p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-warning/15 text-warning-foreground">
                <Clock3 className="size-5" aria-hidden="true" />
              </div>

              <div>
                <h2 className="font-semibold">Response health</h2>
                <p className="text-sm text-muted-foreground">
                  Average first action
                </p>
              </div>
            </div>

            <p className="mt-8 text-4xl font-semibold tracking-[-0.04em]">
              2h 18m
            </p>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Your team responds 34 minutes faster than the previous period.
            </p>

            <div className="mt-6 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-[72%] rounded-full bg-primary" />
            </div>

            <div className="mt-3 flex justify-between text-xs text-muted-foreground">
              <span>Target: under 3h</span>
              <span>72%</span>
            </div>
          </article>
        </section>
      </div>
    </AppShell>
  )
}