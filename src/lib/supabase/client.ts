import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from '../database.types'

export function createClient() {
  return createSupabaseClient<Database>(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!
  )
}
