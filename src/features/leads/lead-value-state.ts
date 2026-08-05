export type LeadValueActionState = {
  status: "idle" | "success" | "error"
  message: string
  fieldErrors?: {
    estimatedValue?: string[]
  }
}

export const initialLeadValueActionState: LeadValueActionState = {
  status: "idle",
  message: "",
}