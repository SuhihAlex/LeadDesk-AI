"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Building2, ChevronsUpDown } from "lucide-react"

import { BrandLogo } from "@/components/layout/brand-logo"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  appNavigation,
  appSettingsNavigation,
} from "@/config/app-navigation"
import { cn } from "@/lib/utils"

type AppSidebarProps = {
  onNavigate?: () => void
}

function isActiveRoute(pathname: string, href: string) {
  if (href === "/app") {
    return pathname === href
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="flex h-full min-h-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border px-4">
        <BrandLogo />
      </div>

      <div className="p-3">
        <Button
          variant="ghost"
          className="h-auto w-full justify-between gap-3 border border-sidebar-border bg-background px-3 py-2.5 hover:bg-sidebar-accent"
          type="button"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="size-4" aria-hidden="true" />
            </span>

            <span className="min-w-0 text-left">
              <span className="block truncate text-sm font-semibold">
                KINETIC Studio
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                Pro workspace
              </span>
            </span>
          </span>

          <ChevronsUpDown
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
        </Button>
      </div>

      <nav
        aria-label="Application navigation"
        className="min-h-0 flex-1 overflow-y-auto px-3 pb-3"
      >
        <p className="px-3 pb-2 pt-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Workspace
        </p>

        <div className="space-y-1">
          {appNavigation.map((item) => {
            const Icon = item.icon
            const active = isActiveRoute(pathname, item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            )
          })}
        </div>

        <Separator className="my-4 bg-sidebar-border" />

        <p className="px-3 pb-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Administration
        </p>

        <div className="space-y-1">
          {appSettingsNavigation.map((item) => {
            const Icon = item.icon
            const active = isActiveRoute(pathname, item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="shrink-0 border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          className="h-auto w-full justify-start gap-3 px-2 py-2"
          type="button"
        >
          <Avatar className="size-9">
            <AvatarFallback>AM</AvatarFallback>
          </Avatar>

          <span className="min-w-0 text-left">
            <span className="block truncate text-sm font-semibold">
              Alex Morgan
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              alex@kinetic.studio
            </span>
          </span>
        </Button>
      </div>
    </aside>
  )
}