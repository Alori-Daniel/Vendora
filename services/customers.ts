import { getSupabaseClient } from "@/lib/supabase";
import type { CustomerInsert, CustomerRow } from "@/types/supabase";

export type CreateCustomerInput = Pick<
  CustomerInsert,
  | "user_id"
  | "business_profile_id"
  | "full_name"
  | "phone"
  | "email"
  | "address"
  | "landmark"
  | "notes"
  | "tags"
>;

export async function createCustomer(payload: CreateCustomerInput) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("customers")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as CustomerRow;
}
