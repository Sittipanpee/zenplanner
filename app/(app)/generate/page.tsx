/**
 * Generate Page
 * Shows planner generation progress and download
 * Requires payment verification before generation
 */

"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ZenCard } from "@/components/ui/zen-card";
import { ZenButton } from "@/components/ui/zen-button";
import { Download, CheckCircle, Loader2, FileSpreadsheet, AlertCircle, Play, RefreshCw } from "lucide-react";
import { generatePlannerWorkbook } from "@/lib/sheet-builder";
import type { PlannerBlueprint } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

type GenStatus = "ready" | "checking" | "generating" | "completed" | "failed" | "no_payment";
type PaymentStatus = "pending" | "completed" | "failed" | "not_found";

interface GenerationStep {
  label: string;
  status: "pending" | "active" | "done";
  description?: string;
}

function GenerateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId");
  const blueprintId = searchParams.get("blueprintId");
  const supabase = createClient();

  const [status, setStatus] = useState<GenStatus>("ready");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("pending");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [toolCount, setToolCount] = useState(0);
  const [currentStep, setCurrentStep] = useState<GenerationStep>({ label: "เตรียมพร้อม", status: "pending" });
  const [steps, setSteps] = useState<GenerationStep[]>([
    { label: "เตรียมข้อมูล", status: "pending" },
    { label: "สร้างเครื่องมือ", status: "pending" },
    { label: "ปรับแต่ง Layout", status: "pending" },
    { label: "สร้างไฟล์ Excel", status: "pending" },
  ]);

  const updateStep = (index: number, stepStatus: "pending" | "active" | "done") => {
    setSteps(prev => prev.map((step, i) => ({
      ...step,
      status: i < index ? "done" : i === index ? stepStatus : "pending"
    })));
    if (index < steps.length) {
      setCurrentStep({ ...steps[index], status: stepStatus });
    }
  };

  const checkPaymentAndGenerate = async () => {
    setErrorMessage(null);
    setStatus("checking");

    try {
      updateStep(0, "active");

      // If no payment ID provided, skip payment check (demo mode)
      if (!paymentId) {
        console.log("No payment ID, starting demo generation");
        await startGeneration();
        return;
      }

      // Check payment status
      try {
        const response = await fetch(`/api/payment/webhook?paymentId=${paymentId}`);
        const data = await response.json();

        if (data.status === "completed") {
          setPaymentStatus("completed");
          await startGeneration();
        } else if (data.status === "pending" || data.status === "not_found") {
          setPaymentStatus(data.status as PaymentStatus);
          setStatus("no_payment");
        } else {
          setPaymentStatus("failed");
          setStatus("no_payment");
        }
      } catch (error) {
        console.error("Payment check failed:", error);
        // For demo, allow bypass on error
        await startGeneration();
      }
    } catch (error) {
      console.error("Error in checkPaymentAndGenerate:", error);
      setStatus("failed");
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    }
  };

  // Start planner generation
  const startGeneration = async () => {
    setStatus("generating");
    setProgress(0);

    try {
      updateStep(0, "done");
      updateStep(1, "active");
      setProgress(10);

      let blueprint: PlannerBlueprint;
      let toolsUsed = 0;

      // Try to fetch blueprint from DB if blueprintId is provided
      if (blueprintId && blueprintId !== "demo") {
        console.log("Fetching blueprint from DB:", blueprintId);
        const { data: dbBlueprint, error: fetchError } = await supabase
          .from("planner_blueprints")
          .select("*")
          .eq("id", blueprintId)
          .single();

        if (!fetchError && dbBlueprint) {
          console.log("Blueprint fetched:", dbBlueprint);
          blueprint = {
            id: dbBlueprint.id,
            user_id: dbBlueprint.user_id,
            quiz_session_id: dbBlueprint.quiz_session_id,
            title: dbBlueprint.title,
            description: dbBlueprint.description,
            spirit_animal: dbBlueprint.spirit_animal,
            archetype_code: dbBlueprint.archetype_code,
            tool_selection: dbBlueprint.tool_selection || [],
            customization: dbBlueprint.customization || {},
            status: dbBlueprint.status,
            created_at: dbBlueprint.created_at,
          };
          toolsUsed = blueprint.tool_selection?.length || 0;
        } else {
          console.warn("Blueprint fetch error:", fetchError);
          throw new Error("Failed to fetch blueprint from database");
        }
      } else {
        // Mock blueprint for demo
        console.log("Using demo blueprint");
        blueprint = {
          id: blueprintId || "demo-" + Date.now(),
          user_id: null,
          quiz_session_id: null,
          title: "My ZenPlanner",
          description: "Personalized planner based on my spirit animal",
          spirit_animal: "lion",
          archetype_code: "lion-leader",
          tool_selection: [
            "daily_power_block",
            "weekly_compass",
            "morning_clarity",
            "habit_heatmap",
            "gratitude_log",
            "life_wheel",
            "project_tracker",
            "budget_tracker",
          ],
          customization: {
            wake_time: "06:00",
          },
          status: "draft",
          created_at: new Date().toISOString(),
        };
        toolsUsed = blueprint.tool_selection.length;
      }

      updateStep(1, "done");
      updateStep(2, "active");
      setProgress(30);
      setToolCount(toolsUsed);

      console.log("Generating workbook with tools:", toolsUsed);

      // Generate workbook
      const workbookBuffer = await generatePlannerWorkbook({
        blueprint,
        format: "google_sheets",
      });

      updateStep(2, "done");
      updateStep(3, "active");
      setProgress(70);

      console.log("Workbook generated, buffer length:", workbookBuffer.byteLength);

      // Create blob URL for download
      const blob = new Blob([workbookBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);

      console.log("Blob created, URL:", url);
      setProgress(100);
      updateStep(3, "done");

      setDownloadUrl(url);
      setStatus("completed");
    } catch (error) {
      console.error("Failed to generate planner:", error);
      const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
      setErrorMessage(errorMsg);
      setStatus("failed");
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = "ZenPlanner.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleRetry = () => {
    setStatus("ready");
    setProgress(0);
    setDownloadUrl(null);
    setErrorMessage(null);
    setSteps([
      { label: "เตรียมข้อมูล", status: "pending" },
      { label: "สร้างเครื่องมือ", status: "pending" },
      { label: "ปรับแต่ง Layout", status: "pending" },
      { label: "สร้างไฟล์ Excel", status: "pending" },
    ]);
  };

  const goToPayment = () => {
    router.push(`/payment?blueprintId=${blueprintId || "demo"}`);
  };

  const goToBlueprint = () => {
    router.push("/blueprint");
  };

  // Ready state - show start button
  if (status === "ready") {
    return (
      <main className="min-h-screen bg-zen-bg flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-20 h-20 bg-zen-sage/10 rounded-full flex items-center justify-center mx-auto">
            <FileSpreadsheet className="w-10 h-10 text-zen-sage" />
          </div>
          <h1 className="font-display text-2xl font-bold text-zen-text">
            สร้าง Planner ของคุณ
          </h1>
          <p className="text-zen-text-secondary">
            พร้อมสร้าง Excel Planner แล้ว
            {blueprintId && blueprintId !== "demo" ? " (มีการเลือกเครื่องมือแล้ว)" : " (โหมดทดลอง)"}
          </p>

          <ZenCard className="text-left">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-zen-sage" />
                <span>รองรับ Excel และ Google Sheets</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-zen-sage" />
                <span>มีสูตร Excel ในตัว</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-zen-sage" />
                <span>ปรับแต่งตามสัตว์ประจำตัวคุณ</span>
              </div>
            </div>
          </ZenCard>

          <ZenButton fullWidth size="lg" onClick={checkPaymentAndGenerate}>
            <Play className="w-5 h-5 mr-2" />
            เริ่มสร้าง Planner
          </ZenButton>

          <ZenButton variant="ghost" fullWidth onClick={goToBlueprint}>
            กลับไปปรับแต่งเครื่องมือ
          </ZenButton>
        </div>
      </main>
    );
  }

  // No payment required state
  if (status === "no_payment") {
    return (
      <main className="min-h-screen bg-zen-bg flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-20 h-20 bg-zen-earth/10 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10 text-zen-earth" />
          </div>
          <h1 className="font-display text-2xl font-bold text-zen-text">
            กรุณาชำระเงินก่อน
          </h1>
          <p className="text-zen-text-secondary">
            {paymentStatus === "pending"
              ? "การชำระเงินยังไม่เสร็จสมบูรณ์"
              : paymentStatus === "not_found"
              ? "ไม่พบรายการชำระเงิน"
              : "การชำระเงินล้มเหลว"}
          </p>

          <ZenButton fullWidth size="lg" onClick={goToPayment}>
            ไปหน้าชำระเงิน
          </ZenButton>

          <ZenButton variant="ghost" fullWidth onClick={() => router.push("/dashboard")}>
            กลับสู่หน้าหลัก
          </ZenButton>
        </div>
      </main>
    );
  }

  // Checking payment state
  if (status === "checking") {
    return (
      <main className="min-h-screen bg-zen-bg flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-6">
          <Loader2 className="w-10 h-10 text-zen-sage animate-spin mx-auto" />
          <h1 className="font-display text-xl font-bold text-zen-text">
            กำลังตรวจสอบ...
          </h1>
          <p className="text-zen-text-secondary">
            กำลังตรวจสอบสถานะการชำระเงิน
          </p>
        </div>
      </main>
    );
  }

  // Completed state
  if (status === "completed") {
    return (
      <main className="min-h-screen bg-zen-bg flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-20 h-20 bg-zen-sage/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-zen-sage" />
          </div>
          <h1 className="font-display text-2xl font-bold text-zen-text">
            Planner พร้อมแล้ว!
          </h1>
          <p className="text-zen-text-secondary">
            สร้าง Planner เฉพาะตัวสำหรับคุณสำเร็จ
          </p>

          <ZenCard className="text-left">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-8 h-8 text-zen-sage" />
              <div>
                <p className="font-semibold text-zen-text">MyZenPlanner.xlsx</p>
                <p className="text-sm text-zen-text-muted">เครื่องมือ: {toolCount} รายการ</p>
              </div>
            </div>
          </ZenCard>

          <div className="space-y-3">
            <ZenButton fullWidth size="lg" onClick={handleDownload}>
              <Download className="w-5 h-5 mr-2" />
              ดาวน์โหลด Planner
            </ZenButton>

            <ZenButton variant="secondary" fullWidth onClick={() => router.push("/dashboard")}>
              กลับสู่หน้าหลัก
            </ZenButton>
          </div>

          <p className="text-sm text-zen-text-muted">
            เปิดไฟล์ด้วย Excel หรือ Google Sheets เพื่อแก้ไขได้
          </p>
        </div>
      </main>
    );
  }

  // Failed state
  if (status === "failed") {
    return (
      <main className="min-h-screen bg-zen-bg flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-20 h-20 bg-zen-blossom/10 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10 text-zen-blossom" />
          </div>
          <h1 className="font-display text-2xl font-bold text-zen-text">
            เกิดข้อผิดพลาด
          </h1>
          <p className="text-zen-text-secondary">
            ไม่สามารถสร้าง Planner ได้ กรุณาลองใหม่
          </p>

          {errorMessage && (
            <ZenCard className="text-left bg-red-50 border-red-200">
              <p className="text-sm text-red-600 font-mono">{errorMessage}</p>
            </ZenCard>
          )}

          <div className="space-y-3">
            <ZenButton fullWidth onClick={handleRetry}>
              <RefreshCw className="w-4 h-4 mr-2" />
              ลองใหม่
            </ZenButton>

            <ZenButton variant="ghost" fullWidth onClick={goToBlueprint}>
              กลับไปปรับแต่งเครื่องมือ
            </ZenButton>
          </div>
        </div>
      </main>
    );
  }

  // Generating state
  return (
    <main className="min-h-screen bg-zen-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 border-4 border-zen-border rounded-full" />
          <div
            className="absolute inset-0 border-4 border-zen-sage rounded-full border-t-transparent animate-spin"
            style={{ animationDuration: "1.5s" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-zen-sage" />
          </div>
        </div>

        <h1 className="font-display text-2xl font-bold text-zen-text">
          กำลังสร้าง Planner...
        </h1>

        <p className="text-zen-text-secondary">
          กำลังปรับแต่งเครื่องมือต่างๆ ให้เหมาะกับคุณ
        </p>

        {/* Progress bar */}
        <div className="w-full bg-zen-surface-alt rounded-full h-2">
          <div
            className="bg-zen-sage h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <ZenCard padding="sm">
          <div className="space-y-3">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    step.status === "done"
                      ? "bg-zen-sage text-white"
                      : step.status === "active"
                      ? "bg-zen-gold text-white animate-pulse"
                      : "bg-zen-surface-alt"
                  }`}
                >
                  {step.status === "done" && (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {step.status === "active" && (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  )}
                </div>
                <span
                  className={
                    step.status === "done"
                      ? "text-zen-text"
                      : step.status === "active"
                      ? "text-zen-gold font-medium"
                      : "text-zen-text-muted"
                  }
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </ZenCard>
      </div>
    </main>
  );
}

function LoadingFallback() {
  return (
    <main className="min-h-screen bg-zen-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <Loader2 className="w-10 h-10 text-zen-sage animate-spin mx-auto" />
        <h1 className="font-display text-xl font-bold text-zen-text">
          กำลังโหลด...
        </h1>
      </div>
    </main>
  );
}

export default function GeneratePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <GenerateContent />
    </Suspense>
  );
}
