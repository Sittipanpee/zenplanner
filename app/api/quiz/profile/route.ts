/**
 * Quiz Profile API
 * Handle lifestyle profiling chat
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { callLLM } from "@/lib/llm";
import { buildQuizSystemPrompt } from "@/lib/quiz-prompts";
import type { LLMMessage } from "@/lib/llm";
import type { LifestyleProfile } from "@/lib/types";

// Zod schema for validating parsed lifestyle profile JSON
const LifestyleProfileSchema = z.object({
  schedule: z.string().min(1),
  energy_pattern: z.string().min(1),
  goals: z.array(z.string()).min(1),
  obstacles: z.array(z.string()).min(1),
  preferences: z.record(z.string(), z.unknown()).optional().default({}),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId, message, spiritAnimal, conversation } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    // Detect locale from Accept-Language header
    const acceptLanguage = request.headers.get("accept-language") ?? "";
    let locale: "en" | "th" | "zh" = "th";
    if (acceptLanguage.startsWith("zh")) locale = "zh";
    else if (acceptLanguage.startsWith("en")) locale = "en";

    // Build system prompt (locale-aware, NOT duplicated into messages array)
    const systemPrompt = buildQuizSystemPrompt(locale);
    const spiritAnimalContext = spiritAnimal
      ? `\n\nUser's spirit animal is ${spiritAnimal}. Use this context to tailor your questions about their lifestyle.`
      : "";
    const fullSystemPrompt = systemPrompt + spiritAnimalContext;

    // Build conversation history — skip any existing system messages to prevent duplication
    const messages: LLMMessage[] = (conversation ?? [])
      .filter((msg: { role: string; content: string }) => msg.role !== "system")
      .map((msg: { role: string; content: string }) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));

    // Add current user message
    messages.push({ role: "user", content: message });

    // Call LLM — system prompt is passed separately (NOT prepended into messages)
    const reply = await callLLM(fullSystemPrompt, messages, {
      temperature: 0.7,
      maxTokens: 500,
    });

    // Step 1: Extract JSON first (before checking for completion tag)
    let lifestyleProfile: LifestyleProfile | null = null;
    let cleanReply = reply;

    const profileJsonMatch = reply.match(/\{[\s\S]*\}/);
    if (profileJsonMatch) {
      try {
        const parsed = JSON.parse(profileJsonMatch[0]);
        const validated = LifestyleProfileSchema.safeParse(parsed);
        if (validated.success) {
          lifestyleProfile = {
            schedule: validated.data.schedule,
            energy_pattern: validated.data.energy_pattern,
            goals: validated.data.goals,
            obstacles: validated.data.obstacles,
            preferences: validated.data.preferences,
          };
        } else {
          console.error("Lifestyle profile schema validation failed:", validated.error.issues);
        }
      } catch (e) {
        console.error("Failed to parse lifestyle profile JSON:", e);
      }
    }

    // Step 2: Check for completion tag AFTER attempting JSON extraction
    const isComplete =
      reply.includes("[PROFILE_COMPLETE]") ||
      reply.includes("[COMPLETE]") ||
      lifestyleProfile !== null;

    // Remove the completion markers from reply shown to user
    cleanReply = reply
      .replace(/\[PROFILE_COMPLETE\]|\[COMPLETE\]/g, "")
      .replace(/\{[\s\S]*\}/, "")
      .trim();

    // Update session in database if sessionId provided
    if (sessionId) {
      const newConversation = [
        ...(conversation ?? []).filter(
          (msg: { role: string }) => msg.role !== "system"
        ),
        { role: "user", content: message },
        { role: "assistant", content: cleanReply },
      ];

      await supabase
        .from("quiz_sessions")
        .update({
          conversation: newConversation,
          lifestyle_profile: lifestyleProfile,
          phase: isComplete ? "complete" : "profiling",
        })
        .eq("id", sessionId);
    }

    return NextResponse.json({
      reply: cleanReply,
      isComplete,
      lifestyleProfile,
    });
  } catch (error) {
    console.error("Quiz profile error:", error);
    return NextResponse.json({ error: "Profile chat failed" }, { status: 500 });
  }
}
