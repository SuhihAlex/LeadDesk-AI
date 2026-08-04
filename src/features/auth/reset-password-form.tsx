"use client"

import { useActionState } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { resetPasswordAction } from "@/features/auth/actions"
import { AuthFieldError } from "@/features/auth/auth-field-error"
import { AuthFormMessage } from "@/features/auth/auth-form-message"
import { AuthSubmitButton } from "@/features/auth/auth-submit-button"
import { initialAuthActionState } from "@/features/auth/types"

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(
    resetPasswordAction,
    initialAuthActionState,
  )

  return (
    <form action={formAction} className="space-y-5">
      <AuthFormMessage state={state} />

      <div className="space-y-2">
        <Label htmlFor="new-password">New password</Label>

        <Input
          id="new-password"
          name="newPassword"
          type="password"
          placeholder="Minimum 8 characters"
          autoComplete="new-password"
          minLength={8}
          disabled={pending}
          required
          aria-invalid={Boolean(state.fieldErrors?.newPassword)}
          aria-describedby={
            state.fieldErrors?.newPassword
              ? "new-password-error"
              : undefined
          }
        />

        <div id="new-password-error">
          <AuthFieldError errors={state.fieldErrors?.newPassword} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm new password</Label>

        <Input
          id="confirm-password"
          name="confirmPassword"
          type="password"
          placeholder="Repeat your new password"
          autoComplete="new-password"
          minLength={8}
          disabled={pending}
          required
          aria-invalid={Boolean(state.fieldErrors?.confirmPassword)}
          aria-describedby={
            state.fieldErrors?.confirmPassword
              ? "confirm-password-error"
              : undefined
          }
        />

        <div id="confirm-password-error">
          <AuthFieldError errors={state.fieldErrors?.confirmPassword} />
        </div>
      </div>

      <AuthSubmitButton
        idleLabel="Update password"
        pendingLabel="Updating password..."
        pending={pending}
      />
    </form>
  )
}