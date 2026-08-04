"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Building2,
  ChevronsUpDown,
  LogOut,
} from "lucide-react"

import { BrandLogo } from "@/components/layout/brand-logo"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  appNavigation,
  appSettingsNavigation,
} from "@/config/app-navigation"
import { logoutAction } from "@/features/auth/actions"
import type { CurrentWorkspaceContext } from "@/features/workspace/types"
import { cn } from "@/lib/utils"

type AppSidebarProps = {
  context: CurrentWorkspaceContext
  onNavigate?: () => void
}

function isActiveRoute(pathname: string, href: string) {
  if (href === "/app") {
    return pathname === href
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AppSidebar({
  context,
  onNavigate,
}: AppSidebarProps) {
  const pathname = usePathname()

  const workspaceRole =
    context.workspace.role === "owner" ? "Owner workspace" : "Member workspace"

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
            <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-primary">
              {context.workspace.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={context.workspace.logoUrl}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <Building2 className="size-4" aria-hidden="true" />
              )}
            </span>

            <span className="min-w-0 text-left">
              <span className="block truncate text-sm font-semibold">
                {context.workspace.name}
              </span>

              <span className="block truncate text-xs text-muted-foreground">
                {workspaceRole}
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
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="h-auto min-w-0 flex-1 justify-start gap-3 px-2 py-2"
            type="button"
          >
            <Avatar className="size-9">
              {context.user.avatarUrl && (
                <AvatarImage
                  src={context.user.avatarUrl}
                  alt={context.user.fullName}
                />
              )}

              <AvatarFallback>{context.user.initials}</AvatarFallback>
            </Avatar>

            <span className="min-w-0 text-left">
              <span className="block truncate text-sm font-semibold">
                {context.user.fullName}
              </span>

              <span className="block truncate text-xs text-muted-foreground">
                {context.user.email}
              </span>
            </span>
          </Button>

          <form action={logoutAction}>
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut className="size-4" aria-hidden="true" />
            </Button>
          </form>
        </div>
      </div>
    </aside>
  )
}