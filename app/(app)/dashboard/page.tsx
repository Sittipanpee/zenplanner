/**
 * Dashboard Page
 * Main hub showing user's planner stats and recent activity
 * Includes embedded web-based planner tools
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ZenCard, ZenCardHeader, ZenCardContent } from "@/components/ui/zen-card";
import { ZenButton } from "@/components/ui/zen-button";
import { ZenStatusBadge } from "@/components/ui/zen-badge";
import { Heatmap } from "@/components/dashboard/heatmap";
import { getAnimal, getAnimalName } from "@/lib/animal-data";
import Link from "next/link";
import { Home, Sparkles, LayoutGrid, BarChart3, Target, TrendingUp, CheckCircle2, Circle, Plus, Minus, Zap, Flame, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ActivityLog, SpiritAnimal } from "@/lib/types";

interface HabitItem {
  id: string;
  name: string;
  completed: boolean;
}

interface PriorityItem {
  id: string;
  text: string;
  completed: boolean;
}

interface MoodEntry {
  score: number; // 1-5
  energy: number; // 1-5
  note: string;
}

// Helper to safely access localStorage
function getLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage not available (private browsing, etc.)
  }
}

// getAnimalName and getAnimal imported from @/lib/animal-data

export default function DashboardPage() {
  const supabase = createClient();
  const t = useTranslations('dashboard');
  const locale = useLocale();

  // State for user's selected tools from Blueprint
  // Initialize with default tools if no saved data
  const [selectedTools, setSelectedTools] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("zenplanner_selected_tools");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    // Default tools for new users
    return [
      "daily_power_block",
      "weekly_compass",
      "mood_tracker",
      "habit_heatmap",
      "gratitude_log",
      "streak_tracker",
    ];
  });
  const [hasBlueprint, setHasBlueprint] = useState(false);

  // Fetch user's blueprint/tools on mount - but work without login
  useEffect(() => {
    const fetchBlueprint = async () => {
      try {
        // Try to get user (works even without login for guest)
        const { data: { user } } = await supabase.auth.getUser();

        // Try to fetch from Supabase first
        if (user) {
          const { data: blueprints, error } = await supabase
            .from("planner_blueprints")
            .select("tool_selection, status")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1);

          console.log("Blueprint fetch result:", { blueprints, error });

          if (!error && blueprints && blueprints.length > 0) {
            const blueprint = blueprints[0];
            if (blueprint.tool_selection && Array.isArray(blueprint.tool_selection)) {
              setSelectedTools(blueprint.tool_selection as string[]);
              setHasBlueprint(true);
              console.log("Tools loaded from Supabase:", blueprint.tool_selection);
              return;
            }
          }
        }

        // Fallback: Load from localStorage or use default
        const savedTools = localStorage.getItem("zenplanner_selected_tools");
        if (savedTools) {
          try {
            const tools = JSON.parse(savedTools);
            setSelectedTools(tools);
            console.log("Tools loaded from localStorage:", tools);
          } catch {
            // Use defaults
          }
        }
      } catch (error) {
        console.error("Error fetching blueprint:", error);
      }
    };

    fetchBlueprint();
  }, [supabase]);

  // Default tool blocks - always show for all users
  // These are the core dashboard features
  const showMoodBlock = true; // Always show mood/energy tracking
  const showPrioritiesBlock = true; // Always show daily priorities
  const showHabitBlock = true; // Always show habit tracking

  // Additional tools from Blueprint - for "เครื่องมือ Planner ของคุณ" section
  const blueprintTools = selectedTools.filter(t =>
    !['mood_tracker', 'energy_map', 'gratitude_log', 'journal_prompt',
      'daily_power_block', 'eisenhower_matrix', 'time_boxing', 'weekly_compass',
      'habit_heatmap', 'habit_stack', 'streak_tracker', 'quest_system', 'level_up'].includes(t)
  );
  const toolDisplayNames: Record<string, string> = {
    daily_power_block: "⚡ Daily Power Block",
    weekly_compass: "🧭 Weekly Compass",
    monthly_horizon: "🌅 Monthly Horizon",
    quarterly_vision: "🔭 Quarterly Vision",
    pomodoro_tracker: "🍅 Pomodoro Tracker",
    eisenhower_matrix: "⚡ Eisenhower Matrix",
    kanban_board: "📋 Kanban Board",
    time_boxing: "⏰ Time Boxing",
    morning_clarity: "🌅 Morning Clarity",
    evening_reflection: "🌙 Evening Reflection",
    weekly_review: "🗓️ Weekly Review",
    mood_tracker: "😊 Mood Tracker",
    energy_map: "🔋 Energy Map",
    gratitude_log: "🙏 Gratitude Log",
    journal_prompt: "✍️ Journal Prompt",
    mindfulness_bell: "🔔 Mindfulness Bell",
    habit_heatmap: "🔥 Habit Heatmap",
    habit_stack: "🔗 Habit Stack",
    streak_tracker: "🔥 Streak Tracker",
    quest_system: "⚔️ Quest System",
    level_up: "🌟 Level Up",
    milestone_map: "🗺️ Milestone Map",
    progress_bars: "📊 Progress Bars",
    bujo_spread: "📓 Bujo Spread",
    moodboard: "🎨 Moodboard",
    brain_dump: "🧠 Brain Dump",
    mind_map: "🕸️ Mind Map",
    doodle_zone: "✏️ Doodle Zone",
    life_wheel: "🎡 Life Wheel",
    weekly_scorecard: "📝 Weekly Scorecard",
    hp_clarity_chart: "📈 HP Clarity Chart",
    nps_self: "🤔 Self NPS",
    budget_tracker: "💰 Budget Tracker",
    meal_planner: "🥗 Meal Planner",
    fitness_log: "🏋️ Fitness Log",
    reading_list: "📚 Reading List",
    project_tracker: "🚀 Project Tracker",
  };

  // Local state for embedded tools
  const [habits, setHabits] = useState<HabitItem[]>([]);
  const [priorities, setPriorities] = useState<PriorityItem[]>([]);
  const [moodToday, setMoodToday] = useState<MoodEntry | null>(null);
  const [newHabit, setNewHabit] = useState("");
  const [newPriority, setNewPriority] = useState("");

  // Activity data from Supabase
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [habitActivity, setHabitActivity] = useState<ActivityLog[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);

  // Fetch activity data from Supabase
  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch all activity logs for the user
        const { data: logs, error } = await supabase
          .from("activity_log")
          .select("*")
          .eq("user_id", user.id)
          .order("activity_date", { ascending: false })
          .limit(100);

        if (!error && logs) {
          setActivityLogs(logs);

          // Filter habit check activities
          const habitLogs = logs.filter(log => log.activity_type === "habit_check");
          setHabitActivity(habitLogs);
        }
      } catch (error) {
        console.error("Error fetching activity:", error);
      } finally {
        setIsLoadingActivity(false);
      }
    };

    fetchActivityData();
  }, [supabase]);

  // Load from localStorage on mount (fallback for local tools)
  useEffect(() => {
    setHabits(getLocalStorage("zenplanner_habits", []));
    setPriorities(getLocalStorage("zenplanner_priorities", []));
    setMoodToday(getLocalStorage<MoodEntry | null>("zenplanner_mood", null));
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    setLocalStorage("zenplanner_habits", habits);
  }, [habits]);

  useEffect(() => {
    setLocalStorage("zenplanner_priorities", priorities);
  }, [priorities]);

  // Save mood to Supabase when it changes
  useEffect(() => {
    const saveMoodToSupabase = async () => {
      if (!moodToday) return;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.from("activity_log").insert({
          user_id: user.id,
          activity_type: "mood_log",
          metadata: { score: moodToday.score, energy: moodToday.energy, note: moodToday.note },
          activity_date: new Date().toISOString().split("T")[0],
        });
      } catch (error) {
        console.error("Error saving mood:", error);
      }
    };

    if (moodToday) {
      setLocalStorage("zenplanner_mood", moodToday);
      saveMoodToSupabase();
    }
  }, [moodToday, supabase]);

  // Habit handlers - save to Supabase when toggled
  const addHabit = () => {
    if (!newHabit.trim()) return;
    const habit: HabitItem = {
      id: Date.now().toString(),
      name: newHabit.trim(),
      completed: false,
    };
    setHabits([...habits, habit]);
    setNewHabit("");
  };

  const toggleHabit = async (id: string) => {
    const updatedHabits = habits.map(h => h.id === id ? { ...h, completed: !h.completed } : h);
    setHabits(updatedHabits);

    // Save to Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const habit = updatedHabits.find(h => h.id === id);
        if (habit?.completed) {
          await supabase.from("activity_log").insert({
            user_id: user.id,
            activity_type: "habit_check",
            metadata: { habit_id: id, habit_name: habit.name },
            activity_date: new Date().toISOString().split("T")[0],
          });
        }
      }
    } catch (error) {
      console.error("Error saving habit check:", error);
    }
  };

  const deleteHabit = (id: string) => {
    setHabits(habits.filter(h => h.id !== id));
  };

  // Priority handlers
  const addPriority = () => {
    if (!newPriority.trim()) return;
    const priority: PriorityItem = {
      id: Date.now().toString(),
      text: newPriority.trim(),
      completed: false,
    };
    setPriorities([...priorities, priority]);
    setNewPriority("");
  };

  const togglePriority = (id: string) => {
    setPriorities(priorities.map(p => p.id === id ? { ...p, completed: !p.completed } : p));
  };

  // Mood handlers
  const setMood = (score: number, energy: number) => {
    setMoodToday({ score, energy, note: "" });
  };

  // Fetch user data from Supabase
  const [userStats, setUserStats] = useState({
    spiritAnimal: null as string | null,
    spiritAnimalEmoji: "🦁",
    quizzesCompleted: 0,
    plannersCreated: 0,
    currentStreak: 0,
    bestStreak: 0,
  });
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Calculate streak from activity logs
  const { currentStreak, bestStreak } = useMemo(() => {
    if (activityLogs.length === 0) return { currentStreak: 0, bestStreak: 0 };

    // Get unique dates with activity
    const datesWithActivity = new Set(
      activityLogs.map(log => log.activity_date)
    );

    let current = 0;
    let best = 0;
    let temp = 0;

    // Check consecutive days from today
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];

      if (datesWithActivity.has(dateStr)) {
        if (i === 0 || current > 0) current++;
      } else if (i > 0) {
        break;
      }
    }

    // Calculate best streak
    const sortedDates = Array.from(datesWithActivity).sort();
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        temp = 1;
      } else {
        const prev = new Date(sortedDates[i - 1]);
        const curr = new Date(sortedDates[i]);
        const diffDays = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          temp++;
        } else {
          best = Math.max(best, temp);
          temp = 1;
        }
      }
    }
    best = Math.max(best, temp);

    return { currentStreak: current, bestStreak: best };
  }, [activityLogs]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoadingUser(false);
          return;
        }

        // Fetch profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("spirit_animal, archetype_code")
          .eq("id", user.id)
          .single();

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

        // Use canonical animal data from lib/animal-data
        const animalEmoji = profile?.spirit_animal
          ? getAnimal(profile.spirit_animal as SpiritAnimal)?.emoji || "🦁"
          : "🦁";

        setUserStats(prev => ({
          spiritAnimal: profile?.spirit_animal || null,
          spiritAnimalEmoji: animalEmoji,
          quizzesCompleted: quizCount || 0,
          plannersCreated: plannerCount || 0,
          currentStreak: prev.currentStreak,
          bestStreak: prev.bestStreak,
        }));
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUserData();
  }, [supabase, currentStreak, bestStreak]);

  const recentActivity = [
    { type: "quiz", title: "ทำ Quiz สัตว์ประจำตัว", date: "วันนี้", status: "completed" as const },
    { type: "planner", title: "สร้าง Planner", date: "เมื่อวาน", status: "completed" as const },
  ];

  const quickActions = [
    { icon: <Sparkles className="w-6 h-6" />, label: t('quickActions.takeQuiz'), href: "/quiz", color: "bg-zen-gold/10 text-zen-gold" },
    { icon: <Target className="w-6 h-6" />, label: t('quickActions.createPlanner'), href: "/blueprint", color: "bg-zen-sage/10 text-zen-sage" },
    { icon: <LayoutGrid className="w-6 h-6" />, label: t('quickActions.tools'), href: "/tools", color: "bg-zen-sky/10 text-zen-sky" },
    { icon: <BarChart3 className="w-6 h-6" />, label: t('quickActions.statistics'), href: "/stats", color: "bg-zen-earth/10 text-zen-earth" },
  ];

  const moodEmojis = ["😫", "😕", "😐", "🙂", "😄"];
  const energyBars = ["🔴", "🟠", "🟡", "🟢", "⚡"];

  return (
    <main className="min-h-screen bg-zen-bg pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-zen-sage/20 to-zen-gold/20 px-4 md:px-8 py-8 md:py-12">
        <div className="max-w-md md:max-w-4xl mx-auto">
          <div className="flex items-center gap-4 md:gap-6 mb-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-zen-surface flex items-center justify-center text-4xl md:text-5xl shadow-zen-md">
              {userStats.spiritAnimalEmoji}
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-zen-text">
                {userStats.spiritAnimalEmoji} {userStats.spiritAnimal ? getAnimalName(userStats.spiritAnimal as SpiritAnimal, locale as 'en' | 'th' | 'zh') : ''}
              </h1>
              <p className="text-zen-text-secondary">{userStats.spiritAnimal ? getAnimal(userStats.spiritAnimal as SpiritAnimal)?.archetypeTitle : t('quickActions.retakeQuiz')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-md md:max-w-4xl mx-auto px-4 -mt-4 md:mt-0">
        <ZenCard className="mb-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl md:text-3xl font-bold text-zen-sage">{userStats.quizzesCompleted}</p>
              <p className="text-sm text-zen-text-secondary">{t('quizzes')}</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-zen-sage">{userStats.plannersCreated}</p>
              <p className="text-sm text-zen-text-secondary">{t('planner')}</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-zen-gold flex items-center justify-center gap-1">
                <Flame className="w-6 h-6" />
                {currentStreak}
              </p>
              <p className="text-sm text-zen-text-secondary">{t('consecutiveDays')}</p>
            </div>
          </div>
        </ZenCard>
      </div>

      {/* Main Content - Two columns on desktop */}
      <div className="max-w-md md:max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Left Column: Tools */}
          <div className="space-y-6">
            {/* 1. Mood/Energy Check-in - Only show if selected in Blueprint */}
            {showMoodBlock && (
            <div>
              <h2 className="font-semibold text-zen-text mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-zen-gold" />
                {t('mood.title')}
              </h2>
              <ZenCard className="mb-4">
                <div className="space-y-4">
                  {/* Mood selector */}
                  <div>
                    <p className="text-sm text-zen-text-secondary mb-2">{t('mood.howAreYou')}</p>
                    <div className="flex justify-between">
                      {moodEmojis.map((emoji, idx) => (
                        <button
                          key={idx}
                          onClick={() => setMood(idx + 1, moodToday?.energy || 3)}
                          className={`text-3xl p-2 rounded-xl transition-all duration-200 ${
                            moodToday?.score === idx + 1
                              ? "bg-zen-sage/20 scale-125"
                              : "hover:bg-zen-surface-alt"
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Energy selector */}
                  <div>
                    <p className="text-sm text-zen-text-secondary mb-2">{t('mood.energyLevel')}</p>
                    <div className="flex justify-between">
                      {energyBars.map((bar, idx) => (
                        <button
                          key={idx}
                          onClick={() => setMood(moodToday?.score || 3, idx + 1)}
                          className={`text-xl p-2 rounded-xl transition-all duration-200 ${
                            moodToday?.energy === idx + 1
                              ? "bg-zen-gold/20 scale-125"
                              : "hover:bg-zen-surface-alt"
                          }`}
                        >
                          {bar}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </ZenCard>
            </div>
            )}

            {/* 2. Daily Priorities - Only show if selected in Blueprint */}
            {showPrioritiesBlock && (
            <div>
              <h2 className="font-semibold text-zen-text mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-zen-sage" />
                {t('priorities.title')}
              </h2>
              <ZenCard className="mb-3">
                <div className="space-y-2">
                  {priorities.length === 0 ? (
                    <p className="text-sm text-zen-text-muted text-center py-4">
                      {t('priorities.empty')}
                    </p>
                  ) : (
                    priorities.map((priority) => (
                      <div
                        key={priority.id}
                        className={`flex items-center gap-2 p-2 rounded-lg hover:bg-zen-surface-alt transition-colors ${
                          priority.completed ? "opacity-50" : ""
                        }`}
                      >
                        <button onClick={() => togglePriority(priority.id)}>
                          {priority.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-zen-sage" />
                          ) : (
                            <Circle className="w-5 h-5 text-zen-border" />
                          )}
                        </button>
                        <span className={priority.completed ? "line-through text-zen-text-muted" : "text-zen-text"}>
                          {priority.text}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </ZenCard>
              {/* Add priority input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addPriority()}
                  placeholder={t('priorities.placeholder')}
                  className="flex-1 px-4 py-2 border border-zen-border rounded-full text-zen-text bg-zen-surface focus:outline-none focus:ring-2 focus:ring-zen-sage"
                />
                <button
                  onClick={addPriority}
                  className="p-2 bg-zen-sage text-white rounded-full hover:bg-zen-sage/90 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
            )}

            {/* 3. Quick Habit Tracker - GitHub-style tiles - Only show if selected in Blueprint */}
            {showHabitBlock && (
            <div>
              <h2 className="font-semibold text-zen-text mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-zen-sky" />
                {t('habits.title')}
              </h2>
              <ZenCard className="mb-3">
                {habits.length === 0 ? (
                  <p className="text-sm text-zen-text-muted text-center py-4">
                    {t('habits.empty')}
                  </p>
                ) : (
                  <>
                    {/* Streak display */}
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-zen-border">
                      <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-zen-gold" />
                        <span className="font-medium text-zen-text">
                          {habits.filter(h => h.completed).length}/{habits.length} {t('habits.today')}
                        </span>
                      </div>
                      <div className="text-sm text-zen-text-secondary">
                        {t('habits.best')}: {bestStreak} {t('habits.days')}
                      </div>
                    </div>

                    {/* Habit list with toggle */}
                    <div className="space-y-2 mb-4">
                      {habits.map((habit) => (
                        <div
                          key={habit.id}
                          className={`flex items-center justify-between p-2 rounded-lg hover:bg-zen-surface-alt transition-colors ${
                            habit.completed ? "bg-zen-sage/10" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <button onClick={() => toggleHabit(habit.id)}>
                              {habit.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-zen-sage" />
                              ) : (
                                <Circle className="w-5 h-5 text-zen-border" />
                              )}
                            </button>
                            <span className={habit.completed ? "line-through text-zen-text-muted" : "text-zen-text"}>
                              {habit.name}
                            </span>
                          </div>
                          <button onClick={() => deleteHabit(habit.id)} className="text-zen-text-muted hover:text-zen-blossom">
                            <Minus className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Habit heatmap visualization - GitHub-style tiles */}
                    <div className="mt-4 pt-3 border-t border-zen-border">
                      <p className="text-xs text-zen-text-muted mb-2">{t('overview30')}</p>
                      <HabitHeatmap habitActivity={habitActivity} />
                    </div>
                  </>
                )}
              </ZenCard>
              {/* Add habit input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newHabit}
                  onChange={(e) => setNewHabit(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addHabit()}
                  placeholder={t('habits.placeholder')}
                  className="flex-1 px-4 py-2 border border-zen-border rounded-full text-zen-text bg-zen-surface focus:outline-none focus:ring-2 focus:ring-zen-sky"
                />
                <button
                  onClick={addHabit}
                  className="p-2 bg-zen-sky text-white rounded-full hover:bg-zen-sky/90 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
            )}
          </div>

          {/* Right Column: Quick Actions & Activity */}
          <div className="space-y-6">
            {/* Selected Tools from Blueprint */}
            {(hasBlueprint || selectedTools.length > 0) ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-zen-text">{t('plannerTools.title')}</h2>
                  <Link href="/blueprint" className="text-sm text-zen-sage hover:underline">
                    {selectedTools.length > 0 ? 'แก้ไข' : 'สร้าง'}
                  </Link>
                </div>
                <ZenCard padding="sm">
                  {selectedTools.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedTools.slice(0, 8).map((toolId) => (
                        <span
                          key={toolId}
                          className="px-2 py-1 bg-zen-sage/10 text-zen-sage text-xs rounded-lg"
                        >
                          {toolDisplayNames[toolId] || toolId}
                        </span>
                      ))}
                      {selectedTools.length > 8 && (
                        <span className="px-2 py-1 bg-zen-surface-alt text-zen-text-muted text-xs rounded-lg">
                          +{selectedTools.length - 8} อีก
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-zen-text-muted mb-3">{t('plannerTools.noTools')}</p>
                      <Link href="/blueprint">
                        <ZenButton size="sm">{t('plannerTools.customize')}</ZenButton>
                      </Link>
                    </div>
                  )}
                </ZenCard>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-zen-text">{t('plannerTools.title')}</h2>
                  <Link href="/blueprint" className="text-sm text-zen-sage hover:underline">
                    {t('plannerTools.customize')}
                  </Link>
                </div>
                <ZenCard padding="sm">
                  <div className="text-center py-4">
                    <p className="text-zen-text-muted mb-3">{t('plannerTools.noTools')}</p>
                    <Link href="/blueprint">
                      <ZenButton size="sm">{t('plannerTools.customize')}</ZenButton>
                    </Link>
                  </div>
                </ZenCard>
              </div>
            )}

            {/* Quick Actions */}
            <div>
              <h2 className="font-semibold text-zen-text mb-3">{t('quickActions.title')}</h2>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color}`}
                  >
                    {action.icon}
                    <span className="font-medium text-sm">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Activity Heatmap */}
            <div>
              <Heatmap data={activityLogs} showStats={true} />
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="font-semibold text-zen-text mb-3">{t('recentActivity')}</h2>
              <ZenCard padding="sm">
                {recentActivity.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border-b border-zen-border last:border-0">
                    <div>
                      <p className="font-medium text-zen-text">{item.title}</p>
                      <p className="text-sm text-zen-text-muted">{item.date}</p>
                    </div>
                    <ZenStatusBadge status={item.status} />
                  </div>
                ))}
              </ZenCard>
            </div>

            {/* CTA */}
            <div>
              <Link href="/quiz">
                <ZenButton fullWidth>
                  <Sparkles className="w-5 h-5 mr-2" />
                  {t('findAnimal')}
                </ZenButton>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/**
 * HabitHeatmap - GitHub-style tile grid for habit tracking
 * Shows 30 days of habit completion data
 */
function HabitHeatmap({ habitActivity }: { habitActivity: ActivityLog[] }) {
  // Generate last 30 dates
  const dates = useMemo(() => {
    const d: string[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      d.push(date.toISOString().split("T")[0]);
    }
    return d;
  }, []);

  // Count habits by date
  const habitByDate = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const log of habitActivity) {
      const date = log.activity_date;
      counts[date] = (counts[date] || 0) + 1;
    }
    return counts;
  }, [habitActivity]);

  // Get color based on completion
  const getTileColor = (date: string) => {
    const count = habitByDate[date] || 0;
    if (count === 0) return "bg-zen-surface-alt";
    if (count <= 2) return "bg-zen-sage-light";
    if (count <= 4) return "bg-zen-sage";
    return "bg-zen-earth";
  };

  // Check if today
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="flex gap-0.5 overflow-x-auto pb-1">
      {dates.map((date) => (
        <div
          key={date}
          className={`w-3 h-3 rounded-sm flex-shrink-0 ${getTileColor(date)} ${
            date === today ? "ring-1 ring-zen-sage" : ""
          }`}
          title={`${date}: ${habitByDate[date] || 0} habits`}
        />
      ))}
    </div>
  );
}