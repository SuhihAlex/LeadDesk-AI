import type { ReactNode } from "react"

import { PublicFooter } from "@/components/marketing/public-footer"
import { PublicHeader } from "@/components/marketing/public-header"

type PublicLayoutProps = {
  children: ReactNode
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main>{children}</main>
      <PublicFooter />
    </div>
  )
}