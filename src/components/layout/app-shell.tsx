import type { ReactNode } from "react"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { AppTopbar } from "@/components/layout/app-topbar"
import { getCurrentWorkspace } from "@/features/workspace/get-current-workspace"

type AppShellProps = {
  children: ReactNode
  title: string
  description?: string
}

export async function AppShell({
  children,
  title,
  description,
}: AppShellProps) {
  const context = await getCurrentWorkspace()

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-sidebar-border lg:block">
        <AppSidebar context={context} />
      </div>

      <div className="min-h-screen lg:pl-64">
        <AppTopbar
          title={title}
          description={description}
          context={context}
        />

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}