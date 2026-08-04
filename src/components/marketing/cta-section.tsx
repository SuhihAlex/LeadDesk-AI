import Link from "next/link"
import { ArrowRight, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"

export function CtaSection() {
  return (
    <section className="border-b bg-card">
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border bg-foreground px-6 py-12 text-background shadow-sm sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-12 lg:px-12">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-primary)/0.36,transparent_40%)]"
            aria-hidden="true"
          />

          <div className="relative max-w-2xl">
            <div className="inline-flex items-center gap-2 text-sm text-background/70">
              <ShieldCheck className="size-4" aria-hidden="true" />
              Human-reviewed AI qualification
            </div>

            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
              Stop losing strong inquiries in scattered forms and inboxes.
            </h2>

            <p className="mt-4 max-w-xl text-pretty text-sm leading-6 text-background/70 sm:text-base">
              Give your sales process one clear place for qualification,
              follow-up, ownership, and pipeline visibility.
            </p>
          </div>

          <div className="relative mt-8 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:flex-none">
            <Button
              size="lg"
              variant="secondary"
              className="bg-background text-foreground hover:bg-background/90"
              asChild
            >
              <Link href="/register">
                Create workspace
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-background/20 bg-transparent text-background hover:bg-background/10 hover:text-background"
              asChild
            >
              <Link href="/demo">Try the lead form</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}