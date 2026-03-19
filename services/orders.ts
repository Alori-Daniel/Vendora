import { getSupabaseClient } from "@/lib/supabase";
import type {
  DeliveryStatus,
  InvoiceRow,
  OrderItemRow,
  OrderRow,
  OrderStatus,
} from "@/types/supabase";

export type CreateOrderItemInput = {
  product_id?: string | null;
  name: string;
  quantity: number;
  unit_price: number;
};

export type CreateOrderInput = {
  user_id: string;
  business_profile_id: string;
  customer_id?: string | null;
  invoice_prefix: string;
  status: OrderStatus;
  delivery_status?: DeliveryStatus;
  due_at?: string | null;
  discount?: number;
  delivery_fee?: number;
  notes?: string | null;
  items: CreateOrderItemInput[];
  create_invoice?: boolean;
};

export type CreateOrderResult = {
  order: OrderRow;
  invoice: InvoiceRow | null;
  items: OrderItemRow[];
};

export type UpdateOrderStatusInput = {
  orderId: string;
  status: OrderStatus;
  delivery_status?: DeliveryStatus;
};

function getOrderNumber(invoicePrefix: string) {
  return `${invoicePrefix}-${Date.now()}`;
}

function getInvoiceNumber(invoicePrefix: string) {
  return `${invoicePrefix}-INV-${Date.now()}`;
}

function getDeliveryStatusForOrderStatus(status: OrderStatus): DeliveryStatus {
  if (status === "out_for_delivery") {
    return "dispatched";
  }

  if (status === "delivered") {
    return "delivered";
  }

  if (status === "cancelled") {
    return "failed";
  }

  return "pending";
}

export async function createOrderWithItemsAndInvoice(
  payload: CreateOrderInput,
) {
  const supabase = getSupabaseClient();
  const orderNumber = getOrderNumber(payload.invoice_prefix);

  const { data, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: payload.user_id,
      business_profile_id: payload.business_profile_id,
      customer_id: payload.customer_id ?? null,
      order_number: orderNumber,
      status: payload.status,
      delivery_status: payload.delivery_status ?? "pending",
      due_at: payload.due_at ?? null,
      discount: payload.discount ?? 0,
      delivery_fee: payload.delivery_fee ?? 0,
      notes: payload.notes ?? null,
    })
    .select("*")
    .single();

  if (orderError) {
    throw orderError;
  }

  const order = data as OrderRow | null;

  if (!order) {
    throw new Error("Order could not be created.");
  }

  const { data: createdItems, error: itemsError } = await supabase
    .from("order_items")
    .insert(
      payload.items.map((item) => ({
        user_id: payload.user_id,
        order_id: order.id,
        product_id: item.product_id ?? null,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
    )
    .select("*");

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    throw itemsError;
  }

  let invoice: InvoiceRow | null = null;

  if (payload.create_invoice !== false) {
    const { data: invoiceData, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        user_id: payload.user_id,
        order_id: order.id,
        invoice_number: getInvoiceNumber(payload.invoice_prefix),
        status: "unpaid",
        due_at: payload.due_at ?? null,
      })
      .select("*")
      .single();

    if (invoiceError) {
      throw invoiceError;
    }

    invoice = (invoiceData as InvoiceRow | null) ?? null;
  }

  return {
    order,
    invoice,
    items: (createdItems ?? []) as OrderItemRow[],
  } satisfies CreateOrderResult;
}

export async function updateOrderStatus({
  orderId,
  status,
  delivery_status,
}: UpdateOrderStatusInput) {
  const supabase = getSupabaseClient();
  const nextDeliveryStatus = delivery_status ?? getDeliveryStatusForOrderStatus(status);

  const { data, error } = await supabase
    .from("orders")
    .update({
      status,
      delivery_status: nextDeliveryStatus,
    })
    .eq("id", orderId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  const order = data as OrderRow | null;

  if (!order) {
    throw new Error("Order could not be updated.");
  }

  return order;
}
