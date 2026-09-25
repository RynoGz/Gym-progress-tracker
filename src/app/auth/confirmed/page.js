import Link from "next/link";

export const metadata = {
  title: "Email confirmed | Workout Progress Tracker",
};

export default function ConfirmedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 py-12 text-neutral-100">
      <section className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-center shadow-xl">
        <h1 className="text-3xl font-semibold tracking-tight">
          Email confirmed
        </h1>

        <p className="mt-4 leading-7 text-neutral-400">
           Your email address has been confirmed. You can now
           sign in to your account.
        </p>

        <Link
          href="/login"
          className="mt-8 inline-block rounded-lg bg-neutral-100 px-5 py-3 font-semibold text-neutral-950 transition hover:bg-white"
        >
          Continue to sign in
        </Link>
      </section>
    </main>
  );
}