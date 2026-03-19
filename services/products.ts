import { getSupabaseClient } from "@/lib/supabase";
import type { ProductRow } from "@/types/supabase";

export type CreateProductInput = {
  user_id: string;
  business_profile_id: string;
  name: string;
  sku?: string | null;
  price: number;
  category?: string | null;
  image_url?: string | null;
  is_active?: boolean;
};

export async function fetchProducts(businessProfileId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("business_profile_id", businessProfileId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as ProductRow[];
}

export async function createProduct(payload: CreateProductInput) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as ProductRow;
}
