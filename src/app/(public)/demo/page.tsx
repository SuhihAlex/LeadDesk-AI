import {
  CheckCircle2,
  Clock3,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { PublicLeadForm } from "@/features/leads/public-lead-form"

const benefits = [
  {
    icon: Sparkles,
    title: "AI-ready qualification",
    description:
      "Your request will be structured for faster review and qualification.",
  },
  {
    icon: Clock3,
    title: "Faster response",
    description:
      "Clear project details help the team prepare a more relevant response.",
  },
  {
    icon: ShieldCheck,
    title: "Secure submission",
    description:
      "The form uses validation, workspace isolation and explicit consent.",
  },
]

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-muted/30">

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[0.8fr_1.2fr] lg:px-8 lg:py-20">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-sm font-medium text-primary">
            Lead form demo
          </p>

          <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Tell us what you want to build
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
            Submit a realistic website or SaaS project inquiry. The request
            will appear inside the LeadDesk AI workspace Inbox.
          </p>

          <div className="mt-8 space-y-4">
            {benefits.map((benefit) => {
              const Icon = benefit.icon

              return (
                <div
                  key={benefit.title}
                  className="flex items-start gap-4"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>

                  <div>
                    <h2 className="font-semibold">{benefit.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-8 flex items-start gap-3 rounded-xl border bg-background p-4">
            <CheckCircle2
              className="mt-0.5 size-5 shrink-0 text-success"
              aria-hidden="true"
            />

            <p className="text-sm leading-6 text-muted-foreground">
              This is a portfolio demo. Submissions are stored as CRM leads
              for testing the complete LeadDesk workflow.
            </p>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="border-b">
            <h2 className="text-xl font-semibold">
              Project inquiry
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Complete the form with realistic project information.
            </p>
          </CardHeader>

          <CardContent className="p-6 sm:p-8">
            <PublicLeadForm />
          </CardContent>
        </Card>
      </section>
    </main>
  )
}