import { CreditCard } from "lucide-react"

import { AppPagePlaceholder } from "@/components/layout/app-page-placeholder"

export default function BillingPage() {
  return (
    <AppPagePlaceholder
      title="Billing"
      description="Manage the workspace plan in Stripe test mode."
      feature="Subscription and plan management"
      stage="Stage 7"
      icon={CreditCard}
    />
  )
}