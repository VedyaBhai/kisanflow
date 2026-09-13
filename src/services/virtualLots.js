import { supabase } from "../lib/supabase.js";
import { ensureSupabase, unwrap } from "./helpers.js";

export async function getVirtualLot(id) {
  const client = ensureSupabase(supabase);
  return unwrap(await client.from("virtual_lots").select("*").eq("id", id).single());
}

export async function getVirtualLots(filters = {}) {
  const client = ensureSupabase(supabase);
  let query = client.from("virtual_lots").select("*").order("created_at", { ascending: false });
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.crop) query = query.eq("crop", filters.crop);
  return unwrap(await query);
}

export async function createVirtualLot(payload) {
  const client = ensureSupabase(supabase);
  return unwrap(await client.from("virtual_lots").insert(payload).select().single());
}

export async function getLotContributions(lotId) {
  const client = ensureSupabase(supabase);
  return unwrap(
    await client
      .from("lot_contributions")
      .select("*, farmers(id, name, district, mandal, village)")
      .eq("virtual_lot_id", lotId)
      .order("created_at", { ascending: true })
  );
}

export async function addLotContribution(payload) {
  const client = ensureSupabase(supabase);
  return unwrap(await client.from("lot_contributions").insert(payload).select().single());
}
