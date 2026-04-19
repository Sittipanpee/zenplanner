/**
 * Reveal Summary API
 * Generates a personalized LLM insight for the minigame quiz result page.
 * Uses gemini-flash-lite-3.1 via Pollinations for fast, cheap generation.
 */

import { NextRequest, NextResponse } from "next/server";
import { callLLM } from "@/lib/llm";
import { getAnimal } from "@/lib/animal-data";
import { checkRateLimit, getClientIp } from "@/lib/api/rate-limit";
import type { SpiritAnimal } from "@/lib/types";

const LANGUAGE_INSTRUCTION: Record<"en" | "th" | "zh", string> = {
  en: "Write in English.",
  th: "เขียนเป็นภาษาไทยทั้งหมด",
  zh: "全部用中文书写。",
};

// ---------- Rate limiting (in-memory, per-IP) ----------
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;

// ---------- Axis description helpers ----------
function clampScore(raw: string | null): number {
  const n = Number(raw ?? 50);
  if (!Number.isFinite(n)) return 50;
  return Math.min(100, Math.max(0, n));
}

type AxisKey = "energy" | "planning" | "social" | "decision" | "focus" | "drive";

const AXIS_PHRASES: Record<AxisKey, { high: string; low: string; mid: string }> = {
  energy: {
    high: "charges up early, peak clarity before noon",
    low: "thinks deepest when the world quiets down",
    mid: "energy is contextual — depends on the task",
  },
  planning: {
    high: "maps the route before walking",
    low: "finds the way by moving",
    mid: "plans when stakes are high, improvises when they're low",
  },
  social: {
    high: "other people's energy is fuel",
    low: "does best thinking alone",
    mid: "calibrates between collaboration and solitude",
  },
  decision: {
    high: "makes the call and moves on",
    low: "turns the problem over until it clicks",
    mid: "fast on small things, slow on what matters",
  },
  focus: {
    high: "goes deep on one thing at a time",
    low: "works best across parallel tracks",
    mid: "focus adapts to the task",
  },
  drive: {
    high: "wants to reach something specific",
    low: "motivated by process and feeling, not just outcome",
    mid: "driven by both progress and meaning",
  },
};

function describeAxis(axis: AxisKey, value: number): string {
  const phrases = AXIS_PHRASES[axis];
  if (value > 65) return phrases.high;
  if (value < 40) return phrases.low;
  return phrases.mid;
}

export async function GET(request: NextRequest) {
  // Rate limit check
  const ip = getClientIp(request);
  const rl = checkRateLimit(`reveal-summary:${ip}`, {
    max: RATE_LIMIT_MAX,
    windowMs: RATE_LIMIT_WINDOW_MS,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: rl.retryAfter
          ? { "Retry-After": String(rl.retryAfter) }
          : undefined,
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const animal = searchParams.get("animal") as SpiritAnimal | null;
  const locale = (searchParams.get("locale") ?? "th") as "en" | "th" | "zh";

  if (!animal) {
    return NextResponse.json({ error: "Missing animal" }, { status: 400 });
  }

  // Server-side clamp every axis to [0, 100]
  const energy   = clampScore(searchParams.get("energy"));
  const planning = clampScore(searchParams.get("planning"));
  const social   = clampScore(searchParams.get("social"));
  const decision = clampScore(searchParams.get("decision"));
  const focus    = clampScore(searchParams.get("focus"));
  const drive    = clampScore(searchParams.get("drive"));

  const animalData = getAnimal(animal);
  const animalName =
    locale === "th" ? animalData.nameTh :
    locale === "zh" ? animalData.nameZh :
    animalData.nameEn;

  // Build plain-language axis descriptions
  const descriptions = [
    `- Energy: ${describeAxis("energy", energy)}`,
    `- Planning: ${describeAxis("planning", planning)}`,
    `- Social: ${describeAxis("social", social)}`,
    `- Decision-making: ${describeAxis("decision", decision)}`,
    `- Focus: ${describeAxis("focus", focus)}`,
    `- Drive: ${describeAxis("drive", drive)}`,
  ].join("\n");

  const systemPrompt = `You are a Narrative Designer writing personal planning insights for ZenPlanner. ${LANGUAGE_INSTRUCTION[locale]}

You are writing for a real person whose archetype is ${animalName} (${animalData.archetypeTitle}). Their lived patterns, in plain language:
${descriptions}

Write 2 to 3 sentences of warm, specific prose that reference AT LEAST 2 of the descriptions above — translated naturally into the target language, not quoted verbatim. Make it feel like the writer truly sees this person.

Hard rules:
- Do NOT name the animal — it is already shown above the text.
- Do NOT use bullet points, lists, headings, or markdown of any kind. Pure prose only.
- End with one natural sentence suggesting that a personalised planner can support how they actually work.`;

  try {
    const summary = await callLLM(
      systemPrompt,
      [{ role: "user", content: "Write the insight." }],
      { model: "gemini-flash-lite-3.1", temperature: 0.75, maxTokens: 220 }
    );
    return NextResponse.json({ summary: summary.trim() });
  } catch {
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}
