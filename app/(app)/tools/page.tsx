/**
 * Tools Page
 * Interactive planner tools with full SSOT tool taxonomy
 */

"use client";

import { useState } from "react";
import { ZenCard, ZenCardHeader } from "@/components/ui/zen-card";
import { ToolGrid } from "@/components/planner/tool-grid";
import { ToolId, BlueprintCustomization } from "@/lib/types";
import { ArrowRight, Sparkles } from "lucide-react";

export default function ToolsPage() {
  // Load user's selected tools from localStorage or use defaults
  const [selectedTools, setSelectedTools] = useState<ToolId[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("zenplanner_selected_tools");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Invalid JSON, use defaults
        }
      }
    }
    return [
      "daily_power_block",
      "weekly_compass",
      "habit_heatmap",
      "streak_tracker",
    ];
  });

  const [customization, setCustomization] = useState<BlueprintCustomization>({
    color_scheme: "zen-sage",
  });

  const handleToggleTool = (toolId: ToolId) => {
    setSelectedTools((prev) => {
      const newTools = prev.includes(toolId)
        ? prev.filter((t) => t !== toolId)
        : [...prev, toolId];
      // Save to localStorage with error handling
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("zenplanner_selected_tools", JSON.stringify(newTools));
        } catch {
          // localStorage not available
        }
      }
      return newTools;
    });
  };

  return (
    <main className="min-h-screen bg-zen-bg pb-20 md:pb-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-zen-text mb-2">
          เครื่องมือของฉัน
        </h1>
        <p className="text-zen-text-secondary">
          เลือกเครื่องมือที่คุณต้องการใช้ใน Planner ของคุณ
        </p>
      </div>

      {/* Summary */}
      <div className="max-w-4xl mx-auto px-4 mb-6">
        <ZenCard>
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-zen-gold" />
            <span className="font-semibold text-zen-text">
              เครื่องมือที่เลือก: {selectedTools.length} รายการ
            </span>
          </div>
        </ZenCard>
      </div>

      {/* Tool Grid - Full SSOT taxonomy */}
      <div className="max-w-4xl mx-auto px-4 pb-24 md:pb-8">
        <ToolGrid
          selectedTools={selectedTools}
          onToggleTool={handleToggleTool}
          customization={customization}
        />
      </div>
    </main>
  );
}