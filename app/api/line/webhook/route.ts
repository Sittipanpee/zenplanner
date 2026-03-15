/**
 * LINE Webhook API
 * Handle LINE events (follow/unfollow, rich menu, messages)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-line-signature")!;

    // Verify LINE signature
    const hash = crypto
      .createHmac("sha256", LINE_CHANNEL_SECRET)
      .update(body)
      .digest("base64");

    if (hash !== signature) {
      console.error("Invalid LINE signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const events = JSON.parse(body).events;

    for (const event of events) {
      await handleLineEvent(event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("LINE webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}

async function handleLineEvent(event: any) {
  const supabase = await createClient();

  switch (event.type) {
    case "follow":
      // User followed the LINE official account
      console.log("User followed:", event.source.userId);
      // Optionally store in activity_log
      await supabase.from("activity_log").insert({
        activity_type: "line_follow",
        metadata: { user_id: event.source.userId },
      });
      break;

    case "unfollow":
      // User unfollowed the LINE official account
      console.log("User unfollowed:", event.source.userId);
      await supabase.from("activity_log").insert({
        activity_type: "line_unfollow",
        metadata: { user_id: event.source.userId },
      });
      break;

    case "postback":
      // Rich menu or postback action
      console.log("Postback data:", event.postback.data);
      await supabase.from("activity_log").insert({
        activity_type: "line_postback",
        metadata: {
          user_id: event.source.userId,
          data: event.postback.data,
        },
      });
      break;

    case "message":
      // Handle incoming messages (optional: could trigger quiz, etc.)
      console.log("Message received:", event.message.text);
      break;

    default:
      console.log("Unhandled event type:", event.type);
  }
}
