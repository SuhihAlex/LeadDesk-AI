import { Settings } from "lucide-react"

import { AppPagePlaceholder } from "@/components/layout/app-page-placeholder"

export default function SettingsPage() {
  return (
    <AppPagePlaceholder
      title="Settings"
      description="Configure workspace identity and company information."
      feature="Workspace settings"
      stage="Stage 3"
      icon={Settings}
    />
  )
}