import Link from "next/link"
import { Check } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const plans = [
  {
    name: "Free",
    description: "For solo operators testing a focused lead workflow.",
    price: "$0",
    suffix: "/month",
    cta: "Start free",
    href: "/register",
    featured: false,
    features: [
      "Up to 50 leads per month",
      "1 workspace member",
      "Basic dashboard",
      "Limited AI qualification",
      "Lead inbox and pipeline",
    ],
  },
  {
    name: "Pro",
    description: "For web studios actively processing incoming opportunities.",
    price: "$29",
    suffix: "/month",
    cta: "Choose Pro",
    href: "/register",
    featured: true,
    features: [
      "Higher lead limits",
      "Up to 5 members",
      "Full AI qualification",
      "Reply draft generation",
      "Email sending",
      "Complete dashboard",
    ],
  },
  {
    name: "Agency",
    description: "For larger teams managing a higher lead volume.",
    price: "$79",
    suffix: "/month",
    cta: "Choose Agency",
    href: "/register",
    featured: false,
    features: [
      "Extended lead limits",
      "Up to 15 members",
      "AI qualification",
      "Email and pipeline tools",
      "Workspace analytics",
      "Priority portfolio support",
    ],
  },
] as const

export default function PricingPage() {
  return (
    <section className="border-b">
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="outline" className="rounded-full">
            Simple pricing
          </Badge>

          <h1 className="mt-5 text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Choose the plan that matches your lead volume.
          </h1>

          <p className="mt-5 text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
            Start with the focused essentials and upgrade when your team needs
            more members, AI usage, and workspace capacity.
          </p>

          <p className="mt-3 text-sm text-muted-foreground">
            Portfolio demo pricing. Billing will use Stripe test mode.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                "flex h-full flex-col",
                plan.featured && "border-primary shadow-lg shadow-primary/10",
              )}
            >
              <CardHeader className="space-y-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold">{plan.name}</h2>

                    {plan.featured && <Badge>Most popular</Badge>}
                  </div>

                  <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">
                    {plan.description}
                  </p>
                </div>

                <div className="flex items-end gap-2">
                  <span className="text-4xl font-semibold tracking-[-0.04em]">
                    {plan.price}
                  </span>

                  <span className="pb-1 text-sm text-muted-foreground">
                    {plan.suffix}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm text-muted-foreground"
                    >
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-success"
                        aria-hidden="true"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-8">
                  <Button
                    className="w-full"
                    variant={plan.featured ? "default" : "outline"}
                    asChild
                  >
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}