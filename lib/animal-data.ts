// ZenPlanner — Canonical Spirit Animal Data
// Single source of truth for all 16 spirit archetypes.
// Fixes P0 Issue #11: fox Chinese name (was broken, now correctly 狐狸)

import { SpiritAnimal } from './types'

export type AnimalData = {
  emoji: string
  nameTh: string       // Thai name (accurate, not phonetic)
  nameEn: string       // English name
  nameZh: string       // Simplified Chinese name (accurate)
  gradient: string     // CSS gradient for animal card background
  description: string  // 1-2 sentence English description
  descriptionTh?: string  // Thai description
  descriptionZh?: string  // Simplified Chinese description
  archetypeTitle: string  // e.g. "The Strategic Planner"
  traits: string[]     // 3 key personality traits in English
  particleEffect?: string
  frameAnimation?: string
}

export const ANIMALS: Record<SpiritAnimal, AnimalData> = {
  lion: {
    emoji: '🦁',
    nameTh: 'สิงโต',
    nameEn: 'Lion',
    nameZh: '狮子',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    description: 'Bold, decisive, and natural leaders who plan with conviction and inspire others to follow.',
    descriptionTh: 'สิงโตเป็นผู้นำที่เกิดมา มีวิสัยทัศน์กว้างไกลและกล้าหาญ วางแผนด้วยความมั่นใจและสร้างแรงบันดาลใจให้ผู้อื่นทำตาม',
    descriptionZh: '狮子是天生的领袖，具有远见卓识和无比勇气。他们以坚定的信念规划，激励他人追随。',
    archetypeTitle: 'The Confident Leader',
    traits: ['decisive', 'bold', 'visionary'],
    particleEffect: 'sparkle',
    frameAnimation: 'pulse-gold'
  },

  whale: {
    emoji: '🐋',
    nameTh: 'วาฬ',
    nameEn: 'Whale',
    nameZh: '鲸鱼',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)',
    description: 'Deeply reflective and emotionally intelligent, whales navigate life\'s depths with quiet wisdom.',
    descriptionTh: 'วาฬเป็นสัตว์ที่ใคร่ครวญลึกซึ้งและมีความฉลาดทางอารมณ์ นำทางชีวิตด้วยปัญญาอันสงบ',
    descriptionZh: '鲸鱼深思熟虑且情商极高，以安静的智慧驾驭人生的深处。',
    archetypeTitle: 'The Deep Thinker',
    traits: ['reflective', 'empathetic', 'patient'],
    particleEffect: 'bubbles',
    frameAnimation: 'wave-slow'
  },

  dolphin: {
    emoji: '🐬',
    nameTh: 'ปลาโลมา',
    nameEn: 'Dolphin',
    nameZh: '海豚',
    gradient: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
    description: 'Playful and highly intelligent, dolphins thrive in collaborative environments and find joy in every task.',
    archetypeTitle: 'The Joyful Collaborator',
    traits: ['playful', 'social', 'adaptive'],
    particleEffect: 'ripple',
    frameAnimation: 'bounce-gentle'
  },

  owl: {
    emoji: '🦉',
    nameTh: 'นกฮูก',
    nameEn: 'Owl',
    nameZh: '猫头鹰',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    description: 'Wise and methodical, owls plan with precision and see patterns in complexity that others overlook.',
    descriptionTh: 'นกฮูกมีสติปัญญาลึกซึ้งและมองเห็นสิ่งที่คนอื่นมองข้าม วางแผนอย่างเป็นระบบด้วยความแม่นยำ',
    descriptionZh: '猫头鹰拥有深邃的智慧，能看见他人忽略的事物。以精确的方法系统地规划一切。',
    archetypeTitle: 'The Wise Analyst',
    traits: ['analytical', 'precise', 'intuitive'],
    particleEffect: 'stars',
    frameAnimation: 'glow-violet'
  },

  fox: {
    emoji: '🦊',
    nameTh: 'สุนัขจิ้งจอก',
    nameEn: 'Fox',
    nameZh: '狐狸',  // P0 Fix #11 — was incorrect in prior codebase
    gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    description: 'Clever strategists who see opportunities others miss and adapt effortlessly to changing circumstances.',
    archetypeTitle: 'The Strategic Thinker',
    traits: ['clever', 'adaptive', 'resourceful'],
    particleEffect: 'sparkle',
    frameAnimation: 'flicker'
  },

  turtle: {
    emoji: '🐢',
    nameTh: 'เต่า',
    nameEn: 'Turtle',
    nameZh: '乌龟',
    gradient: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
    description: 'Steady, grounded, and persistent — turtles build lasting habits and reach their goals through consistent effort.',
    archetypeTitle: 'The Steady Achiever',
    traits: ['persistent', 'grounded', 'methodical'],
    particleEffect: 'leaves',
    frameAnimation: 'breathe-green'
  },

  eagle: {
    emoji: '🦅',
    nameTh: 'นกอินทรี',
    nameEn: 'Eagle',
    nameZh: '鹰',
    gradient: 'linear-gradient(135deg, #64748b 0%, #1e293b 100%)',
    description: 'Strategic visionaries with a panoramic perspective, eagles spot the big picture while executing with precision.',
    descriptionTh: 'นกอินทรีมองเห็นภาพรวมและเล็งเห็นโอกาสจากระยะไกล ดำเนินการตามวิสัยทัศน์ด้วยความแม่นยำ',
    descriptionZh: '鹰能纵观全局，从远处发现机会。以精确的执行力实现战略愿景。',
    archetypeTitle: 'The Strategic Visionary',
    traits: ['visionary', 'focused', 'strategic'],
    particleEffect: 'wind',
    frameAnimation: 'soar'
  },

  octopus: {
    emoji: '🐙',
    nameTh: 'ปลาหมึก',
    nameEn: 'Octopus',
    nameZh: '章鱼',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #9333ea 100%)',
    description: 'Highly creative multi-taskers who juggle multiple projects with fluid grace and inventive problem-solving.',
    archetypeTitle: 'The Creative Multi-Tasker',
    traits: ['creative', 'multitasking', 'inventive'],
    particleEffect: 'ink-burst',
    frameAnimation: 'tentacle-wave'
  },

  mountain: {
    emoji: '⛰️',
    nameTh: 'ภูเขา',
    nameEn: 'Mountain',
    nameZh: '山岳',
    gradient: 'linear-gradient(135deg, #78716c 0%, #44403c 100%)',
    description: 'Unshakeable and enduring, the mountain archetype embodies strength through stillness and long-term vision.',
    archetypeTitle: 'The Unshakeable Pillar',
    traits: ['resilient', 'steadfast', 'long-term thinker'],
    particleEffect: 'mist',
    frameAnimation: 'still-strong'
  },

  wolf: {
    emoji: '🐺',
    nameTh: 'หมาป่า',
    nameEn: 'Wolf',
    nameZh: '狼',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #312e81 100%)',
    description: 'Instinct-driven and fiercely loyal, wolves thrive in tight-knit teams and pursue goals with primal determination.',
    descriptionTh: 'หมาป่าเป็นสัตว์ที่ทำงานเป็นทีมและซื่อสัตย์ต่อฝูง ไล่ตามเป้าหมายด้วยความมุ่งมั่นอันแรงกล้า',
    descriptionZh: '狼是团队合作者，对群体忠诚无比。以原始的决心追求目标。',
    archetypeTitle: 'The Loyal Pack Leader',
    traits: ['instinctive', 'loyal', 'determined'],
    particleEffect: 'moonlight',
    frameAnimation: 'howl-pulse'
  },

  sakura: {
    emoji: '🌸',
    nameTh: 'ซากุระ',
    nameEn: 'Sakura',
    nameZh: '樱花',
    gradient: 'linear-gradient(135deg, #f9a8d4 0%, #db2777 100%)',
    description: 'Graceful and mindful, the sakura archetype finds beauty in impermanence and lives with intentional presence.',
    archetypeTitle: 'The Mindful Dreamer',
    traits: ['mindful', 'graceful', 'present'],
    particleEffect: 'petals',
    frameAnimation: 'float-soft'
  },

  cat: {
    emoji: '🐱',
    nameTh: 'แมว',
    nameEn: 'Cat',
    nameZh: '猫',
    gradient: 'linear-gradient(135deg, #fde68a 0%, #d97706 100%)',
    description: 'Independent and self-directed, cats follow their own rhythm and achieve goals on their own terms.',
    archetypeTitle: 'The Independent Spirit',
    traits: ['independent', 'curious', 'self-directed'],
    particleEffect: 'sparks',
    frameAnimation: 'slink'
  },

  crocodile: {
    emoji: '🐊',
    nameTh: 'จระเข้',
    nameEn: 'Crocodile',
    nameZh: '鳄鱼',
    gradient: 'linear-gradient(135deg, #4ade80 0%, #166534 100%)',
    description: 'Patient predators who plan every move with precision — when the moment arrives, execution is flawless.',
    archetypeTitle: 'The Patient Executor',
    traits: ['patient', 'precise', 'calculated'],
    particleEffect: 'ripple',
    frameAnimation: 'still-strike'
  },

  dove: {
    emoji: '🕊️',
    nameTh: 'นกพิราบ',
    nameEn: 'Dove',
    nameZh: '鸽子',
    gradient: 'linear-gradient(135deg, #e0f2fe 0%, #7dd3fc 100%)',
    description: 'Harmonious and empathetic, doves create peaceful, productive environments and mediate with natural grace.',
    archetypeTitle: 'The Peaceful Harmoniser',
    traits: ['empathetic', 'harmonious', 'calm'],
    particleEffect: 'feathers',
    frameAnimation: 'glide-soft'
  },

  butterfly: {
    emoji: '🦋',
    nameTh: 'ผีเสื้อ',
    nameEn: 'Butterfly',
    nameZh: '蝴蝶',
    gradient: 'linear-gradient(135deg, #a78bfa 0%, #f472b6 100%)',
    description: 'Transformative and free-spirited, butterflies embrace change as a source of growth and reinvent themselves with ease.',
    archetypeTitle: 'The Transformative Free Spirit',
    traits: ['adaptable', 'transformative', 'free-spirited'],
    particleEffect: 'sparkle-color',
    frameAnimation: 'flutter'
  },

  bamboo: {
    emoji: '🎋',
    nameTh: 'ไม้ไผ่',
    nameEn: 'Bamboo',
    nameZh: '竹子',
    gradient: 'linear-gradient(135deg, #86efac 0%, #16a34a 100%)',
    description: 'Flexible yet unbreakable, bamboo bends under pressure but never loses its core strength or sense of direction.',
    archetypeTitle: 'The Resilient Optimist',
    traits: ['flexible', 'resilient', 'growth-oriented'],
    particleEffect: 'leaves-green',
    frameAnimation: 'sway'
  }
}

/**
 * Get the full data record for a spirit animal.
 */
export function getAnimal(animal: SpiritAnimal): AnimalData {
  return ANIMALS[animal]
}

/**
 * Get the localised display name for a spirit animal.
 */
export function getAnimalName(animal: SpiritAnimal, locale: 'en' | 'th' | 'zh'): string {
  const data = ANIMALS[animal]
  if (locale === 'th') return data.nameTh
  if (locale === 'zh') return data.nameZh
  return data.nameEn
}
