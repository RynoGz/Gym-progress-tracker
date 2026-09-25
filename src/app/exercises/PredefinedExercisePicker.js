"use client";

import { useMemo, useState } from "react";

export default function PredefinedExercisePicker({
  exercises,
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] =
    useState(null);

  const filteredExercises = useMemo(() => {
    const normalizedQuery = query
      .trim()
      .toLocaleLowerCase();

    if (!normalizedQuery) {
      return exercises;
    }

    return exercises.filter((exercise) =>
      exercise.name
        .toLocaleLowerCase()
        .includes(normalizedQuery),
    );
  }, [exercises, query]);

  function handleQueryChange(event) {
    setQuery(event.target.value);
    setSelectedExercise(null);
    setIsOpen(true);
  }

  function handleSelect(exercise) {
    setQuery(exercise.name);
    setSelectedExercise(exercise);
    setIsOpen(false);
  }

  function handleClear() {
    setQuery("");
    setSelectedExercise(null);
    setIsOpen(true);
  }

  return (
    <div>
      <div className="relative">
        <label
          htmlFor="predefinedExerciseSearch"
          className="mb-2 block text-sm font-medium"
        >
          Find a predefined exercise
        </label>

        <div className="relative">
          <input
            id="predefinedExerciseSearch"
            type="search"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={isOpen}
            aria-controls="predefined-exercise-options"
            value={query}
            placeholder="Search by exercise name"
            autoComplete="off"
            onChange={handleQueryChange}
            onFocus={() => setIsOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setIsOpen(false);
              }
            }}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-3 pr-20 outline-none transition placeholder:text-neutral-600 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-700"
          />

          {query ? (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-sm text-neutral-400 transition hover:text-neutral-100"
            >
              Clear
            </button>
          ) : null}
        </div>

        {isOpen ? (
          <div
            id="predefined-exercise-options"
            role="listbox"
            className="absolute z-20 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-neutral-700 bg-neutral-900 p-1 shadow-2xl"
          >
            {filteredExercises.length > 0 ? (
              filteredExercises.map((exercise) => (
                <button
                  key={exercise.id}
                  type="button"
                  role="option"
                  aria-selected={
                    selectedExercise?.id === exercise.id
                  }
                  onClick={() =>
                    handleSelect(exercise)
                  }
                  className="block w-full rounded-lg px-4 py-3 text-left text-sm transition hover:bg-neutral-800 focus:bg-neutral-800 focus:outline-none"
                >
                  {exercise.name}
                </button>
              ))
            ) : (
              <p className="px-4 py-6 text-center text-sm text-neutral-500">
                No predefined exercises match your
                search.
              </p>
            )}

            <div className="sticky bottom-0 border-t border-neutral-800 bg-neutral-900 p-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full rounded-lg px-3 py-2 text-sm text-neutral-400 transition hover:bg-neutral-800 hover:text-neutral-200"
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {selectedExercise ? (
        <div className="mt-4 rounded-lg border border-emerald-900 bg-emerald-950/30 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-500">
            Selected exercise
          </p>

          <p className="mt-1 font-medium text-emerald-100">
            {selectedExercise.name}
          </p>
        </div>
      ) : null}
    </div>
  );
}