/**
 * Generate Done Page
 * Download success page with social sharing
 */

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ZenCard } from "@/components/ui/zen-card";
import { ZenButton } from "@/components/ui/zen-button";
import { ShareAnimalButton } from "@/components/liff/share-animal-button";
import type { SpiritAnimal } from "@/lib/types";
import {
  CheckCircle,
  Download,
  Share2,
  FileSpreadsheet,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

const ANIMAL_INFO: Record<string, { emoji: string; nameTh: string }> = {
  lion: { emoji: "🦁", nameTh: "สิงโต" },
  whale: { emoji: "🐋", nameTh: "วาฬ" },
  dolphin: { emoji: "🐬", nameTh: "โลมา" },
  owl: { emoji: "🦉", nameTh: "นกฮูก" },
  fox: { emoji: "🦊", nameTh: "จิ้งจอก" },
  turtle: { emoji: "🐢", nameTh: "เต่า" },
  eagle: { emoji: "🦅", nameTh: "อินทรี" },
  wolf: { emoji: "🐺", nameTh: "หมาป่า" },
  cat: { emoji: "🐱", nameTh: "แมว" },
  butterfly: { emoji: "🦋", nameTh: "ผีเสื้อ" },
};

function GenerateDoneContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [format, setFormat] = useState<"xlsx" | "csv">("xlsx");
  const [isCopied, setIsCopied] = useState(false);

  const animal = (searchParams.get("animal") || "lion") as SpiritAnimal;
  const info = ANIMAL_INFO[animal] || ANIMAL_INFO.lion;
  const insight = "ค้นพบสัตว์ประจำตัวของคุณบน ZenPlanner!";

  // Get download URL from localStorage or generate
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = localStorage.getItem("planner_download_url");
      if (url) {
        setDownloadUrl(url);
      }
    }
  }, []);

  const handleDownload = () => {
    if (downloadUrl) {
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `ZenPlanner-${info.nameTh}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/quiz?ref=shared`;
    navigator.clipboard.writeText(link).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleRetakeQuiz = () => {
    router.push("/quiz");
  };

  return (
    <main className="min-h-screen bg-zen-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Success Animation */}
        <div className="text-center space-y-4">
          <div className="relative inline-flex">
            {/* Ripple effect */}
            <div className="absolute inset-0 bg-zen-sage/20 rounded-full animate-zen-ripple" />
            <div className="relative w-24 h-24 bg-zen-sage/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-zen-sage animate-zen-reveal" />
            </div>
          </div>

          <h1 className="font-display text-2xl font-bold text-zen-text animate-zen-fade-in">
            Planner พร้อมแล้ว!
          </h1>
          <p className="text-zen-text-secondary animate-zen-fade-in" style={{ animationDelay: "0.1s" }}>
            สร้าง {info.nameTh} {info.emoji} Planner สำเร็จแล้ว
          </p>
        </div>

        {/* Download Card */}
        <ZenCard className="animate-zen-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-zen-sage/10 rounded-xl flex items-center justify-center">
              <FileSpreadsheet className="w-7 h-7 text-zen-sage" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-zen-text">ZenPlanner-{info.nameTh}</p>
              <p className="text-sm text-zen-text-muted">8 เครื่องมือ • Excel/Sheets</p>
            </div>
          </div>

          {/* Format Selection */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setFormat("xlsx")}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                format === "xlsx"
                  ? "bg-zen-sage text-white"
                  : "bg-zen-surface-alt text-zen-text-secondary hover:bg-zen-border"
              }`}
            >
              Excel (.xlsx)
            </button>
            <button
              onClick={() => setFormat("csv")}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                format === "csv"
                  ? "bg-zen-sage text-white"
                  : "bg-zen-surface-alt text-zen-text-secondary hover:bg-zen-border"
              }`}
            >
              CSV
            </button>
          </div>

          <ZenButton fullWidth size="lg" onClick={handleDownload}>
            <Download className="w-5 h-5 mr-2" />
            ดาวน์โหลด Planner
          </ZenButton>
        </ZenCard>

        {/* Share Section */}
        <div className="animate-zen-fade-in" style={{ animationDelay: "0.3s" }}>
          <p className="text-center text-sm text-zen-text-muted mb-3">
            แชร์ให้เพื่อนได้รู้
          </p>

          <div className="flex gap-3">
            {/* LINE Share */}
            <ShareAnimalButton animal={animal} insight={insight} className="flex-1" />

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="flex-1 h-11 bg-zen-surface border border-zen-border text-zen-text font-semibold rounded-full flex items-center justify-center gap-2 hover:bg-zen-surface-alt transition-colors"
            >
              <Share2 className="w-4 h-4" />
              {isCopied ? "คัดลอกแล้ว!" : "คัดลอกลิงก์"}
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3 animate-zen-fade-in" style={{ animationDelay: "0.4s" }}>
          <Link href="/dashboard">
            <ZenButton variant="secondary" fullWidth>
              ไปหน้าหลัก
              <ArrowRight className="w-4 h-4 ml-2" />
            </ZenButton>
          </Link>

          <button
            onClick={handleRetakeQuiz}
            className="w-full h-11 text-zen-text-muted text-sm flex items-center justify-center gap-2 hover:text-zen-text transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            ทำ Quiz ใหม่
          </button>
        </div>

        {/* Tips */}
        <div className="text-center text-xs text-zen-text-muted space-y-1 animate-zen-fade-in" style={{ animationDelay: "0.5s" }}>
          <p>เปิดไฟล์ด้วย Excel หรือ Google Sheets</p>
          <p>เปิดใช้ Macro เพื่อใช้งานฟีเจอร์เต็มรูปแบบ</p>
        </div>
      </div>
    </main>
  );
}

function LoadingFallback() {
  return (
    <main className="min-h-screen bg-zen-bg flex items-center justify-center p-4">
      <div className="text-zen-text-secondary">กำลังโหลด...</div>
    </main>
  );
}

export default function GenerateDonePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <GenerateDoneContent />
    </Suspense>
  );
}
