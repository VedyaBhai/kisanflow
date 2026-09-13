import { supabase } from "../lib/supabase.js";
import { ensureSupabase, unwrap } from "./helpers.js";

export async function getBuyerDemands(filters = {}) {
  const client = ensureSupabase(supabase);
  let query = client.from("buyer_demands").select("*").order("created_at", { ascending: false });
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.crop) query = query.eq("crop", filters.crop);
  if (filters.destination) query = query.eq("destination", filters.destination);
  return unwrap(await query);
}

export async function createBuyerDemand(payload) {
  const client = ensureSupabase(supabase);
  return unwrap(await client.from("buyer_demands").insert(payload).select().single());
}

export async function updateBuyerDemand(id, patch) {
  const client = ensureSupabase(supabase);
  return unwrap(await client.from("buyer_demands").update(patch).eq("id", id).select().single());
}
