import Link from "next/link"
import {
  CircleDollarSign,
  Inbox,
} from "lucide-react"

import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { getPipelineLeads } from "@/features/leads/get-pipeline-leads"
import { PipelineBoard } from "@/features/leads/pipeline-board"

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

export default async function PipelinePage() {
  const {
    columns,
    totalLeads,
    totalEstimatedValue,
  } = await getPipelineLeads()

  return (
    <AppShell
      title="Pipeline"
      description="Track opportunities across the fixed sales stages."
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Inbox
                  className="size-5"
                  aria-hidden="true"
                />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Pipeline leads
                </p>

                <p className="mt-1 text-2xl font-semibold">
                  {totalLeads}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CircleDollarSign
                  className="size-5"
                  aria-hidden="true"
                />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Estimated value
                </p>

                <p className="mt-1 text-2xl font-semibold">
                  {formatCurrency(totalEstimatedValue)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {totalLeads === 0 ? (
          <Card>
            <CardContent className="flex min-h-96 items-center justify-center px-6 py-16">
              <div className="max-w-md text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Inbox
                    className="size-6"
                    aria-hidden="true"
                  />
                </div>

                <h2 className="mt-5 text-xl font-semibold">
                  No leads in the pipeline
                </h2>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  New inquiries will appear in the New stage after
                  submission through the public lead form.
                </p>

                <Button className="mt-6" asChild>
                  <Link href="/demo">
                    Open lead form demo
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <PipelineBoard initialColumns={columns} />
        )}
      </div>
    </AppShell>
  )
}