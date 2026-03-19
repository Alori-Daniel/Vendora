import { File } from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

import { getSupabaseClient } from "@/lib/supabase";
import type { WorkspaceOrder } from "@/services/workspace";
import type {
  BusinessProfileRow,
  DocumentGenerationGrant,
  GeneratedDocumentInsert,
  GeneratedDocumentRow,
  GeneratedDocumentType,
  InvoiceRow,
  Json,
  PaymentRow,
} from "@/types/supabase";
import { formatCurrency, formatDate, humanizeLabel } from "@/utils/formatters";

export const FREE_DOCUMENT_GENERATION_LIMIT = 5;
export const GENERATED_DOCUMENT_BUCKET = "generated-documents";

export type DocumentGenerationSummary = {
  freeLimit: number;
  freeUsed: number;
  freeRemaining: number;
};

export type GenerateDocumentInput = {
  userId: string;
  businessProfile: BusinessProfileRow;
  order: WorkspaceOrder;
  invoice?: InvoiceRow | null;
  payment?: PaymentRow | null;
  type: GeneratedDocumentType;
  hasActiveSubscription: boolean;
};

export type GenerateDocumentResult = {
  document: GeneratedDocumentRow;
  localUri: string;
  grantedBy: DocumentGenerationGrant;
  freeRemainingAfter: number;
};

function escapeHtml(value?: string | null) {
  return (value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDocumentCurrency(
  amount: number,
  businessProfile: BusinessProfileRow,
) {
  return formatCurrency(amount, businessProfile.default_currency);
}

function sanitizeFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9-_]/g, "-").replace(/-+/g, "-");
}

function buildDocumentBaseHtml({
  businessProfile,
  title,
  badge,
  counterpartyLabel,
  counterpartyName,
  counterpartyAddress,
  metaRows,
  lineItemsHtml,
  summaryRows,
  footerNote,
}: {
  businessProfile: BusinessProfileRow;
  title: string;
  badge: string;
  counterpartyLabel: string;
  counterpartyName: string;
  counterpartyAddress: string;
  metaRows: Array<{ label: string; value: string }>;
  lineItemsHtml: string;
  summaryRows: Array<{ label: string; value: string; strong?: boolean }>;
  footerNote: string;
}) {
  const logoHtml = businessProfile.logo_url
    ? `<img class="logo" src="${escapeHtml(businessProfile.logo_url)}" alt="Business logo" />`
    : "";
  const metaHtml = metaRows
    .map(
      (row) => `
        <div class="meta-row">
          <span>${escapeHtml(row.label)}</span>
          <strong>${escapeHtml(row.value)}</strong>
        </div>
      `,
    )
    .join("");
  const summaryHtml = summaryRows
    .map(
      (row) => `
        <div class="summary-row ${row.strong ? "summary-strong" : ""}">
          <span>${escapeHtml(row.label)}</span>
          <strong>${escapeHtml(row.value)}</strong>
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
            color: #132235;
            padding: 28px;
            background: #f4f0e8;
          }
          .page {
            background: #fffdf8;
            border: 1px solid #d8cfbe;
            border-radius: 24px;
            padding: 28px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            margin-bottom: 24px;
          }
          .brand {
            max-width: 60%;
          }
          .logo {
            width: 72px;
            height: 72px;
            object-fit: cover;
            border-radius: 18px;
            margin-bottom: 12px;
          }
          .title {
            font-size: 30px;
            font-weight: 800;
            margin: 0 0 6px;
          }
          .badge {
            display: inline-block;
            padding: 8px 12px;
            border-radius: 999px;
            background: #eadfc8;
            color: #5a4a2c;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
          }
          .muted {
            color: #5f6775;
            line-height: 1.5;
          }
          .section {
            margin-top: 22px;
            padding-top: 22px;
            border-top: 1px solid #e9e2d5;
          }
          .section-title {
            font-size: 12px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #6d6251;
            margin: 0 0 10px;
            font-weight: 800;
          }
          .meta-row,
          .summary-row,
          .line-row {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            margin-bottom: 10px;
          }
          .line-copy {
            flex: 1;
          }
          .line-copy strong,
          .summary-row strong,
          .meta-row strong {
            font-weight: 700;
          }
          .line-copy span {
            display: block;
            color: #6d7480;
            font-size: 12px;
            margin-top: 4px;
          }
          .summary-strong {
            font-size: 16px;
            padding-top: 10px;
            border-top: 1px solid #e9e2d5;
          }
          .footer {
            margin-top: 26px;
            color: #6d7480;
            font-size: 12px;
            line-height: 1.6;
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <div class="brand">
              ${logoHtml}
              <div class="badge">${escapeHtml(badge)}</div>
              <h1 class="title">${escapeHtml(title)}</h1>
              <p class="muted"><strong>${escapeHtml(
                businessProfile.business_name,
              )}</strong></p>
              <p class="muted">${escapeHtml(
                businessProfile.business_address ?? "No business address saved",
              )}</p>
              <p class="muted">${escapeHtml(
                businessProfile.phone ?? "No business phone saved",
              )}</p>
            </div>
            <div>
              <p class="section-title">${escapeHtml(counterpartyLabel)}</p>
              <p><strong>${escapeHtml(counterpartyName)}</strong></p>
              <p class="muted">${escapeHtml(counterpartyAddress)}</p>
            </div>
          </div>

          <div class="section">
            ${metaHtml}
          </div>

          <div class="section">
            <p class="section-title">Line items</p>
            ${lineItemsHtml}
          </div>

          <div class="section">
            <p class="section-title">Totals</p>
            ${summaryHtml}
          </div>

          <p class="footer">${escapeHtml(footerNote)}</p>
        </div>
      </body>
    </html>
  `;
}

function buildLineItemsHtml(
  order: WorkspaceOrder,
  businessProfile: BusinessProfileRow,
) {
  return order.items
    .map(
      (item) => `
        <div class="line-row">
          <div class="line-copy">
            <strong>${escapeHtml(item.name)}</strong>
            <span>${item.quantity} x ${escapeHtml(
              formatDocumentCurrency(item.unit_price, businessProfile),
            )}</span>
          </div>
          <strong>${escapeHtml(
            formatDocumentCurrency(
              item.quantity * item.unit_price,
              businessProfile,
            ),
          )}</strong>
        </div>
      `,
    )
    .join("");
}

function getReceiptDocumentNumber(order: WorkspaceOrder, payment: PaymentRow) {
  return `REC-${order.order_number}-${payment.id.slice(0, 6).toUpperCase()}`;
}

function buildInvoiceHtml(
  businessProfile: BusinessProfileRow,
  order: WorkspaceOrder,
  invoice: InvoiceRow,
) {
  return buildDocumentBaseHtml({
    businessProfile,
    title: "Invoice",
    badge: "Payment request",
    counterpartyLabel: "Bill to",
    counterpartyName: order.customer?.full_name ?? "Walk-in customer",
    counterpartyAddress:
      order.customer?.address ??
      order.customer?.phone ??
      "No customer address saved",
    metaRows: [
      { label: "Invoice number", value: invoice.invoice_number },
      { label: "Order number", value: order.order_number },
      { label: "Issued", value: formatDate(invoice.issued_at) },
      {
        label: "Due date",
        value: invoice.due_at ? formatDate(invoice.due_at) : "Not set",
      },
      { label: "Status", value: humanizeLabel(invoice.status) },
      {
        label: "Bank details",
        value: businessProfile.bank_details ?? "No bank details saved",
      },
    ],
    lineItemsHtml: buildLineItemsHtml(order, businessProfile),
    summaryRows: [
      {
        label: "Subtotal",
        value: formatDocumentCurrency(order.subtotal, businessProfile),
      },
      {
        label: "Delivery fee",
        value: formatDocumentCurrency(order.delivery_fee, businessProfile),
      },
      {
        label: "Discount",
        value: formatDocumentCurrency(order.discount, businessProfile),
      },
      {
        label: "Paid already",
        value: formatDocumentCurrency(order.paidAmount, businessProfile),
      },
      {
        label: "Balance due",
        value: formatDocumentCurrency(order.balance, businessProfile),
        strong: true,
      },
      {
        label: "Invoice total",
        value: formatDocumentCurrency(order.total, businessProfile),
        strong: true,
      },
    ],
    footerNote:
      "Generated from Vendora. This invoice reflects the order and payment state at the time of export.",
  });
}

function buildReceiptHtml(
  businessProfile: BusinessProfileRow,
  order: WorkspaceOrder,
  payment: PaymentRow,
) {
  const receiptNumber = getReceiptDocumentNumber(order, payment);

  return buildDocumentBaseHtml({
    businessProfile,
    title: "Payment receipt",
    badge: "Payment received",
    counterpartyLabel: "Received from",
    counterpartyName: order.customer?.full_name ?? "Walk-in customer",
    counterpartyAddress:
      order.customer?.address ??
      order.customer?.phone ??
      "No customer address saved",
    metaRows: [
      { label: "Receipt number", value: receiptNumber },
      { label: "Order number", value: order.order_number },
      {
        label: "Invoice number",
        value: order.invoice?.invoice_number ?? "No invoice linked",
      },
      { label: "Payment date", value: formatDate(payment.recorded_at) },
      { label: "Payment method", value: humanizeLabel(payment.method) },
      { label: "Reference", value: payment.reference ?? "Not provided" },
    ],
    lineItemsHtml: buildLineItemsHtml(order, businessProfile),
    summaryRows: [
      {
        label: "Order total",
        value: formatDocumentCurrency(order.total, businessProfile),
      },
      {
        label: "This payment",
        value: formatDocumentCurrency(payment.amount, businessProfile),
      },
      {
        label: "Paid to date",
        value: formatDocumentCurrency(order.paidAmount, businessProfile),
      },
      {
        label: "Remaining balance",
        value: formatDocumentCurrency(order.balance, businessProfile),
        strong: true,
      },
    ],
    footerNote:
      "Generated from Vendora. This receipt confirms the recorded payment and remaining balance at the time of export.",
  });
}

function buildDocumentSnapshot({
  businessProfile,
  order,
  invoice,
  payment,
  type,
}: {
  businessProfile: BusinessProfileRow;
  order: WorkspaceOrder;
  invoice?: InvoiceRow | null;
  payment?: PaymentRow | null;
  type: GeneratedDocumentType;
}) {
  return {
    generated_at: new Date().toISOString(),
    type,
    business: {
      id: businessProfile.id,
      business_name: businessProfile.business_name,
      business_category: businessProfile.business_category,
      logo_url: businessProfile.logo_url,
      phone: businessProfile.phone,
      default_currency: businessProfile.default_currency,
      business_address: businessProfile.business_address,
      bank_details: businessProfile.bank_details,
    },
    customer: order.customer
      ? {
          id: order.customer.id,
          full_name: order.customer.full_name,
          phone: order.customer.phone,
          email: order.customer.email,
          address: order.customer.address,
          landmark: order.customer.landmark,
        }
      : null,
    order: {
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      delivery_status: order.delivery_status,
      due_at: order.due_at,
      created_at: order.created_at,
      notes: order.notes,
      subtotal: order.subtotal,
      discount: order.discount,
      delivery_fee: order.delivery_fee,
      total: order.total,
      paid_amount: order.paidAmount,
      balance: order.balance,
      items: order.items.map((item) => ({
        id: item.id,
        product_id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
    },
    invoice: invoice
      ? {
          id: invoice.id,
          invoice_number: invoice.invoice_number,
          status: invoice.status,
          issued_at: invoice.issued_at,
          due_at: invoice.due_at,
        }
      : null,
    payment: payment
      ? {
          id: payment.id,
          amount: payment.amount,
          method: payment.method,
          reference: payment.reference,
          note: payment.note,
          recorded_at: payment.recorded_at,
        }
      : null,
  } satisfies Json;
}

async function uploadGeneratedPdf({
  fileName,
  localUri,
  userId,
}: {
  fileName: string;
  localUri: string;
  userId: string;
}) {
  const supabase = getSupabaseClient();
  const file = new File(localUri);
  const arrayBuffer = await file.arrayBuffer();
  const storagePath = `${userId}/${new Date()
    .toISOString()
    .slice(0, 10)}/${fileName}`;

  const { error } = await supabase.storage
    .from(GENERATED_DOCUMENT_BUCKET)
    .upload(storagePath, arrayBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (error) {
    throw error;
  }

  return storagePath;
}

export async function getDocumentGenerationSummary(businessProfileId: string) {
  const supabase = getSupabaseClient();
  const { count, error } = await supabase
    .from("document_generation_events")
    .select("id", { count: "exact", head: true })
    .eq("business_profile_id", businessProfileId)
    .eq("granted_by", "free_quota");

  if (error) {
    throw error;
  }

  const freeUsed = count ?? 0;

  return {
    freeLimit: FREE_DOCUMENT_GENERATION_LIMIT,
    freeUsed,
    freeRemaining: Math.max(FREE_DOCUMENT_GENERATION_LIMIT - freeUsed, 0),
  } satisfies DocumentGenerationSummary;
}

export async function generateAndStoreDocument(input: GenerateDocumentInput) {
  if (Platform.OS === "web") {
    throw new Error("PDF generation is only available in the native app.");
  }

  const invoice =
    input.type === "invoice"
      ? (input.invoice ?? input.order.invoice)
      : input.invoice;
  const payment =
    input.type === "receipt" ? (input.payment ?? null) : input.payment;

  if (input.type === "invoice" && !invoice) {
    throw new Error(
      "An invoice record is required before exporting an invoice PDF.",
    );
  }

  if (input.type === "receipt" && !payment) {
    throw new Error(
      "A payment record is required before exporting a receipt PDF.",
    );
  }

  const summary = await getDocumentGenerationSummary(input.businessProfile.id);

  if (!input.hasActiveSubscription && summary.freeRemaining <= 0) {
    throw new Error(
      "You have used all 5 free document generations. Subscribe to keep exporting invoices and receipts.",
    );
  }

  const grantedBy: DocumentGenerationGrant = input.hasActiveSubscription
    ? "subscription"
    : "free_quota";
  const documentNumber =
    input.type === "invoice"
      ? invoice!.invoice_number
      : getReceiptDocumentNumber(input.order, payment!);
  const fileName = `${sanitizeFileName(documentNumber)}-${Date.now()}.pdf`;
  const html =
    input.type === "invoice"
      ? buildInvoiceHtml(input.businessProfile, input.order, invoice!)
      : buildReceiptHtml(input.businessProfile, input.order, payment!);
  const printResult = await Print.printToFileAsync({
    html,
    width: 612,
    height: 792,
  });

  let storagePath: string | null = null;
  let uploadStatus: GeneratedDocumentRow["upload_status"] = "local_only";

  try {
    storagePath = await uploadGeneratedPdf({
      fileName,
      localUri: printResult.uri,
      userId: input.userId,
    });
    uploadStatus = "uploaded";
  } catch {
    uploadStatus = "local_only";
  }

  const supabase = getSupabaseClient();
  const snapshot = buildDocumentSnapshot({
    businessProfile: input.businessProfile,
    order: input.order,
    invoice,
    payment,
    type: input.type,
  });
  const documentPayload: GeneratedDocumentInsert = {
    user_id: input.userId,
    business_profile_id: input.businessProfile.id,
    order_id: input.order.id,
    invoice_id: invoice?.id ?? null,
    payment_id: payment?.id ?? null,
    type: input.type,
    document_number: documentNumber,
    file_name: fileName,
    mime_type: "application/pdf",
    storage_path: storagePath,
    upload_status: uploadStatus,
    snapshot,
  };
  const { data: document, error: documentError } = await supabase
    .from("generated_documents")
    .insert(documentPayload)
    .select("*")
    .single();

  if (documentError) {
    throw documentError;
  }

  const generatedDocument = document as GeneratedDocumentRow | null;

  if (!generatedDocument) {
    throw new Error("The generated document record could not be saved.");
  }

  const { error: eventError } = await supabase
    .from("document_generation_events")
    .insert({
      user_id: input.userId,
      business_profile_id: input.businessProfile.id,
      document_id: generatedDocument.id,
      document_type: input.type,
      granted_by: grantedBy,
    });

  if (eventError) {
    await supabase
      .from("generated_documents")
      .delete()
      .eq("id", generatedDocument.id);
    throw eventError;
  }

  return {
    document: generatedDocument,
    localUri: printResult.uri,
    grantedBy,
    freeRemainingAfter:
      grantedBy === "free_quota"
        ? Math.max(summary.freeRemaining - 1, 0)
        : summary.freeRemaining,
  } satisfies GenerateDocumentResult;
}

export async function shareGeneratedDocument(localUri: string) {
  if (!(await Sharing.isAvailableAsync())) {
    return false;
  }

  await Sharing.shareAsync(localUri, {
    dialogTitle: "Share document",
    mimeType: "application/pdf",
    UTI: "com.adobe.pdf",
  });

  return true;
}
