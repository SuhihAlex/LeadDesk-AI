export type AuthActionState = {
  status: "idle" | "error" | "success"
  message: string
  fieldErrors?: Partial<
    Record<
      | "fullName"
      | "company"
      | "email"
      | "password"
      | "terms"
      | "newPassword"
      | "confirmPassword",
      string[]
    >
  >
}

export const initialAuthActionState: AuthActionState = {
  status: "idle",
  message: "",
}