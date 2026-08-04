type PublicLeadFieldErrorProps = {
  errors?: string[]
}

export function PublicLeadFieldError({
  errors,
}: PublicLeadFieldErrorProps) {
  const message = errors?.[0]

  if (!message) {
    return null
  }

  return (
    <p className="text-sm text-destructive" role="alert">
      {message}
    </p>
  )
}