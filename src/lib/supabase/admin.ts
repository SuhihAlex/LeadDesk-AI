import "server-only"

import { createClient as createSupabaseClient } from "@supabase/supabase-js"

import {
  getSupabasePublicEnvironment,
  getSupabaseSecretKey,
} from "@/lib/supabase/env"

export function createAdminClient() {
  const { url } = getSupabasePublicEnvironment()
  const secretKey = getSupabaseSecretKey()

  return createSupabaseClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}