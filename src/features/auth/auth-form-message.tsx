import { AlertCircle, CheckCircle2 } from "lucide-react"

import type { AuthActionState } from "@/features/auth/types"
import { cn } from "@/lib/utils"

type AuthFormMessageProps = {
  state: AuthActionState
}

export function AuthFormMessage({ state }: AuthFormMessageProps) {
  if (state.status === "idle" || !state.message) {
    return null
  }

  const success = state.status === "success"
  const Icon = success ? CheckCircle2 : AlertCircle

  return (
    <div
      role={success ? "status" : "alert"}
      className={cn(
        "flex items-start gap-3 rounded-lg border px-4 py-3 text-sm",
        success
          ? "border-success/25 bg-success/10 text-foreground"
          : "border-destructive/25 bg-destructive/10 text-foreground",
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 size-4 shrink-0",
          success ? "text-success" : "text-destructive",
        )}
        aria-hidden="true"
      />

      <p className="leading-5">{state.message}</p>
    </div>
  )
}