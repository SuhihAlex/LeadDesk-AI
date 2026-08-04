import { Badge } from "@/components/ui/badge"
import { leadPriorityLabels } from "@/features/leads/constants"
import type { LeadPriority } from "@/features/leads/types"
import { cn } from "@/lib/utils"

type LeadPriorityBadgeProps = {
  priority: LeadPriority
}

export function LeadPriorityBadge({
  priority,
}: LeadPriorityBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        priority === "low" &&
          "border-muted-foreground/20 bg-muted text-muted-foreground",
        priority === "medium" &&
          "border-primary/20 bg-primary/10 text-primary",
        priority === "high" &&
          "border-warning/30 bg-warning/10 text-warning-foreground",
        priority === "urgent" &&
          "border-destructive/30 bg-destructive/10 text-destructive",
      )}
    >
      {leadPriorityLabels[priority]}
    </Badge>
  )
}