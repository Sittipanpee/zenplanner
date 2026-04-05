/**
 * Lifestyle Profiling Chat Page
 * Mode 2: Deep lifestyle profiling after animal quiz
 * With i18n, dark mode, cancel/skip button (no forced redirect)
 */

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { getAnimal } from "@/lib/animal-data";
import type { SpiritAnimal } from "@/lib/types";
import { ChatBubble, ChatInput, ChatTypingIndicator } from "@/components/quiz/chat-bubble";
import { ZenBadge } from "@/components/ui/zen-badge";
import { ZenButton } from "@/components/ui/zen-button";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("quiz");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [redirectTimer, setRedirectTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Get animal from URL or fallback
  const [animal] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("animal") || "lion";
    }
    return "lion";
  });

  const animalData = getAnimal(animal as SpiritAnimal);
  const animalName = locale === "th" ? animalData.nameTh : locale === "zh" ? animalData.nameZh : animalData.nameEn;

  // Set initial message on mount
  useEffect(() => {
    setMessages([
      { role: "assistant", content: t("profile.title") },
    ]);
  }, [t]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /** Cancel auto-redirect */
  const cancelRedirect = useCallback(() => {
    if (redirectTimer) {
      clearTimeout(redirectTimer);
      setRedirectTimer(null);
    }
  }, [redirectTimer]);

  /** Skip profiling and go directly to blueprint */
  const handleSkip = useCallback(() => {
    cancelRedirect();
    router.push("/blueprint");
  }, [cancelRedirect, router]);

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
        setMessages((prev) => [...prev, { role: "assistant", content: cleanReply || t("profile.complete") }]);

        // Start redirect timer — user can cancel
        const timer = setTimeout(() => {
          router.push("/blueprint");
        }, 5000);
        setRedirectTimer(timer);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      }
    } catch (error) {
      console.error("Profile chat error:", error);
      // Fallback response
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: tCommon("errors.networkError") },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zen-bg dark:bg-zinc-950 flex flex-col">
      {/* Header with Animal Badge */}
      <div className="sticky top-0 bg-zen-bg/95 dark:bg-zinc-950/95 backdrop-blur-sm border-b border-zen-border dark:border-zinc-700 z-10 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/quiz/reveal" className="p-2 -ml-2">
              <ArrowLeft className="w-5 h-5 text-zen-text-secondary dark:text-zinc-400" />
            </Link>
            <div className="flex items-center gap-2">
              <ZenBadge variant="success" className="text-lg">
                {animalData.emoji}
              </ZenBadge>
              <div>
                <h1 className="font-semibold text-zen-text dark:text-zinc-100 text-sm">{t("profile.title")}</h1>
                <p className="text-xs text-zen-text-muted dark:text-zinc-500">{animalName}</p>
              </div>
            </div>
          </div>
          {/* Skip button */}
          <button
            onClick={handleSkip}
            className="text-sm text-zen-text-muted dark:text-zinc-500 hover:text-zen-text dark:hover:text-zinc-300 transition-colors"
          >
            {tCommon("actions.skip")}
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-safe">
        <div className="flex items-center justify-center gap-2 mb-4" aria-hidden="true">
          <Sparkles className="w-4 h-4 text-zen-gold" />
          <span className="text-sm text-zen-text-muted dark:text-zinc-500">{t("profile.title")}</span>
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
          <div className="text-center py-4 animate-zen-fade-in space-y-3">
            <p className="text-zen-sage font-medium">{t("profile.complete")}</p>
            <div className="flex gap-2 justify-center">
              <ZenButton size="sm" onClick={() => router.push("/blueprint")}>
                {tCommon("actions.continue")}
              </ZenButton>
              <ZenButton size="sm" variant="ghost" onClick={cancelRedirect}>
                {tCommon("actions.cancel")}
              </ZenButton>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {!isComplete && (
        <div className="sticky bottom-0 bg-zen-bg dark:bg-zinc-950 border-t border-zen-border dark:border-zinc-700">
          <ChatInput
            value={input}
            onChange={setInput}
            onSend={handleSend}
            placeholder={t("profile.chatPlaceholder")}
            disabled={isLoading}
          />
        </div>
      )}
    </main>
  );
}
