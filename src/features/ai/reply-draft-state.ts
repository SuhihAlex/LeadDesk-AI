export type ReplyDraftActionState = {
  status: "idle" | "success" | "error"
  message: string
  fieldErrors?: {
    subject?: string[]
    body?: string[]
  }
}

export const initialReplyDraftActionState: ReplyDraftActionState = {
  status: "idle",
  message: "",
}