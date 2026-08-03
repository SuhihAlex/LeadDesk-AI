import Link from "next/link"
import { Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"

type BrandLogoProps = {
  href?: string
  compact?: boolean
  className?: string
}

export function BrandLogo({
  href = "/",
  compact = false,
  className,
}: BrandLogoProps) {
  return (
    <Link
      href={href}
      aria-label="LeadDesk AI home"
      className={cn(
        "inline-flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
        <Sparkles className="size-4" aria-hidden="true" />
      </span>

      {!compact && (
        <span className="flex items-baseline gap-1">
          <span className="text-sm font-semibold tracking-tight text-foreground sm:text-base">
            LeadDesk
          </span>
          <span className="text-sm font-semibold text-primary sm:text-base">
            AI
          </span>
        </span>
      )}
    </Link>
  )
}