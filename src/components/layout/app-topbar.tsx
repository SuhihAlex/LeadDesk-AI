"use client"

import { useState } from "react"
import { Bell, Menu, Search } from "lucide-react"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"

type AppTopbarProps = {
  title: string
  description?: string
}

export function AppTopbar({ title, description }: AppTopbarProps) {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-30 flex min-h-16 items-center border-b bg-background/95 px-4 backdrop-blur sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 lg:hidden"
            aria-label="Open application navigation"
            onClick={() => setMobileNavigationOpen(true)}
          >
            <Menu className="size-5" aria-hidden="true" />
          </Button>

          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight">
              {title}
            </h1>

            {description && (
              <p className="hidden truncate text-sm text-muted-foreground sm:block">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="Search"
            className="hidden sm:inline-flex"
          >
            <Search className="size-4" aria-hidden="true" />
          </Button>

          <Button variant="outline" size="icon" aria-label="Notifications">
            <Bell className="size-4" aria-hidden="true" />
          </Button>

          <Avatar className="size-9">
            <AvatarFallback>AM</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <Sheet
        open={mobileNavigationOpen}
        onOpenChange={setMobileNavigationOpen}
      >
        <SheetContent
          side="left"
          className="w-[min(19rem,90vw)] gap-0 p-0"
        >
          <SheetTitle className="sr-only">
            Application navigation
          </SheetTitle>

          <SheetDescription className="sr-only">
            Navigate through LeadDesk AI workspace pages.
          </SheetDescription>

          <AppSidebar onNavigate={() => setMobileNavigationOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}