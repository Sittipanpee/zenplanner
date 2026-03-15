/**
 * Stats Grid Component - Quick Stats Cards
 * Displays user statistics in a 3-column grid layout
 */

"use client";

import { ZenCard, ZenCardContent } from "../ui/zen-card";
import { TrendingUp, FileSpreadsheet, Flame, Award, Target, Calendar } from "lucide-react";

export interface DashboardStats {
  quizzesCompleted?: number;
  plannersCreated?: number;
  currentStreak?: number;
  totalActivities?: number;
  daysActive?: number;
  averageScore?: number;
}

export interface StatsGridProps {
  stats: DashboardStats;
  showAll?: boolean;
}

// Default stats when no data
const DEFAULT_STATS: DashboardStats = {
  quizzesCompleted: 0,
  plannersCreated: 0,
  currentStreak: 0,
  totalActivities: 0,
  daysActive: 0,
  averageScore: 0,
};

interface StatItem {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

export function StatsGrid({ stats, showAll = false }: StatsGridProps) {
  const mergedStats = { ...DEFAULT_STATS, ...stats };

  const quickStats: StatItem[] = [
    {
      label: "Quiz ที่ทำ",
      value: mergedStats.quizzesCompleted || 0,
      icon: <Award className="w-5 h-5" />,
      color: "text-zen-gold",
    },
    {
      label: "Planner ที่สร้าง",
      value: mergedStats.plannersCreated || 0,
      icon: <FileSpreadsheet className="w-5 h-5" />,
      color: "text-zen-sage",
    },
    {
      label: "วันติดต่อกัน",
      value: mergedStats.currentStreak || 0,
      icon: <Flame className="w-5 h-5" />,
      color: "text-zen-earth",
    },
  ];

  const extendedStats: StatItem[] = [
    {
      label: "กิจกรรมทั้งหมด",
      value: mergedStats.totalActivities || 0,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-zen-sky",
    },
    {
      label: "วันที่ใช้งาน",
      value: mergedStats.daysActive || 0,
      icon: <Calendar className="w-5 h-5" />,
      color: "text-zen-indigo",
    },
    {
      label: "คะแนนเฉลี่ย",
      value: mergedStats.averageScore || 0,
      icon: <Target className="w-5 h-5" />,
      color: "text-zen-blossom",
    },
  ];

  const displayStats = showAll
    ? [...quickStats, ...extendedStats]
    : quickStats;

  return (
    <div className="grid grid-cols-3 gap-3">
      {displayStats.map((stat, index) => (
        <ZenCard
          key={stat.label}
          variant="default"
          padding="sm"
          className="text-center"
        >
          <ZenCardContent>
            <div className={`${stat.color} mx-auto w-fit mb-2`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-zen-text font-display">
              {stat.value}
            </p>
            <p className="text-xs text-zen-text-muted mt-1 line-clamp-1">
              {stat.label}
            </p>
          </ZenCardContent>
        </ZenCard>
      ))}
    </div>
  );
}

export default StatsGrid;
