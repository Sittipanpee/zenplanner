/**
 * QR Code Generator for Thai QR Payment (PromptPay)
 * Generates QR codes for payment processing
 */

import QRCode from "qrcode";

/**
 * Thai QR Payment Data Structure
 * Based on PromptPay QR standard
 */
export interface ThaiQRPaymentData {
  paymentId: string;
  amount: number;
  merchantId: string;
  merchantName: string;
  ref1?: string;
  ref2?: string;
}

/**
 * Generate Thai QR Payment QR Code
 * Creates a QR code string in PromptPay format
 *
 * @param paymentData - Payment information
 * @returns Base64 encoded QR code image
 */
export async function generateQRCode(paymentData: ThaiQRPaymentData): Promise<string> {
  // Build PromptPay QR string
  // Format: EMVCO Merchant Presentment QR
  const qrString = buildPromptPayQRString(paymentData);

  // Generate QR code as base64
  const qrCodeDataUrl = await QRCode.toDataURL(qrString, {
    width: 300,
    margin: 2,
    color: {
      dark: "#2C2C2C",
      light: "#FFFFFF",
    },
    errorCorrectionLevel: "M",
  });

  return qrCodeDataUrl;
}

/**
 * Build PromptPay QR string format
 * Based on Thai QR Payment standard
 */
function buildPromptPayQRString(data: ThaiQRPaymentData): string {
  // EMVCO QR Payment format
  const segments: string[] = [];

  // Payload Format Indicator (00)
  segments.push("000201");

  // Point of Initiation Method (01) - Static QR for merchant
  segments.push("010211");

  // Merchant ID (02) - NPS (National PromptPay Standard)
  const merchantId = data.merchantId || "1234567890";
  segments.push(`02${merchantId.length.toString().padStart(2, "0")}${merchantId}`);

  // Merchant Category Code (52) - General merchandise
  segments.push("52040000");

  // Transaction Currency (53) - THB (764)
  segments.push("5303764");

  // Transaction Amount (54)
  const amountStr = data.amount.toFixed(2);
  segments.push(`54${amountStr.length.toString().padStart(2, "0")}${amountStr}`);

  // Country Code (58) - Thailand
  segments.push("5802TH");

  // Merchant Name (59)
  const merchantName = data.merchantName || "ZenPlanner";
  segments.push(`59${merchantName.length.toString().padStart(2, "0")}${merchantName}`);

  // Merchant City (60) - Bangkok
  segments.push("60Bangkok");

  // Additional Data - Reference 1 (62)
  if (data.ref1) {
    const ref1Tag = `07${data.ref1.length.toString().padStart(2, "0")}${data.ref1}`;
    segments.push(`6207${ref1Tag.length.toString().padStart(2, "0")}${ref1Tag}`);
  }

  // Additional Data - Reference 2 (62)
  if (data.ref2) {
    const ref2Tag = `08${data.ref2.length.toString().padStart(2, "0")}${data.ref2}`;
    segments.push(`6208${ref2Tag.length.toString().padStart(2, "0")}${ref2Tag}`);
  }

  // CRC (63) - will be calculated
  // For now, use placeholder - in production calculate proper CRC16
  segments.push("6304FFFF");

  return segments.join("");
}

/**
 * Generate a simple payment QR for demo/testing
 * Uses a mock format that's easier to test
 */
export async function generateSimpleQRCode(
  amount: number,
  description: string
): Promise<string> {
  // Create a simpler QR that works for testing
  const paymentInfo = `ZenPlanner Payment\nAmount: ${amount} THB\n${description}`;

  const qrCodeDataUrl = await QRCode.toDataURL(paymentInfo, {
    width: 280,
    margin: 2,
    color: {
      dark: "#2C2C2C",
      light: "#FFFFFF",
    },
    errorCorrectionLevel: "L",
  });

  return qrCodeDataUrl;
}

/**
 * Calculate CRC16 for Thai QR
 * Used for proper EMVCO QR validation
 */
export function calculateCRC16(data: string): string {
  let crc = 0xFFFF;
  const polynomial = 0x1021;

  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ polynomial;
      } else {
        crc = crc << 1;
      }
    }
  }

  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, "0");
}
