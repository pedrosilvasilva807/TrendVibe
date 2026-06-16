import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables')
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function verifySupabaseToken(token: string): Promise<{ id: string; email: string } | null> {
  try {
    // Call GoTrue user endpoint directly to validate access token. Using the
    // service role key as `apikey` header to ensure the endpoint responds.
    const url = `${supabaseUrl.replace(/\/$/, '')}/auth/v1/user`
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: supabaseServiceRoleKey,
      },
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.error('verifySupabaseToken supabase fetch error:', res.status, text)
      return null
    }
    const data = await res.json().catch(() => null)
    if (!data || !data.id) return null
    return { id: data.id, email: data.email || '' }
  } catch (err) {
    console.error('verifySupabaseToken unexpected error:', err)
    return null
  }
}
