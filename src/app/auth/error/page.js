import Link from "next/link";

export const metadata = {
  title: "Confirmation failed | Workout Progress Tracker",
};

export default function AuthErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 py-12 text-neutral-100">
      <section className="w-full max-w-md rounded-2xl border border-red-950 bg-neutral-900 p-6 text-center shadow-xl">
        <h1 className="text-3xl font-semibold tracking-tight">
          Confirmation failed
        </h1>

        <p className="mt-4 leading-7 text-neutral-400">
          The confirmation link is invalid or has expired.
          Request a new registration email or try creating
          the account again.
        </p>

        <Link
          href="/signup"
          className="mt-8 inline-block rounded-lg bg-neutral-100 px-5 py-3 font-semibold text-neutral-950 transition hover:bg-white"
        >
          Return to sign up
        </Link>
      </section>
    </main>
  );
}