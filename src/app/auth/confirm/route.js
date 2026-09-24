import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const tokenHash =
    requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");

  if (tokenHash && type === "email") {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (!error) {
      return NextResponse.redirect(
        new URL("/auth/confirmed", request.url),
      );
    }
  }

  return NextResponse.redirect(
    new URL("/auth/error", request.url),
  );
}