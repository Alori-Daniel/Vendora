import { useQuery } from "@tanstack/react-query";

import { fetchWorkspaceSnapshot } from "@/services/workspace";
import { useAppStore } from "@/stores/app-store";

export const workspaceQueryKey = (businessProfileId?: string) =>
  ["workspace", businessProfileId ?? "none"] as const;

export function useWorkspaceSnapshotQuery() {
  const businessProfileId = useAppStore((state) => state.businessProfile?.id);

  return useQuery({
    queryKey: workspaceQueryKey(businessProfileId),
    queryFn: () => fetchWorkspaceSnapshot(businessProfileId!),
    enabled: Boolean(businessProfileId),
  });
}

export function useDashboardQuery() {
  return useWorkspaceSnapshotQuery();
}

export function useOrdersQuery() {
  return useWorkspaceSnapshotQuery();
}

export function useOrderDetailQuery(orderId?: string) {
  const workspaceQuery = useWorkspaceSnapshotQuery();

  return {
    ...workspaceQuery,
    data: orderId
      ? workspaceQuery.data?.orders.find((order) => order.id === orderId) ?? null
      : null,
  };
}

export function useCustomersQuery() {
  return useWorkspaceSnapshotQuery();
}

export function useInvoicesQuery() {
  const workspaceQuery = useWorkspaceSnapshotQuery();

  return {
    ...workspaceQuery,
    data: workspaceQuery.data
      ? workspaceQuery.data.orders
          .filter((order) => Boolean(order.invoice))
          .map((order) => ({
            order,
            invoice: order.invoice!,
          }))
      : [],
  };
}

export function usePaymentDetailQuery(paymentId?: string) {
  const workspaceQuery = useWorkspaceSnapshotQuery();

  return {
    ...workspaceQuery,
    data: paymentId
      ? workspaceQuery.data?.orders
          .flatMap((order) =>
            order.payments.map((payment) => ({
              payment,
              order,
              invoice: order.invoice,
            })),
          )
          .find((entry) => entry.payment.id === paymentId) ?? null
      : null,
  };
}

export function useInvoiceDetailQuery(invoiceId?: string) {
  const workspaceQuery = useWorkspaceSnapshotQuery();

  return {
    ...workspaceQuery,
    data: invoiceId
      ? workspaceQuery.data?.orders.find((order) => order.invoice?.id === invoiceId) ??
        null
      : null,
  };
}

export function useCustomerDetailQuery(customerId?: string) {
  const workspaceQuery = useWorkspaceSnapshotQuery();

  return {
    ...workspaceQuery,
    data: customerId
      ? workspaceQuery.data?.customers.find((customer) => customer.id === customerId) ??
        null
      : null,
  };
}
