import { supabase } from "../lib/supabase.js";
import { ensureSupabase, unwrap } from "./helpers.js";

export async function getCropProduction(filters = {}) {
  const client = ensureSupabase(supabase);
  let query = client.from("crop_production").select("*").order("year", { ascending: true });
  if (filters.district) query = query.eq("district", filters.district);
  if (filters.crop) query = query.eq("crop", filters.crop);
  if (filters.season) query = query.eq("season", filters.season);
  if (filters.yearFrom) query = query.gte("year", filters.yearFrom);
  if (filters.yearTo) query = query.lte("year", filters.yearTo);
  return unwrap(await query);
}
