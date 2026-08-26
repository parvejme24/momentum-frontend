import Link from "next/link";
import { Sparkles } from "lucide-react";

import { buttons, card, chip, chipFlame, hint, sectionTitle } from "@/lib/ui";
import { cn } from "@/lib/utils";

export function AiUpgradePrompt({
  compact = false,
  embedded = false,
}: {
  compact?: boolean;
  embedded?: boolean;
}) {
  return (
    <section
      className={cn(
        !embedded && card,
        !embedded && (compact ? "mb-[18px] mt-0" : "mt-[18px]"),
        embedded && "bg-transparent p-3.5 shadow-none",
      )}
    >
      <div className="mb-3 flex items-center gap-2.5">
        <Sparkles size={16} strokeWidth={2.4} aria-hidden />
        <h2 className={cn(sectionTitle, "flex-1")}>AI coach</h2>
        <span className={cn(chip, chipFlame)}>Pro</span>
      </div>
      <p className={cn(hint, "mb-3.5 mt-0 leading-[1.55]")}>
        Get habit ideas, daily suggestions, and personal check-in messages on Pro.
      </p>
      <div className="flex flex-wrap gap-2.5">
        <Link href="/pricing" className={buttons("primary", "sm")}>
          View plans
        </Link>
        <Link href="/subscription" className={buttons("ghost", "sm")}>
          Subscription
        </Link>
      </div>
    </section>
  );
}
