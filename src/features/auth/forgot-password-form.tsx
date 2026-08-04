"use client"

import { useActionState } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { forgotPasswordAction } from "@/features/auth/actions"
import { AuthFieldError } from "@/features/auth/auth-field-error"
import { AuthFormMessage } from "@/features/auth/auth-form-message"
import { AuthSubmitButton } from "@/features/auth/auth-submit-button"
import { initialAuthActionState } from "@/features/auth/types"

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    forgotPasswordAction,
    initialAuthActionState,
  )

  return (
    <form action={formAction} className="space-y-5">
      <AuthFormMessage state={state} />

      <div className="space-y-2">
        <Label htmlFor="recovery-email">Email address</Label>

        <Input
          id="recovery-email"
          name="email"
          type="email"
          placeholder="alex@kinetic.studio"
          autoComplete="email"
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={
            state.fieldErrors?.email ? "recovery-email-error" : undefined
          }
          disabled={pending}
          required
        />

        <div id="recovery-email-error">
          <AuthFieldError errors={state.fieldErrors?.email} />
        </div>
      </div>

      <AuthSubmitButton
        idleLabel="Send recovery email"
        pendingLabel="Sending instructions..."
        pending={pending}
      />
    </form>
  )
}