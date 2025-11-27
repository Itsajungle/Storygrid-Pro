import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yljdgsywqombavyzxhqj.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsamRnc3l3cW9tYmF2eXp4aHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5OTI3MDgsImV4cCI6MjA3OTU2ODcwOH0.w43aH-aO0CJ7k-niuRNzlx-tV-FhXYaUCMqMLqJLM9k'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Allowed email for access
export const ALLOWED_EMAIL = 'itsajungletv@gmail.com'
