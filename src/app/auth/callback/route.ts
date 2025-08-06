import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (code) {
    try {
      await supabase.auth.exchangeCodeForSession(code);
    } catch (error) {
      console.error("Error exchanging code for session:", error);
      // You might want to handle this error more gracefully
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL("/", req.url));
}