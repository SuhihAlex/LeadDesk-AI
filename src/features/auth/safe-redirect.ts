export function getSafeRedirectPath(
  value: string | null,
  fallback = "/app",
) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback
  }

  return value
}