import { supabase } from "../lib/supabase.js";
import { ensureSupabase, unwrap } from "./helpers.js";

export async function getFarmers(filters = {}) {
  const client = ensureSupabase(supabase);
  let query = client.from("farmers").select("*").order("created_at", { ascending: false });
  if (filters.district) query = query.eq("district", filters.district);
  if (filters.language) query = query.eq("language", filters.language);
  if (filters.whatsappOptIn !== undefined) query = query.eq("whatsapp_opt_in", filters.whatsappOptIn);
  return unwrap(await query);
}

export async function getFarmerById(id) {
  const client = ensureSupabase(supabase);
  return unwrap(await client.from("farmers").select("*").eq("id", id).single());
}

export async function getFarmerProduce(farmerId, { status = "AVAILABLE" } = {}) {
  const client = ensureSupabase(supabase);
  let query = client.from("farmer_produce").select("*").eq("farmer_id", farmerId);
  if (status) query = query.eq("status", status);
  return unwrap(await query.order("available_from", { ascending: true }));
}

export async function createFarmer(payload) {
  const client = ensureSupabase(supabase);
  return unwrap(await client.from("farmers").insert(payload).select().single());
}
