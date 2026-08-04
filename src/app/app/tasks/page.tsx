import { CheckSquare2 } from "lucide-react"

import { AppPagePlaceholder } from "@/components/layout/app-page-placeholder"

export default function TasksPage() {
  return (
    <AppPagePlaceholder
      title="Tasks"
      description="Manage lead follow-up and team responsibilities."
      feature="Lead-linked tasks"
      stage="Stage 7"
      icon={CheckSquare2}
    />
  )
}