/**
 * Stats Page
 * Displays user statistics and analytics
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ZenCard } from "@/components/ui/zen-card";
import { ZenButton } from "@/components/ui/zen-button";
import { Heatmap } from "@/components/dashboard/heatmap";
import { ArrowLeft, TrendingUp, Flame, Award, Target, Calendar, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ActivityLog } from "@/lib/types";

export default function StatsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        // Fetch quiz count
        const { count: quizCount } = await supabase
          .from("quiz_sessions")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "complete");

        // Fetch planner count
        const { count: plannerCount } = await supabase
          .from("planner_blueprints")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        // Fetch activity log for heatmap
        const { data: activityData } = await supabase
          .from("activity_log")
          .select("*")
          .eq("user_id", user.id)
          .order("activity_date", { ascending: false })
          .limit(90);

        setActivities(activityData || []);

        // Calculate weekly progress (activities in last 7 days)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const weeklyProgress = activityData?.filter(a => {
          const activityDate = new Date(a.activity_date);
          return activityDate >= oneWeekAgo;
        }).length || 0;

        setStats({
          totalQuizzes: quizCount || 0,
          totalPlanners: plannerCount || 0,
          currentStreak: 0, // Could calculate from activity_log
          longestStreak: 0, // Could calculate
          totalActivities: activityData?.length || 0,
          weeklyGoal: 5,
          weeklyProgress,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [supabase, router]);

  // Stats state
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalPlanners: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalActivities: 0,
    weeklyGoal: 5,
    weeklyProgress: 0,
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-zen-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zen-sage" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zen-bg pb-20 md:pb-8">
      {/* Header */}
      <div className="sticky top-0 bg-zen-bg/95 backdrop-blur-sm border-b border-zen-border z-10 px-4 py-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-zen-text-secondary" />
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold text-zen-text">
              สถิติของคุณ
            </h1>
            <p className="text-sm text-zen-text-secondary">
              ติดตามความก้าวหน้า
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-md md:max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Summary Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ZenCard className="text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-zen-gold/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-zen-gold" />
              </div>
              <p className="text-2xl font-bold text-zen-text">{stats.totalQuizzes}</p>
              <p className="text-xs text-zen-text-secondary">Quiz ที่ทำ</p>
            </div>
          </ZenCard>

          <ZenCard className="text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-zen-sage/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-zen-sage" />
              </div>
              <p className="text-2xl font-bold text-zen-text">{stats.totalPlanners}</p>
              <p className="text-xs text-zen-text-secondary">Planner</p>
            </div>
          </ZenCard>

          <ZenCard className="text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-zen-earth/10 flex items-center justify-center">
                <Flame className="w-5 h-5 text-zen-earth" />
              </div>
              <p className="text-2xl font-bold text-zen-text">{stats.currentStreak}</p>
              <p className="text-xs text-zen-text-secondary">วันติด</p>
            </div>
          </ZenCard>

          <ZenCard className="text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-zen-sky/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-zen-sky" />
              </div>
              <p className="text-2xl font-bold text-zen-text">{stats.longestStreak}</p>
              <p className="text-xs text-zen-text-secondary">สถิติสูงสุด</p>
            </div>
          </ZenCard>
        </div>

        {/* Weekly Progress */}
        <ZenCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-zen-text flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-zen-sage" />
              ความก้าวหน้าประจำสัปดาห์
            </h2>
            <span className="text-sm text-zen-text-secondary">
              {stats.weeklyProgress}/{stats.weeklyGoal} กิจกรรม
            </span>
          </div>
          <div className="h-4 bg-zen-surface-alt rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-zen-sage to-zen-sage-light rounded-full transition-all duration-500"
              style={{ width: `${(stats.weeklyProgress / stats.weeklyGoal) * 100}%` }}
            />
          </div>
        </ZenCard>

        {/* Activity Heatmap */}
        <Heatmap data={activities} showStats={true} />

        {/* Back to Dashboard */}
        <Link href="/dashboard">
          <ZenButton variant="secondary" fullWidth>
            กลับไปหน้าหลัก
          </ZenButton>
        </Link>
      </div>
    </main>
  );
}
