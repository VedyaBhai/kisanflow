export function ensureSupabase(supabaseClient) {
  if (!supabaseClient) {
    throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }
  return supabaseClient;
}

export function unwrap(result) {
  if (result.error) throw result.error;
  return result.data;
}
