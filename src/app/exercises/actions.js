"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function redirectWithMessage(type, message) {
  redirect(
    `/exercises?${type}=${encodeURIComponent(message)}`,
  );
}

async function getAuthenticatedClient() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return {
    supabase,
    user,
  };
}

export async function createExercise(formData) {
  const name = String(
    formData.get("name") ?? "",
  ).trim();

  if (!name) {
    redirectWithMessage(
      "error",
      "Exercise name is required.",
    );
  }

  const { supabase } =
    await getAuthenticatedClient();

  const {
    data: exercise,
    error,
  } = await supabase
    .from("exercises")
    .insert({
      name,
    })
    .select("id")
    .single();

  if (error || !exercise) {
    console.error("Exercise creation failed:", {
      message: error?.message,
      code: error?.code,
    });

    redirectWithMessage(
      "error",
      "The custom exercise could not be created.",
    );
  }

  revalidatePath("/exercises");

  redirectWithMessage(
    "success",
    "Custom exercise created.",
  );
}

export async function archiveExercise(formData) {
  const exerciseId = String(
    formData.get("exerciseId") ?? "",
  ).trim();

  if (!exerciseId) {
    redirectWithMessage(
      "error",
      "Exercise ID is missing.",
    );
  }

  const { supabase, user } =
    await getAuthenticatedClient();

  const {
    data: exercise,
    error,
  } = await supabase
    .from("exercises")
    .update({
      archived_at: new Date().toISOString(),
    })
    .eq("id", exerciseId)
    .eq("owner_id", user.id)
    .select("id")
    .single();

  if (error || !exercise) {
    console.error("Exercise archive failed:", {
      message: error?.message,
      code: error?.code,
    });

    redirectWithMessage(
      "error",
      "The exercise could not be archived.",
    );
  }

  revalidatePath("/exercises");

  redirectWithMessage(
    "success",
    "Custom exercise archived.",
  );
}

export async function restoreExercise(formData) {
  const exerciseId = String(
    formData.get("exerciseId") ?? "",
  ).trim();

  if (!exerciseId) {
    redirectWithMessage(
      "error",
      "Exercise ID is missing.",
    );
  }

  const { supabase, user } =
    await getAuthenticatedClient();

  const {
    data: exercise,
    error,
  } = await supabase
    .from("exercises")
    .update({
      archived_at: null,
    })
    .eq("id", exerciseId)
    .eq("owner_id", user.id)
    .select("id")
    .single();

  if (error || !exercise) {
    console.error("Exercise restoration failed:", {
      message: error?.message,
      code: error?.code,
    });

    redirectWithMessage(
      "error",
      "The exercise could not be restored.",
    );
  }

  revalidatePath("/exercises");

  redirectWithMessage(
    "success",
    "Custom exercise restored.",
  );
}