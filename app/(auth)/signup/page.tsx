/**
 * Signup Page
 * With i18n, dark mode
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ZenButton } from "@/components/ui/zen-button";
import { ZenInput } from "@/components/ui/zen-input";
import { ZenCard } from "@/components/ui/zen-card";
import ThemeToggle from "@/components/ui/theme-toggle";
import LanguageSwitcher from "@/components/ui/language-switcher";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (password !== confirmPassword) {
      setError(tCommon("errors.serverError"));
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      if (data.user && data.user.identities?.length === 0) {
        setError(t("signup.hasAccount"));
      } else {
        setSuccessMessage(t("signup.title"));
      }
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
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold text-zen-sage mb-2">
            {t("signup.title")}
          </h1>
          <p className="text-zen-text-secondary dark:text-zinc-400">
            {tCommon("app.tagline")}
          </p>
        </div>

        <ZenCard padding="lg" className="dark:bg-zinc-900 dark:border-zinc-700">
          <form onSubmit={handleSignUp} className="space-y-4">
            <ZenInput
              label="Email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <ZenInput
              label="Password"
              type="password"
              placeholder="--------"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <ZenInput
              label="Confirm Password"
              type="password"
              placeholder="--------"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            {error && (
              <p className="text-sm text-zen-blossom" role="alert">{error}</p>
            )}

            {successMessage && (
              <p className="text-sm text-zen-sage" role="status">{successMessage}</p>
            )}

            <ZenButton
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
            >
              {t("signup.title")}
            </ZenButton>
          </form>
        </ZenCard>

        <p className="text-center text-zen-text-secondary dark:text-zinc-400">
          {t("signup.hasAccount")}{" "}
          <Link href="/login" className="text-zen-sage font-medium hover:underline">
            {t("signup.signIn")}
          </Link>
        </p>
      </div>
    </main>
  );
}
