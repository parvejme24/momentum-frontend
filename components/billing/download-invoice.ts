import type { CustomerInvoice, PaymentStatus } from "@/lib/api/types";
import { formatPrettyIso } from "@/lib/dates";
import { formatCents } from "@/lib/money";

export function normalizePaymentStatus(status: unknown): PaymentStatus {
  const raw = String(status ?? "")
    .toLowerCase()
    .trim();
  if (raw === "paid" || raw === "succeeded") return "succeeded";
  if (raw === "pending") return "pending";
  if (raw === "failed") return "failed";
  if (raw === "refunded") return "refunded";
  return "pending";
}

export function normalizeCustomerInvoice(invoice: CustomerInvoice): CustomerInvoice {
  return {
    ...invoice,
    status: normalizePaymentStatus(invoice.status),
  };
}

export type InvoiceDownload = {
  id: string;
  label: string;
  date: string;
  amount: string;
  status: string;
};

type InvoiceMeta = {
  name: string;
  email: string;
  paymentMethod: string;
};

const INK: [number, number, number] = [20, 26, 46];
const INK_70: [number, number, number] = [90, 96, 110];
const RULE: [number, number, number] = [214, 220, 216];
const BLUE: [number, number, number] = [43, 76, 224];
const PAPER: [number, number, number] = [251, 252, 250];
const ROW: [number, number, number] = [227, 231, 226];

function invoiceNumber(id: string) {
  if (id.startsWith("inv-")) {
    return id.replace(/^inv-/, "MOM-2026-").toUpperCase();
  }
  const compact = id.replace(/-/g, "").slice(0, 8).toUpperCase();
  return `MOM-${compact}`;
}

function invoiceStatusLabel(status: string) {
  const normalized = normalizePaymentStatus(status);
  if (normalized === "succeeded") return "PAID";
  if (normalized === "refunded") return "REFUNDED";
  if (normalized === "pending") return "PENDING";
  if (normalized === "failed") return "FAILED";
  return String(status).toUpperCase();
}

export function canDownloadInvoice(
  invoice: Pick<CustomerInvoice, "status" | "amountCents">,
) {
  if (invoice.amountCents <= 0) return false;
  const status = normalizePaymentStatus(invoice.status);
  return status !== "failed";
}

export function paymentMethodFromReceipt(receiptUrl: string | null) {
  if (receiptUrl?.startsWith("sslcommerz:")) return "SSLCommerz";
  return "Card";
}

export function toInvoiceDownload(invoice: CustomerInvoice): InvoiceDownload {
  return {
    id: invoice.id,
    label: invoice.description || "Momentum plan",
    date: formatPrettyIso(invoice.paidAt),
    amount: formatCents(invoice.amountCents, invoice.currency),
    status: invoice.status,
  };
}

export async function downloadInvoice(invoice: InvoiceDownload, meta: InvoiceMeta) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 56;
  const contentW = pageW - margin * 2;
  let y = 56;

  doc.setFillColor(...PAPER);
  doc.rect(0, 0, pageW, doc.internal.pageSize.getHeight(), "F");

  doc.setFillColor(...INK);
  doc.rect(0, 0, pageW, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text("MOMENTUM", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...INK_70);
  doc.text("Habit logbook", margin + 78, y);

  y += 36;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...INK);
  doc.text("Invoice", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...BLUE);
  doc.text(invoiceNumber(invoice.id), pageW - margin, y, { align: "right" });

  y += 18;
  doc.setDrawColor(...RULE);
  doc.setLineWidth(1.5);
  doc.line(margin, y, pageW - margin, y);

  y += 28;
  doc.setTextColor(...INK_70);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("DATE", margin, y);
  doc.text("STATUS", margin + 160, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text(invoice.date, margin, y);
  doc.text(invoiceStatusLabel(invoice.status), margin + 160, y);

  y += 32;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...INK_70);
  doc.text("BILL TO", margin, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text(meta.name, margin, y);
  y += 15;
  doc.setTextColor(...INK_70);
  doc.text(meta.email, margin, y);

  y += 36;
  doc.setFillColor(...ROW);
  doc.rect(margin, y, contentW, 28, "F");
  doc.setTextColor(...INK_70);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("DESCRIPTION", margin + 12, y + 18);
  doc.text("AMOUNT", pageW - margin - 12, y + 18, { align: "right" });

  y += 48;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text(invoice.label, margin + 12, y);
  doc.setFont("helvetica", "bold");
  doc.text(invoice.amount, pageW - margin - 12, y, { align: "right" });

  y += 20;
  doc.setDrawColor(...RULE);
  doc.line(margin, y, pageW - margin, y);
  y += 22;
  doc.setFontSize(12);
  doc.text("Total", margin + 12, y);
  doc.text(invoice.amount, pageW - margin - 12, y, { align: "right" });

  y += 36;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...INK_70);
  doc.text(`Payment method: ${meta.paymentMethod}`, margin, y);
  y += 28;
  doc.setTextColor(...INK);
  doc.text("Thank you for keeping the chain.", margin, y);
  y += 14;
  doc.setTextColor(...BLUE);
  doc.text("momentum.app", margin, y);

  doc.save(`${invoiceNumber(invoice.id)}.pdf`);
}

export async function downloadCustomerInvoice(
  invoice: CustomerInvoice,
  meta: Omit<InvoiceMeta, "paymentMethod">,
) {
  if (!canDownloadInvoice(invoice)) {
    throw new Error("Invoice is not downloadable");
  }

  await downloadInvoice(toInvoiceDownload(invoice), {
    ...meta,
    paymentMethod: paymentMethodFromReceipt(invoice.receiptUrl),
  });
}