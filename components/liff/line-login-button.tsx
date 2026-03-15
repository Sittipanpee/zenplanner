/**
 * ZenPlanner — LINE Login Button Component
 * Agent 8: LIFF_INTEGRATION
 *
 * Login button using LINE authentication.
 * Works in both LINE in-app browser and standalone browsers.
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { LogIn, Loader2 } from 'lucide-react';
import { useLIFF, useLIFFProfile } from './liff-provider';
import { lineLogin, lineLogout, getLINEIdToken, isInLIFF } from '@/lib/liff';

interface LineLoginButtonProps {
  onLoginSuccess?: (idToken: string) => void;
  onLoginError?: (error: Error) => void;
  className?: string;
  variant?: 'primary' | 'ghost';
  label?: string;
}

/**
 * LINE Login Button Component
 *
 * Handles LINE authentication in both environments:
 * - LINE in-app browser: Uses liff.login() for seamless auth
 * - Standalone browser: Redirects to LINE OAuth endpoint
 *
 * @example
 * ```tsx
 * <LineLoginButton
 *   onLoginSuccess={(token) => console.log('Logged in:', token)}
 *   label="เข้าสู่ระบบด้วย LINE"
 * />
 * ```
 */
export function LineLoginButton({
  onLoginSuccess,
  onLoginError,
  className = '',
  variant = 'primary',
  label = 'เข้าสู่ระบบด้วย LINE',
}: LineLoginButtonProps) {
  const { isInitialized, isInClient, userProfile } = useLIFF();
  const [isLoading, setIsLoading] = useState(false);
  const [isLineClient, setIsLineClient] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if in LINE on mount
  useEffect(() => {
    isInLIFF().then(setIsLineClient);
  }, []);

  // Update logged in state based on profile
  useEffect(() => {
    setIsLoggedIn(!!userProfile);
  }, [userProfile]);

  const handleLogin = useCallback(async () => {
    if (!isInitialized) {
      console.warn('[LineLogin] LIFF not initialized yet');
      return;
    }

    setIsLoading(true);

    try {
      // If in LINE client, use LIFF login
      if (isLineClient) {
        console.log('[LineLogin] Using LINE client login');
        lineLogin();
        return;
      }

      // For standalone browser, redirect to LINE OAuth
      console.log('[LineLogin] Redirecting to LINE OAuth');
      lineLogin();
    } catch (error) {
      console.error('[LineLogin] Login error:', error);
      onLoginError?.(error instanceof Error ? error : new Error('Login failed'));
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, isLineClient, onLoginError]);

  const handleLogout = useCallback(async () => {
    setIsLoading(true);

    try {
      await lineLogout();
      setIsLoggedIn(false);
      console.log('[LineLogin] Logged out successfully');
    } catch (error) {
      console.error('[LineLogin] Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Button styles based on variant
  const buttonClasses = variant === 'primary'
    ? 'zen-button zen-button-primary'
    : 'zen-button zen-button-ghost';

  // If user is already logged in, show profile and logout option
  if (isLoggedIn && userProfile) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {userProfile.pictureUrl && (
          <img
            src={userProfile.pictureUrl}
            alt={userProfile.displayName}
            className="w-10 h-10 rounded-full border-2 border-[var(--zen-border)]"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[var(--zen-text)] truncate">
            {userProfile.displayName}
          </p>
          <p className="text-sm text-[var(--zen-text-muted)]">
            {isLineClient ? 'LINE Member' : 'Logged in'}
          </p>
        </div>
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="
            zen-button zen-button-ghost
            min-h-[var(--zen-touch-target)]
            px-4 py-2
            text-sm
          "
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'ออกจากระบบ'
          )}
        </button>
      </div>
    );
  }

  // Show login button
  return (
    <button
      onClick={handleLogin}
      disabled={isLoading || !isInitialized}
      className={`
        ${buttonClasses}
        flex items-center justify-center gap-2
        min-h-[var(--zen-touch-target)]
        px-6 py-3
        font-semibold
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      style={{
        // LINE green brand color
        background: variant === 'primary' ? '#06C755' : undefined,
        color: variant === 'primary' ? 'white' : undefined,
      }}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5"
          fill="currentColor"
        >
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.182c5.342 0 9.818 4.476 9.818 9.818 0 5.342-4.476 9.818-9.818 9.818-5.342 0-9.818-4.476-9.818-9.818 0-5.342 4.476-9.818 9.818-9.818z" />
          <path d="M17.5 12.5h-4.5v-4.5h-2v4.5H7v2h4v4.5h2v-4.5h4v-2z" />
        </svg>
      )}
      <span>{isLoading ? 'กำลังเข้าสู่ระบบ...' : label}</span>
    </button>
  );
}

/**
 * Simplified hook for LINE login/logout
 *
 * @example
 * ```tsx
 * const { login, logout, isLoggedIn, profile } = useLineAuth();
 * ```
 */
export function useLineAuth() {
  const { isInitialized, isInClient, userProfile } = useLIFF();
  const [idToken, setIdToken] = useState<string | null>(null);

  const login = useCallback(async () => {
    if (!isInitialized) {
      throw new Error('LIFF not initialized');
    }

    const token = await getLINEIdToken();
    if (token) {
      setIdToken(token);
    }

    lineLogin();
  }, [isInitialized]);

  const logout = useCallback(async () => {
    await lineLogout();
    setIdToken(null);
  }, []);

  return {
    login,
    logout,
    isLoggedIn: !!userProfile,
    isInClient,
    profile: userProfile,
    idToken,
  };
}

export default LineLoginButton;
