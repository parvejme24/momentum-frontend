import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="wrap section">
      <h1>Dashboard</h1>
      <p className="lede" style={{ marginTop: 12 }}>
        You&apos;re signed in. Habit tracking comes next.
      </p>
      <p style={{ marginTop: 24 }}>
        <Link href="/" className="btn btn-ghost">
          Back home
        </Link>
      </p>
    </main>
  );
}
