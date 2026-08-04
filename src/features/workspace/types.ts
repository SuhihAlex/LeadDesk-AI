export type CurrentWorkspaceContext = {
  user: {
    id: string
    email: string
    fullName: string
    initials: string
    avatarUrl: string | null
  }
  workspace: {
    id: string
    name: string
    slug: string
    logoUrl: string | null
    role: "owner" | "member"
  }
}

export type WorkspaceSettingsActionState = {
  status: "idle" | "success" | "error"
  message: string
  fieldErrors?: Partial<
    Record<"fullName" | "workspaceName", string[]>
  >
}

export const initialWorkspaceSettingsActionState: WorkspaceSettingsActionState =
  {
    status: "idle",
    message: "",
  }