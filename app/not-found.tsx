/**
 * 404 Not Found Page
 * Shows when page doesn't exist
 */

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import { ZenButton } from "@/components/ui/zen-button";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-zen-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6">
        {/* 404 Icon */}
        <div className="w-24 h-24 mx-auto rounded-full bg-zen-surface border border-zen-border flex items-center justify-center">
          <span className="font-display text-5xl text-zen-text-muted">?</span>
        </div>

        {/* Message */}
        <div>
          <h1 className="font-display text-3xl font-bold text-zen-text mb-2">
            404
          </h1>
          <h2 className="font-semibold text-zen-text mb-2">
            ไม่พบหน้าที่คุณต้องการ
          </h2>
          <p className="text-zen-text-secondary">
            หน้าที่คุณกำลังค้นหาอาจถูกย้ายหรือลบไปแล้ว
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link href="/">
            <ZenButton fullWidth>
              <Home className="w-5 h-5 mr-2" />
              กลับหน้าหลัก
            </ZenButton>
          </Link>
          <Link href="/quiz">
            <ZenButton variant="secondary" fullWidth>
              <ArrowLeft className="w-5 h-5 mr-2" />
              ทำ Quiz ค้นหาสัตว์ประจำตัว
            </ZenButton>
          </Link>
        </div>
      </div>
    </main>
  );
}
