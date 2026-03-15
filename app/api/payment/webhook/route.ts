/**
 * Payment Webhook Handler
 * Handles payment confirmations from payment providers
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      paymentId,
      status,
      amount,
      transactionId,
    } = body;

    // Validate webhook
    if (!paymentId || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // In production, verify the webhook signature
    // const signature = request.headers.get("x-webhook-signature");
    // if (!verifySignature(signature, body)) {
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    // }

    // Initialize Supabase client
    const supabase = await createClient();

    // Find the payment record
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
      // Update blueprint status to confirmed
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

// Get payment status
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

    const { data: payment, error } = await supabase
      .from("payments")
      .select("*")
      .eq("id", paymentId)
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

// Simulate payment for demo purposes
export async function PUT(request: NextRequest) {
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

    // Update payment status (simulated)
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

    // If successful, also update the blueprint
    if (simulate === "success") {
      // Find the payment to get blueprint_id
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
