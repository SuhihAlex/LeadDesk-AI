import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import { getSupabasePublicEnvironment } from "@/lib/supabase/env"

export async function updateSession(request: NextRequest) {
  const { url, publishableKey } = getSupabasePublicEnvironment()

  let response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },

      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })

        response = NextResponse.next({
          request,
        })

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  /*
   * Do not remove this call.
   * It validates the access token and refreshes auth cookies when necessary.
   */
  await supabase.auth.getClaims()

  return response
}