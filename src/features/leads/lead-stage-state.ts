export type LeadStageActionState = {
  status: "idle" | "success" | "error"
  message: string
  fieldErrors?: {
    stage?: string[]
  }
}

export const initialLeadStageActionState: LeadStageActionState = {
  status: "idle",
  message: "",
}