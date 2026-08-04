import { KanbanSquare } from "lucide-react"

import { AppPagePlaceholder } from "@/components/layout/app-page-placeholder"

export default function PipelinePage() {
  return (
    <AppPagePlaceholder
      title="Pipeline"
      description="Track opportunities across the fixed sales stages."
      feature="Drag-and-drop sales pipeline"
      stage="Stage 5"
      icon={KanbanSquare}
    />
  )
}