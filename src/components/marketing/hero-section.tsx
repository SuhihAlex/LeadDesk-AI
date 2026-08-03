import Link from "next/link"
import {
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Sparkles,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const qualificationSignals = [
  {
    label: "Budget",
    value: "$7k–$15k",
    icon: CircleDollarSign,
  },
  {
    label: "Timeline",
    value: "4–6 weeks",
    icon: Clock3,
  },
  {
    label: "Service fit",
    value: "Excellent",
    icon: CheckCircle2,
  },
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,var(--color-primary)/0.10,transparent_34%)]"
        aria-hidden="true"
      />

      <div className="mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
        <div className="max-w-3xl">
          <Badge variant="outline" className="mb-6 gap-2 rounded-full px-3 py-1">
            <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
            Built for web studios and SaaS teams
          </Badge>

          <h1 className="text-balance text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl">
            Turn every new inquiry into a qualified sales opportunity.
          </h1>

          <p className="mt-6 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
            LeadDesk AI captures website inquiries, extracts key project
            details, scores every lead, and prepares a professional reply before
            your team opens the CRM.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/register">
                Start with LeadDesk
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>

            <Button size="lg" variant="outline" asChild>
              <Link href="/demo">Submit a demo lead</Link>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
              No automatic sending
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
              Transparent lead scoring
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
              One focused sales pipeline
            </span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div
            className="absolute -inset-8 -z-10 rounded-[2rem] bg-primary/8 blur-3xl"
            aria-hidden="true"
          />

          <div className="surface-panel overflow-hidden">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <p className="text-sm font-semibold">New lead qualification</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  AI analysis completed
                </p>
              </div>

              <Badge className="bg-success/12 text-success hover:bg-success/12">
                Score 86
              </Badge>
            </div>

            <div className="space-y-6 p-5 sm:p-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Project summary
                </p>
                <p className="mt-3 text-sm leading-6 text-foreground">
                  Northstar Labs needs a conversion-focused SaaS marketing site
                  with product pages, pricing, CMS content, and a polished launch
                  within six weeks.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {qualificationSignals.map((signal) => {
                  const Icon = signal.icon

                  return (
                    <div
                      key={signal.label}
                      className="rounded-lg border bg-muted/40 p-3"
                    >
                      <Icon
                        className="size-4 text-primary"
                        aria-hidden="true"
                      />
                      <p className="mt-3 text-xs text-muted-foreground">
                        {signal.label}
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {signal.value}
                      </p>
                    </div>
                  )
                })}
              </div>

              <div className="rounded-lg border bg-background p-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" aria-hidden="true" />
                  <p className="text-sm font-semibold">Suggested reply</p>
                </div>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Thanks for sharing the details about Northstar Labs. Your
                  timeline and scope look aligned with the type of SaaS launch
                  projects we handle…
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Review required before sending
                  </span>
                  <Button size="sm" variant="outline">
                    Open draft
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-5 -left-3 hidden rounded-xl border bg-card px-4 py-3 shadow-lg sm:block">
            <p className="text-xs text-muted-foreground">Priority</p>
            <p className="mt-1 text-sm font-semibold text-success">
              High opportunity
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}