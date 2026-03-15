/**
 * Heatmap Component - GitHub-style Activity Heatmap
 * Displays user activity over the last 3 months in a grid format
 */

"use client";

import { useMemo } from "react";
import { ZenCard, ZenCardContent, ZenCardHeader } from "../ui/zen-card";
import { Flame, TrendingUp } from "lucide-react";
import type { ActivityLog } from "@/lib/types";

export interface HeatmapProps {
  data?: ActivityLog[];
  showStats?: boolean;
}

// Generate dates for the last 3 months
function generateDateRange(): string[] {
  const dates: string[] = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 90); // Last 90 days

  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

// Count activities by date
function countActivitiesByDate(data: ActivityLog[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const log of data) {
    const date = log.activity_date;
    counts[date] = (counts[date] || 0) + 1;
  }
  return counts;
}

// Get color intensity based on activity count
function getIntensityColor(count: number): string {
  if (count === 0) return "bg-zen-bg";
  if (count <= 2) return "bg-zen-sage-light";
  if (count <= 5) return "bg-zen-sage";
  return "bg-zen-earth";
}

// Get month labels
function getMonthLabels(dates: string[]): { month: string; colStart: number }[] {
  const labels: { month: string; colStart: number }[] = [];
  let currentMonth = "";

  dates.forEach((date, index) => {
    const month = new Date(date).toLocaleDateString("th-TH", {
      month: "short",
    });
    if (month !== currentMonth) {
      labels.push({ month, colStart: index % 7 });
      currentMonth = month;
    }
  });

  return labels;
}

// Day labels (Thai)
const DAY_LABELS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

export function Heatmap({ data = [], showStats = true }: HeatmapProps) {
  const dates = useMemo(() => generateDateRange(), []);
  const activityCounts = useMemo(() => countActivitiesByDate(data), [data]);
  const monthLabels = useMemo(() => getMonthLabels(dates), [dates]);

  // Calculate stats
  const totalActivities = data.length;
  const currentStreak = useMemo(() => {
    let streak = 0;
    const today = new Date().toISOString().split("T")[0];
    for (let i = 0; i < 90; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      if (activityCounts[dateStr] && activityCounts[dateStr] > 0) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  }, [activityCounts]);

  const maxDay = useMemo(() => {
    const counts = Object.values(activityCounts);
    return Math.max(...counts, 1);
  }, [activityCounts]);

  return (
    <ZenCard>
      <ZenCardHeader
        title="กิจกรรมล่าสุด"
        subtitle="3 เดือนที่ผ่านมา"
        icon={<Flame className="w-5 h-5" />}
      />

      <ZenCardContent>
        {/* Stats */}
        {showStats && (
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-zen-sage" />
              <span className="text-sm text-zen-text-secondary">
                {totalActivities} กิจกรรม
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-zen-earth" />
              <span className="text-sm text-zen-text-secondary">
                {currentStreak} วันติดต่อกัน
              </span>
            </div>
          </div>
        )}

        {/* Month labels */}
        <div className="flex mb-1 ml-8">
          {monthLabels.map((label, i) => (
            <div
              key={i}
              className="text-xs text-zen-text-muted"
              style={{
                marginLeft: i === 0 ? `${label.colStart * 14}px` : 0,
                minWidth: "28px",
              }}
            >
              {label.month}
            </div>
          ))}
        </div>

        {/* Grid container */}
        <div className="flex">
          {/* Day labels */}
          <div className="flex flex-col gap-0.5 mr-2">
            {DAY_LABELS.map((day, i) => (
              <div
                key={day}
                className="h-3 w-6 flex items-center justify-end"
                style={{ visibility: i % 2 === 1 ? "visible" : "hidden" }}
              >
                <span className="text-xs text-zen-text-muted">{day}</span>
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="flex gap-0.5">
            {/* Group by weeks */}
            {Array.from({ length: Math.ceil(dates.length / 7) }).map(
              (_, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-0.5">
                  {Array.from({ length: 7 }).map((_, dayIndex) => {
                    const dateIndex = weekIndex * 7 + dayIndex;
                    if (dateIndex >= dates.length) return null;

                    const date = dates[dateIndex];
                    const count = activityCounts[date] || 0;

                    return (
                      <div
                        key={date}
                        className={`w-3 h-3 rounded-sm ${getIntensityColor(
                          count
                        )} transition-colors`}
                        title={`${date}: ${count} activities`}
                      />
                    );
                  })}
                </div>
              )
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-3">
          <span className="text-xs text-zen-text-muted">น้อย</span>
          <div className="flex gap-0.5">
            <div className="w-3 h-3 rounded-sm bg-zen-bg" />
            <div className="w-3 h-3 rounded-sm bg-zen-sage-light" />
            <div className="w-3 h-3 rounded-sm bg-zen-sage" />
            <div className="w-3 h-3 rounded-sm bg-zen-earth" />
          </div>
          <span className="text-xs text-zen-text-muted">มาก</span>
        </div>
      </ZenCardContent>
    </ZenCard>
  );
}

export default Heatmap;
