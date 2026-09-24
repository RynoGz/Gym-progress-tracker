import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-zinc-100">
      <section className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center shadow-xl">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-emerald-400">
          Workout Progress Tracker
        </p>

        <h1 className="text-3xl font-bold tracking-tight">
          Track your training progress
        </h1>

        <p className="mt-4 text-zinc-400">
          Create workout templates, record your sessions, and follow your
          progress over time.
        </p>

        <Link
          href="/signup"
          className="mt-8 inline-flex rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-zinc-950 transition hover:bg-emerald-400"
        >
          Create an account
        </Link>
      </section>
    </main>
  );
}