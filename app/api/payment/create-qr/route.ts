/**
 * Thai QR Payment (PromptPay) Generation
 * Creates a QR code for payment
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateSimpleQRCode } from "@/lib/qr-generator";

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

    // Generate actual QR code
    const qrCode = await generateSimpleQRCode(
      amount,
      `ZenPlanner - Blueprint: ${blueprintId.substring(0, 8)}`
    );

    // Create payment record in database
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    // Store payment in database
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
      // Continue with mock data if DB insert fails
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
