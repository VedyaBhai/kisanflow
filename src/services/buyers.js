import { supabase } from "../lib/supabase.js";
import { ensureSupabase, unwrap } from "./helpers.js";

export async function getBuyers() {
  const client = ensureSupabase(supabase);
  return unwrap(await client.from("buyers").select("*").order("created_at", { ascending: false }));
}

export async function createBuyer(payload) {
  const client = ensureSupabase(supabase);
  return unwrap(await client.from("buyers").insert(payload).select().single());
}
