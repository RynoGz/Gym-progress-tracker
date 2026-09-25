import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { updateProfile } from "./actions";

export const metadata = {
  title: "Profile | Workout Progress Tracker",
};

export default async function ProfilePage({
  searchParams,
}) {
  const params = await searchParams;

  const success =
    typeof params?.success === "string"
      ? params.success
      : null;

  const error =
    typeof params?.error === "string"
      ? params.error
      : null;

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
      <div className="mx-auto max-w-xl">
        <Link
          href="/dashboard"
          className="text-sm text-neutral-400 transition hover:text-neutral-200"
        >
          ← Return to dashboard
        </Link>

        <section className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-xl">
          <div className="mb-8">
            <p className="text-sm font-medium text-emerald-400">
              Account settings
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Your profile
            </h1>

            <p className="mt-3 text-sm leading-6 text-neutral-400">
              Update the name displayed throughout the
              application.
            </p>
          </div>

          {success ? (
            <div
              role="status"
              className="mb-6 rounded-lg border border-emerald-900 bg-emerald-950/50 px-4 py-3 text-sm text-emerald-200"
            >
              {success}
            </div>
          ) : null}

          {error ? (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-200"
            >
              {error}
            </div>
          ) : null}

          <form
            action={updateProfile}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="displayName"
                className="mb-2 block text-sm font-medium"
              >
                Display name
              </label>

              <input
                id="displayName"
                name="displayName"
                type="text"
                autoComplete="name"
                defaultValue={profile.display_name}
                required
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-3 text-base outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-700"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                value={user.email ?? ""}
                readOnly
                className="w-full cursor-not-allowed rounded-lg border border-neutral-800 bg-neutral-950/50 px-4 py-3 text-base text-neutral-500"
              />

              <p className="mt-2 text-xs leading-5 text-neutral-500">
                Email changes are not available yet.
              </p>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-neutral-950 transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-neutral-900"
            >
              Save profile
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}