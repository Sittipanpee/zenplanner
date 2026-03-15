/**
 * LINE Auth Bridge API
 * Handles LINE LIFF authentication
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    // Find or create user in Supabase
    const supabase = await createClient();

    // Check if user exists by line_user_id
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("line_user_id", lineProfile.userId)
      .single();

    if (existingProfile) {
      // For now, just return success with profile
      // In production, you'd create a proper session
      return NextResponse.json({
        user: existingProfile,
        success: true,
      });
    }

    // Create new user - simplified for demo
    // In production, use proper admin API
    return NextResponse.json({
      user: {
        line_user_id: lineProfile.userId,
        line_display_name: lineProfile.displayName,
        line_picture_url: lineProfile.pictureUrl,
      },
      success: true,
    });
  } catch (error) {
    console.error("LINE auth error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}