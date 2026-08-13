export type FaqItem = {
  q: string;
  a: string;
};

export type FaqGroup = {
  id: string;
  title: string;
  blurb: string;
  items: FaqItem[];
};

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: "getting-started",
    title: "Getting started",
    blurb: "Create a logbook, add a habit, mark the first square.",
    items: [
      {
        q: "What is Momentum?",
        a: "A habit logbook. You mark a day when you show up — one square per day — and the year chain makes consistency visible on laptop or phone.",
      },
      {
        q: "Do I need a credit card to start?",
        a: "No. Free is a real plan. New accounts also get fourteen days of Pro so you can try the full year chain before choosing.",
      },
      {
        q: "How do I add my first habit?",
        a: "After you register, open New habit. Name it, pick a schedule, optionally set a quantity and reminder, then save. It appears on Today when it’s due.",
      },
      {
        q: "Can I use Momentum on phone and laptop?",
        a: "Yes. Same account, same chain. Mark a square at the desk or on the train — history stays one.",
      },
    ],
  },
  {
    id: "streaks",
    title: "Streaks & the chain",
    blurb: "How rest, skips, and missed days count.",
    items: [
      {
        q: "Do planned rest days break my streak?",
        a: "No. Rest days you schedule don’t break the chain. Only missed due days do — same rules on every plan.",
      },
      {
        q: "What’s the difference between skip and miss?",
        a: "Skip is intentional — you mark the day as skipped on purpose. A miss is a due day you didn’t mark. Skips are recorded without pretending you were there.",
      },
      {
        q: "What does the year chain show?",
        a: "The last 364 days for one habit. Blue intensity deepens with stronger days; today has a flame border; skipped days are hatched. Hover a cell for the date.",
      },
      {
        q: "Can I restore an archived habit?",
        a: "Yes. Archive leaves the daily list but keeps history. Open Archive in the app (or Habits → View all) and restore anytime. Delete from Archive removes it forever.",
      },
    ],
  },
  {
    id: "billing",
    title: "Plans & billing",
    blurb: "Free, Pro, Team — trials, upgrades, invoices.",
    items: [
      {
        q: "Can I stay on Free forever?",
        a: "Yes. Free is a real plan — three habits, ninety-day heatmaps, and CSV export. No card required to start.",
      },
      {
        q: "What happens if I downgrade to Free?",
        a: "Your history stays. The full year chain becomes read-only until you upgrade again. Nothing is deleted.",
      },
      {
        q: "Can I switch plans later?",
        a: "Anytime from Settings → Subscription, or the Subscription page in the app. Upgrades apply immediately; downgrades take effect at the next renewal.",
      },
      {
        q: "Is there a trial for Pro?",
        a: "New accounts get fourteen days of Pro on us. After that, pick Free or keep Pro at $6/month.",
      },
      {
        q: "Where do I download invoices?",
        a: "Open Subscription in the app. Paid invoices have a Download button — you get a plain-text receipt with amount, date, and billing details.",
      },
    ],
  },
  {
    id: "account",
    title: "Account & data",
    blurb: "Timezone, export, devices, and leaving.",
    items: [
      {
        q: "What happens if I change my timezone?",
        a: "Days already logged keep their original date. New marks and reminders use the new zone. Update it under Settings.",
      },
      {
        q: "Can I export my data?",
        a: "Yes. Settings → Your data offers JSON and CSV. Free includes CSV; Pro and Team also include JSON.",
      },
      {
        q: "How do I sign out another device?",
        a: "Settings → Devices lists signed-in sessions. Remove any device that isn’t the one you’re on.",
      },
      {
        q: "How do I delete my account?",
        a: "Settings → Delete account. Export first if you want a copy. Deletion removes habits and history and can’t be undone.",
      },
    ],
  },
];

/** Short subset reused on the public pricing page. */
export const PRICING_FAQ = FAQ_GROUPS.find((g) => g.id === "billing")!.items.slice(
  0,
  5,
);
