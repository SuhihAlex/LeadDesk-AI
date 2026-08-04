import { Users } from "lucide-react"

import { AppPagePlaceholder } from "@/components/layout/app-page-placeholder"

export default function TeamPage() {
  return (
    <AppPagePlaceholder
      title="Team"
      description="Manage workspace members and simple roles."
      feature="Workspace team management"
      stage="Stage 3"
      icon={Users}
    />
  )
}