import { getSupabaseClient } from "@/lib/supabase";
import type {
  BusinessProfileRow,
  CustomerRow,
  InvoiceRow,
  OrderItemRow,
  OrderRow,
  PaymentRow,
  ProductRow,
} from "@/types/supabase";

export type WorkspaceOrder = OrderRow & {
  customer: CustomerRow | null;
  items: OrderItemRow[];
  invoice: InvoiceRow | null;
  payments: PaymentRow[];
  subtotal: number;
  total: number;
  paidAmount: number;
  balance: number;
};

export type WorkspaceCustomer = CustomerRow & {
  orders: WorkspaceOrder[];
  totalSpend: number;
  outstandingBalance: number;
  orderCount: number;
};

export type WorkspaceChecklistItem = {
  label: string;
  completed: boolean;
};

export type WorkspaceDashboard = {
  salesToday: number;
  salesThisMonth: number;
  outstandingBalance: number;
  openOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalCustomers: number;
  totalProducts: number;
  activeProducts: number;
  unpaidInvoiceCount: number;
  recentOrders: WorkspaceOrder[];
  checklist: WorkspaceChecklistItem[];
};

export type WorkspaceSnapshot = {
  businessProfileId: BusinessProfileRow["id"];
  products: ProductRow[];
  customers: WorkspaceCustomer[];
  orders: WorkspaceOrder[];
  dashboard: WorkspaceDashboard;
};

function getLocalDateKey(input: string | Date) {
  const date = input instanceof Date ? input : new Date(input);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getLocalMonthKey(input: string | Date) {
  const date = input instanceof Date ? input : new Date(input);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");

  return `${year}-${month}`;
}

function calculateOrderSubtotal(items: OrderItemRow[]) {
  return items.reduce(
    (total, item) => total + item.quantity * item.unit_price,
    0,
  );
}

function calculateOrderTotal(order: OrderRow, items: OrderItemRow[]) {
  return calculateOrderSubtotal(items) - order.discount + order.delivery_fee;
}

export async function fetchWorkspaceSnapshot(businessProfileId: string) {
  const supabase = getSupabaseClient();

  const [customersResult, ordersResult, productsResult] = await Promise.all([
    supabase
      .from("customers")
      .select("*")
      .eq("business_profile_id", businessProfileId)
      .order("full_name", { ascending: true }),
    supabase
      .from("orders")
      .select("*")
      .eq("business_profile_id", businessProfileId)
      .order("created_at", { ascending: false }),
    supabase
      .from("products")
      .select("*")
      .eq("business_profile_id", businessProfileId)
      .order("created_at", { ascending: false }),
  ]);

  if (customersResult.error) {
    throw customersResult.error;
  }

  if (ordersResult.error) {
    throw ordersResult.error;
  }

  if (productsResult.error) {
    throw productsResult.error;
  }

  const customers = (customersResult.data ?? []) as CustomerRow[];
  const orders = (ordersResult.data ?? []) as OrderRow[];
  const products = (productsResult.data ?? []) as ProductRow[];
  const orderIds = orders.map((order) => order.id);

  let items: OrderItemRow[] = [];
  let invoices: InvoiceRow[] = [];
  let payments: PaymentRow[] = [];

  if (orderIds.length > 0) {
    const [itemsResult, invoicesResult, paymentsResult] = await Promise.all([
      supabase
        .from("order_items")
        .select("*")
        .in("order_id", orderIds)
        .order("created_at", { ascending: true }),
      supabase
        .from("invoices")
        .select("*")
        .in("order_id", orderIds)
        .order("issued_at", { ascending: false }),
      supabase
        .from("payments")
        .select("*")
        .in("order_id", orderIds)
        .order("recorded_at", { ascending: false }),
    ]);

    if (itemsResult.error) {
      throw itemsResult.error;
    }

    if (invoicesResult.error) {
      throw invoicesResult.error;
    }

    if (paymentsResult.error) {
      throw paymentsResult.error;
    }

    items = (itemsResult.data ?? []) as OrderItemRow[];
    invoices = (invoicesResult.data ?? []) as InvoiceRow[];
    payments = (paymentsResult.data ?? []) as PaymentRow[];
  }

  const customersById = new Map(customers.map((customer) => [customer.id, customer]));

  const ordersWithDetails: WorkspaceOrder[] = orders.map((order) => {
    const orderItems = items.filter((item) => item.order_id === order.id);
    const orderPayments = payments.filter((payment) => payment.order_id === order.id);
    const invoice = invoices.find((candidate) => candidate.order_id === order.id) ?? null;
    const subtotal = calculateOrderSubtotal(orderItems);
    const total = calculateOrderTotal(order, orderItems);
    const paidAmount = orderPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );

    return {
      ...order,
      customer: order.customer_id ? customersById.get(order.customer_id) ?? null : null,
      items: orderItems,
      invoice,
      payments: orderPayments,
      subtotal,
      total,
      paidAmount,
      balance: Math.max(total - paidAmount, 0),
    };
  });

  const customersWithMetrics: WorkspaceCustomer[] = customers.map((customer) => {
    const customerOrders = ordersWithDetails.filter(
      (order) => order.customer_id === customer.id,
    );

    const totalSpend = customerOrders
      .filter((order) => order.status !== "cancelled")
      .reduce((sum, order) => sum + order.total, 0);

    const outstandingBalance = customerOrders.reduce(
      (sum, order) => sum + order.balance,
      0,
    );

    return {
      ...customer,
      orders: customerOrders,
      totalSpend,
      outstandingBalance,
      orderCount: customerOrders.length,
    };
  });

  const todayKey = getLocalDateKey(new Date());
  const currentMonthKey = getLocalMonthKey(new Date());
  const activeOrders = ordersWithDetails.filter((order) => order.status !== "cancelled");
  const nonDeliveredOrders = ordersWithDetails.filter(
    (order) => !["cancelled", "delivered"].includes(order.status),
  );
  const invoiceCount = ordersWithDetails.filter((order) => Boolean(order.invoice)).length;
  const paymentCount = payments.length;
  const checklist: WorkspaceChecklistItem[] = [
    {
      label: "Business profile completed",
      completed: true,
    },
    {
      label: "Add your first product",
      completed: products.length > 0,
    },
    {
      label: "Add your first customer",
      completed: customersWithMetrics.length > 0,
    },
    {
      label: "Create your first order",
      completed: ordersWithDetails.length > 0,
    },
    {
      label: "Generate your first invoice",
      completed: invoiceCount > 0,
    },
    {
      label: "Record your first payment",
      completed: paymentCount > 0,
    },
  ];

  return {
    businessProfileId,
    products,
    customers: customersWithMetrics,
    orders: ordersWithDetails,
    dashboard: {
      salesToday: activeOrders
        .filter((order) => getLocalDateKey(order.created_at) === todayKey)
        .reduce((sum, order) => sum + order.total, 0),
      salesThisMonth: activeOrders
        .filter((order) => getLocalMonthKey(order.created_at) === currentMonthKey)
        .reduce((sum, order) => sum + order.total, 0),
      outstandingBalance: ordersWithDetails.reduce(
        (sum, order) => sum + order.balance,
        0,
      ),
      openOrders: nonDeliveredOrders.length,
      completedOrders: ordersWithDetails.filter((order) => order.status === "delivered")
        .length,
      cancelledOrders: ordersWithDetails.filter((order) => order.status === "cancelled")
        .length,
      totalCustomers: customersWithMetrics.length,
      totalProducts: products.length,
      activeProducts: products.filter((product) => product.is_active).length,
      unpaidInvoiceCount: ordersWithDetails.filter(
        (order) => order.invoice && order.invoice.status !== "paid",
      ).length,
      recentOrders: ordersWithDetails.slice(0, 4),
      checklist,
    },
  } satisfies WorkspaceSnapshot;
}
