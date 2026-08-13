import Link from "next/link";

export default function FirstHabitPage() {
  return (
    <main className="wrap section">
      <h1>Add your first habit</h1>
      <p className="lede" style={{ marginTop: 12 }}>
        Setup comes next. For now, your account is ready.
      </p>
      <p style={{ marginTop: 24 }}>
        <Link href="/dashboard" className="btn btn-primary">
          Go to dashboard
        </Link>
      </p>
    </main>
  );
}
