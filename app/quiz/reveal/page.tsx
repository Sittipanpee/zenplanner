/**
 * Quiz Reveal Page
 * Dramatic reveal of spirit animal with animations
 */

"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ZenCard } from "@/components/ui/zen-card";
import { ZenButton } from "@/components/ui/zen-button";
import { Sparkles, Download, Share2, ArrowLeft, Loader2 } from "lucide-react";

const ANIMAL_INFO: Record<string, { emoji: string; nameTh: string; insight: string }> = {
  lion: { emoji: "🦁", nameTh: "สิงโต", insight: "คุณคือผู้นำที่เกิดมาพร้อมวิสัยทัศน์! ตื่นเช้า มีพลัง และมุ่งมั่นสู่เป้าหมาย คุณไม่รอโอกาส — คุณสร้างมันขึ้นมาเอง" },
  whale: { emoji: "🐋", nameTh: "วาฬ", insight: "คุณมีความคิดที่ลึกซึ้งและมองเห็นภาพใหญ่ คุณไม่ต้องการความวุ่นวาย — คุณต้องการความหมาย" },
  dolphin: { emoji: "🐬", nameTh: "โลมา", insight: "คุณเกิดมาเพื่อสร้างความสนุกและเชื่อมโยงผู้คน! พลังงานของคุณมาจากการอยู่ร่วมกับผู้อื่น" },
  owl: { emoji: "🦉", nameTh: "นกฮูก", insight: "คุณเป็นนักวิเคราะห์ที่คิดทบทวนก่อนตัดสินใจ คุณมองเห็นสิ่งที่คนอื่นมองข้าม" },
  fox: { emoji: "🦊", nameTh: "狐狸", insight: "คุณฉลาดไหว ปรับตัวเก่ง และหาทางออกเสมอ ไม่ว่าสถานการณ์จะเป็นอย่างไร" },
  turtle: { emoji: "🐢", nameTh: "เต่า", insight: "คุณไม่รีบ แต่ไม่เคยหยุด ด้วยความอดทนและความสม่ำเสมอ คุณไปถึงเป้าหมายได้เสมอ" },
  eagle: { emoji: "🦅", nameTh: "นกอินทรี", insight: "คุณมองเห็นเป้าหมายจากระยะไกลและบินตรงไปยังมัน อิสระและมุ่งมั่น" },
  octopus: { emoji: "🐙", nameTh: "ปลาหมึก", insight: "คุณคิดได้หลายมิติพร้อมกัน! สมองของคุณเชื่อมโยงไอเดียได้อย่างสร้างสรรค์" },
  mountain: { emoji: "🏔️", nameTh: "ภูเขา", insight: "คุณมั่นคงและไม่เปลี่ยนแปลง วางแผนระยะยาวและยืนหยัดไม่ว่าพายุจะพัดผ่าน" },
  wolf: { emoji: "🐺", nameTh: "หมาป่า", insight: "คุณภักดีต่อฝูงและพร้อมลงมือทำเพื่อคนที่คุณรัก สังคมและภักดี" },
  sakura: { emoji: "🌸", nameTh: "ซากุระ", insight: "คุณงดงามและอ่อนโยน สร้างสรรค์และไหลไปกับธรรมชาติ ชอบสิ่งที่สวยงาม" },
  cat: { emoji: "🐱", nameTh: "แมว", insight: "คุณสมดุลระหว่างสังคมและความสงบ อิสระแต่ไม่โดดเดี่ยว สังเกตการณ์มากกว่าพูด" },
  crocodile: { emoji: "🐊", nameTh: "จระเข้", insight: "คุณอดทนรอคอยโอกาส เมื่อจับได้แล้วไม่ปล่อย มีกลยุทธ์และวางแผนรอบคอบ" },
  dove: { emoji: "🕊️", nameTh: "นกพิราบ", insight: "คุณสงบ สมดุล และหาความกลมกลืน ดูแลคนรอบข้างด้วยความเมตตา" },
  butterfly: { emoji: "🦋", nameTh: "ผีเสื้อ", insight: "คุณเปลี่ยนแปลงและเติบโตอยู่เสมอ สร้างสรรค์ ยืดหยุ่น และไม่หยุดนิ่ง" },
  bamboo: { emoji: "🌿", nameTh: "ไผ่", insight: "คุณยืดหยุ่นแต่ไม่มีวันหัก เติบโตอย่างสม่ำเสมอ ทนทานต่อทุกสภาพอากาศ" },
};

function QuizRevealContent() {
  const searchParams = useSearchParams();
  const animal = searchParams.get("animal") || "butterfly";
  const info = ANIMAL_INFO[animal] || ANIMAL_INFO.butterfly;
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleShare = async () => {
    const text = `สัตว์ประจำตัวฉันคือ ${info.nameTh} ${info.emoji}! ${info.insight}`;
    try {
      await navigator.clipboard.writeText(text);
      alert("คัดลอกแล้ว! แชร์ให้เพื่อนได้เลย");
    } catch {
      // Fallback for browsers without clipboard API or in non-secure contexts
      alert("ไม่สามารถคัดลอกได้ในเบราว์เซอร์นี้");
    }
  };

  return (
    <main className="min-h-screen bg-zen-bg">
      {/* Simple Header */}
      <div className="fixed top-0 left-0 right-0 px-4 py-4 z-50">
        <Link href="/quiz" className="inline-flex items-center text-zen-text-secondary hover:text-zen-text">
          <ArrowLeft className="w-5 h-5" />
          <span className="ml-1">ทำ Quiz ใหม่</span>
        </Link>
      </div>

      <div className="relative overflow-hidden bg-gradient-to-br from-zen-gold/20 to-zen-blossom/20 py-16 px-4 pt-16">
        <div className="absolute inset-0 opacity-30">
          <Sparkles className="w-full h-full text-zen-gold animate-zen-float" />
        </div>
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-32 h-32 mb-6 rounded-full bg-white shadow-zen-lg text-6xl animate-zen-reveal">
            {info.emoji}
          </div>
          <h1 className="font-display text-3xl font-bold text-zen-text mb-2 animate-zen-fade-in" style={{ animationDelay: "0.2s" }}>
            สัตว์ประจำตัวคุณคือ
          </h1>
          <h2 className="font-display text-5xl font-bold text-zen-sage mb-4 animate-zen-fade-in" style={{ animationDelay: "0.4s" }}>
            {info.nameTh}
          </h2>
          <p className="text-zen-text-secondary max-w-sm mx-auto animate-zen-fade-in" style={{ animationDelay: "0.6s" }}>
            {info.insight}
          </p>
        </div>
      </div>
      <div className="max-w-md mx-auto px-4 py-8 space-y-4">
        <div className="flex gap-3">
          <button onClick={handleShare} className="flex-1 h-11 bg-zen-surface border border-zen-border text-zen-text font-semibold rounded-full flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-zen-sage">
            <Share2 className="w-5 h-5" />
            แชร์ผลลัพธ์
          </button>
        </div>
        <Link href="/blueprint">
          <ZenButton fullWidth>
            <Download className="w-5 h-5 mr-2" />
            สร้าง Planner ของฉัน
          </ZenButton>
        </Link>
        <p className="text-center text-sm text-zen-text-muted">
          หรือ <Link href="/dashboard" className="text-zen-sage hover:underline">ไปหน้าหลัก →</Link>
        </p>
      </div>
    </main>
  );
}

function LoadingState() {
  return (
    <main className="min-h-screen bg-zen-bg flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-zen-sage animate-spin mx-auto mb-4" />
        <p className="text-zen-text-secondary">กำลังโหลด...</p>
      </div>
    </main>
  );
}

export default function QuizRevealPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <QuizRevealContent />
    </Suspense>
  );
}