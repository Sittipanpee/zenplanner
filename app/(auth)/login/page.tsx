/**
 * Login Page
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ZenButton } from "@/components/ui/zen-button";
import { ZenInput } from "@/components/ui/zen-input";
import { ZenCard } from "@/components/ui/zen-card";
import { createClient } from "@/lib/supabase/client";
import { lineLogin } from "@/lib/liff";
import { MessageCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // Redirect to dashboard on success
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zen-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo / Header */}
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold text-zen-sage mb-2">
            ZenPlanner
          </h1>
          <p className="text-zen-text-secondary">
            Your personalized planning journey awaits
          </p>
        </div>

        <ZenCard padding="lg">
          <div className="space-y-6">
            {/* LINE Login */}
            <div className="space-y-3">
              <button
                type="button"
                className="w-full h-11 bg-zen-line hover:bg-zen-line/90 text-white font-semibold rounded-full flex items-center justify-center gap-2 transition-colors focus-visible:ring-2 focus-visible:ring-zen-sage"
                onClick={() => {
                  // Trigger LINE login flow
                  lineLogin();
                }}
              >
                <MessageCircle className="w-5 h-5" />
                เข้าสู่ระบบด้วย LINE
              </button>
              <p className="text-xs text-center text-zen-text-muted">
                สะดวกและรวดเร็ว — ไม่ต้องจดจำรหัสผ่าน
              </p>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zen-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-zen-surface text-zen-text-muted">
                  หรือ
                </span>
              </div>
            </div>

            {/* Email Login Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <ZenInput
                label="อีเมล"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <ZenInput
                label="รหัสผ่าน"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {error && (
                <p className="text-sm text-zen-blossom">{error}</p>
              )}

              <ZenButton
                type="submit"
                variant="secondary"
                fullWidth
                isLoading={isLoading}
              >
                เข้าสู่ระบบ
              </ZenButton>
            </form>
          </div>
        </ZenCard>

        {/* Sign Up Link */}
        <p className="text-center text-zen-text-secondary">
          ยังไม่มีบัญชี?{" "}
          <Link href="/signup" className="text-zen-sage font-medium hover:underline">
            สมัครสมาชิก
          </Link>
        </p>

        {/* Guest Option */}
        <div className="text-center">
          <ZenButton variant="ghost" size="sm" onClick={() => router.push("/quiz")}>
            ลองใช้งานแบบ Guest
          </ZenButton>
        </div>
      </div>
    </main>
  );
}