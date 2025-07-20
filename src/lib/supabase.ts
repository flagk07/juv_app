import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface User {
  id: string
  email?: string
  phone?: string
  telegram_id?: number
  telegram_username?: string
  created_at: string
}

export interface Product {
  id: string
  title: string
  description?: string
  image_url?: string
  price: number
  quantity_available: number
  is_active: boolean
  created_at: string
}

export interface CartItem {
  id: string
  telegram_id?: number
  user_id?: string
  product_id: string
  quantity: number
  created_at: string
  product?: Product
}

export interface Order {
  id: string
  telegram_id: number
  user_id?: string
  email: string
  phone: string
  items: any[]
  total_amount: number
  status: string
  created_at: string
}

export interface LogEntry {
  id: string
  telegram_id: number
  telegram_username?: string
  action_type: string
  metadata?: any
  timestamp: string
}

// Logging function
export async function logUserAction(
  telegram_id: number,
  telegram_username: string | undefined,
  action_type: string,
  metadata?: any
) {
  try {
    const { error } = await supabase
      .from('logs')
      .insert({
        telegram_id,
        telegram_username,
        action_type,
        metadata,
      })
    
    if (error) {
      console.error('Error logging user action:', error)
    }
  } catch (err) {
    console.error('Failed to log user action:', err)
  }
} 