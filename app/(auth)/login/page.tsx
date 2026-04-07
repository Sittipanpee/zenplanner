/**
 * Login Page
 * With i18n, dark mode, ThemeToggle, LanguageSwitcher
 * Uses router.push instead of window.location.href
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ZenButton } from "@/components/ui/zen-button";
import { ZenInput } from "@/components/ui/zen-input";
import { ZenCard } from "@/components/ui/zen-card";
import ThemeToggle from "@/components/ui/theme-toggle";
import LanguageSwitcher from "@/components/ui/language-switcher";
import { createClient } from "@/lib/supabase/client";
import { lineLogin } from "@/lib/liff";
import { MessageCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");

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

      // Redirect to dashboard on success — use router.push instead of window.location.href
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : tCommon("errors.serverError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zen-bg dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
      {/* Header with theme/language controls */}
      <div className="fixed top-0 right-0 px-4 py-4 z-10 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-8">
        {/* Logo / Header */}
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold text-zen-sage mb-2">
            {tCommon("app.name")}
          </h1>
          <p className="text-zen-text-secondary dark:text-zinc-400">
            {t("login.subtitle")}
          </p>
        </div>

        <ZenCard padding="lg" className="dark:bg-zinc-900 dark:border-zinc-700">
          <div className="space-y-6">
            {/* LINE Login */}
            <div className="space-y-3">
              <button
                type="button"
                className="w-full h-11 bg-zen-line hover:bg-zen-line/90 text-white font-semibold rounded-full flex items-center justify-center gap-2 transition-colors focus-visible:ring-2 focus-visible:ring-zen-sage"
                onClick={() => {
                  lineLogin();
                }}
                aria-label={t("login.lineButton")}
              >
                <MessageCircle className="w-5 h-5" />
                {t("login.lineButton")}
              </button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zen-border dark:border-zinc-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-zen-surface dark:bg-zinc-900 text-zen-text-muted dark:text-zinc-500">
                  {t("login.orDivider")}
                </span>
              </div>
            </div>

            {/* Email Login Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <ZenInput
                label={t("login.title")}
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <ZenInput
                label={t("login.subtitle")}
                type="password"
                placeholder="--------"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {error && (
                <p className="text-sm text-zen-blossom" role="alert">{error}</p>
              )}

              <ZenButton
                type="submit"
                variant="secondary"
                fullWidth
                isLoading={isLoading}
              >
                {t("login.title")}
              </ZenButton>
            </form>
          </div>
        </ZenCard>

        {/* Sign Up Link */}
        <p className="text-center text-zen-text-secondary dark:text-zinc-400">
          {t("login.noAccount")}{" "}
          <Link href="/signup" className="text-zen-sage font-medium hover:underline">
            {t("login.signUp")}
          </Link>
        </p>

        {/* Guest Option */}
        <div className="text-center">
          <ZenButton variant="ghost" size="sm" onClick={() => router.push("/quiz")}>
            {tCommon("nav.quiz")}
          </ZenButton>
        </div>
      </div>
    </main>
  );
}
