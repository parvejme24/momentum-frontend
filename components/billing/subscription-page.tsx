"use client";

import { useMemo, useState } from "react";
import { Check, Download } from "lucide-react";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";

import {
  canDownloadInvoice,
  downloadInvoice,
} from "@/components/billing/download-invoice";
import { useToast } from "@/components/auth/toast";
import {
  CURRENT_SUBSCRIPTION,
  INVOICES,
  PLANS,
  type PlanId,
} from "@/components/billing/subscription-data";
import { fadeUpSoft, staggerContainer } from "@/components/home/motion";
import { ConfirmSheet } from "@/components/settings/confirm-sheet";
import { useAuth } from "@/lib/auth/context";

export function SubscriptionPage() {
  const reduce = useReducedMotion();
  const { pushToast } = useToast();
  const { user } = useAuth();

  const [planId, setPlanId] = useState<PlanId>(CURRENT_SUBSCRIPTION.planId);
  const [cancelOpen, setCancelOpen] = useState(false);

  const current = useMemo(
    () => PLANS.find((p) => p.id === planId) ?? PLANS[1],
    [planId],
  );

  const billingEmail =
    user?.email?.trim() || CURRENT_SUBSCRIPTION.billingEmail;
  const billingName = user?.name?.trim() || "Momentum member";

  function handleDownloadInvoice(invoice: (typeof INVOICES)[number]) {
    if (!canDownloadInvoice(invoice)) {
      pushToast(
        invoice.status === "upcoming"
          ? "Invoice not issued yet"
          : "Download unavailable for this invoice",
      );
      return;
    }
    downloadInvoice(invoice, {
      name: billingName,
      email: billingEmail,
      paymentMethod: CURRENT_SUBSCRIPTION.paymentMethod,
    });
    pushToast(`Downloaded ${invoice.label}`);
  }

  function choosePlan(id: PlanId) {
    if (id === planId) {
      pushToast(`You’re already on ${PLANS.find((p) => p.id === id)?.name}`);
      return;
    }
    setPlanId(id);
    pushToast(
      id === "free"
        ? "Moved to Free — Pro features pause at period end"
        : `Switched to ${PLANS.find((p) => p.id === id)?.name}`,
    );
  }

  function confirmCancel() {
    setPlanId("free");
    setCancelOpen(false);
    pushToast("Subscription cancelled — stays Pro until renew date");
  }

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className="subscription-page"
        initial={reduce ? false : "hidden"}
        animate="show"
        variants={reduce ? undefined : staggerContainer}
      >
        <motion.header
          className="page-head"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <p className="eyebrow">Billing</p>
          <h1>Subscription</h1>
          <p className="lede" style={{ marginTop: 10, maxWidth: "48ch" }}>
            One plan, one renewal date — keep the year chain without surprise
            invoices.
          </p>
        </motion.header>

        <motion.section
          className="card subscription-current"
          aria-labelledby="current-plan-heading"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <div className="panel-head">
            <div>
              <h2 id="current-plan-heading" className="section-title">
                Current plan
              </h2>
              <p className="hint" style={{ marginTop: 4 }}>
                {CURRENT_SUBSCRIPTION.status === "active"
                  ? "Active · renews automatically"
                  : "Inactive"}
              </p>
            </div>
            <span className="chip chip-blue">{current.name}</span>
          </div>

          <div className="subscription-current-grid">
            <div>
              <div className="stat-k">Price</div>
              <div className="subscription-price mono">
                {current.price}
                <span className="subscription-period">{current.period}</span>
              </div>
            </div>
            <div>
              <div className="stat-k">Renews</div>
              <div className="mono subscription-meta-value">
                {CURRENT_SUBSCRIPTION.renewsOn}
              </div>
            </div>
            <div>
              <div className="stat-k">Payment</div>
              <div className="mono subscription-meta-value">
                {CURRENT_SUBSCRIPTION.paymentMethod}
              </div>
            </div>
            <div>
              <div className="stat-k">Receipts to</div>
              <div className="mono subscription-meta-value">{billingEmail}</div>
            </div>
          </div>

          <div className="settings-actions" style={{ marginTop: 18 }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => pushToast("Payment method sheet comes next")}
            >
              Update card
            </button>
            {planId !== "free" ? (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => setCancelOpen(true)}
              >
                Cancel plan
              </button>
            ) : null}
          </div>
        </motion.section>

        <motion.section
          className="subscription-plans"
          aria-labelledby="plans-heading"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <div className="panel-head" style={{ borderBottom: 0, marginBottom: 14, paddingBottom: 0 }}>
            <h2 id="plans-heading" className="section-title">
              Plans
            </h2>
          </div>
          <div className="subscription-plan-grid">
            {PLANS.map((plan) => {
              const selected = plan.id === planId;
              return (
                <article
                  key={plan.id}
                  className={
                    selected
                      ? "card subscription-plan selected"
                      : plan.highlighted
                        ? "card subscription-plan featured"
                        : "card subscription-plan"
                  }
                >
                  <div className="subscription-plan-top">
                    <h3 className="section-title">{plan.name}</h3>
                    {selected ? (
                      <span className="chip chip-blue">Current</span>
                    ) : plan.highlighted ? (
                      <span className="chip chip-flame">Popular</span>
                    ) : null}
                  </div>
                  <p className="subscription-plan-price mono">
                    {plan.price}
                    <span className="subscription-period">{plan.period}</span>
                  </p>
                  <p className="hint" style={{ marginTop: 8 }}>
                    {plan.blurb}
                  </p>
                  <ul className="subscription-features">
                    {plan.features.map((feature) => (
                      <li key={feature}>
                        <Check size={15} strokeWidth={2.6} aria-hidden />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className={
                      selected
                        ? "btn btn-ghost btn-block"
                        : plan.highlighted
                          ? "btn btn-primary btn-block"
                          : "btn btn-block"
                    }
                    disabled={selected}
                    onClick={() => choosePlan(plan.id)}
                  >
                    {selected
                      ? "Current plan"
                      : plan.id === "free"
                        ? "Downgrade to Free"
                        : `Choose ${plan.name}`}
                  </button>
                </article>
              );
            })}
          </div>
        </motion.section>

        <motion.section
          className="card"
          aria-labelledby="invoices-heading"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <div className="panel-head">
            <h2 id="invoices-heading" className="section-title">
              Invoices
            </h2>
          </div>
          <ul className="invoice-list">
            {INVOICES.map((invoice) => {
              const downloadable = canDownloadInvoice(invoice);
              return (
                <li key={invoice.id} className="invoice-row">
                  <div className="invoice-copy">
                    <div className="invoice-label">{invoice.label}</div>
                    <div className="invoice-date mono">{invoice.date}</div>
                  </div>
                  <span className="mono invoice-amount">{invoice.amount}</span>
                  <span
                    className={
                      invoice.status === "paid"
                        ? "chip chip-blue"
                        : invoice.status === "upcoming"
                          ? "chip chip-quiet"
                          : "chip chip-flame"
                    }
                  >
                    {invoice.status}
                  </span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm invoice-download"
                    disabled={!downloadable}
                    aria-label={
                      downloadable
                        ? `Download invoice for ${invoice.label}`
                        : `Invoice for ${invoice.label} not ready`
                    }
                    title={downloadable ? "Download invoice" : "Not ready yet"}
                    onClick={() => handleDownloadInvoice(invoice)}
                  >
                    <Download size={14} strokeWidth={2.4} aria-hidden />
                    Download
                  </button>
                </li>
              );
            })}
          </ul>
        </motion.section>

        <ConfirmSheet
          open={cancelOpen}
          onClose={() => setCancelOpen(false)}
          title="Cancel Pro?"
        >
          <p className="hint" style={{ marginTop: 10, lineHeight: 1.55 }}>
            You keep Pro until {CURRENT_SUBSCRIPTION.renewsOn}. After that the
            year chain stays read-only on Free until you upgrade again.
          </p>
          <div className="settings-actions" style={{ marginTop: 22 }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setCancelOpen(false)}
            >
              Keep Pro
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={confirmCancel}
            >
              Cancel plan
            </button>
          </div>
        </ConfirmSheet>
      </motion.div>
    </MotionConfig>
  );
}
