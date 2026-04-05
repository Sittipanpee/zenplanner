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
  const qrString = buildPromptPayQRString(paymentData);

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
 * Based on Thai QR Payment standard (EMVCO)
 */
function buildPromptPayQRString(data: ThaiQRPaymentData): string {
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

  // Merchant City (60) - Bangkok (fixed length prefix)
  const city = "Bangkok";
  segments.push(`60${city.length.toString().padStart(2, "0")}${city}`);

  // Additional Data (62) - References
  if (data.ref1 || data.ref2) {
    let additionalData = "";
    if (data.ref1) {
      additionalData += `07${data.ref1.length.toString().padStart(2, "0")}${data.ref1}`;
    }
    if (data.ref2) {
      additionalData += `08${data.ref2.length.toString().padStart(2, "0")}${data.ref2}`;
    }
    segments.push(`62${additionalData.length.toString().padStart(2, "0")}${additionalData}`);
  }

  // CRC placeholder -- will be replaced with real CRC16
  const dataWithoutCRC = segments.join("") + "6304";
  const crc = calculateCRC16(dataWithoutCRC);

  return dataWithoutCRC + crc;
}

/**
 * Calculate CRC16-CCITT for EMVCO QR validation
 * Polynomial: 0x1021, Initial: 0xFFFF
 */
export function calculateCRC16(data: string): string {
  let crc = 0xffff;
  const polynomial = 0x1021;

  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ polynomial) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, "0");
}
