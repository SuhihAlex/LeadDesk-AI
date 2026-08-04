import {
  BarChart3,
  CheckSquare2,
  CreditCard,
  Inbox,
  KanbanSquare,
  Settings,
  Users,
} from "lucide-react"

export const appNavigation = [
  {
    label: "Dashboard",
    href: "/app",
    icon: BarChart3,
  },
  {
    label: "Inbox",
    href: "/app/inbox",
    icon: Inbox,
  },
  {
    label: "Pipeline",
    href: "/app/pipeline",
    icon: KanbanSquare,
  },
  {
    label: "Tasks",
    href: "/app/tasks",
    icon: CheckSquare2,
  },
  {
    label: "Team",
    href: "/app/team",
    icon: Users,
  },
] as const

export const appSettingsNavigation = [
  {
    label: "Settings",
    href: "/app/settings",
    icon: Settings,
  },
  {
    label: "Billing",
    href: "/app/billing",
    icon: CreditCard,
  },
] as const