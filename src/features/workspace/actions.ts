"use server"

import { revalidatePath } from "next/cache"

import { getCurrentWorkspace } from "@/features/workspace/get-current-workspace"
import { workspaceSettingsSchema } from "@/features/workspace/schemas"
import type { WorkspaceSettingsActionState } from "@/features/workspace/types"
import { createClient } from "@/lib/supabase/server"

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key)

  return typeof value === "string" ? value : ""
}

export async function updateWorkspaceSettingsAction(
  _previousState: WorkspaceSettingsActionState,
  formData: FormData,
): Promise<WorkspaceSettingsActionState> {
  const parsed = workspaceSettingsSchema.safeParse({
    fullName: getStringValue(formData, "fullName"),
    workspaceName: getStringValue(formData, "workspaceName"),
  })

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const context = await getCurrentWorkspace()
  const supabase = await createClient()

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
    })
    .eq("id", context.user.id)

  if (profileError) {
    return {
      status: "error",
      message: "Your profile could not be updated. Please try again.",
    }
  }

  if (context.workspace.role !== "owner") {
    revalidatePath("/app", "layout")

    return {
      status: "success",
      message:
        "Your profile was updated. Only the workspace Owner can rename the company.",
    }
  }

  const { error: workspaceError } = await supabase
    .from("workspaces")
    .update({
      name: parsed.data.workspaceName,
    })
    .eq("id", context.workspace.id)

  if (workspaceError) {
    return {
      status: "error",
      message:
        "Your profile was updated, but the workspace name could not be changed.",
    }
  }

  revalidatePath("/app", "layout")
  revalidatePath("/app/settings")

  return {
    status: "success",
    message: "Profile and workspace settings were updated.",
  }
}