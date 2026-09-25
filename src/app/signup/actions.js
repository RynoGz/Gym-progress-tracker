"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function redirectWithError(message) {
  redirect(
    `/signup?error=${encodeURIComponent(message)}`,
  );
}

export async function signUp(formData) {
  const displayName = String(
    formData.get("displayName") ?? "",
  ).trim();

  const email = String(
    formData.get("email") ?? "",
  )
    .trim()
    .toLowerCase();

  const password = String(
    formData.get("password") ?? "",
  );

  if (!displayName) {
    redirectWithError("Display name is required.");
  }

  if (!emailPattern.test(email)) {
    redirectWithError("Enter a valid email address.");
  }

  if (!password) {
    redirectWithError("Password is required.");
  }

  const supabase = await createClient();

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
      emailRedirectTo: `${siteUrl}/auth/confirmed`,
    },
  });

  if (error) {
  console.error("Supabase signup failed:", {
    name: error.name,
    message: error.message,
    code: error.code,
    status: error.status,
  });

  redirectWithError(
    "The account could not be created. Check your details and try again."
  );
}

  redirect("/check-email");
}