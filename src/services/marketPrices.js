import { supabase } from "../lib/supabase.js";
import { ensureSupabase, unwrap } from "./helpers.js";

export async function getMarketPrices(filters = {}) {
  const client = ensureSupabase(supabase);
  let query = client.from("market_prices").select("*").order("date", { ascending: true });
  if (filters.state) query = query.eq("state", filters.state);
  if (filters.district) query = query.eq("district", filters.district);
  if (filters.market) query = query.eq("market", filters.market);
  if (filters.commodity) query = query.eq("commodity", filters.commodity);
  if (filters.from) query = query.gte("date", filters.from);
  if (filters.to) query = query.lte("date", filters.to);
  return unwrap(await query);
}
