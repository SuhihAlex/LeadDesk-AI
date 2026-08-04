import {
  Bot,
  Inbox,
  KanbanSquare,
  MailCheck,
  SearchCheck,
  TrendingUp,
} from "lucide-react"

const features = [
  {
    title: "Lead inbox",
    description:
      "Collect every website inquiry in one focused workspace with search, filters, ownership, and clear new-lead states.",
    icon: Inbox,
  },
  {
    title: "AI qualification",
    description:
      "Turn unstructured requests into concise summaries, extracted project details, missing information, and visible risks.",
    icon: Bot,
  },
  {
    title: "Transparent scoring",
    description:
      "Understand why a lead received its score through separate budget, timeline, completeness, fit, urgency, and quality factors.",
    icon: SearchCheck,
  },
  {
    title: "Sales pipeline",
    description:
      "Move qualified opportunities through one fixed and practical pipeline without building or maintaining custom workflows.",
    icon: KanbanSquare,
  },
  {
    title: "Reply drafts",
    description:
      "Review and edit a professional AI-prepared response before sending it through the connected test email provider.",
    icon: MailCheck,
  },
  {
    title: "Focused analytics",
    description:
      "Track new leads, qualification quality, potential value, pipeline stages, response time, and real conversion.",
    icon: TrendingUp,
  },
]

export function ProductSection() {
  return (
    <section id="product" className="border-b bg-card">
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-primary">One focused CRM</p>

          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            Everything your studio needs to process new business opportunities.
          </h2>

          <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
            LeadDesk AI keeps lead capture, qualification, follow-up, pipeline,
            and performance in one compact product without turning into a
            universal enterprise CRM.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon

            return (
              <article
                key={feature.title}
                className="rounded-xl border bg-background p-5 transition-colors hover:border-primary/30 sm:p-6"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </div>

                <h3 className="mt-5 text-lg font-semibold tracking-tight">
                  {feature.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {feature.description}
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}