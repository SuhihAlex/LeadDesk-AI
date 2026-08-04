import "server-only"

import { createClient as createSupabaseClient } from "@supabase/supabase-js"

import {
  getSupabasePublicEnvironment,
  getSupabaseServiceRoleKey,
} from "@/lib/supabase/env"

export function createAdminClient() {
  const { url } = getSupabasePublicEnvironment()
  const serviceRoleKey = getSupabaseServiceRoleKey()

  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}