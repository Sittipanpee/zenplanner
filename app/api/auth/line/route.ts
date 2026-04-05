/**
 * LINE Auth Bridge API
 * Handles LINE LIFF authentication — creates a real Supabase session
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { lineAccessToken } = await request.json();

    if (!lineAccessToken) {
      return NextResponse.json({ error: "Missing lineAccessToken" }, { status: 400 });
    }

    // Verify LINE token and get profile
    const lineProfileRes = await fetch("https://api.line.me/v2/profile", {
      headers: { Authorization: `Bearer ${lineAccessToken}` },
    });

    if (!lineProfileRes.ok) {
      return NextResponse.json({ error: "Invalid LINE token" }, { status: 401 });
    }

    const lineProfile = await lineProfileRes.json();
    const lineUserId: string = lineProfile.userId;

    // Create Supabase Admin client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const deterministicEmail = `line_${lineUserId}@line.zenplanner.internal`;
    const salt = process.env.LINE_AUTH_SALT || "zenplanner";
    const deterministicPassword = `line_${lineUserId}_${salt}`;

    // Try to create user (will fail with 422 if exists)
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: deterministicEmail,
      password: deterministicPassword,
      email_confirm: true,
      user_metadata: {
        display_name: lineProfile.displayName,
        full_name: lineProfile.displayName,
        avatar_url: lineProfile.pictureUrl,
        line_user_id: lineUserId,
        provider: "line",
      },
    });

    // If user already exists, update their metadata
    if (createError && createError.message?.includes("already been registered")) {
      const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = listData?.users?.find((u) => u.email === deterministicEmail);
      if (existingUser) {
        await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
          user_metadata: {
            display_name: lineProfile.displayName,
            full_name: lineProfile.displayName,
            avatar_url: lineProfile.pictureUrl,
            line_user_id: lineUserId,
            provider: "line",
          },
        });
      }
    } else if (createError) {
      console.error("Failed to create LINE user:", createError);
      return NextResponse.json({ error: "Failed to create user account" }, { status: 500 });
    }

    // Sign in with password to get session tokens
    const serverSupabase = await createServerClient();
    const { data: signInData, error: signInError } = await serverSupabase.auth.signInWithPassword({
      email: deterministicEmail,
      password: deterministicPassword,
    });

    if (signInError || !signInData.session) {
      console.error("LINE sign-in failed:", signInError);
      return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
    }

    // Upsert profile with LINE data
    await serverSupabase.from("profiles").upsert(
      {
        id: signInData.user.id,
        display_name: lineProfile.displayName,
        avatar_url: lineProfile.pictureUrl,
        line_user_id: lineUserId,
      },
      { onConflict: "id" }
    );

    return NextResponse.json({
      user: {
        id: signInData.user.id,
        email: signInData.user.email,
        display_name: lineProfile.displayName,
        avatar_url: lineProfile.pictureUrl,
        line_user_id: lineUserId,
      },
      session: {
        access_token: signInData.session.access_token,
        refresh_token: signInData.session.refresh_token,
        expires_at: signInData.session.expires_at,
      },
      success: true,
    });
  } catch (error) {
    console.error("LINE auth error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
