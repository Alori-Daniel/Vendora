import { getSupabaseClient } from "@/lib/supabase";
import type { BusinessProfileInsert, BusinessProfileRow } from "@/types/supabase";

export type UpsertBusinessProfileInput = Pick<
  BusinessProfileInsert,
  | "user_id"
  | "business_name"
  | "business_category"
  | "phone"
  | "default_currency"
  | "invoice_prefix"
  | "business_address"
  | "bank_details"
>;

export async function fetchBusinessProfile(userId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("business_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as BusinessProfileRow | null;
}

export async function upsertBusinessProfile(
  payload: UpsertBusinessProfileInput,
) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("business_profiles")
    .upsert(payload, {
      onConflict: "user_id",
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as BusinessProfileRow;
}
