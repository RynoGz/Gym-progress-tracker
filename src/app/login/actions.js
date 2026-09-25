"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function redirectWithError(message) {
  redirect(`/login?error=${encodeURIComponent(message)}`);
}

export async function signIn(formData) {
  const email = String(
    formData.get("email") ?? "",
  )
    .trim()
    .toLowerCase();

  const password = String(
    formData.get("password") ?? "",
  );

  if (!emailPattern.test(email)) {
    redirectWithError("Enter a valid email address.");
  }

  if (!password) {
    redirectWithError("Password is required.");
  }

  const supabase = await createClient();

  const { error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error) {
    console.error("Supabase sign-in failed:", {
      name: error.name,
      message: error.message,
      code: error.code,
      status: error.status,
    });

    redirectWithError(
      "The email address or password is incorrect.",
    );
  }

  redirect("/dashboard");
}