/**
 * Blueprint Customization Page
 * Deep customization of planner settings
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ZenCard } from "@/components/ui/zen-card";
import { ZenButton } from "@/components/ui/zen-button";
import { ZenInput } from "@/components/ui/zen-input";
import { ArrowLeft, ArrowRight, Palette, Clock, FolderOpen, Check, Sparkles } from "lucide-react";

// Zen color palettes
const COLOR_PALETTES = [
  {
    id: "zen-sage",
    name: "Zen Garden",
    colors: ["#7C9A82", "#A8C5AE", "#F5F3EE", "#2C2C2C"],
    preview: "bg-zen-sage",
  },
  {
    id: "zen-earth",
    name: "Warm Earth",
    colors: ["#B38B6D", "#D4A574", "#F5F3EE", "#3C2415"],
    preview: "bg-zen-earth",
  },
  {
    id: "zen-sky",
    name: "Calm Sky",
    colors: ["#89A4C7", "#B8C9E0", "#F5F3EE", "#2C3E50"],
    preview: "bg-zen-sky",
  },
  {
    id: "zen-gold",
    name: "Golden Hour",
    colors: ["#C9A96E", "#E8C99B", "#FAFAF7", "#3D2B1F"],
    preview: "bg-zen-gold",
  },
  {
    id: "zen-indigo",
    name: "Deep Indigo",
    colors: ["#6B7AA1", "#8E95B8", "#F5F3EE", "#2D2D44"],
    preview: "bg-zen-indigo",
  },
];

// Default categories
const DEFAULT_CATEGORIES = ["งาน", "สุขภาพ", "การเงิน", "ความสัมพันธ์", "การเรียนรู้", "ความบันเทิง"];

export default function CustomizePage() {
  const router = useRouter();

  // State
  const [selectedPalette, setSelectedPalette] = useState("zen-sage");
  const [wakeTime, setWakeTime] = useState("07:00");
  const [sleepTime, setSleepTime] = useState("23:00");
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [newCategory, setNewCategory] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Mock selected tools
  const [selectedTools] = useState([
    "daily_power_block",
    "weekly_compass",
    "morning_clarity",
    "habit_heatmap",
    "gratitude_log",
    "life_wheel",
  ]);

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory("");
    }
  };

  const handleRemoveCategory = (cat: string) => {
    if (categories.length > 1) {
      setCategories(categories.filter((c) => c !== cat));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    // Save customization to localStorage or API
    const customization = {
      color_scheme: selectedPalette,
      wake_time: wakeTime,
      sleep_time: sleepTime,
      categories,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("planner_customization", JSON.stringify(customization));
    }

    // Simulate API call
    await new Promise((r) => setTimeout(r, 800));

    setIsSaving(false);
    router.push("/generate");
  };

  return (
    <main className="min-h-screen bg-zen-bg pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-zen-bg/95 backdrop-blur-sm border-b border-zen-border z-10 px-4 py-4">
        <div className="flex items-center gap-3">
          <Link href="/blueprint" className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-zen-text-secondary" />
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold text-zen-text">
              ปรับแต่ง Planner
            </h1>
            <p className="text-sm text-zen-text-secondary">
              ตั้งค่าส่วนตัว
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Summary Card */}
        <ZenCard>
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-zen-gold" />
            <div>
              <p className="font-semibold text-zen-text">สรุป Planner ของคุณ</p>
              <p className="text-sm text-zen-text-secondary">
                {selectedTools.length} เครื่องมือ • 6 หมวดหมู่
              </p>
            </div>
          </div>
        </ZenCard>

        {/* Color Palette Selection */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-5 h-5 text-zen-sage" />
            <h2 className="font-semibold text-zen-text">ธีมสี</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {COLOR_PALETTES.map((palette) => (
              <button
                key={palette.id}
                onClick={() => setSelectedPalette(palette.id)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  selectedPalette === palette.id
                    ? "border-zen-sage bg-zen-surface"
                    : "border-zen-border bg-zen-surface hover:border-zen-border-hover"
                }`}
              >
                <div className="flex gap-1 mb-2">
                  {palette.colors.map((color, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full border border-zen-border"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-zen-text">{palette.name}</span>
                {selectedPalette === palette.id && (
                  <Check className="w-4 h-4 text-zen-sage ml-auto" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Time Preferences */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-zen-sage" />
            <h2 className="font-semibold text-zen-text">เวลาตารางชีวิต</h2>
          </div>

          <ZenCard>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zen-text-secondary mb-1">
                  ตื่นนอน
                </label>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-zen-border bg-zen-surface-alt text-zen-text focus:outline-none focus:ring-2 focus:ring-zen-sage"
                />
              </div>
              <div>
                <label className="block text-sm text-zen-text-secondary mb-1">
                  เข้านอน
                </label>
                <input
                  type="time"
                  value={sleepTime}
                  onChange={(e) => setSleepTime(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-zen-border bg-zen-surface-alt text-zen-text focus:outline-none focus:ring-2 focus:ring-zen-sage"
                />
              </div>
            </div>
          </ZenCard>
        </section>

        {/* Categories */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <FolderOpen className="w-5 h-5 text-zen-sage" />
            <h2 className="font-semibold text-zen-text">หมวดหมู่</h2>
          </div>

          <ZenCard>
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-zen-surface-alt text-zen-text text-sm"
                >
                  {cat}
                  {categories.length > 1 && (
                    <button
                      onClick={() => handleRemoveCategory(cat)}
                      className="w-4 h-4 rounded-full bg-zen-border hover:bg-zen-blossom/30 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <ZenInput
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="เพิ่มหมวดหมู่ใหม่..."
                className="flex-1"
              />
              <ZenButton variant="secondary" onClick={handleAddCategory}>
                เพิ่ม
              </ZenButton>
            </div>
          </ZenCard>
        </section>

        {/* Sample Preview */}
        <section>
          <h2 className="font-semibold text-zen-text mb-3">ตัวอย่าง Preview</h2>
          <ZenCard className="bg-white">
            <div className="aspect-[4/3] rounded-lg overflow-hidden relative">
              {/* Header */}
              <div
                className="h-12 px-3 flex items-center justify-between"
                style={{ backgroundColor: COLOR_PALETTES.find((p) => p.id === selectedPalette)?.colors[0] }}
              >
                <span className="text-white font-semibold">Daily Planner</span>
                <span className="text-white/80 text-sm">{wakeTime} - {sleepTime}</span>
              </div>

              {/* Content */}
              <div className="p-3 space-y-2">
                {/* Time blocks */}
                {["06:00 - 08:00", "08:00 - 12:00", "12:00 - 13:00", "13:00 - 18:00"].map((time, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-xs text-zen-text-muted w-16">{time}</span>
                    <div
                      className="flex-1 h-6 rounded"
                      style={{ backgroundColor: i % 2 === 0 ? COLOR_PALETTES.find((p) => p.id === selectedPalette)?.colors[1] : "#f5f5f5" }}
                    />
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="absolute bottom-0 left-0 right-0 h-8 px-3 flex items-center gap-2">
                {categories.slice(0, 4).map((cat) => (
                  <span
                    key={cat}
                    className="px-2 py-0.5 rounded text-xs"
                    style={{
                      backgroundColor: COLOR_PALETTES.find((p) => p.id === selectedPalette)?.colors[0] + "20",
                      color: COLOR_PALETTES.find((p) => p.id === selectedPalette)?.colors[0],
                    }}
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </ZenCard>
        </section>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-zen-surface border-t border-zen-border p-4 pb-safe">
        <div className="max-w-md mx-auto">
          <ZenButton fullWidth size="lg" onClick={handleSave} isLoading={isSaving}>
            สร้าง Planner
            <ArrowRight className="w-5 h-5 ml-2" />
          </ZenButton>
        </div>
      </div>
    </main>
  );
}
