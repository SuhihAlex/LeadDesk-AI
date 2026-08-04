type AuthFieldErrorProps = {
  errors?: string[]
}

export function AuthFieldError({ errors }: AuthFieldErrorProps) {
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