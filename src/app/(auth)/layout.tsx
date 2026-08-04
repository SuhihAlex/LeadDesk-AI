import type { ReactNode } from "react"
import { CheckCircle2, Sparkles } from "lucide-react"

import { BrandLogo } from "@/components/layout/brand-logo"

type AuthLayoutProps = {
  children: ReactNode
}

const benefits = [
  "Capture and qualify website inquiries",
  "Explain every lead score",
  "Prepare reply drafts for manager review",
]

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.05fr]">
      <section className="flex min-h-screen flex-col bg-background px-4 py-6 sm:px-6 lg:px-10">
        <div>
          <BrandLogo />
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 items-center py-12">
          {children}
        </div>
      </section>

      <aside className="relative hidden overflow-hidden border-l bg-foreground text-background lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-primary)/0.38,transparent_42%)]"
          aria-hidden="true"
        />

        <div className="relative auth-copy-enter">
          <div className="inline-flex items-center gap-2 text-sm text-background/70">
            <Sparkles className="size-4" aria-hidden="true" />
            Lead qualification without automation overload
          </div>

          <h1 className="mt-6 max-w-xl text-balance text-4xl font-semibold tracking-[-0.04em]">
            Give every strong inquiry a clear next step.
          </h1>

          <p className="mt-5 max-w-lg text-pretty text-base leading-7 text-background/70">
            LeadDesk AI helps web studios review opportunities faster while
            keeping every important decision under human control.
          </p>
        </div>

        <div className="relative space-y-4 auth-benefits-enter">
          {benefits.map((benefit) => (
            <div
              key={benefit}
              className="flex items-center gap-3 rounded-xl border border-background/10 bg-background/5 px-4 py-3"
            >
              <CheckCircle2
                className="size-5 shrink-0 text-success"
                aria-hidden="true"
              />
              <span className="text-sm text-background/85">{benefit}</span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}