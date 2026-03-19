import { getSupabaseClient } from "@/lib/supabase";
import type { PaymentInsert, PaymentRow } from "@/types/supabase";

export type CreatePaymentInput = Pick<
  PaymentInsert,
  | "user_id"
  | "business_profile_id"
  | "order_id"
  | "invoice_id"
  | "amount"
  | "method"
  | "reference"
  | "note"
  | "recorded_at"
>;

export async function createPayment(payload: CreatePaymentInput) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("payments")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  const payment = data as PaymentRow | null;

  if (!payment) {
    throw new Error("Payment could not be created.");
  }

  await supabase
    .from("orders")
    .update({
      status: "confirmed",
    })
    .eq("id", payment.order_id)
    .eq("status", "draft");

  return payment;
}
