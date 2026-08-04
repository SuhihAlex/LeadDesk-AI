"use client"

import { useActionState } from "react"
import Link from "next/link"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginAction } from "@/features/auth/actions"
import { AuthFieldError } from "@/features/auth/auth-field-error"
import { AuthFormMessage } from "@/features/auth/auth-form-message"
import { AuthSubmitButton } from "@/features/auth/auth-submit-button"
import { initialAuthActionState } from "@/features/auth/types"

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialAuthActionState,
  )

  return (
    <form action={formAction} className="space-y-5">
      <AuthFormMessage state={state} />

      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>

        <Input
          id="email"
          name="email"
          type="email"
          placeholder="alex@kinetic.studio"
          autoComplete="email"
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={
            state.fieldErrors?.email ? "login-email-error" : undefined
          }
          disabled={pending}
          required
        />

        <div id="login-email-error">
          <AuthFieldError errors={state.fieldErrors?.email} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="password">Password</Label>

          <Link
            href="/forgot-password"
            className="text-sm font-medium text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          aria-invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby={
            state.fieldErrors?.password ? "login-password-error" : undefined
          }
          disabled={pending}
          required
        />

        <div id="login-password-error">
          <AuthFieldError errors={state.fieldErrors?.password} />
        </div>
      </div>

      <AuthSubmitButton
        idleLabel="Log in"
        pendingLabel="Logging in..."
        pending={pending}
      />
    </form>
  )
}