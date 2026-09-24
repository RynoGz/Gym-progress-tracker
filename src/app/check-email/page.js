import Link from "next/link";

export const metadata = {
  title: "Check your email | Workout Progress Tracker",
};

export default function CheckEmailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 py-12 text-neutral-100">
      <section className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-center shadow-xl">
        <h1 className="text-3xl font-semibold tracking-tight">
          Check your email
        </h1>

        <p className="mt-4 leading-7 text-neutral-400">
          If registration was successful, you will recieve a confirmation link. Open the link to
          activate your account.
        </p>

        <p className="mt-4 text-sm leading-6 text-neutral-500">
          Delivery may take a few moments. Also check your
          spam folder.
        </p>

        <Link
          href="/"
          className="mt-8 inline-block text-sm text-neutral-300 underline-offset-4 hover:underline"
        >
          Return home
        </Link>
      </section>
    </main>
  );
}