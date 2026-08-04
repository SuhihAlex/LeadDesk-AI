import { LoaderCircle } from "lucide-react"

import { Button } from "@/components/ui/button"

type AuthSubmitButtonProps = {
  idleLabel: string
  pendingLabel: string
  pending: boolean
}

export function AuthSubmitButton({
  idleLabel,
  pendingLabel,
  pending,
}: AuthSubmitButtonProps) {
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && (
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
      )}

      {pending ? pendingLabel : idleLabel}
    </Button>
  )
}