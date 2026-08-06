"use server"

import { revalidatePath } from "next/cache"

import { getCurrentWorkspace } from "@/features/workspace/get-current-workspace"
import { workspaceSettingsSchema } from "@/features/workspace/schemas"
import type {
  WorkspaceInvitationActionState,
  WorkspaceSettingsActionState,
} from "@/features/workspace/types"
import { createClient } from "@/lib/supabase/server"

import { workspaceInvitationSchema } from "@/features/workspace/schemas"

import { redirect } from "next/navigation"

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

export async function createWorkspaceInvitationAction(
  _previousState: WorkspaceInvitationActionState,
  formData: FormData,
): Promise<WorkspaceInvitationActionState> {
  const parsed = workspaceInvitationSchema.safeParse({
    email: getStringValue(formData, "email"),
  })

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted field.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const context = await getCurrentWorkspace()

  if (context.workspace.role !== "owner") {
    return {
      status: "error",
      message: "Only the workspace Owner can invite members.",
    }
  }

  if (parsed.data.email === context.user.email.toLowerCase()) {
    return {
      status: "error",
      message: "You are already a member of this workspace.",
    }
  }

  const supabase = await createClient()

  const { data: existingInvitation, error: lookupError } = await supabase
    .from("workspace_invitations")
    .select("id")
    .eq("workspace_id", context.workspace.id)
    .eq("email", parsed.data.email)
    .eq("status", "pending")
    .maybeSingle()

  if (lookupError) {
    return {
      status: "error",
      message: "Existing invitations could not be checked.",
    }
  }

  if (existingInvitation) {
    return {
      status: "error",
      message: "A pending invitation already exists for this email address.",
    }
  }

  const { error } = await supabase
    .from("workspace_invitations")
    .insert({
      workspace_id: context.workspace.id,
      email: parsed.data.email,
      role: "member",
      invited_by: context.user.id,
    })

  if (error) {
    if (error.code === "23505") {
      return {
        status: "error",
        message: "A pending invitation already exists for this email address.",
      }
    }

    return {
      status: "error",
      message: "The invitation could not be created. Please try again.",
    }
  }

  revalidatePath("/app/team")

  return {
    status: "success",
    message:
      "Invitation created. Copy the invitation link and send it to the member.",
  }
}

export async function revokeWorkspaceInvitationAction(
  formData: FormData,
) {
  const invitationId = getStringValue(formData, "invitationId")

  if (!invitationId) {
    return
  }

  const context = await getCurrentWorkspace()

  if (context.workspace.role !== "owner") {
    return
  }

  const supabase = await createClient()

  await supabase
    .from("workspace_invitations")
    .update({
      status: "revoked",
      revoked_at: new Date().toISOString(),
    })
    .eq("id", invitationId)
    .eq("workspace_id", context.workspace.id)
    .eq("status", "pending")

  revalidatePath("/app/team")
}

function getInvitationErrorCode(message: string) {
  const normalized = message.toLowerCase()

  if (normalized.includes("email does not match")) {
    return "email_mismatch"
  }

  if (
    normalized.includes(
      "free_plan_member_limit_reached",
    )
  ) {
    return "member_limit"
  }

  if (normalized.includes("another workspace")) {
    return "existing_workspace"
  }

  if (normalized.includes("expired")) {
    return "expired"
  }

  if (normalized.includes("no longer pending")) {
    return "unavailable"
  }

  return "accept_failed"
}

export async function acceptWorkspaceInvitationAction(
  formData: FormData,
) {
  const token = getStringValue(formData, "token")

  if (!/^[a-f0-9]{48}$/.test(token)) {
    redirect("/invite/invalid?error=invalid")
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/invite/${token}`)}`)
  }

  const { error } = await supabase.rpc(
    "accept_workspace_invitation",
    {
      invitation_token: token,
    },
  )

  if (error) {
    const errorCode = getInvitationErrorCode(error.message)

    redirect(`/invite/${token}?error=${errorCode}`)
  }

  revalidatePath("/app", "layout")
  revalidatePath("/app/team")

  redirect("/app/team")
}

export async function removeWorkspaceMemberAction(
  formData: FormData,
) {
  const membershipId = getStringValue(
    formData,
    "membershipId",
  )

  if (!membershipId) {
    return
  }

  const context = await getCurrentWorkspace()

  if (context.workspace.role !== "owner") {
    return
  }

  const supabase = await createClient()

  const { error } = await supabase.rpc(
    "remove_workspace_member",
    {
      target_membership_id: membershipId,
    },
  )

  if (error) {
    console.error(
      "Workspace member could not be removed.",
      error,
    )

    return
  }

  revalidatePath("/app", "layout")
  revalidatePath("/app/team")
  revalidatePath("/app/billing")
  revalidatePath("/app/inbox")
  revalidatePath("/app/tasks")
}

export async function transferWorkspaceOwnershipAction(
  formData: FormData,
) {
  const membershipId = getStringValue(
    formData,
    "membershipId",
  )

  if (!membershipId) {
    return
  }

  const context = await getCurrentWorkspace()

  if (context.workspace.role !== "owner") {
    return
  }

  const supabase = await createClient()

  const { error } = await supabase.rpc(
    "transfer_workspace_ownership",
    {
      target_membership_id: membershipId,
    },
  )

  if (error) {
    console.error(
      "Workspace ownership could not be transferred.",
      error,
    )

    return
  }

  revalidatePath("/app", "layout")
  revalidatePath("/app/team")
  revalidatePath("/app/billing")
  revalidatePath("/app/settings")
}

const WORKSPACE_LOGO_BUCKET = "workspace-logos"
const MAX_WORKSPACE_LOGO_SIZE = 2 * 1024 * 1024

const workspaceLogoMimeTypes = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
} as const

const workspaceLogoExtensions = [
  "png",
  "jpg",
  "webp",
] as const

function getWorkspaceLogoPaths(workspaceId: string) {
  return workspaceLogoExtensions.map(
    (extension) =>
      `${workspaceId}/logo.${extension}`,
  )
}

export async function uploadWorkspaceLogoAction(
  formData: FormData,
) {
  const context = await getCurrentWorkspace()

  if (context.workspace.role !== "owner") {
    return
  }

  const file = formData.get("logo")

  if (!(file instanceof File) || file.size === 0) {
    return
  }

  if (file.size > MAX_WORKSPACE_LOGO_SIZE) {
    console.error(
      "Workspace logo exceeds the 2 MB limit.",
    )
    return
  }

  const extension =
    workspaceLogoMimeTypes[
      file.type as keyof typeof workspaceLogoMimeTypes
    ]

  if (!extension) {
    console.error(
      "Workspace logo has an unsupported file type.",
    )
    return
  }

  const supabase = await createClient()
  const logoPath =
    `${context.workspace.id}/logo.${extension}`

  const existingPaths = getWorkspaceLogoPaths(
    context.workspace.id,
  )

  const { error: removeError } = await supabase.storage
    .from(WORKSPACE_LOGO_BUCKET)
    .remove(existingPaths)

  if (removeError) {
    console.error(
      "Previous workspace logo could not be removed.",
      removeError,
    )
  }

  const { error: uploadError } = await supabase.storage
    .from(WORKSPACE_LOGO_BUCKET)
    .upload(logoPath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: true,
    })

  if (uploadError) {
    console.error(
      "Workspace logo could not be uploaded.",
      uploadError,
    )
    return
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from(WORKSPACE_LOGO_BUCKET)
    .getPublicUrl(logoPath)

  const logoUrl =
    `${publicUrl}?v=${Date.now()}`

  const { error: workspaceError } = await supabase
    .from("workspaces")
    .update({
      logo_url: logoUrl,
    })
    .eq("id", context.workspace.id)

  if (workspaceError) {
    await supabase.storage
      .from(WORKSPACE_LOGO_BUCKET)
      .remove([logoPath])

    console.error(
      "Workspace logo URL could not be saved.",
      workspaceError,
    )
    return
  }

  revalidatePath("/app", "layout")
  revalidatePath("/app/settings")
  revalidatePath("/app/team")
}

export async function removeWorkspaceLogoAction() {
  const context = await getCurrentWorkspace()

  if (context.workspace.role !== "owner") {
    return
  }

  const supabase = await createClient()

  const { error: workspaceError } = await supabase
    .from("workspaces")
    .update({
      logo_url: null,
    })
    .eq("id", context.workspace.id)

  if (workspaceError) {
    console.error(
      "Workspace logo could not be cleared.",
      workspaceError,
    )
    return
  }

  const logoPaths = getWorkspaceLogoPaths(
    context.workspace.id,
  )

  const { error: removeError } = await supabase.storage
    .from(WORKSPACE_LOGO_BUCKET)
    .remove(logoPaths)

  if (removeError) {
    console.error(
      "Workspace logo file could not be removed.",
      removeError,
    )
  }

  revalidatePath("/app", "layout")
  revalidatePath("/app/settings")
  revalidatePath("/app/team")
}