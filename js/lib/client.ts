// lib/client.ts
// This client is for client-side interactions (browser)
import { createClient } from '@supabase/supabase-js';

// These environment variables MUST be prefixed with NEXT_PUBLIC_ to be accessible in the browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // Corrected variable name

// Create a singleton Supabase client instance for client-side usage
export const supabase = createClient(supabaseUrl, supabaseAnonKey);