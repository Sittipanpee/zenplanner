/**
 * Profile Page
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ZenCard } from "@/components/ui/zen-card";
import { ZenButton } from "@/components/ui/zen-button";
import { Settings, LogOut, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Animal name mapping
const animalNames: Record<string, string> = {
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

const animalEmojis: Record<string, string> = {
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

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<{
    spiritAnimal: string | null;
    createdAt: string | null;
  }>({
    spiritAnimal: null,
    createdAt: null,
  });
  const [stats, setStats] = useState({
    quizzesCompleted: 0,
    plannersCreated: 0,
    currentStreak: 0,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        // Fetch profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("spirit_animal, created_at")
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

        setProfile({
          spiritAnimal: profileData?.spirit_animal || null,
          createdAt: profileData?.created_at || null,
        });
        setStats({
          quizzesCompleted: quizCount || 0,
          plannersCreated: plannerCount || 0,
          currentStreak: 0, // Could calculate from activity_log
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleSettings = () => {
    alert("Settings page coming soon!");
  };

  const displayName = profile.spiritAnimal
    ? animalNames[profile.spiritAnimal] || profile.spiritAnimal
    : "ผู้ใช้";
  const displayEmoji = profile.spiritAnimal
    ? animalEmojis[profile.spiritAnimal] || "🧘"
    : "🧘";
  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
      })
    : "-";

  if (isLoading) {
    return (
      <main className="min-h-screen bg-zen-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zen-sage" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zen-bg pb-20 md:pb-8">
      <div className="max-w-md md:max-w-lg mx-auto p-4 md:p-6">
        <div className="text-center mb-8">
          <div className="w-24 h-24 md:w-28 md:h-28 bg-zen-sage/10 rounded-full flex items-center justify-center mx-auto mb-4 text-5xl md:text-6xl">
            {displayEmoji}
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-zen-text">
            {displayName}
          </h1>
          <p className="text-zen-text-secondary">สมาชิกตั้งแต่ {memberSince}</p>
        </div>

        <div className="space-y-4 max-w-sm mx-auto">
          <ZenCard>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-zen-text-secondary">Quiz ที่ทำ</span>
                <span className="font-semibold">{stats.quizzesCompleted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zen-text-secondary">Planner ที่สร้าง</span>
                <span className="font-semibold">{stats.plannersCreated}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zen-text-secondary">วันต่อเนื่อง</span>
                <span className="font-semibold text-zen-gold">{stats.currentStreak}</span>
              </div>
            </div>
          </ZenCard>

          <ZenButton variant="secondary" fullWidth onClick={handleSettings}>
            <Settings className="w-5 h-5 mr-2" />
            ตั้งค่า
          </ZenButton>

          <ZenButton variant="ghost" fullWidth onClick={handleLogout}>
            <LogOut className="w-5 h-5 mr-2" />
            ออกจากระบบ
          </ZenButton>
        </div>
      </div>
    </main>
  );
}