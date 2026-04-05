/**
 * Payment Page
 * QR Code payment for planner
 */

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ZenCard } from "@/components/ui/zen-card";
import { ZenButton } from "@/components/ui/zen-button";
import { QrCode, Timer, CheckCircle, XCircle, Loader2, CreditCard } from "lucide-react";

const PLANNER_PRICE = 299; // 299 THB

interface PaymentData {
  paymentId: string;
  qrCode: string;
  amount: number;
  currency: string;
  expiresAt: string;
  instructions: string[];
}

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('planner.payment');
  const tCommon = useTranslations('common.actions');
  const blueprintId = searchParams.get("blueprintId") || "demo-blueprint";
  const isDev = process.env.NODE_ENV !== 'production';

  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [status, setStatus] = useState<"loading" | "pending" | "success" | "failed" | "expired">("loading");
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [error, setError] = useState<string | null>(null);

  // Create payment on mount
  useEffect(() => {
    const createPayment = async () => {
      try {
        const response = await fetch("/api/payment/create-qr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ blueprintId, amount: PLANNER_PRICE }),
        });

        const data = await response.json();

        if (data.success) {
          setPaymentData(data.data);
          setStatus("pending");
        } else {
          setError(data.error || "Failed to create payment");
          setStatus("failed");
        }
      } catch (err) {
        setError("errorGeneric");
        setStatus("failed");
      }
    };

    createPayment();
  }, [blueprintId]);

  // Countdown timer
  useEffect(() => {
    if (status !== "pending" || !paymentData?.expiresAt) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(paymentData.expiresAt).getTime();
      const remaining = Math.floor((expiry - now) / 1000);

      if (remaining <= 0) {
        setStatus("expired");
        clearInterval(interval);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [status, paymentData?.expiresAt]);

  // Poll for payment status
  useEffect(() => {
    if (status !== "pending" || !paymentData?.paymentId) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/payment/webhook?paymentId=${paymentData.paymentId}`
        );
        const data = await response.json();

        if (data.status === "completed") {
          setStatus("success");
          clearInterval(pollInterval);
          // Redirect to generate after success
          setTimeout(() => {
            router.push(`/generate?paymentId=${paymentData.paymentId}`);
          }, 1500);
        }
      } catch (err) {
        // Ignore polling errors
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [status, paymentData?.paymentId, router]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Simulate payment for demo
  const simulatePayment = async () => {
    if (!paymentData?.paymentId) return;

    try {
      const response = await fetch("/api/payment/webhook", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: paymentData.paymentId,
          simulate: "success",
        }),
      });

      const data = await response.json();
      if (data.success) {
        setStatus("success");
      }
    } catch (err) {
      console.error("Simulation failed:", err);
    }
  };

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-zen-bg flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 text-zen-sage animate-spin mx-auto" />
          <p className="text-zen-text-secondary">{t('creatingQr')}</p>
        </div>
      </main>
    );
  }

  if (status === "failed" || status === "expired") {
    return (
      <main className="min-h-screen bg-zen-bg flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="w-16 h-16 bg-zen-blossom/10 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-8 h-8 text-zen-blossom" />
          </div>
          <h1 className="font-display text-2xl font-bold text-zen-text">
            {status === "expired" ? t('timeout') : t('failed')}
          </h1>
          <p className="text-zen-text-secondary">
            {error ? t(error) : t('tryAgainError')}
          </p>
          <ZenButton onClick={() => router.push("/blueprint")}>
            {t('retry')}
          </ZenButton>
        </div>
      </main>
    );
  }

  if (status === "success") {
    return (
      <main className="min-h-screen bg-zen-bg flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="w-16 h-16 bg-zen-sage/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-zen-sage" />
          </div>
          <h1 className="font-display text-2xl font-bold text-zen-text">
            {t('success')}
          </h1>
          <p className="text-zen-text-secondary">
            {t('redirecting')}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zen-bg pb-20">
      <div className="max-w-md mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="font-display text-2xl font-bold text-zen-text mb-2">
            {t('title')}
          </h1>
          <p className="text-zen-text-secondary">
            {t('scan')} — {t('amount', { amount: PLANNER_PRICE })}
          </p>
        </div>

        {/* QR Code Card */}
        <ZenCard className="mb-6">
          <div className="text-center">
            {/* Timer */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <Timer className="w-5 h-5 text-zen-gold" />
              <span className={`font-mono text-lg ${timeLeft < 60 ? "text-zen-blossom" : "text-zen-text"}`}>
                {formatTime(timeLeft)}
              </span>
            </div>

            {/* QR Code */}
            {paymentData?.qrCode && (
              <div className="bg-white p-4 rounded-xl inline-block mb-4">
                <img
                  src={paymentData.qrCode}
                  alt="Payment QR Code"
                  className="w-48 h-48"
                />
              </div>
            )}

            {/* Amount */}
            <p className="font-bold text-2xl text-zen-text mb-4">
              {t('amountDisplay', { amount: PLANNER_PRICE })}
            </p>
          </div>
        </ZenCard>

        {/* Instructions */}
        <ZenCard className="mb-6">
          <h3 className="font-semibold text-zen-text mb-3">{t('howTo')}</h3>
          <ol className="space-y-2 text-sm text-zen-text-secondary">
            {paymentData?.instructions.map((instruction, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-zen-sage font-semibold">{i + 1}.</span>
                <span>{instruction}</span>
              </li>
            ))}
          </ol>
        </ZenCard>

        {/* Demo Button — only visible in development */}
        {isDev && (
        <div className="text-center mb-6">
          <p className="text-xs text-zen-text-muted mb-2">{t('forTesting')}</p>
          <button
            onClick={simulatePayment}
            className="text-sm text-zen-sage hover:underline"
          >
            {t('simulateSuccess')} →
          </button>
        </div>
        )}

        {/* Cancel */}
        <div className="text-center">
          <button
            onClick={() => router.back()}
            className="text-zen-text-muted text-sm hover:text-zen-text"
          >
            {t('cancelButton')}
          </button>
        </div>
      </div>
    </main>
  );
}

function LoadingFallback() {
  return (
    <main className="min-h-screen bg-zen-bg flex items-center justify-center p-4">
      <div className="text-zen-text-secondary">Loading...</div>
    </main>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentContent />
    </Suspense>
  );
}
