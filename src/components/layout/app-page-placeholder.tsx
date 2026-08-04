import type { LucideIcon } from "lucide-react"

import { AppShell } from "@/components/layout/app-shell"
import { Badge } from "@/components/ui/badge"

type AppPagePlaceholderProps = {
  title: string
  description: string
  feature: string
  stage: string
  icon: LucideIcon
}

export function AppPagePlaceholder({
  title,
  description,
  feature,
  stage,
  icon: Icon,
}: AppPagePlaceholderProps) {
  return (
    <AppShell title={title} description={description}>
      <section className="surface-panel flex min-h-[28rem] items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-6" aria-hidden="true" />
          </div>

          <Badge variant="outline" className="mt-5">
            Planned for {stage}
          </Badge>

          <h2 className="mt-4 text-2xl font-semibold tracking-tight">
            {feature}
          </h2>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            This route is part of the frozen MVP. Its business logic will be
            implemented in the designated development stage.
          </p>
        </div>
      </section>
    </AppShell>
  )
}