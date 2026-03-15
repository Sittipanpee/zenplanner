/**
 * Planner History Component - Download History List
 * Displays list of previously generated planners with download options
 */

"use client";

import Link from "next/link";
import { ZenCard, ZenCardContent, ZenCardHeader } from "../ui/zen-card";
import { ZenButton } from "../ui/zen-button";
import { FileSpreadsheet, Download, Calendar, ExternalLink } from "lucide-react";
import type { GeneratedPlanner } from "@/lib/types";

// Animal emoji map
const ANIMAL_EMOJIS: Record<string, string> = {
  lion: "🦁",
  whale: "🐋",
  dolphin: "🐬",
  owl: "🦉",
  fox: "🦊",
  turtle: "🐢",
  eagle: "🦅",
  octopus: "🐙",
  mountain: "🏔️",
  wolf: "🐺",
  sakura: "🌸",
  cat: "🐈",
  crocodile: "🐊",
  dove: "🕊️",
  butterfly: "🦋",
  bamboo: "🌿",
};

// Format labels (Thai)
const FORMAT_LABELS: Record<string, string> = {
  google_sheets: "Google Sheets",
  excel_vba: "Excel (VBA)",
  pdf: "PDF",
};

// Format icons
const FORMAT_ICONS: Record<string, React.ReactNode> = {
  google_sheets: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm2 2h8v2H8V8zm0 4h8v2H8v-2z" />
    </svg>
  ),
  excel_vba: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
    </svg>
  ),
  pdf: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 9h-2v2H9v-2H7v-2h2V7h2v2h2v2zm0-6V3.5L18.5 9H13z" />
    </svg>
  ),
};

export interface PlannerHistoryProps {
  planners: GeneratedPlanner[];
  title?: string;
  showEmpty?: boolean;
}

export function PlannerHistory({
  planners,
  title = "Planner ที่สร้างแล้ว",
  showEmpty = true,
}: PlannerHistoryProps) {
  // Sort by date, newest first
  const sortedPlanners = [...planners].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Check if URL is expired
  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <ZenCard>
      <ZenCardHeader
        title={title}
        subtitle={`${planners.length} ไฟล์`}
        icon={<FileSpreadsheet className="w-5 h-5" />}
      />

      <ZenCardContent>
        {sortedPlanners.length === 0 ? (
          showEmpty ? (
            <div className="text-center py-8">
              <FileSpreadsheet className="w-12 h-12 text-zen-text-muted mx-auto mb-3" />
              <p className="text-zen-text-secondary">ยังไม่มี Planner ที่สร้างไว้</p>
              <Link href="/blueprint" className="mt-4 inline-block">
                <ZenButton variant="secondary" size="sm">
                  สร้าง Planner แรก
                </ZenButton>
              </Link>
            </div>
          ) : null
        ) : (
          <div className="space-y-3">
            {sortedPlanners.map((planner) => {
              const animalEmoji = planner.blueprint_id
                ? ANIMAL_EMOJIS["lion"]
                : "📋"; // Default if no blueprint
              const isUrlExpired = isExpired(planner.expires_at);

              return (
                <div
                  key={planner.id}
                  className="flex items-center justify-between p-3 bg-zen-surface-alt rounded-lg border border-zen-border"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-lg bg-zen-surface flex items-center justify-center text-xl shrink-0">
                      {animalEmoji}
                    </div>

                    {/* Info */}
                    <div className="min-w-0">
                      <p className="font-medium text-zen-text truncate">
                        Planner #{planner.id.slice(0, 8)}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-zen-text-muted">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(planner.created_at)}</span>
                        <span className="mx-1">•</span>
                        <span>{FORMAT_LABELS[planner.format] || planner.format}</span>
                      </div>
                    </div>
                  </div>

                  {/* Download Button */}
                  {planner.download_url && !isUrlExpired ? (
                    <a
                      href={planner.download_url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0"
                    >
                      <ZenButton variant="primary" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        ดาวน์โหลด
                      </ZenButton>
                    </a>
                  ) : (
                    <ZenButton variant="ghost" size="sm" disabled>
                      หมดอายุ
                    </ZenButton>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ZenCardContent>
    </ZenCard>
  );
}

export default PlannerHistory;
