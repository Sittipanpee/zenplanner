/**
 * Payment Webhook Handler
 * Handles payment confirmations from payment providers
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

/**
 * Verify webhook HMAC-SHA256 signature
 */
function verifyWebhookSignature(signature: string | null, body: string): boolean {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret) {
    console.error("PAYMENT_WEBHOOK_SECRET not configured");
    return false;
  }
  if (!signature) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expected, "hex")
  );
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    // Verify webhook signature (HMAC-SHA256)
    const signature = request.headers.get("x-webhook-signature");
    if (!verifyWebhookSignature(signature, rawBody)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const { paymentId, status, amount, transactionId } = body;

    if (!paymentId || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Idempotency: check if payment already processed
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .single();

    if (paymentError || !payment) {
      console.error("Payment not found:", paymentId);
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // If already in a terminal state, return success (idempotent)
    if (payment.status === "completed" || payment.status === "failed") {
      return NextResponse.json({
        success: true,
        message: "Payment already processed",
        status: payment.status,
      });
    }

    // Update payment status
    const { error: updateError } = await supabase
      .from("payments")
      .update({
        status: status === "success" ? "completed" : "failed",
        stripe_session_id: transactionId,
      })
      .eq("id", paymentId);

    if (updateError) {
      console.error("Failed to update payment:", updateError);
      return NextResponse.json(
        { error: "Failed to update payment" },
        { status: 500 }
      );
    }

    // If payment successful, trigger planner generation
    if (status === "success" && payment.blueprint_id) {
      await supabase
        .from("planner_blueprints")
        .update({ status: "confirmed" })
        .eq("id", payment.blueprint_id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// Get payment status (requires auth)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("paymentId");

    if (!paymentId) {
      return NextResponse.json(
        { error: "paymentId is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: payment, error } = await supabase
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .eq("user_id", user.id)
      .single();

    if (error || !payment) {
      return NextResponse.json(
        { error: "Payment not found", status: "not_found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      status: payment.status,
      amount: payment.amount_cents / 100,
      currency: payment.currency,
    });
  } catch (error) {
    console.error("Get payment error:", error);
    return NextResponse.json(
      { error: "Failed to get payment status" },
      { status: 500 }
    );
  }
}

// Simulate payment — DEVELOPMENT ONLY
export async function PUT(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Simulation only available in development" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { paymentId, simulate } = body;

    if (simulate !== "success" && simulate !== "failed") {
      return NextResponse.json(
        { error: "Invalid simulation type" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("payments")
      .update({
        status: simulate === "success" ? "completed" : "failed",
      })
      .eq("id", paymentId);

    if (error) {
      return NextResponse.json(
        { error: "Failed to simulate payment" },
        { status: 500 }
      );
    }

    if (simulate === "success") {
      const { data: payment } = await supabase
        .from("payments")
        .select("blueprint_id")
        .eq("id", paymentId)
        .single();

      if (payment?.blueprint_id) {
        await supabase
          .from("planner_blueprints")
          .update({ status: "confirmed" })
          .eq("id", payment.blueprint_id);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Payment ${simulate === "success" ? "completed" : "failed"}`,
    });
  } catch (error) {
    console.error("Simulation error:", error);
    return NextResponse.json(
      { error: "Simulation failed" },
      { status: 500 }
    );
  }
}
