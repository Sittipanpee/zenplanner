/**
 * Auth Callback API
 * Handles OAuth callback from GitHub/LINE and creates user session
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const provider = requestUrl.searchParams.get("provider"); // "github" or "line"
    // Validate redirect target — only allow relative paths to prevent open redirect
    let next = requestUrl.searchParams.get("next") || "/dashboard";
    if (!next.startsWith("/") || next.startsWith("//")) {
      next = "/dashboard";
    }
    // Block any absolute URL smuggling
    try {
      const parsed = new URL(next, request.url);
      if (parsed.origin !== new URL(request.url).origin) {
        next = "/dashboard";
      }
    } catch {
      next = "/dashboard";
    }

    if (!code) {
      return NextResponse.redirect(new URL("/login?error=no_code", request.url));
    }

    const supabase = await createClient();

    if (provider === "github") {
      // GitHub OAuth exchange
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("GitHub auth error:", error);
        return NextResponse.redirect(new URL(`/login?error=${error.message}`, request.url));
      }

      // Create or update profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert(
            {
              id: data.user.id,
              display_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
              avatar_url: data.user.user_metadata?.avatar_url,
              created_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );

        if (profileError) {
          console.error("Profile upsert error:", profileError);
        }
      }
    } else if (provider === "line") {
      // LINE OAuth - exchange code for access token
      const lineClientId = process.env.LINE_CHANNEL_ID;
      const lineClientSecret = process.env.LINE_CHANNEL_SECRET;
      const lineRedirectUri = process.env.LINE_REDIRECT_URI || `${requestUrl.origin}/api/auth/callback?provider=line`;

      if (!lineClientId || !lineClientSecret) {
        return NextResponse.redirect(new URL("/login?error=line_not_configured", request.url));
      }

      // Exchange code for access token
      const tokenResponse = await fetch("https://api.line.me/oauth2/v2.1/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: lineRedirectUri,
          client_id: lineClientId,
          client_secret: lineClientSecret,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text();
        console.error("LINE token error:", errorData);
        return NextResponse.redirect(new URL("/login?error=line_token_failed", request.url));
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // Get LINE profile
      const profileResponse = await fetch("https://api.line.me/v2/profile", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!profileResponse.ok) {
        return NextResponse.redirect(new URL("/login?error=line_profile_failed", request.url));
      }

      const lineProfile = await profileResponse.json();

      // Check if user exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("line_user_id", lineProfile.userId)
        .single();

      if (existingProfile) {
        // Link existing profile with LINE (simplified - would need proper magic link in production)
        return NextResponse.redirect(new URL(`${next}?line_linked=true`, request.url));
      }

      // For demo: redirect with LINE info (in production, create Supabase user)
      // Store LINE info in cookies for client-side handling
      const cookieStore = await cookies();
      cookieStore.set("line_user_id", lineProfile.userId, { httpOnly: true, maxAge: 60 * 5 });
      cookieStore.set("line_display_name", lineProfile.displayName, { httpOnly: true, maxAge: 60 * 5 });
      cookieStore.set("line_picture_url", lineProfile.pictureUrl || "", { httpOnly: true, maxAge: 60 * 5 });

      return NextResponse.redirect(new URL(`${next}?line_auth=complete`, request.url));
    }

    // Successful auth - redirect to dashboard
    return NextResponse.redirect(new URL(next, request.url));
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(new URL("/login?error=unknown", request.url));
  }
}
