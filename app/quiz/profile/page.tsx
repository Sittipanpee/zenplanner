/**
 * Lifestyle Profiling Chat Page
 * Mode 2: Deep lifestyle profiling after animal quiz
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChatBubble, ChatInput, ChatTypingIndicator } from "@/components/quiz/chat-bubble";
import { ZenBadge } from "@/components/ui/zen-badge";
import { ArrowLeft, Sparkles } from "lucide-react";

// Profiling questions based on spirit animal
const PROFILING_SYSTEM_PROMPT = `คุณคือผู้ให้คำปรึกษาด้านการวางแผนชีวิตของ ZenPlanner
หลังจากได้รู้สัตว์ประจำตัวแล้ว คุณจะถามคำถามเพื่อทำความเข้าใจ lifestyle ของผู้ใช้

กฎ:
- ถามทีละคำถาม ตอบกลับด้วยคำถามใหม่หลังได้รับคำตอบ
- ใช้น้ำเสียงเป็นกันเอง ไม่เป็นทางการ
- คำถามครอบคลุม: ตารางประจำวัน, พลังงาน, เป้าหมาย, อุปสรรค, เครื่องมือที่เคยใช้, สไตล์ planner
- เมื่อได้ข้อมูลครบแล้ว ตอบกลับว่า "[PROFILE_COMPLETE]" แล้วตามด้วย JSON:
{"schedule": "...", "energy_pattern": "...", "goals": ["...", "..."], "obstacles": ["..."], "preferences": {...}}

เริ่มต้นด้วยการแนะนำตัวและถามคำถามแรก`;

const ANIMAL_EMOJI: Record<string, string> = {
  lion: "🦁",
  whale: "🐋",
  dolphin: "🐬",
  owl: "🦉",
  fox: "🦊",
  turtle: "🐢",
  eagle: "🦅",
  wolf: "🐺",
  cat: "🐱",
  butterfly: "🦋",
};

const INITIAL_MESSAGE = "สวัสดีค่ะ! ดีใจที่ได้รู้จักสัตว์ประจำตัวคุณแล้ว 🦁\n\nต่อไปผม/ดิฉัน อยากทำความรู้จักคุณให้มากขึ้น เพื่อออกแบบ Planner ที่เหมาะกับคุณจริงๆ\n\nเล่าให้ฟังได้เลยนะคะ — ตารางชีวิตประจำวันของคุณเป็นอย่างไรบ้าง? ตื่นกี่โมง นอนกี่โมง?";

export default function ProfilePage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: INITIAL_MESSAGE },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Get animal from URL or localStorage
  const [animal] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("animal") || "lion";
    }
    return "lion";
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || isComplete) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    try {
      // Call the profiling API
      const response = await fetch("/api/quiz/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          animal,
          conversation: messages,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      const reply = data.reply || "";

      // Check for completion
      if (reply.includes("[PROFILE_COMPLETE]")) {
        setIsComplete(true);
        // Remove the marker and show the completion message
        const cleanReply = reply.replace("[PROFILE_COMPLETE]", "").trim();
        setMessages((prev) => [...prev, { role: "assistant", content: cleanReply || "เยี่ยมมากค่ะ! ข้อมูลเพียงพอแล้ว พร้อมสร้าง Planner ให้คุณแล้ว 🎉" }]);

        // Redirect to blueprint after delay
        setTimeout(() => {
          router.push("/blueprint");
        }, 2000);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      }
    } catch (error) {
      console.error("Profile chat error:", error);
      // Fallback response
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "ขอบคุณสำหรับคำตอบค่ะ! มีอะไรอีกไหมที่อยากให้ผม/ดิฉันรู้ เกี่ยวกับเป้าหมายหรือความท้าทายในการวางแผนของคุณ?" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zen-bg flex flex-col">
      {/* Header with Animal Badge */}
      <div className="sticky top-0 bg-zen-bg/95 backdrop-blur-sm border-b border-zen-border z-10 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/quiz/reveal" className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-zen-text-secondary" />
          </Link>
          <div className="flex items-center gap-2">
            <ZenBadge variant="success" className="text-lg">
              {ANIMAL_EMOJI[animal] || "🦁"}
            </ZenBadge>
            <div>
              <h1 className="font-semibold text-zen-text text-sm">Lifestyle Profile</h1>
              <p className="text-xs text-zen-text-muted">ทำความรู้จักคุณ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-safe">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-zen-gold" />
          <span className="text-sm text-zen-text-muted">สร้าง Planner เฉพาะคุณ</span>
          <Sparkles className="w-4 h-4 text-zen-gold" />
        </div>

        {messages.map((msg, i) => (
          <ChatBubble
            key={i}
            message={msg.content}
            isUser={msg.role === "user"}
            timestamp={new Date()}
          />
        ))}

        {isLoading && <ChatTypingIndicator />}

        {isComplete && (
          <div className="text-center py-4 animate-zen-fade-in">
            <p className="text-zen-sage font-medium">กำลังไปยังหน้าปรับแต่ง Planner...</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {!isComplete && (
        <div className="sticky bottom-0 bg-zen-bg border-t border-zen-border">
          <ChatInput
            value={input}
            onChange={setInput}
            onSend={handleSend}
            placeholder="เล่าเรื่องราวของคุณได้เลย..."
            disabled={isLoading}
          />
        </div>
      )}
    </main>
  );
}
