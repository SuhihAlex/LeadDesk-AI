type PublicEnvironmentKey =
  | "NEXT_PUBLIC_SUPABASE_URL"
  | "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"

function getPublicEnvironmentVariable(key: PublicEnvironmentKey) {
  const value = process.env[key]

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }

  return value
}

export function getSupabasePublicEnvironment() {
  return {
    url: getPublicEnvironmentVariable("NEXT_PUBLIC_SUPABASE_URL"),
    publishableKey: getPublicEnvironmentVariable(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    ),
  }
}

export function getSupabaseSecretKey() {
  const value = process.env.SUPABASE_SECRET_KEY

  if (!value) {
    throw new Error(
      "Missing required server environment variable: SUPABASE_SECRET_KEY",
    )
  }

  return value
}

export function getDemoPublicFormToken() {
  const value = process.env.NEXT_PUBLIC_DEMO_FORM_TOKEN

  if (!value) {
    throw new Error(
      "Missing required environment variable: NEXT_PUBLIC_DEMO_FORM_TOKEN",
    )
  }

  return value
}