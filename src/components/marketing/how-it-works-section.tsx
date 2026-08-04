import { ArrowDown, CheckCircle2 } from "lucide-react"

const steps = [
  {
    number: "01",
    title: "Capture the inquiry",
    description:
      "A potential client submits the public project form with their contact details, scope, budget, timeline, and goals.",
  },
  {
    number: "02",
    title: "Qualify with AI",
    description:
      "LeadDesk creates a summary, extracts key information, detects missing details, calculates a transparent score, and prepares a reply draft.",
  },
  {
    number: "03",
    title: "Review and respond",
    description:
      "A manager checks the qualification, edits the draft, assigns follow-up tasks, and sends the approved response.",
  },
  {
    number: "04",
    title: "Move through the pipeline",
    description:
      "The opportunity progresses through New, Qualified, Contacted, Proposal, Won, or Lost while dashboard metrics update automatically.",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-b">
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold text-primary">
            From inquiry to opportunity
          </p>

          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            A clear sales process your team can understand immediately.
          </h2>

          <p className="mt-5 text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
            No autonomous agents and no complex workflow builder. Every
            important decision remains visible and under the manager&apos;s
            control.
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-4xl">
          {steps.map((step, index) => (
            <div key={step.number}>
              <article className="grid gap-5 rounded-xl border bg-card p-5 sm:grid-cols-[5rem_1fr_auto] sm:items-center sm:p-6">
                <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10 font-mono text-sm font-semibold text-primary">
                  {step.number}
                </div>

                <div>
                  <h3 className="text-lg font-semibold tracking-tight">
                    {step.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {step.description}
                  </p>
                </div>

                <CheckCircle2
                  className="hidden size-5 text-success sm:block"
                  aria-hidden="true"
                />
              </article>

              {index < steps.length - 1 && (
                <div
                  className="flex h-10 items-center justify-center"
                  aria-hidden="true"
                >
                  <ArrowDown className="size-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}