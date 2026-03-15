/**
 * Error Boundary
 * Handles errors in the app group
 */

"use client";

import { useEffect } from "react";
import { ZenButton } from "@/components/ui/zen-button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-zen-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6">
        {/* Error Icon */}
        <div className="w-16 h-16 mx-auto rounded-full bg-zen-blossom/10 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-zen-blossom"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
        </div>

        {/* Error Message */}
        <div>
          <h2 className="font-display text-2xl font-bold text-zen-text mb-2">
            เกิดข้อผิดพลาด
          </h2>
          <p className="text-zen-text-secondary">
            ขออภัย มีบางอย่างผิดพลาด กรุณาลองใหม่อีกครั้ง
          </p>
        </div>

        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === "development" && (
          <details className="text-left bg-zen-surface-alt p-4 rounded-lg">
            <summary className="text-sm text-zen-text-muted cursor-pointer">
              รายละเอียดข้อผิดพลาด
            </summary>
            <pre className="mt-2 text-xs text-zen-text-secondary overflow-auto max-h-32">
              {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
            </pre>
          </details>
        )}

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <ZenButton variant="secondary" onClick={() => window.location.href = "/"}>
            กลับหน้าหลัก
          </ZenButton>
          <ZenButton onClick={reset}>
            ลองใหม่
          </ZenButton>
        </div>
      </div>
    </div>
  );
}
