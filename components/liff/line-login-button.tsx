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
          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.108 9.436-7.025C23.176 14.393 24 12.458 24 10.314" />
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
