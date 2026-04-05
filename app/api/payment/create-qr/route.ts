/**
 * Thai QR Payment (PromptPay) Generation
 * Creates a QR code for payment
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateQRCode } from "@/lib/qr-generator";

// Mock payment amount - in production this would come from the planner blueprint
const PLANNER_PRICE = 299; // 299 THB

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { blueprintId, amount = PLANNER_PRICE } = body;

    // Validate input
    if (!blueprintId) {
      return NextResponse.json(
        { error: "blueprintId is required" },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Generate payment ID and QR code
    const paymentId = `pay_${crypto.randomUUID()}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const qrCode = await generateQRCode({
      paymentId,
      amount,
      merchantId: process.env.PROMPTPAY_MERCHANT_ID || "1234567890",
      merchantName: "ZenPlanner",
      ref1: blueprintId.substring(0, 20),
    });

    // Store payment in database — fail if insert fails
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        id: paymentId,
        user_id: user.id,
        blueprint_id: blueprintId,
        amount_cents: amount * 100,
        currency: "THB",
        status: "pending",
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Failed to create payment record:", paymentError);
      return NextResponse.json(
        { error: "Failed to create payment record" },
        { status: 500 }
      );
    }

    // Create payment response
    const paymentData = {
      paymentId,
      blueprintId,
      amount,
      currency: "THB",
      status: "pending",
      expiresAt,
      qrCode,
      paymentMethod: "promptpay",
      instructions: [
        "1. เปิดแอปธนาคารของคุณ",
        "2. เลือกสแกน QR Code",
        "3. สแกน QR Code ด้านบน",
        `4. ยืนยันการชำระเงิน ${amount} บาท`,
      ],
      // For demo purposes
      demoMode: process.env.NODE_ENV !== "production",
    };

    return NextResponse.json({
      success: true,
      data: paymentData,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
