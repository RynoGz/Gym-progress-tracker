import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { signOut } from "./actions";

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

          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg border border-neutral-700 px-4 py-2 text-sm font-medium transition hover:border-neutral-500 hover:bg-neutral-900"
            >
              Sign out
            </button>
          </form>
        </header>

        <section className="py-10">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold">
              Workout templates
            </h2>

            <p className="mt-2 text-neutral-400">
              Template management will be added next.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}