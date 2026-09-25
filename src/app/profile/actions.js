"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function redirectWithMessage(type, message) {
  redirect(
    `/profile?${type}=${encodeURIComponent(message)}`,
  );
}

export async function updateProfile(formData) {
  const displayName = String(
    formData.get("displayName") ?? "",
  ).trim();

  if (!displayName) {
    redirectWithMessage(
      "error",
      "Display name is required.",
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const {
    data: updatedProfile,
    error: updateError,
  } = await supabase
    .from("profiles")
    .update({
      display_name: displayName,
    })
    .eq("id", user.id)
    .select("id")
    .single();

  if (updateError || !updatedProfile) {
    console.error("Profile update failed:", {
      message: updateError?.message,
      code: updateError?.code,
    });

    redirectWithMessage(
      "error",
      "Your profile could not be updated.",
    );
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard");

  redirectWithMessage(
    "success",
    "Display name updated.",
  );
}