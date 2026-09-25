import Link from "next/link";

import { signIn } from "./actions";

export const metadata = {
  title: "Sign in | Workout Progress Tracker",
};

export default async function LoginPage({
  searchParams,
}) {
  const params = await searchParams;

  const error =
    typeof params?.error === "string"
      ? params.error
      : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 py-12 text-neutral-100">
      <section className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-neutral-400">
            Workout Progress Tracker
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Sign in
          </h1>

          <p className="mt-3 text-sm leading-6 text-neutral-400">
            Sign in to manage your workout templates and
            training history.
          </p>
        </div>

        {error ? (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-200"
          >
            {error}
          </div>
        ) : null}

        <form action={signIn} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium"
            >
              Email address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-3 text-base outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-700"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-3 text-base outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-700"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-neutral-950 transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-neutral-900"
          >
            Sign in
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-400">
          Need an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-neutral-200 underline-offset-4 hover:underline"
          >
            Create one
          </Link>
        </p>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-neutral-300 underline-offset-4 hover:underline"
          >
            Return home
          </Link>
        </div>
      </section>
    </main>
  );
}