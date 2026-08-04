"use server"

import { redirect } from "next/navigation"

import { ensureCurrentUserWorkspace } from "@/features/auth/ensure-workspace"
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/features/auth/schemas"
import type { AuthActionState } from "@/features/auth/types"
import { getSiteUrl } from "@/lib/site-url"
import { createClient } from "@/lib/supabase/server"

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key)

  return typeof value === "string" ? value : ""
}

function getFieldErrors(
  error: {
    flatten(): {
      fieldErrors: Record<string, string[] | undefined>
    }
  },
): AuthActionState["fieldErrors"] {
  return error.flatten().fieldErrors
}

function getSafeAuthErrorMessage(message: string) {
  const normalizedMessage = message.toLowerCase()

  if (
    normalizedMessage.includes("invalid login credentials") ||
    normalizedMessage.includes("invalid credentials")
  ) {
    return "The email address or password is incorrect."
  }

  if (normalizedMessage.includes("email not confirmed")) {
    return "Confirm your email address before logging in."
  }

  if (
    normalizedMessage.includes("user already registered") ||
    normalizedMessage.includes("already been registered")
  ) {
    return "An account with this email address already exists."
  }

  if (normalizedMessage.includes("rate limit")) {
    return "Too many attempts. Try again later."
  }

  return "Authentication could not be completed. Please try again."
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: getStringValue(formData, "email"),
    password: getStringValue(formData, "password"),
  })

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: getFieldErrors(parsed.error),
    }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return {
      status: "error",
      message: getSafeAuthErrorMessage(error.message),
    }
  }

  const company =
    typeof data.user.user_metadata.company === "string"
      ? data.user.user_metadata.company.trim()
      : ""

  try {
    await ensureCurrentUserWorkspace(
      supabase,
      company || `${parsed.data.email.split("@")[0]} Workspace`,
    )
  } catch {
    await supabase.auth.signOut()

    return {
      status: "error",
      message:
        "Your account was authenticated, but the workspace could not be prepared.",
    }
  }

  redirect("/app")
}

export async function registerAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    fullName: getStringValue(formData, "fullName"),
    company: getStringValue(formData, "company"),
    email: getStringValue(formData, "email"),
    password: getStringValue(formData, "password"),
    terms: getStringValue(formData, "terms"),
  })

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: getFieldErrors(parsed.error),
    }
  }

  const supabase = await createClient()
  const siteUrl = getSiteUrl()

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/confirm?next=/app`,
      data: {
        full_name: parsed.data.fullName,
        company: parsed.data.company,
      },
    },
  })

  if (error) {
    return {
      status: "error",
      message: getSafeAuthErrorMessage(error.message),
    }
  }

  /*
   * When email confirmation is disabled, signUp may immediately return
   * an active session. In that case we can bootstrap the workspace now.
   */
  if (data.session) {
    try {
      await ensureCurrentUserWorkspace(supabase, parsed.data.company)
    } catch {
      await supabase.auth.signOut()

      return {
        status: "error",
        message:
          "Your account was created, but the workspace could not be prepared.",
      }
    }

    redirect("/app")
  }

  return {
    status: "success",
    message:
      "Account created. Check your email and confirm the registration before logging in.",
  }
}

export async function forgotPasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: getStringValue(formData, "email"),
  })

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted field.",
      fieldErrors: getFieldErrors(parsed.error),
    }
  }

  const supabase = await createClient()
  const siteUrl = getSiteUrl()

  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo: `${siteUrl}/auth/confirm?next=/reset-password`,
    },
  )

  if (error) {
    return {
      status: "error",
      message: getSafeAuthErrorMessage(error.message),
    }
  }

  /*
   * Do not disclose whether an account exists for this address.
   */
  return {
    status: "success",
    message:
      "If an account exists for this email address, recovery instructions have been sent.",
  }
}

export async function resetPasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse({
    newPassword: getStringValue(formData, "newPassword"),
    confirmPassword: getStringValue(formData, "confirmPassword"),
  })

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: getFieldErrors(parsed.error),
    }
  }

  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      status: "error",
      message:
        "Your recovery session has expired. Request a new password reset email.",
    }
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
  })

  if (error) {
    return {
      status: "error",
      message: getSafeAuthErrorMessage(error.message),
    }
  }

  await supabase.auth.signOut()

  redirect("/login?password=updated")
}

export async function logoutAction() {
  const supabase = await createClient()

  await supabase.auth.signOut()

  redirect("/login")
}