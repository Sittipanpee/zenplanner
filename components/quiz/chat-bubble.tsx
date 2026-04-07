/**
 * Chat Bubble Component
 * Displays chat messages for quiz conversations
 * With dark mode support
 */

"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: Date;
  className?: string;
}

export function ChatBubble({
  message,
  isUser,
  timestamp,
  className,
}: ChatBubbleProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={cn(
        "flex w-full animate-zen-fade-in",
        isUser ? "justify-end" : "justify-start",
        className
      )}
      role="log"
      aria-live="polite"
    >
      <div
        className={cn(
          "max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 relative",
          isUser
            ? "bg-zen-sage text-white rounded-br-sm"
            : "bg-zen-surface dark:bg-zinc-800 border border-zen-border dark:border-zinc-700 text-zen-text dark:text-zinc-200 rounded-bl-sm"
        )}
      >
        {/* Message content */}
        <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
          {message}
        </p>

        {/* Timestamp */}
        {timestamp && (
          <span
            className={cn(
              "text-xs mt-1 block",
              isUser ? "text-white/70" : "text-zen-text-muted dark:text-zinc-500"
            )}
          >
            {formatTime(timestamp)}
          </span>
        )}

        {/* AI indicator dot */}
        {!isUser && (
          <div className="absolute -left-2 top-1/2 -translate-y-1/2" aria-hidden="true">
            <div className="w-3 h-3 rounded-full bg-zen-sage animate-zen-pulse-grow" />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Chat Input Component
 * Input field for user messages in quiz chat
 */
export interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  placeholder,
  disabled = false,
  className,
}: ChatInputProps) {
  const t = useTranslations("quiz");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSend();
      }
    }
  };

  return (
    <div
      className={cn(
        "flex items-end gap-2 p-4 bg-zen-surface dark:bg-zinc-900 border-t border-zen-border dark:border-zinc-700",
        className
      )}
    >
      <div className="flex-1 relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? t("profile.chatPlaceholder")}
          disabled={disabled}
          rows={1}
          className="w-full min-h-[44px] max-h-[120px] px-4 py-3 pr-12
            bg-zen-surface-alt dark:bg-zinc-800 border border-zen-border dark:border-zinc-700 rounded-2xl
            text-zen-text dark:text-zinc-200 text-base resize-none
            focus:outline-none focus:ring-2 focus:ring-zen-sage focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            placeholder:text-zen-text-muted dark:placeholder:text-zinc-500"
          style={{ fontSize: "16px" }}
          aria-label={placeholder ?? t("profile.chatPlaceholder")}
        />
      </div>
      <button
        onClick={onSend}
        disabled={disabled || !value.trim()}
        className="flex-shrink-0 w-11 h-11 rounded-full
          bg-zen-sage text-white
          hover:bg-zen-sage/90 active:scale-95
          disabled:bg-zen-border dark:disabled:bg-zinc-700 disabled:text-zen-text-muted
          transition-all duration-200 flex items-center justify-center
          focus-visible:ring-2 focus-visible:ring-zen-sage focus-visible:outline-none"
        aria-label={t("profile.send")}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
      </button>
    </div>
  );
}

/**
 * Typing Indicator
 * Shows when AI is thinking/typing
 */
export function ChatTypingIndicator({ className }: { className?: string }) {
  return (
    <div className={cn("flex justify-start animate-zen-fade-in", className)} aria-live="polite" aria-label="AI is typing">
      <div className="bg-zen-surface dark:bg-zinc-800 border border-zen-border dark:border-zinc-700 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-zen-text-muted dark:bg-zinc-500 animate-zen-bounce-playful"
              style={{ animationDelay: `${i * 0.15}s` }}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
