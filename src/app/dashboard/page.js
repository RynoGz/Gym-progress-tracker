import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { signOut } from "./actions";

import Link from "next/link";



export const metadata = {
  title: "Dashboard | Workout Progress Tracker",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    throw new Error(
      "Your profile could not be loaded.",
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-12 text-neutral-100">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col gap-6 border-b border-neutral-800 pb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-400">
              Workout Progress Tracker
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Welcome, {profile.display_name}
            </h1>

            <p className="mt-2 text-sm text-neutral-400">
              {user.email}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="rounded-lg border border-neutral-700 px-4 py-2 text-sm font-medium transition hover:border-neutral-500 hover:bg-neutral-900"
            >
              Profile
            </Link>

          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg border border-neutral-700 px-4 py-2 text-sm font-medium transition hover:border-neutral-500 hover:bg-neutral-900"
            >
              Sign out
            </button>
          </form>
          </div>
        </header>

        <section className="grid gap-6 py-10 md:grid-cols-2">
          <Link
            href="/exercises"
            className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 transition hover:border-neutral-600"
          >
            <p className="text-sm font-medium text-emerald-400">
              Exercise library
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Manage exercises
            </h2>

            <p className="mt-2 text-neutral-400">
              Browse predefined exercises and manage your
              private custom exercises.
            </p>
          </Link>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <p className="text-sm font-medium text-neutral-500">
              Coming next
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Workout templates
            </h2>

            <p className="mt-2 text-neutral-400">
              Create and organize reusable workout templates.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}