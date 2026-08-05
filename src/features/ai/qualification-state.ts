import type {
  QualifyLeadActionState,
} from "@/features/ai/qualification-actions"

export const initialQualifyLeadActionState: QualifyLeadActionState = {
  status: "idle",
  message: "",
}