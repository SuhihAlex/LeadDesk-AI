import type { ReactNode } from "react"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { AppTopbar } from "@/components/layout/app-topbar"

type AppShellProps = {
  children: ReactNode
  title: string
  description?: string
}

export function AppShell({
  children,
  title,
  description,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-sidebar-border lg:block">
        <AppSidebar />
      </div>

      <div className="min-h-screen lg:pl-64">
        <AppTopbar title={title} description={description} />

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}