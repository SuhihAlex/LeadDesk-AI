export type SendLeadEmailState = {
  status: "idle" | "success" | "error"
  message: string
}

export const initialSendLeadEmailState: SendLeadEmailState = {
  status: "idle",
  message: "",
}