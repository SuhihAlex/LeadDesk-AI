export type CreateLeadNoteState = {
  status: "idle" | "success" | "error"
  message: string
  fieldErrors?: {
    content?: string[]
  }
}

export const initialCreateLeadNoteState: CreateLeadNoteState = {
  status: "idle",
  message: "",
}