import { supabase } from "../lib/supabase.js";
import { ensureSupabase, unwrap } from "./helpers.js";

export async function getWeather(filters = {}) {
  const client = ensureSupabase(supabase);
  let query = client.from("weather").select("*").order("date", { ascending: true });
  if (filters.district) query = query.eq("district", filters.district);
  if (filters.from) query = query.gte("date", filters.from);
  if (filters.to) query = query.lte("date", filters.to);
  return unwrap(await query);
}
