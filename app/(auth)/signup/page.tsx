"use client";

import { useState } from "react";
import Link from "next/link";
import { ZenButton } from "@/components/ui/zen-button";
import { ZenInput } from "@/components/ui/zen-input";
import { ZenCard } from "@/components/ui/zen-card";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
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
      setError("Passwords do not match.");
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
        setError("This user already exists. Please try logging in.");
      } else {
        setSuccessMessage("Success! Please check your email to confirm your registration.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zen-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold text-zen-sage mb-2">
            Create Account
          </h1>
          <p className="text-zen-text-secondary">
            Begin your journey with ZenPlanner
          </p>
        </div>

        <ZenCard padding="lg">
          <form onSubmit={handleSignUp} className="space-y-4">
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
            <ZenInput
              label="ยืนยันรหัสผ่าน"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            {error && (
              <p className="text-sm text-zen-blossom">{error}</p>
            )}

            {successMessage && (
              <p className="text-sm text-zen-sage">{successMessage}</p>
            )}

            <ZenButton
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
            >
              สมัครสมาชิก
            </ZenButton>
          </form>
        </ZenCard>

        <p className="text-center text-zen-text-secondary">
          มีบัญชีอยู่แล้ว?{" "}
          <Link href="/login" className="text-zen-sage font-medium hover:underline">
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </main>
  );
}
