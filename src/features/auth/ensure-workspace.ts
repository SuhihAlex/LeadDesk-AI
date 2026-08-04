import type { SupabaseClient } from "@supabase/supabase-js"

export async function ensureCurrentUserWorkspace(
  supabase: SupabaseClient,
  workspaceName: string,
) {
  const { data, error } = await supabase.rpc(
    "ensure_current_user_workspace",
    {
      requested_workspace_name: workspaceName,
    },
  )

  if (error) {
    throw new Error(`Workspace setup failed: ${error.message}`)
  }

  if (!data) {
    throw new Error("Workspace setup did not return a workspace ID.")
  }

  return data as string
}