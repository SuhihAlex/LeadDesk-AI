import { Inbox } from "lucide-react"

import { AppPagePlaceholder } from "@/components/layout/app-page-placeholder"

export default function InboxPage() {
  return (
    <AppPagePlaceholder
      title="Inbox"
      description="Review and qualify new website inquiries."
      feature="Lead inbox"
      stage="Stage 4"
      icon={Inbox}
    />
  )
}