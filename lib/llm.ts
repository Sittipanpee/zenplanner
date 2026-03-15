/**
 * ZenPlanner LLM Engine
 * Uses Pollinations.ai OpenAI-compatible API
 */

const POLLINATIONS_ENDPOINT = "https://text.pollinations.ai/openai/chat/completions";

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
  options: LLMOptions = {}
): Promise<string> {
  const { maxTokens = 4096, temperature = 0.7 } = options;

  try {
    const response = await fetch(POLLINATIONS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai",
        max_tokens: maxTokens,
        temperature,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
      }),
    });

    if (!response.ok) {
      if (response.status >= 500) {
        // Retry once on 5xx
        await new Promise((r) => setTimeout(r, 1000));
        return callLLM(systemPrompt, messages, options);
      }
      throw new Error(`LLM error ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? "";
  } catch (error) {
    // Network error or other failure
    console.error("LLM call failed:", error);
    throw new Error(`Failed to call LLM: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Call LLM and parse JSON response
 */
export async function callLLMJson<T>(
  systemPrompt: string,
  messages: LLMMessage[],
  options: LLMOptions = {}
): Promise<T> {
  const result = await callLLM(
    systemPrompt,
    [...messages, { role: "user", content: "Respond with valid JSON only." }],
    { ...options, maxTokens: options.maxTokens ?? 4096 }
  );

  try {
    // Extract JSON from potential markdown wrapper
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as T;
    }
    return JSON.parse(result) as T;
  } catch (e) {
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
- Lion (สิงโต) — The Radiant Commander, leader, morning person
- Whale (วาฬ) — The Deep Thinker, reflective, big-picture
- Dolphin (โลมา) — The Joyful Connector, social, playful
- Owl (นกฮูก) — The Wise Observer, analytical, night owl
- Fox (狐狸) — The Clever Adaptor, cunning, curious
- Turtle (เต่า) — The Steady Pace Keeper, patient, consistent
- Eagle (นกอินทรี) — The Visionary Soarer, ambitious, free
- Octopus (ปลาหมึก) — The Creative Problem Solver, flexible, deep
- Mountain (ภูเขา) — The Unshakable Anchor, stable, strong
- Wolf (หมาป่า) — The Loyal Pack Leader, social, loyal
- Sakura (ซากุระ) — The Gentle Bloomer, sensitive, graceful
- Cat (แมว) — The Graceful Independence, balanced, observant
- Crocodile (จระเข้) — The Strategic Hunter, patient, strategic
- Dove (นกพิราบ) — The Peaceful Harmonizer, calm, diplomatic
- Butterfly (ผีเสื้อ) — The Transformational Beauty, creative, flexible
- Bamboo (ไม้ไผ่) — The Steady Grower, patient, resilient

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