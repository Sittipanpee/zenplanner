/**
 * LINE Share Flex Message API
 * Generate Flex Message JSON for animal reveal sharing
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SpiritAnimal } from "@/lib/types";

// Animal emoji mapping
const ANIMAL_EMOJI: Record<SpiritAnimal, string> = {
  lion: "🦁",
  whale: "🐋",
  dolphin: "🐬",
  owl: "🦉",
  fox: "🦊",
  turtle: "🐢",
  eagle: "🦅",
  octopus: "🐙",
  mountain: "⛰️",
  wolf: "🐺",
  sakura: "🌸",
  cat: "🐱",
  crocodile: "🐊",
  dove: "🕊️",
  butterfly: "🦋",
  bamboo: "🎋",
};

// Animal name mapping (Thai)
const ANIMAL_NAME: Record<SpiritAnimal, string> = {
  lion: "สิงโต",
  whale: "วาฬ",
  dolphin: "โลมา",
  owl: "นกฮูก",
  fox: "จิ้งจอก",
  turtle: "เต่า",
  eagle: "อินทรี",
  octopus: "ปลาหมึก",
  mountain: "ภูเขา",
  wolf: "หมาป่า",
  sakura: "ซากุระ",
  cat: "แมว",
  crocodile: "จระเข้",
  dove: "นกพิราบ",
  butterfly: "ผีเสื้อ",
  bamboo: "ไผ่",
};

// Archetype description mapping
const ARCHETYPE_DESC: Record<SpiritAnimal, string> = {
  lion: "ผู้นำที่เกิดมาพร้อมวิสัยทัศน์",
  whale: "นักคิดแห่งมหาสมุทร",
  dolphin: "ผู้เชื่อมต่อแห่งความสุข",
  owl: "ผู้สังเกตการณ์อันชาญฉลาด",
  fox: "ผู้ปรับตัวอันฉลาดหลักแหลม",
  turtle: "ผู้รักษาจังหวะอย่างมั่นคง",
  eagle: "ผู้บินสู่วิสัยทัศน์",
  octopus: "นักแก้ปัญหาสร้างสรรค์",
  mountain: "ยักษ์ที่ไม่สั่นคลอน",
  wolf: "ผู้นำฝูงชน",
  sakura: "ดอกไม้ที่บานอย่างอ่อนโยน",
  cat: "ผู้สังเกตการณ์อิสระ",
  crocodile: "นักล่าที่ใจเย็น",
  dove: "ผู้สร้างความสมดุล",
  butterfly: "การเปลี่ยนแปลงที่สวยงาม",
  bamboo: "ผู้เติบโตอย่างมั่นคง",
};

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { animal, archetypeCode, userName } = await request.json();

    if (!animal || !isSpiritAnimal(animal)) {
      return NextResponse.json({ error: "Invalid animal" }, { status: 400 });
    }

    const emoji = ANIMAL_EMOJI[animal];
    const name = ANIMAL_NAME[animal];
    const description = ARCHETYPE_DESC[animal];
    const quizUrl = process.env.NEXT_PUBLIC_APP_URL || "https://zenplanner.app";

    // Generate Flex Message JSON
    const flexMessage = {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "🧘 ZenPlanner",
            size: "xs",
            color: "#7C9A82",
          },
          {
            type: "text",
            text: `ฉันคือ ${emoji} ${name}!`,
            size: "xl",
            weight: "bold",
            color: "#2C2C2C",
          },
          {
            type: "text",
            text: `${description} — ${archetypeCode || ""}`,
            size: "sm",
            color: "#6B6560",
            margin: "sm",
          },
          {
            type: "text",
            text: userName ? `โดย ${userName}` : "มาค้นหาสัตว์ประจำตัวคุณกัน!",
            size: "xs",
            color: "#A8A098",
            margin: "md",
          },
          {
            type: "button",
            action: {
              type: "uri",
              label: "ค้นหาสัตว์ประจำตัวคุณ",
              uri: `${quizUrl}/quiz`,
            },
            style: "primary",
            color: "#7C9A82",
            margin: "lg",
          },
        ],
      },
    };

    return NextResponse.json({ flexMessage });
  } catch (error) {
    console.error("Share flex error:", error);
    return NextResponse.json({ error: "Failed to generate flex message" }, { status: 500 });
  }
}

function isSpiritAnimal(value: string): value is SpiritAnimal {
  const animals: SpiritAnimal[] = [
    "lion",
    "whale",
    "dolphin",
    "owl",
    "fox",
    "turtle",
    "eagle",
    "octopus",
    "mountain",
    "wolf",
    "sakura",
    "cat",
    "crocodile",
    "dove",
    "butterfly",
    "bamboo",
  ];
  return animals.includes(value as SpiritAnimal);
}
