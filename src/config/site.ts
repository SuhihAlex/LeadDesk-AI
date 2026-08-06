export const siteConfig = {
  name: "LeadDesk AI",
  shortName: "LeadDesk",
  description:
  "LeadDesk AI is a production-ready CRM for web studios with secure lead capture, structured AI qualification, transparent scoring, pipeline management, tasks, analytics and Stripe test billing.",
  url: "https://lead-desk-ai.vercel.app",
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