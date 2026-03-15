/**
 * Quiz Profile API
 * Handle lifestyle profiling chat
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callLLM, PROFILE_SYSTEM_PROMPT } from "@/lib/llm";
import type { LLMMessage } from "@/lib/llm";
import type { LifestyleProfile, SpiritAnimal } from "@/lib/types";

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

    // Build conversation history for LLM
    const messages: LLMMessage[] = conversation?.map((msg: any) => ({
      role: msg.role as "system" | "user" | "assistant",
      content: msg.content,
    })) || [];

    // Add current user message
    messages.push({ role: "user", content: message });

    // Add context about spirit animal
    const contextMessage = spiritAnimal
      ? `User's spirit animal is ${spiritAnimal}. Use this context to tailor your questions about their lifestyle.`
      : "";
    if (contextMessage) {
      messages.unshift({ role: "system", content: PROFILE_SYSTEM_PROMPT + "\n\n" + contextMessage });
    } else {
      messages.unshift({ role: "system", content: PROFILE_SYSTEM_PROMPT });
    }

    // Call LLM for response
    const reply = await callLLM(PROFILE_SYSTEM_PROMPT, messages, {
      temperature: 0.7,
      maxTokens: 500,
    });

    // Check if profiling is complete
    const isComplete = reply.includes("[PROFILE_COMPLETE]") || reply.includes("[COMPLETE]");

    let lifestyleProfile: LifestyleProfile | null = null;
    let cleanReply = reply;

    if (isComplete) {
      // Extract lifestyle profile from response
      const profileMatch = reply.match(/\[[\s\S]*\]/);
      if (profileMatch) {
        try {
          lifestyleProfile = JSON.parse(profileMatch[0]);
        } catch (e) {
          console.error("Failed to parse lifestyle profile:", e);
        }
      }
      // Remove the [PROFILE_COMPLETE] marker from reply
      cleanReply = reply.replace(/\[PROFILE_COMPLETE\]|\[COMPLETE\]/g, "").trim();
    }

    // Update session in database if sessionId provided
    if (sessionId) {
      const newConversation = [
        ...(conversation || []),
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
