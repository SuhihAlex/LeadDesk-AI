import { createBrowserClient } from "@supabase/ssr"

import { getSupabasePublicEnvironment } from "@/lib/supabase/env"

export function createClient() {
  const { url, publishableKey } = getSupabasePublicEnvironment()

  return createBrowserClient(url, publishableKey)
}