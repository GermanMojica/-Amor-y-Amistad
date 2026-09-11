import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/**
 * Cliente Supabase para el cliente / frontend (usa anon/publishable key)
 */
export const supabaseClient =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

/**
 * Cliente Supabase de administración para el backend / API Routes (usa service role key)
 */
export function getSupabaseAdmin() {
  if (!supabaseUrl || (!supabaseServiceKey && !supabaseAnonKey)) {
    return null;
  }
  return createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Verifica si Supabase está configurado con una URL válida y credenciales
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
      supabaseUrl.startsWith("http") &&
      (supabaseServiceKey || supabaseAnonKey)
  );
}
