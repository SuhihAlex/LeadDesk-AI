export type LeadPriorityActionState = {
  status: "idle" | "success" | "error"
  message: string
  fieldErrors?: {
    priority?: string[]
  }
}

export const initialLeadPriorityActionState: LeadPriorityActionState = {
  status: "idle",
  message: "",
}