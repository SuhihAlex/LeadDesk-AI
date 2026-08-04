"use client"

import { useActionState, useState } from "react"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { registerAction } from "@/features/auth/actions"
import { AuthFieldError } from "@/features/auth/auth-field-error"
import { AuthFormMessage } from "@/features/auth/auth-form-message"
import { AuthSubmitButton } from "@/features/auth/auth-submit-button"
import { initialAuthActionState } from "@/features/auth/types"

type RegisterFormProps = {
  nextPath?: string
}

export function RegisterForm({ nextPath }: RegisterFormProps) {
  const [termsAccepted, setTermsAccepted] = useState(false)

  const [state, formAction, pending] = useActionState(
    registerAction,
    initialAuthActionState,
  )

  return (
    <form action={formAction} className="space-y-5">
      {nextPath && <input type="hidden" name="next" value={nextPath} />}
      <AuthFormMessage state={state} />

      <div className="space-y-2">
        <Label htmlFor="full-name">Full name</Label>

        <Input
          id="full-name"
          name="fullName"
          placeholder="Alex Morgan"
          autoComplete="name"
          aria-invalid={Boolean(state.fieldErrors?.fullName)}
          aria-describedby={
            state.fieldErrors?.fullName ? "full-name-error" : undefined
          }
          disabled={pending}
          required
        />

        <div id="full-name-error">
          <AuthFieldError errors={state.fieldErrors?.fullName} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Company name</Label>

        <Input
          id="company"
          name="company"
          placeholder="KINETIC Studio"
          autoComplete="organization"
          aria-invalid={Boolean(state.fieldErrors?.company)}
          aria-describedby={
            state.fieldErrors?.company ? "company-error" : undefined
          }
          disabled={pending}
          required
        />

        <div id="company-error">
          <AuthFieldError errors={state.fieldErrors?.company} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email">Email address</Label>

        <Input
          id="register-email"
          name="email"
          type="email"
          placeholder="alex@kinetic.studio"
          autoComplete="email"
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={
            state.fieldErrors?.email ? "register-email-error" : undefined
          }
          disabled={pending}
          required
        />

        <div id="register-email-error">
          <AuthFieldError errors={state.fieldErrors?.email} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password">Password</Label>

        <Input
          id="register-password"
          name="password"
          type="password"
          placeholder="Minimum 8 characters"
          autoComplete="new-password"
          aria-invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby={
            state.fieldErrors?.password
              ? "register-password-error"
              : undefined
          }
          disabled={pending}
          required
          minLength={8}
        />

        <div id="register-password-error">
          <AuthFieldError errors={state.fieldErrors?.password} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <Checkbox
            id="terms"
            checked={termsAccepted}
            onCheckedChange={(checked) => {
              setTermsAccepted(checked === true)
            }}
            disabled={pending}
            aria-invalid={Boolean(state.fieldErrors?.terms)}
            aria-describedby={
              state.fieldErrors?.terms ? "register-terms-error" : undefined
            }
          />

          <input
            type="hidden"
            name="terms"
            value={termsAccepted ? "on" : ""}
          />

          <Label
            htmlFor="terms"
            className="text-sm font-normal leading-6 text-muted-foreground"
          >
            I agree to the Terms and Privacy Policy.
          </Label>
        </div>

        <div id="register-terms-error">
          <AuthFieldError errors={state.fieldErrors?.terms} />
        </div>
      </div>

      <AuthSubmitButton
        idleLabel="Create account"
        pendingLabel="Creating account..."
        pending={pending}
      />
    </form>
  )
}