import Link from "next/link";
import { Sparkles } from "lucide-react";

export function AiUpgradePrompt({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`card ai-panel${compact ? " ai-panel-compact" : ""}`}>
      <div className="ai-panel-head">
        <Sparkles size={16} strokeWidth={2.4} aria-hidden />
        <h2 className="section-title">AI coach</h2>
        <span className="chip chip-flame">Pro</span>
      </div>
      <p className="hint ai-panel-copy">
        Get habit ideas, daily suggestions, and personal check-in messages on Pro.
      </p>
      <div className="ai-panel-actions">
        <Link href="/pricing" className="btn btn-primary btn-sm">
          View plans
        </Link>
        <Link href="/subscription" className="btn btn-ghost btn-sm">
          Subscription
        </Link>
      </div>
    </section>
  );
}
