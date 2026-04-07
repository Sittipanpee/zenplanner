/**
 * Reveal Summary API
 * Generates a personalized LLM insight for the minigame quiz result page.
 * Uses gemini-flash-lite-3.1 via Pollinations for fast, cheap generation.
 */

import { NextRequest, NextResponse } from "next/server";
import { callLLM } from "@/lib/llm";
import { getAnimal } from "@/lib/animal-data";
import type { SpiritAnimal } from "@/lib/types";

const LANGUAGE_INSTRUCTION: Record<"en" | "th" | "zh", string> = {
  en: "Write in English.",
  th: "เขียนเป็นภาษาไทยทั้งหมด",
  zh: "全部用中文书写。",
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const animal = searchParams.get("animal") as SpiritAnimal | null;
  const locale = (searchParams.get("locale") ?? "th") as "en" | "th" | "zh";

  if (!animal) {
    return NextResponse.json({ error: "Missing animal" }, { status: 400 });
  }

  const energy   = Number(searchParams.get("energy")   ?? 50);
  const planning = Number(searchParams.get("planning") ?? 50);
  const social   = Number(searchParams.get("social")   ?? 50);
  const decision = Number(searchParams.get("decision") ?? 50);
  const focus    = Number(searchParams.get("focus")    ?? 50);
  const drive    = Number(searchParams.get("drive")    ?? 50);

  const animalData = getAnimal(animal);
  const animalName =
    locale === "th" ? animalData.nameTh :
    locale === "zh" ? animalData.nameZh :
    animalData.nameEn;

  const systemPrompt = `You are a warm, insightful spirit guide for ZenPlanner. ${LANGUAGE_INSTRUCTION[locale]}

Write a personal 2–3 sentence planning insight for someone whose spirit animal is ${animalName} (${animalData.archetypeTitle}).

Their axis profile:
- Energy: ${energy}/100 (${energy > 60 ? "morning person, high initiative" : "night owl, reflective"})
- Planning: ${planning}/100 (${planning > 60 ? "structured, detail-oriented" : "flexible, spontaneous"})
- Social: ${social}/100 (${social > 60 ? "energised by people" : "energised by solitude"})
- Decision: ${decision}/100 (${decision > 60 ? "decisive, action-oriented" : "reflective, careful"})
- Focus: ${focus}/100 (${focus > 60 ? "deep single focus" : "broad multi-track"})
- Drive: ${drive}/100 (${drive > 60 ? "achievement-oriented" : "seeks balance and harmony"})

Make it feel personal, warm, and specific to their archetype. No markdown, no bullet points. Pure prose only.`;

  try {
    const summary = await callLLM(
      systemPrompt,
      [{ role: "user", content: "Generate my planning insight." }],
      { model: "gemini-flash-lite-3.1", temperature: 0.75, maxTokens: 200 }
    );
    return NextResponse.json({ summary: summary.trim() });
  } catch {
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}
