import type {
  DeliveryStatus,
  InvoiceStatus,
  OrderStatus,
} from "@/types/supabase";
import { humanizeLabel } from "@/utils/formatters";

export function getOrderStatusTone(status: OrderStatus) {
  if (status === "delivered") {
    return "success";
  }

  if (status === "cancelled") {
    return "danger";
  }

  if (status === "confirmed" || status === "out_for_delivery") {
    return "brand";
  }

  if (status === "in_progress" || status === "ready") {
    return "warning";
  }

  return "neutral";
}

export function getInvoiceStatusTone(status: InvoiceStatus) {
  if (status === "paid") {
    return "success";
  }

  if (status === "partial") {
    return "warning";
  }

  return "danger";
}

export function getDeliveryStatusTone(status: DeliveryStatus) {
  if (status === "delivered") {
    return "success";
  }

  if (status === "failed") {
    return "danger";
  }

  if (status === "dispatched") {
    return "brand";
  }

  return "neutral";
}

export function getStatusLabel(value: string) {
  return humanizeLabel(value);
}
