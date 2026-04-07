/**
 * ZenPlanner Quiz Prompts
 * Locale-aware prompt engineering for personality narrative generation,
 * quiz system prompts, and scoring prompts.
 */

import { z } from "zod";
import { callLLMJson } from "./llm";
import type { SpiritAnimal, AxisScores } from "./types";

// ============================================================
// ZOD SCHEMAS
// ============================================================

export const NarrativeSchema = z.object({
  summary: z.string().min(50).max(500),
  strengths: z.array(z.string()).length(3),
  growthAreas: z.array(z.string()).length(2),
  quote: z.string().min(20).max(200),
  toolReason: z.string().min(30).max(300),
});

export type PersonalityNarrative = z.infer<typeof NarrativeSchema>;

// ============================================================
// ANIMAL METAPHOR LIBRARY
// ============================================================

const ANIMAL_METAPHORS: Record<
  SpiritAnimal,
  { en: string; th: string; zh: string }
> = {
  lion: {
    en: "a radiant commander who lights the way for others",
    th: "ผู้นำที่เปล่งประกายและนำทางผู้อื่น",
    zh: "一位光芒四射的指挥官，为他人指引方向",
  },
  whale: {
    en: "a deep thinker who sees the ocean of possibility beneath the surface",
    th: "นักคิดลึกซึ้งที่มองเห็นมหาสมุทรแห่งความเป็นไปได้ใต้ผิวน้ำ",
    zh: "一位深邃的思考者，在表象之下看到可能性的海洋",
  },
  dolphin: {
    en: "a joyful connector who turns every moment into celebration",
    th: "ผู้เชื่อมต่อด้วยความสุขที่เปลี่ยนทุกช่วงเวลาเป็นงานเฉลิมฉลอง",
    zh: "一位快乐的连接者，将每一刻都变成欢庆",
  },
  owl: {
    en: "a wise observer who notices what others overlook in the quiet hours",
    th: "นักสังเกตการณ์ผู้ชาญฉลาดที่สังเกตเห็นสิ่งที่คนอื่นมองข้ามในยามสงบ",
    zh: "一位睿智的观察者，在宁静时刻注意到他人忽略的事物",
  },
  fox: {
    en: "a clever adaptor who finds elegant solutions in complex terrain",
    th: "ผู้ปรับตัวอันฉลาดที่หาทางออกอันงดงามในสถานการณ์ซับซ้อน",
    zh: "一位聪明的适应者，在复杂地形中找到优雅的解决方案",
  },
  turtle: {
    en: "a steady pace keeper whose quiet consistency achieves what urgency cannot",
    th: "ผู้รักษาจังหวะที่มั่นคง ความสม่ำเสมอของเขาทำได้สิ่งที่ความเร่งรีบไม่อาจทำได้",
    zh: "一位稳健的节奏保持者，其安静的坚持实现了紧迫感无法达到的目标",
  },
  eagle: {
    en: "a visionary soarer who maps the full horizon before taking flight",
    th: "ผู้บินสูงด้วยวิสัยทัศน์ที่วาดแผนที่ขอบฟ้าทั้งหมดก่อนกางปีก",
    zh: "一位有远见的翱翔者，在起飞前就已绘制出完整的地平线",
  },
  octopus: {
    en: "a creative problem solver who thinks in all directions simultaneously",
    th: "นักแก้ปัญหาสร้างสรรค์ที่คิดได้ทุกทิศทางพร้อมกัน",
    zh: "一位创意问题解决者，能同时向各个方向思考",
  },
  mountain: {
    en: "an unshakable anchor who provides the foundation others build upon",
    th: "ยักษ์ที่ไม่สั่นคลอน เป็นรากฐานที่คนอื่นสร้างขึ้นบน",
    zh: "一位不可撼动的锚点，为他人提供赖以建立的基础",
  },
  wolf: {
    en: "a loyal pack leader whose strength multiplies through deep bonds",
    th: "ผู้นำฝูงที่ซื่อสัตย์ ซึ่งความแข็งแกร่งทวีคูณผ่านสายสัมพันธ์อันลึกซึ้ง",
    zh: "一位忠诚的领袖，其力量通过深厚的纽带而倍增",
  },
  sakura: {
    en: "a gentle bloomer who understands that beauty and timing are everything",
    th: "ดอกไม้ที่บานอย่างอ่อนโยน ซึ่งเข้าใจว่าความงามและจังหวะเวลาคือทุกอย่าง",
    zh: "一位温柔的绽放者，深知美丽与时机就是一切",
  },
  cat: {
    en: "a graceful independent who moves through life with quiet self-awareness",
    th: "ผู้อิสระที่งดงาม เดินผ่านชีวิตด้วยความตระหนักรู้ในตนเองอย่างสงบ",
    zh: "一位优雅的独立者，以安静的自我意识穿行于生活",
  },
  crocodile: {
    en: "a strategic hunter whose patience transforms into precise, powerful action",
    th: "นักล่าเชิงกลยุทธ์ที่ความอดทนแปรเปลี่ยนเป็นการกระทำที่แม่นยำและทรงพลัง",
    zh: "一位战略性的猎手，其耐心转化为精准而有力的行动",
  },
  dove: {
    en: "a peaceful harmonizer who builds bridges where others see walls",
    th: "ผู้สร้างความสมดุลอันสงบ ที่สร้างสะพานในที่ที่คนอื่นเห็นกำแพง",
    zh: "一位平和的调和者，在他人看到墙壁的地方架起桥梁",
  },
  butterfly: {
    en: "a transformational explorer who finds freedom in constant becoming",
    th: "นักสำรวจแห่งการเปลี่ยนแปลง ที่พบอิสรภาพในการเติบโตอย่างต่อเนื่อง",
    zh: "一位蜕变中的探索者，在不断成长中寻得自由",
  },
  bamboo: {
    en: "a steady grower whose roots run deep and whose rise is inevitable",
    th: "ผู้เติบโตอย่างมั่นคง ซึ่งรากลึกและการขึ้นสูงเป็นสิ่งที่หลีกเลี่ยงไม่ได้",
    zh: "一位稳健的成长者，根扎得深，崛起不可阻挡",
  },
};

// ============================================================
// LOCALE-AWARE PROMPT BUILDERS
// ============================================================

/**
 * Build the quiz system prompt for conversational spirit animal discovery.
 * Used in both /quiz/step (custom mode) and /quiz/profile routes.
 */
export function buildQuizSystemPrompt(locale: "en" | "th" | "zh"): string {
  const languageInstruction: Record<string, string> = {
    en: "Respond in English.",
    th: "ตอบเป็นภาษาไทย",
    zh: "请用中文回答。",
  };

  const animalList = `Lion / Whale / Dolphin / Owl / Fox / Turtle / Eagle / Octopus / Mountain / Wolf / Sakura / Cat / Crocodile / Dove / Butterfly / Bamboo`;

  return `You are a warm and perceptive spirit animal guide for ZenPlanner, a mindful planning app.
Your role: Lead users through an engaging, scenario-based discovery to reveal their spirit animal from 16 archetypes.

${languageInstruction[locale]}

Guidelines:
1. Ask vivid, scenario-based questions — never dry personality tests
2. React to each answer with a brief, warm acknowledgment (1 sentence)
3. Build naturally toward a reveal after 5-8 exchanges
4. When revealing: name the animal, explain the metaphor, connect it to their answers
5. Keep language warm, encouraging, and psychologically grounding — never clinical

The 16 spirit animals: ${animalList}

When you have enough information, reveal the spirit animal and include a JSON block:
\`\`\`json
{"spirit_animal": "<animal_key>", "reason": "<2 sentence explanation>"}
\`\`\``;
}

/**
 * Build a scoring analysis prompt for reviewing a completed set of quiz answers.
 */
export function buildScoringPrompt(
  answers: Array<{ question: string; answer: string }>,
  locale: "en" | "th" | "zh"
): string {
  const languageInstruction: Record<string, string> = {
    en: "Respond in English.",
    th: "ตอบเป็นภาษาไทย",
    zh: "请用中文回答。",
  };

  const formattedAnswers = answers
    .map((a, i) => `Q${i + 1}: ${a.question}\nA: ${a.answer}`)
    .join("\n\n");

  return `You are a personality psychologist analyzing quiz responses to determine a spirit animal archetype.
${languageInstruction[locale]}

Analyze the following quiz responses and determine axis scores (0-100) for each of the 6 dimensions:
- energy: dawn igniter (high) vs night weaver (low)
- planning: architect (high) vs surfer (low)
- social: gatherer (high) vs hermit (low)
- decision: blade/decisive (high) vs petal/reflective (low)
- focus: laser/deep (high) vs kaleidoscope/broad (low)
- drive: summit/achievement (high) vs garden/balance (low)

Quiz responses:
${formattedAnswers}

Return a JSON object with axis scores.`;
}

/**
 * Build the narrative generation prompt for the personality report.
 */
export function buildNarrativePrompt(
  animal: SpiritAnimal,
  scores: AxisScores,
  locale: "en" | "th" | "zh",
  archetypeTitle: string
): string {
  const metaphor = ANIMAL_METAPHORS[animal];
  const animalMetaphor = metaphor?.[locale] ?? metaphor?.en ?? animal;

  const languageInstruction: Record<string, string> = {
    en: "Write entirely in English.",
    th: "เขียนทั้งหมดเป็นภาษาไทย",
    zh: "全部用中文书写。",
  };

  const dominantAxes = getDominantAxes(scores);

  return `You are a warm, insightful personality psychologist writing a personalized spirit animal report for ZenPlanner.

${languageInstruction[locale]}

Spirit animal: ${animal} — "${archetypeTitle}"
Metaphorical essence: ${animalMetaphor}

Axis scores (0-100):
- Energy: ${scores.energy}/100 ${scores.energy > 60 ? "(dawn igniter — morning person, high initiative)" : "(night weaver — reflective, deep-evening focus)"}
- Planning: ${scores.planning}/100 ${scores.planning > 60 ? "(architect — detailed, structured)" : "(surfer — flexible, spontaneous)"}
- Social: ${scores.social}/100 ${scores.social > 60 ? "(gatherer — energized by people)" : "(hermit — energized by solitude)"}
- Decision: ${scores.decision}/100 ${scores.decision > 60 ? "(blade — decisive, action-oriented)" : "(petal — reflective, careful)"}
- Focus: ${scores.focus}/100 ${scores.focus > 60 ? "(laser — deep single focus)" : "(kaleidoscope — broad multi-track)"}
- Drive: ${scores.drive}/100 ${scores.drive > 60 ? "(summit — achievement-oriented)" : "(garden — balance and harmony)"}

Dominant traits: ${dominantAxes.join(", ")}

Write a personality narrative with these sections. Requirements:
- summary: 2-3 sentences that feel personal, specific, and psychologically rich — NOT generic
- strengths: exactly 3 planning-specific strengths this person naturally has
- growthAreas: exactly 2 areas where gentle growth would serve them
- quote: an inspiring quote (original or attributed) that perfectly fits their archetype
- toolReason: 1-2 sentences explaining WHY their recommended planning tools suit their personality

Tone: Warm, encouraging, like a wise friend who truly sees them. Never clinical or MBTI-style.
Cultural fit: Appropriate for ${locale === "th" ? "Thai" : locale === "zh" ? "Chinese" : "Western"} readers.

Respond with a JSON object matching this exact structure:
{
  "summary": "...",
  "strengths": ["...", "...", "..."],
  "growthAreas": ["...", "..."],
  "quote": "...",
  "toolReason": "..."
}`;
}

// ============================================================
// MAIN NARRATIVE GENERATION FUNCTION
// ============================================================

/**
 * Generate a locale-aware personality narrative for the quiz result.
 * Uses LLM with Zod schema validation and graceful fallback on failure.
 */
export async function generatePersonalityNarrative(params: {
  spiritAnimal: SpiritAnimal;
  axisScores: AxisScores;
  archetypeTitle: string;
  locale: "en" | "th" | "zh";
}): Promise<PersonalityNarrative> {
  const { spiritAnimal, axisScores, archetypeTitle, locale } = params;

  const systemPrompt = buildNarrativePrompt(
    spiritAnimal,
    axisScores,
    locale,
    archetypeTitle
  );

  try {
    const raw = await callLLMJson<unknown>(
      systemPrompt,
      [],
      { temperature: 0.75, maxTokens: 800 }
    );

    const validated = NarrativeSchema.safeParse(raw);
    if (validated.success) {
      return validated.data;
    }

    console.error(
      "Narrative schema validation failed:",
      validated.error.issues
    );
    return buildFallbackNarrative(spiritAnimal, archetypeTitle, locale);
  } catch (error) {
    console.error("generatePersonalityNarrative LLM call failed:", error);
    return buildFallbackNarrative(spiritAnimal, archetypeTitle, locale);
  }
}

// ============================================================
// FALLBACK NARRATIVE (when LLM fails)
// ============================================================

function buildFallbackNarrative(
  animal: SpiritAnimal,
  archetypeTitle: string,
  locale: "en" | "th" | "zh"
): PersonalityNarrative {
  const metaphor = ANIMAL_METAPHORS[animal];
  const metaphorText = metaphor?.[locale] ?? metaphor?.en ?? animal;

  if (locale === "th") {
    return {
      summary: `คุณคือ${archetypeTitle} — ${metaphorText} บุคลิกของคุณโดดเด่นในแบบที่เป็นเอกลักษณ์ ซึ่งส่งผลต่อวิธีที่คุณวางแผนและบรรลุเป้าหมาย`,
      strengths: [
        "มองเห็นภาพรวมและวางแผนได้อย่างมีประสิทธิภาพ",
        "มีความสม่ำเสมอในการลงมือทำสิ่งที่สำคัญ",
        "ปรับตัวได้ดีเมื่อสถานการณ์เปลี่ยนแปลง",
      ],
      growthAreas: [
        "เรียนรู้ที่จะผ่อนคลายและให้ตัวเองพักบ้าง",
        "เปิดรับมุมมองใหม่ๆ จากคนรอบข้างมากขึ้น",
      ],
      quote: "ความสำเร็จไม่ได้เกิดขึ้นในวันเดียว แต่เกิดจากทุกวันที่คุณเลือกลงมือทำ",
      toolReason:
        "เครื่องมือที่แนะนำสำหรับคุณได้รับการออกแบบมาเพื่อเสริมจุดแข็งตามธรรมชาติของคุณ และช่วยให้คุณบรรลุเป้าหมายได้อย่างยั่งยืน",
    };
  }

  if (locale === "zh") {
    return {
      summary: `你是${archetypeTitle} — ${metaphorText}。你独特的个性影响着你规划和实现目标的方式，以一种真正属于你自己的方式。`,
      strengths: [
        "能够看到全局并高效制定计划",
        "在坚持重要事务上保持一致性",
        "在情况变化时能够灵活适应",
      ],
      growthAreas: [
        "学会放松，允许自己休息",
        "更多地对周围人的新观点保持开放",
      ],
      quote: "成功不是一日之功，而是每天你选择行动的积累。",
      toolReason:
        "为你推荐的工具经过精心设计，旨在强化你的天然优势，帮助你以可持续的方式实现目标。",
    };
  }

  // English fallback
  return {
    summary: `You are ${archetypeTitle} — ${metaphorText}. Your distinctive personality shapes the way you plan and achieve your goals in a way that is genuinely your own.`,
    strengths: [
      "You naturally see the big picture and plan with efficiency",
      "You maintain consistency when pursuing what matters most",
      "You adapt gracefully when circumstances change",
    ],
    growthAreas: [
      "Learning to rest and give yourself permission to pause",
      "Opening more to fresh perspectives from those around you",
    ],
    quote:
      "Success is not built in a single day — it is built in every day you choose to begin.",
    toolReason:
      "The tools recommended for you are designed to amplify your natural strengths and help you reach your goals in a sustainable, fulfilling way.",
  };
}

// ============================================================
// HELPERS
// ============================================================

/**
 * Returns the labels of the top 2 dominant axes for use in prompts.
 */
function getDominantAxes(scores: AxisScores): string[] {
  const axes: Array<{ name: string; value: number }> = [
    { name: "energy", value: scores.energy },
    { name: "planning", value: scores.planning },
    { name: "social", value: scores.social },
    { name: "decision", value: scores.decision },
    { name: "focus", value: scores.focus },
    { name: "drive", value: scores.drive },
  ];

  // Score distance from 50 — the further from 50, the more dominant the axis
  return axes
    .map((a) => ({ ...a, dominance: Math.abs(a.value - 50) }))
    .sort((a, b) => b.dominance - a.dominance)
    .slice(0, 3)
    .map((a) => `${a.name} (${a.value}/100)`);
}
