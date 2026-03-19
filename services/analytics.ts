import * as Print from "expo-print";
import { Platform } from "react-native";

import { shareGeneratedDocument } from "@/services/documents";
import type {
  WorkspaceCustomer,
  WorkspaceOrder,
} from "@/services/workspace";
import type { BusinessProfileRow, ProductRow } from "@/types/supabase";
import { formatCurrency } from "@/utils/formatters";

export type AnalyticsRange = "week" | "month" | "year";

export type AnalyticsChartPoint = {
  label: string;
  sales: number;
  collected: number;
  orders: number;
};

export type AnalyticsTopCustomer = {
  id: string;
  fullName: string;
  phone: string;
  totalSpend: number;
};

export type AnalyticsTopProduct = {
  id: string;
  name: string;
  category: string;
  quantity: number;
};

export type AnalyticsReport = {
  range: AnalyticsRange;
  title: string;
  totalSales: number;
  totalCollected: number;
  outstandingBalance: number;
  averageOrderValue: number;
  completedOrders: number;
  repeatCustomers: number;
  chart: AnalyticsChartPoint[];
  topCustomers: AnalyticsTopCustomer[];
  topProducts: AnalyticsTopProduct[];
};

type Bucket = {
  label: string;
  start: Date;
  end: Date;
};

function startOfDay(input: Date) {
  return new Date(input.getFullYear(), input.getMonth(), input.getDate());
}

function endOfDay(input: Date) {
  return new Date(
    input.getFullYear(),
    input.getMonth(),
    input.getDate(),
    23,
    59,
    59,
    999,
  );
}

function addDays(input: Date, days: number) {
  const next = new Date(input);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(input: Date, months: number) {
  return new Date(input.getFullYear(), input.getMonth() + months, 1);
}

function getWeekBuckets(now: Date) {
  const buckets: Bucket[] = [];

  for (let index = 6; index >= 0; index -= 1) {
    const date = addDays(now, -index);
    buckets.push({
      label: date.toLocaleDateString("en-NG", { weekday: "short" }),
      start: startOfDay(date),
      end: endOfDay(date),
    });
  }

  return buckets;
}

function getMonthBuckets(now: Date) {
  const buckets: Bucket[] = [];
  const start = startOfDay(addDays(now, -27));

  for (let index = 0; index < 4; index += 1) {
    const bucketStart = addDays(start, index * 7);
    const bucketEnd = endOfDay(addDays(bucketStart, 6));

    buckets.push({
      label: `Week ${index + 1}`,
      start: bucketStart,
      end: bucketEnd,
    });
  }

  return buckets;
}

function getYearBuckets(now: Date) {
  const buckets: Bucket[] = [];
  const firstMonth = addMonths(new Date(now.getFullYear(), now.getMonth(), 1), -11);

  for (let index = 0; index < 12; index += 1) {
    const monthStart = addMonths(firstMonth, index);
    const monthEnd = endOfDay(
      new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0),
    );

    buckets.push({
      label: monthStart.toLocaleDateString("en-NG", { month: "short" }),
      start: monthStart,
      end: monthEnd,
    });
  }

  return buckets;
}

function getBuckets(range: AnalyticsRange, now: Date) {
  if (range === "week") {
    return getWeekBuckets(now);
  }

  if (range === "month") {
    return getMonthBuckets(now);
  }

  return getYearBuckets(now);
}

function isWithinRange(date: string, bucket: Bucket) {
  const value = new Date(date).getTime();
  return value >= bucket.start.getTime() && value <= bucket.end.getTime();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatAmount(amount: number, businessProfile?: BusinessProfileRow | null) {
  return formatCurrency(amount, businessProfile?.default_currency ?? "NGN");
}

export function buildAnalyticsReport({
  customers,
  orders,
  products,
  range,
  businessProfile,
}: {
  customers: WorkspaceCustomer[];
  orders: WorkspaceOrder[];
  products: ProductRow[];
  range: AnalyticsRange;
  businessProfile?: BusinessProfileRow | null;
}) {
  const now = new Date();
  const buckets = getBuckets(range, now);
  const rangeStart = buckets[0]?.start ?? startOfDay(now);
  const scopedOrders = orders.filter(
    (order) => new Date(order.created_at).getTime() >= rangeStart.getTime(),
  );
  const activeOrders = scopedOrders.filter((order) => order.status !== "cancelled");
  const scopedPayments = scopedOrders.flatMap((order) => order.payments);
  const topCustomers = customers
    .map((customer) => {
      const scopedCustomerOrders = activeOrders.filter(
        (order) => order.customer_id === customer.id,
      );

      return {
        id: customer.id,
        fullName: customer.full_name,
        phone: customer.phone,
        totalSpend: scopedCustomerOrders.reduce((sum, order) => sum + order.total, 0),
      };
    })
    .filter((customer) => customer.totalSpend > 0)
    .sort((left, right) => right.totalSpend - left.totalSpend)
    .slice(0, 5);
  const productsById = new Map(products.map((product) => [product.id, product]));
  const productSales = new Map<string, AnalyticsTopProduct>();

  activeOrders.forEach((order) => {
    order.items.forEach((item) => {
      const key = item.product_id ?? item.name;
      const matchedProduct = item.product_id ? productsById.get(item.product_id) : undefined;
      const existing = productSales.get(key);

      productSales.set(key, {
        id: key,
        name: matchedProduct?.name ?? item.name,
        category: matchedProduct?.category ?? "Custom item",
        quantity: (existing?.quantity ?? 0) + item.quantity,
      });
    });
  });

  const chart = buckets.map((bucket) => ({
    label: bucket.label,
    sales: activeOrders
      .filter((order) => isWithinRange(order.created_at, bucket))
      .reduce((sum, order) => sum + order.total, 0),
    collected: scopedPayments
      .filter((payment) => isWithinRange(payment.recorded_at, bucket))
      .reduce((sum, payment) => sum + payment.amount, 0),
    orders: activeOrders.filter((order) => isWithinRange(order.created_at, bucket)).length,
  }));
  const totalSales = activeOrders.reduce((sum, order) => sum + order.total, 0);
  const totalCollected = scopedPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const outstandingBalance = activeOrders.reduce((sum, order) => sum + order.balance, 0);
  const averageOrderValue = activeOrders.length > 0 ? totalSales / activeOrders.length : 0;
  const completedOrders = activeOrders.filter((order) => order.status === "delivered").length;
  const repeatCustomers = customers.filter(
    (customer) =>
      activeOrders.filter((order) => order.customer_id === customer.id).length > 1,
  ).length;

  return {
    range,
    title:
      range === "week"
        ? "Weekly analytics"
        : range === "month"
          ? "Monthly analytics"
          : "Yearly analytics",
    totalSales,
    totalCollected,
    outstandingBalance,
    averageOrderValue,
    completedOrders,
    repeatCustomers,
    chart,
    topCustomers,
    topProducts: [...productSales.values()]
      .sort((left, right) => right.quantity - left.quantity)
      .slice(0, 5),
  } satisfies AnalyticsReport;
}

function buildAnalyticsReportHtml(
  report: AnalyticsReport,
  businessProfile?: BusinessProfileRow | null,
) {
  const maxSales = Math.max(...report.chart.map((point) => point.sales), 1);
  const chartRows = report.chart
    .map((point) => {
      const width = `${Math.max((point.sales / maxSales) * 100, point.sales > 0 ? 8 : 0)}%`;

      return `
        <div class="chart-row">
          <div class="chart-meta">
            <strong>${escapeHtml(point.label)}</strong>
            <span>${escapeHtml(
              `${formatAmount(point.sales, businessProfile)} sales · ${formatAmount(
                point.collected,
                businessProfile,
              )} collected`,
            )}</span>
          </div>
          <div class="chart-track">
            <div class="chart-fill" style="width: ${width};"></div>
          </div>
        </div>
      `;
    })
    .join("");
  const topCustomers = report.topCustomers
    .map(
      (customer) => `
        <div class="list-row">
          <span>${escapeHtml(customer.fullName)}</span>
          <strong>${escapeHtml(formatAmount(customer.totalSpend, businessProfile))}</strong>
        </div>
      `,
    )
    .join("");
  const topProducts = report.topProducts
    .map(
      (product) => `
        <div class="list-row">
          <span>${escapeHtml(product.name)}</span>
          <strong>${product.quantity} sold</strong>
        </div>
      `,
    )
    .join("");

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            padding: 28px;
            color: #132235;
            background: #f2f5ee;
          }
          .page {
            background: #ffffff;
            border: 1px solid #d6dfce;
            border-radius: 24px;
            padding: 28px;
          }
          .eyebrow {
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #4b6350;
            font-weight: 700;
            font-size: 12px;
          }
          h1 {
            margin: 8px 0 6px;
            font-size: 30px;
          }
          .muted {
            color: #5f6775;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
            margin: 22px 0;
          }
          .summary-card {
            border: 1px solid #d6dfce;
            border-radius: 18px;
            padding: 14px;
          }
          .summary-card strong {
            display: block;
            margin-top: 8px;
            font-size: 20px;
          }
          .section {
            margin-top: 24px;
          }
          .section h2 {
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-bottom: 12px;
          }
          .chart-row {
            margin-bottom: 14px;
          }
          .chart-meta {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 6px;
          }
          .chart-meta span {
            color: #5f6775;
            font-size: 12px;
          }
          .chart-track {
            height: 14px;
            background: #e9efe4;
            border-radius: 999px;
            overflow: hidden;
          }
          .chart-fill {
            height: 100%;
            background: linear-gradient(90deg, #60896a, #8ba957);
            border-radius: 999px;
          }
          .list-row {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="eyebrow">${escapeHtml(report.title)}</div>
          <h1>${escapeHtml(businessProfile?.business_name ?? "Vendor workspace")}</h1>
          <div class="muted">Downloadable analytics snapshot generated from live order and payment data.</div>

          <div class="summary-grid">
            <div class="summary-card">
              <div>Total sales</div>
              <strong>${escapeHtml(formatAmount(report.totalSales, businessProfile))}</strong>
            </div>
            <div class="summary-card">
              <div>Total collected</div>
              <strong>${escapeHtml(formatAmount(report.totalCollected, businessProfile))}</strong>
            </div>
            <div class="summary-card">
              <div>Outstanding</div>
              <strong>${escapeHtml(
                formatAmount(report.outstandingBalance, businessProfile),
              )}</strong>
            </div>
            <div class="summary-card">
              <div>Average order value</div>
              <strong>${escapeHtml(
                formatAmount(report.averageOrderValue, businessProfile),
              )}</strong>
            </div>
          </div>

          <div class="section">
            <h2>Sales chart</h2>
            ${chartRows}
          </div>

          <div class="section">
            <h2>Top customers</h2>
            ${topCustomers || '<div class="muted">No customer data in this range.</div>'}
          </div>

          <div class="section">
            <h2>Top products</h2>
            ${topProducts || '<div class="muted">No product data in this range.</div>'}
          </div>
        </div>
      </body>
    </html>
  `;
}

export async function exportAnalyticsReportPdf({
  businessProfile,
  report,
}: {
  businessProfile?: BusinessProfileRow | null;
  report: AnalyticsReport;
}) {
  if (Platform.OS === "web") {
    throw new Error("Analytics PDF export is only available in the native app.");
  }

  const printResult = await Print.printToFileAsync({
    html: buildAnalyticsReportHtml(report, businessProfile),
    width: 612,
    height: 792,
  });

  return {
    localUri: printResult.uri,
    shared: await shareGeneratedDocument(printResult.uri),
  };
}
