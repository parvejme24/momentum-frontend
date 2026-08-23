import { ChevronDown } from "lucide-react";

import type { FaqItem } from "@/components/marketing/faq-data";

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <div className="faq-accordion-list">
      {items.map((item) => (
        <details key={item.q} className="faq-accordion card">
          <summary className="faq-accordion-trigger">
            <span className="faq-accordion-q">{item.q}</span>
            <ChevronDown
              className="faq-accordion-icon"
              size={18}
              strokeWidth={2.4}
              aria-hidden
            />
          </summary>
          <div className="faq-accordion-panel">
            <p className="muted">{item.a}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
