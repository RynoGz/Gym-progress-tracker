import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import PredefinedExercisePicker from "./PredefinedExercisePicker";

import {
  archiveExercise,
  createExercise,
  restoreExercise,
} from "./actions";

export const metadata = {
  title: "Exercises | Workout Progress Tracker",
};

function ExerciseList({
  exercises,
  type,
}) {
  if (exercises.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-neutral-800 px-4 py-8 text-center text-sm text-neutral-500">
        No exercises found.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-neutral-800 overflow-hidden rounded-xl border border-neutral-800">
      {exercises.map((exercise) => (
        <li
          key={exercise.id}
          className="flex items-center justify-between gap-4 bg-neutral-900 px-4 py-3"
        >
          <div className="min-w-0">
            <p className="truncate font-medium">
              {exercise.name}
            </p>

            <p className="mt-1 text-xs text-neutral-500">
              {type === "predefined"
                ? "Predefined exercise"
                : type === "archived"
                  ? "Archived custom exercise"
                  : "Custom exercise"}
            </p>
          </div>

          {type === "custom" ? (
            <form action={archiveExercise}>
              <input
                type="hidden"
                name="exerciseId"
                value={exercise.id}
              />

              <button
                type="submit"
                className="rounded-lg border border-neutral-700 px-3 py-2 text-sm text-neutral-300 transition hover:border-red-800 hover:bg-red-950/40 hover:text-red-200"
              >
                Archive
              </button>
            </form>
          ) : null}

          {type === "archived" ? (
            <form action={restoreExercise}>
              <input
                type="hidden"
                name="exerciseId"
                value={exercise.id}
              />

              <button
                type="submit"
                className="rounded-lg border border-neutral-700 px-3 py-2 text-sm text-neutral-300 transition hover:border-emerald-800 hover:bg-emerald-950/40 hover:text-emerald-200"
              >
                Restore
              </button>
            </form>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export default async function ExercisesPage({
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
    data: exerciseData,
    error: exerciseError,
  } = await supabase
    .from("exercises")
    .select(
      "id, owner_id, name, archived_at, created_at",
    )
    .order("name", {
      ascending: true,
    });

  if (exerciseError) {
    console.error("Exercise loading failed:", {
      message: exerciseError.message,
      code: exerciseError.code,
    });

    throw new Error(
      "The exercise library could not be loaded.",
    );
  }

  const exercises = exerciseData ?? [];


  const predefinedExercises =
    exercises.filter(
      (exercise) => exercise.owner_id === null,
    );

  const customExercises =
    exercises.filter(
      (exercise) =>
        exercise.owner_id === user.id &&
        exercise.archived_at === null,
    );

  const archivedExercises =
    exercises.filter(
      (exercise) =>
        exercise.owner_id === user.id &&
        exercise.archived_at !== null,
    );

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-12 text-neutral-100">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard"
          className="text-sm text-neutral-400 transition hover:text-neutral-200"
        >
          ← Return to dashboard
        </Link>

        <header className="mt-6">
          <p className="text-sm font-medium text-emerald-400">
            Exercise library
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Manage exercises
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">
            Predefined exercises are available to every
            account. Custom exercises are private to your
            account and can be archived when no longer
            needed.
          </p>
        </header>

        {success ? (
          <div
            role="status"
            className="mt-6 rounded-lg border border-emerald-900 bg-emerald-950/50 px-4 py-3 text-sm text-emerald-200"
          >
            {success}
          </div>
        ) : null}

        {error ? (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-200"
          >
            {error}
          </div>
        ) : null}

        <section className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <h2 className="text-xl font-semibold">
            Add a custom exercise
          </h2>

          <p className="mt-2 text-sm text-neutral-400">
            Custom exercises can only be seen by your
            account.
          </p>

          <form
            action={createExercise}
            className="mt-5 flex flex-col gap-3 sm:flex-row"
          >
            <label
              htmlFor="exerciseName"
              className="sr-only"
            >
              Exercise name
            </label>

            <input
              id="exerciseName"
              name="name"
              type="text"
              placeholder="Exercise name"
              required
              className="min-w-0 flex-1 rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none transition placeholder:text-neutral-600 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-700"
            />

            <button
              type="submit"
              className="rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-neutral-950 transition hover:bg-emerald-400"
            >
              Add exercise
            </button>
          </form>
        </section>

    

        <div className="mt-10 space-y-12">
          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">
                  Your custom exercises
                </h2>

                <p className="mt-1 text-sm text-neutral-500">
                  {customExercises.length} shown
                </p>
              </div>
            </div>

            <ExerciseList
              exercises={customExercises}
              type="custom"
            />
          </section>

          <section>
  <div className="mb-4">
    <h2 className="text-xl font-semibold">
      Predefined exercises
    </h2>

    <p className="mt-1 text-sm text-neutral-500">
      {predefinedExercises.length} exercises available
    </p>
  </div>

  <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
    <PredefinedExercisePicker
      exercises={predefinedExercises}
    />
  </div>
</section>

          <section>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">
                Archived custom exercises
              </h2>

              <p className="mt-1 text-sm text-neutral-500">
                {archivedExercises.length} shown
              </p>
            </div>

            <ExerciseList
              exercises={archivedExercises}
              type="archived"
            />
          </section>
        </div>
      </div>
    </main>
  );
}