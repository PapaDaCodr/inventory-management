import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client using the Service Role key.
// IMPORTANT: Never expose this key to the browser. This file is used only on the server.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

