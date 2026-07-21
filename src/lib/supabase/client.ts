import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from '../database.types'

export function createClient() {
  return createSupabaseClient<Database>(
    'https://ltloscarjmoxvlxraqge.supabase.co',
    'sb_publishable_ikzRGPFo4GN8n0jOOf84Ig_CzXdp7to'
  )
}
