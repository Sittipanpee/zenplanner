/**
 * ZenPlanner Quiz Engine
 * Handles quiz logic, state management, and animal determination
 */

import { callLLM, callLLMJson, QUIZ_SYSTEM_PROMPT, INSIGHT_SYSTEM_PROMPT } from "./llm";
import { getDominantAnimal, calculateToolRecommendations } from "./archetype-map";
import type { AxisScores, LifestyleProfile, SpiritAnimal } from "./types";
import { QUIZ_DATA } from "./quiz-data";

// Re-export for API routes
export { getDominantAnimal as determineAnimal, calculateToolRecommendations };

export interface QuizState {
  sessionId: string;
  mode: "minigame" | "custom";
  phase: "intro" | "quiz" | "reveal" | "profiling" | "complete";
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  questionCount: number;
  axisScores: AxisScores | null;
  spiritAnimal: SpiritAnimal | null;
  lifestyleProfile: LifestyleProfile | null;
}

// Re-export QuizPhase including 'intro' for callers
export type QuizPhase = "intro" | "quiz" | "reveal" | "profiling" | "complete";

// Quiz questions for minigame mode - imported from quiz-data.ts (22 questions in Thai)
const QUIZ_QUESTIONS = QUIZ_DATA.map((q) => ({
  id: q.id,
  scenario: q.scenario,
  options: q.options.map((opt) => ({
    text: opt.label,
    score: {
      energy: opt.score.energy,
      planning: opt.score.planning,
      social: opt.score.social,
      decision: opt.score.decision,
      focus: opt.score.focus,
      drive: opt.score.drive,
    },
  })),
}));

const MINIGAME_THRESHOLD = 10; // Number of questions before revealing animal

/**
 * Create initial quiz state
 */
export function createQuizState(sessionId: string, mode: "minigame" | "custom"): QuizState {
  return {
    sessionId,
    mode,
    phase: mode === "minigame" ? "quiz" : "profiling",
    messages: [],
    questionCount: 0,
    axisScores: null,
    spiritAnimal: null,
    lifestyleProfile: null,
  };
}

/**
 * Get current quiz question
 */
export function getCurrentQuestion(state: QuizState): string | null {
  if (state.mode !== "minigame" || state.phase !== "quiz") return null;
  const index = state.questionCount % QUIZ_QUESTIONS.length;
  return QUIZ_QUESTIONS[index]?.scenario ?? null;
}

/**
 * Process answer in minigame mode
 */
export async function processMinigameAnswer(
  state: QuizState,
  answerIndex: number
): Promise<{ reply: string; isComplete: boolean; state: QuizState }> {
  const question = QUIZ_QUESTIONS[state.questionCount % QUIZ_QUESTIONS.length];
  const answer = question.options[answerIndex];

  // Calculate new axis scores
  const newScores = calculateAxisScores(state.axisScores, answer.score);

  const newState: QuizState = {
    ...state,
    questionCount: state.questionCount + 1,
    axisScores: newScores,
  };

  // Check if complete
  const isComplete = newState.questionCount >= MINIGAME_THRESHOLD;

  let reply: string;
  if (isComplete) {
    newState.spiritAnimal = getDominantAnimal(newState.axisScores!);
    newState.phase = "reveal";
    reply = generateRevealMessage(newState.spiritAnimal);
  } else {
    const nextQuestion = QUIZ_QUESTIONS[newState.questionCount % QUIZ_QUESTIONS.length];
    reply = `สนุกมาก! งั้นมาต่อกันเลย...\n\n${nextQuestion.scenario}`;
  }

  return { reply, isComplete, state: newState };
}

/**
 * Calculate axis scores from answers
 */
function calculateAxisScores(
  current: AxisScores | null,
  delta: Partial<AxisScores>
): AxisScores {
  const base: AxisScores = current ?? {
    energy: 50,
    planning: 50,
    social: 50,
    decision: 50,
    focus: 50,
    drive: 50,
  };

  return {
    energy: clamp(base.energy + (delta.energy ?? 0)),
    planning: clamp(base.planning + (delta.planning ?? 0)),
    social: clamp(base.social + (delta.social ?? 0)),
    decision: clamp(base.decision + (delta.decision ?? 0)),
    focus: clamp(base.focus + (delta.focus ?? 0)),
    drive: clamp(base.drive + (delta.drive ?? 0)),
  };
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

/**
 * Generate reveal message for animal
 */
function generateRevealMessage(animal: SpiritAnimal): string {
  const animalMessages: Record<SpiritAnimal, string> = {
    lion: "✨ **สิงโต** — ราชาแห่งแรงบันดาลใจ ✨\n\nคุณคือผู้นำที่เกิดมาพร้อมวิสัยทัศน์! ตื่นเช้า มีพลัง และมุ่งมั่นสู่เป้าหมาย คุณไม่รอโอกาส — คุณสร้างมันขึ้นมาเอง\n\n🎯 *คุณเก่งเรื่องการวางแผนและการนำทีม แต่อาจต้องเรียนรู้การผ่อนคลายบ้าง*",
    whale: "🐋 **วาฬ** — นักคิดแห่งมหาสมุทร 🌊\n\nคุณมีความคิดที่ลึกซึ้งและมองเห็นภาพใหญ่ คุณไม่ต้องการความวุ่นวาย — คุณต้องการความหมาย\n\n🎯 *คุณเก่งในการคิดเชิงกลยุทธ์ แต่อาจต้องออกไปสัมผัสโลกภายนอกบ้าง*",
    dolphin: "🐬 **โลมา** — ผู้เชื่อมต่อแห่งความสุข 🌊\n\nคุณเกิดมาเพื่อสร้างความสนุกและเชื่อมโยงผู้คน! พลังงานของคุณมาจากการอยู่ร่วมกับผู้อื่น\n\n🎯 *คุณเก่งในการสื่อสารและสร้างบรรยากาศ แต่ต้องระวังการกระจายตัวมากเกินไป*",
    owl: "🦉 **นกฮูก** — ผู้สังเกตการณ์อันชาญฉลาด 🌙\n\nคุณเป็นนักวิเคราะห์ที่คิดทบทวนก่อนตัดสินใจ คุณมองเห็นสิ่งที่คนอื่นมองข้าม\n\n🎯 *คุณเก่งในการวิเคราะห์และแก้ปัญหา แต่อาจคิดมากเกินไป*",
    fox: "🦊 **狐狸** — ผู้ปรับตัวอันฉลาดหลักแหลม 🍂\n\nคุณฉลาดไหว ปรับตัวเก่ง และหาทางออกเสมอ ไม่ว่าสถานการณ์จะเป็นอย่างไร\n\n🎯 *คุณเก่งในการแก้ปัญหาเฉพาะหน้า แต่ต้องระวังความไม่แน่นอน*",
    turtle: "🐢 **เต่า** — ผู้รักษาจังหวะอย่างมั่นคง 🌿\n\nคุณไม่รีบ แต่ไม่เคยหยุด ด้วยความอดทนและความสม่ำเสมอ คุณไปถึงเป้าหมายได้เสมอ\n\n🎯 *คุณเก่งในการทำสิ่งสำคัญอย่างต่อเนื่อง แต่ต้องเร่งบ้างในบางจังหวะ*",
    eagle: "🦅 **นกอินทรี** — ผู้บินสู่วิสัยทัศน์ 🦅\n\nคุณมองเห็นเป้าหมายจากระยะไกลและบินตรงไปยังมัน อิสระและมุ่งมั่น\n\n🎯 *คุณเก่งในการวางแผนระยะยาว แต่ต้องระวังการหย่อนความสนใจในรายละเอียด*",
    octopus: "🐙 **ปลาหมึก** — นักแก้ปัญหาสร้างสรรค์ 🐙\n\nคุณคิดได้หลายทิศทางพร้อมกัน ยืดหยุ่นและปรับตัวได้ดีเยี่ยม\n\n🎯 *คุณเก่งในการคิดสร้างสรรค์ แต่ต้องระวังการกระจายตัวมากเกินไป*",
    mountain: "⛰️ **ภูเขา** — ยักษ์ที่ไม่สั่นคลอน 🏔️\n\nคุณเป็นเสาหลักที่คนอื่นพึ่งพาได้ แข็งแกร่ง มั่นคง และเชื่อถือได้\n\n🎯 *คุณเก่งในการเป็นผู้นำที่เชื่อถือได้ แต่ต้องเรียนรู้การยืดหยุ่นบ้าง*",
    wolf: "🐺 **หมาป่า** — ผู้นำฝูงชน 🔥\n\nคุณภักดีต่อฝูงและพร้อมลงมือทำเพื่อคนที่คุณรัก สังคมและภักดี\n\n🎯 *คุณเก่งในการสร้างทีมและความไว้วางใจ แต่ต้องระวังการควบคุมมากเกินไป*",
    sakura: "🌸 **ซากุระ** — ดอกไม้ที่บานอย่างอ่อนโยน 🌸\n\nคุณอ่อนโยน สวยงาม และมีความเข้าใจ รู้สึกอะไรลึกซึ้งและเห็นอกเห็นใจผู้อื่น\n\n🎯 *คุณเก่งในการเข้าใจผู้อื่นและสร้างความสมดุล แต่ต้องดูแลตัวเองด้วย*",
    cat: "🐱 **แมว** — ผู้สังเกตการณ์อิสระ 😺\n\nคุณสมดุลระหว่างสังคมและความสงบ อิสระแต่ไม่โดดเดี่ยว สังเกตการณ์มากกว่าพูด\n\n🎯 *คุณเก่งในการรักษาความสมดุล แต่ต้องระวังการตัดตัวออกมากเกินไป*",
    crocodile: "🐊 **จระเข้** — นักล่าที่ใจเย็น 🐊\n\nคุณอดทน รอบคอบ และรอโอกาสอย่างฉลาด คุณไม่รีบ แต่เมื่อลงมือแล้วแม่นยำ\n\n🎯 *คุณเก่งในการวางแผนระยะยาวและการใช้กลยุทธ์ แต่ต้องระวังความลังเล*",
    dove: "🕊️ **นกพิราบ** — ผู้สร้างความสมดุล 🕊️\n\nคุณสงบ สันติ และเป็นสะพานเชื่อมระหว่างผู้คน คุณต้องการความสมดุลในชีวิต\n\n🎯 *คุณเก่งในการสร้างความปรองดอง แต่ต้องยืนหยัดในสิ่งที่สำคัญบ้าง*",
    butterfly: "🦋 **ผีเสื้อ** — การเปลี่ยนแปลงที่สวยงาม 🦋\n\nคุณเปลี่ยนแปลงและเติบโตอยู่เสมอ สร้างสรรค์ ยืดหยุ่น และไม่หยุดนิ่ง\n\n🎯 *คุณเก่งในการปรับตัวและสร้างสรรค์ แต่ต้องระวังความไม่แน่นอน*",
    bamboo: "🎋 **ไม้ไผ่** — ผู้เติบโตอย่างมั่นคง 🎋\n\nคุณอดทนและเติบโตอย่างต่อเนื่อง ไม่สูงเร็ว แต่สูงอย่างมั่นคง คุณมีรากฐานที่แข็งแรง\n\n🎯 *คุณเก่งในการทำสิ่งสำคัญอย่างสม่ำเสมอ แต่ต้องผ่อนคลายบ้าง*",
  };

  return animalMessages[animal];
}

/**
 * Generate insight paragraph for animal
 */
export async function generateInsight(
  animal: SpiritAnimal,
  scores: AxisScores
): Promise<string> {
  const messages: { role: "user"; content: string }[] = [
    {
      role: "user",
      content: `Generate insight for someone with spirit animal: ${animal}. Axis scores: energy=${scores.energy}, planning=${scores.planning}, social=${scores.social}, decision=${scores.decision}, focus=${scores.focus}, drive=${scores.drive}`,
    },
  ];

  return callLLM(INSIGHT_SYSTEM_PROMPT, messages, { temperature: 0.8, maxTokens: 300 });
}