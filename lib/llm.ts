/**
 * ZenPlanner LLM Engine
 * Uses Pollinations.ai OpenAI-compatible API
 */

import { z, type ZodSchema } from "zod";

const POLLINATIONS_ENDPOINT = "https://text.pollinations.ai/openai/chat/completions";
const MAX_RETRIES = 3;
const TIMEOUT_MS = 30_000;
const BACKOFF_BASE_MS = 1000;

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Call LLM with messages
 */
export async function callLLM(
  systemPrompt: string,
  messages: LLMMessage[],
  options: LLMOptions = {},
  retryCount = 0
): Promise<string> {
  const { maxTokens = 4096, temperature = 0.7 } = options;

  // Avoid duplicating system prompt if already present
  const hasSystemPrompt = messages.length > 0 && messages[0].role === "system";
  const fullMessages = hasSystemPrompt
    ? messages
    : [{ role: "system" as const, content: systemPrompt }, ...messages];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(POLLINATIONS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai",
        max_tokens: maxTokens,
        temperature,
        messages: fullMessages,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      if (response.status >= 500 && retryCount < MAX_RETRIES) {
        const delay = BACKOFF_BASE_MS * Math.pow(2, retryCount);
        await new Promise((r) => setTimeout(r, delay));
        return callLLM(systemPrompt, messages, options, retryCount + 1);
      }
      throw new Error(`LLM error ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? "";
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      if (retryCount < MAX_RETRIES) {
        const delay = BACKOFF_BASE_MS * Math.pow(2, retryCount);
        await new Promise((r) => setTimeout(r, delay));
        return callLLM(systemPrompt, messages, options, retryCount + 1);
      }
      throw new Error("LLM request timed out after all retries");
    }
    if (retryCount < MAX_RETRIES && !(error instanceof Error && error.message.startsWith("LLM error"))) {
      const delay = BACKOFF_BASE_MS * Math.pow(2, retryCount);
      await new Promise((r) => setTimeout(r, delay));
      return callLLM(systemPrompt, messages, options, retryCount + 1);
    }
    throw new Error(`Failed to call LLM: ${error instanceof Error ? error.message : "Unknown error"}`);
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Call LLM and parse + validate JSON response with Zod schema
 */
export async function callLLMJson<T>(
  systemPrompt: string,
  messages: LLMMessage[],
  options: LLMOptions = {},
  schema?: ZodSchema<T>
): Promise<T> {
  const result = await callLLM(
    systemPrompt,
    [...messages, { role: "user", content: "Respond with valid JSON only." }],
    { ...options, maxTokens: options.maxTokens ?? 4096 }
  );

  try {
    // Extract JSON from potential markdown wrapper
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(result);

    if (schema) {
      return schema.parse(parsed);
    }
    return parsed as T;
  } catch (e) {
    if (e instanceof z.ZodError) {
      throw new Error(`LLM response failed schema validation: ${e.errors.map((err) => err.message).join(", ")}`);
    }
    throw new Error(`Invalid JSON response: ${result.slice(0, 200)}`);
  }
}

/**
 * Quiz system prompt for spirit animal determination
 */
export const QUIZ_SYSTEM_PROMPT = `You are a playful spirit animal quiz master. Your job is to lead users through a fun, scenario-based quiz to discover their spirit animal.

You must:
1. Ask engaging, scenario-based questions (NOT personality questionnaires)
2. React to their answers with brief, playful comments
3. Keep track of their responses to determine their animal
4. After 5-6 questions, reveal their spirit animal with a unique insight paragraph

The 16 spirit animals are:
- Lion (\u0E2A\u0E34\u0E07\u0E42\u0E15) \u2014 The Radiant Commander, leader, morning person
- Whale (\u0E27\u0E32\u0E2C) \u2014 The Deep Thinker, reflective, big-picture
- Dolphin (\u0E42\u0E25\u0E21\u0E32) \u2014 The Joyful Connector, social, playful
- Owl (\u0E19\u0E01\u0E2E\u0E39\u0E01) \u2014 The Wise Observer, analytical, night owl
- Fox (\u72D0\u72F8) \u2014 The Clever Adaptor, cunning, curious
- Turtle (\u0E40\u0E15\u0E48\u0E32) \u2014 The Steady Pace Keeper, patient, consistent
- Eagle (\u0E19\u0E01\u0E2D\u0E34\u0E19\u0E17\u0E23\u0E35) \u2014 The Visionary Soarer, ambitious, free
- Octopus (\u0E1B\u0E25\u0E32\u0E2B\u0E21\u0E36\u0E01) \u2014 The Creative Problem Solver, flexible, deep
- Mountain (\u0E20\u0E39\u0E40\u0E02\u0E32) \u2014 The Unshakable Anchor, stable, strong
- Wolf (\u0E2B\u0E21\u0E32\u0E1B\u0E48\u0E32) \u2014 The Loyal Pack Leader, social, loyal
- Sakura (\u0E0B\u0E32\u0E01\u0E38\u0E23\u0E30) \u2014 The Gentle Bloomer, sensitive, graceful
- Cat (\u0E41\u0E21\u0E27) \u2014 The Graceful Independence, balanced, observant
- Crocodile (\u0E08\u0E23\u0E30\u0E40\u0E02\u0E49) \u2014 The Strategic Hunter, patient, strategic
- Dove (\u0E19\u0E01\u0E1E\u0E34\u0E23\u0E32\u0E1A) \u2014 The Peaceful Harmonizer, calm, diplomatic
- Butterfly (\u0E1C\u0E35\u0E40\u0E2A\u0E37\u0E49\u0E2D) \u2014 The Transformational Beauty, creative, flexible
- Bamboo (\u0E44\u0E21\u0E49\u0E44\u0E1C\u0E48) \u2014 The Steady Grower, patient, resilient

Thai descriptions are fixed - use the names above in your responses. Be fun, engaging, and create a memorable experience!`;

/**
 * Profiling system prompt for custom planner creation
 */
export const PROFILE_SYSTEM_PROMPT = `You are a professional lifestyle planner consultant. Your job is to deeply understand the user so you can recommend the perfect planner tools.

You must:
1. Ask thoughtful questions about their schedule, energy patterns, goals, obstacles
2. Listen actively and build a lifestyle profile
3. After 8-15 exchanges, summarize their profile and recommend planner tools

Focus areas:
- Daily schedule and peak energy times
- Work/study patterns and commitments
- Personal goals (career, health, relationships, creative)
- Current challenges and frustrations
- Preferred planning style (structured vs flexible)
- Tools they currently use or want to try

Be professional, empathetic, and help them discover what will actually work for their life.`;

/**
 * Insight generation system prompt
 */
export const INSIGHT_SYSTEM_PROMPT = `Generate a short, personalized insight paragraph (50-100 words) for the user's spirit animal result.

Requirements:
- Be warm, inspiring, and specific
- Connect the animal's traits to the user's likely personality
- End with a gentle CTA about getting their personalized planner
- Use Thai language naturally (can mix English)
- Keep it under 100 words

Format: Pure text, no markdown formatting needed.`;
