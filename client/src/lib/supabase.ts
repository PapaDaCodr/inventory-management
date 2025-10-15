import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

//TODO: Database Types (will be auto-generated later)
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          role: 'administrator' | 'manager' | 'inventory_clerk' | 'cashier' | 'supplier'
          employee_id: string | null
          contact_phone: string | null
          department: string | null
          assigned_areas: any | null
          shift_info: any | null
          access_level: number
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          role: 'administrator' | 'manager' | 'inventory_clerk' | 'cashier' | 'supplier'
          employee_id?: string | null
          contact_phone?: string | null
          department?: string | null
          assigned_areas?: any | null
          shift_info?: any | null
          access_level?: number
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          role?: 'administrator' | 'manager' | 'inventory_clerk' | 'cashier' | 'supplier'
          employee_id?: string | null
          contact_phone?: string | null
          department?: string | null
          assigned_areas?: any | null
          shift_info?: any | null
          access_level?: number
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // More table types will be added as we implement them
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'administrator' | 'manager' | 'inventory_clerk' | 'cashier' | 'supplier'
    }
  }
}
