export const siteConfig = {
  name: "LeadDesk AI",
  shortName: "LeadDesk",
  description:
    "AI-powered lead qualification CRM for web studios and SaaS development teams.",
  url: "http://localhost:3000",
  navigation: {
    public: [
      {
        label: "Product",
        href: "/#product",
      },
      {
        label: "How it works",
        href: "/#how-it-works",
      },
      {
        label: "Pricing",
        href: "/pricing",
      },
      {
        label: "Demo",
        href: "/demo",
      },
    ],
    application: [
      {
        label: "Dashboard",
        href: "/app",
      },
      {
        label: "Inbox",
        href: "/app/inbox",
      },
      {
        label: "Pipeline",
        href: "/app/pipeline",
      },
      {
        label: "Tasks",
        href: "/app/tasks",
      },
      {
        label: "Team",
        href: "/app/team",
      },
      {
        label: "Settings",
        href: "/app/settings",
      },
      {
        label: "Billing",
        href: "/app/billing",
      },
    ],
  },
} as const

export type SiteConfig = typeof siteConfig