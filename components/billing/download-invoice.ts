import type { Invoice } from "@/components/billing/subscription-data";

type InvoiceMeta = {
  name: string;
  email: string;
  paymentMethod: string;
};

function invoiceNumber(id: string) {
  return id.replace(/^inv-/, "MOM-2026-").toUpperCase();
}

function buildInvoiceText(invoice: Invoice, meta: InvoiceMeta) {
  return [
    "MOMENTUM — INVOICE",
    "================================",
    "",
    `Invoice: ${invoiceNumber(invoice.id)}`,
    `Date: ${invoice.date}`,
    `Status: ${invoice.status.toUpperCase()}`,
    "",
    "Bill to",
    meta.name,
    meta.email,
    "",
    "Line items",
    "--------------------------------",
    `${invoice.label}`.padEnd(28) + invoice.amount,
    "--------------------------------",
    `Total`.padEnd(28) + invoice.amount,
    "",
    `Payment method: ${meta.paymentMethod}`,
    "",
    "Thank you for keeping the chain.",
    "https://momentum.app",
  ].join("\n");
}

export function downloadInvoice(invoice: Invoice, meta: InvoiceMeta) {
  const content = buildInvoiceText(invoice, meta);
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${invoice.id}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

export function canDownloadInvoice(invoice: Invoice) {
  return invoice.status === "paid";
}
