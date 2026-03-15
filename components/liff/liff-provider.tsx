/**
 * ZenPlanner — LIFF Provider Component
 * Agent 8: LIFF_INTEGRATION
 *
 * React context provider for LIFF initialization and user state.
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  initLIFF,
  getLIFF,
  getUserProfile,
  isInLIFF,
  LIFFUserProfile,
} from '@/lib/liff';

interface LIFFContextValue {
  liffObject: typeof import('@line/liff').default | null;
  isInitialized: boolean;
  isInClient: boolean;
  userProfile: LIFFUserProfile | null;
  error: Error | null;
  refreshProfile: () => Promise<void>;
}

const LIFFContext = createContext<LIFFContextValue | null>(null);

interface LIFFProviderProps {
  children: React.ReactNode;
}

/**
 * LIFF Provider Component
 *
 * Wraps the app to provide LIFF state to all child components.
 * Handles initialization and provides user profile when available.
 *
 * @example
 * ```tsx
 * // In app/layout.tsx or app/providers.tsx
 * import { LIFFProvider } from '@/components/liff/liff-provider';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <LIFFProvider>
 *           {children}
 *         </LIFFProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function LIFFProvider({ children }: LIFFProviderProps) {
  const [liffObject, setLiffObject] = useState<typeof import('@line/liff').default | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInClient, setIsInClient] = useState(false);
  const [userProfile, setUserProfile] = useState<LIFFUserProfile | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const refreshProfile = useCallback(async () => {
    if (!isInitialized || !isInClient) {
      return;
    }

    try {
      const profile = await getUserProfile();
      setUserProfile(profile);
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[LIFF] Failed to refresh profile:', err);
      }
    }
  }, [isInitialized, isInClient]);

  useEffect(() => {
    async function initializeLIFF() {
      try {
        if (process.env.NODE_ENV !== 'production') {
          console.log('[LIFF Provider] Starting initialization...');
        }

        // Initialize LIFF
        await initLIFF();
        const liffObj = getLIFF();
        setLiffObject(liffObj);
        setIsInitialized(true);

        // Check if running in LINE
        const inClient = await isInLIFF();
        setIsInClient(inClient);

        if (process.env.NODE_ENV !== 'production') {
          console.log('[LIFF Provider] Initialization complete, inClient:', inClient);
        }

        // Get user profile if in LINE
        if (inClient) {
          const profile = await getUserProfile();
          setUserProfile(profile);
          if (process.env.NODE_ENV !== 'production') {
            console.log('[LIFF Provider] User profile fetched:', profile?.displayName || 'none');
          }
        }
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('[LIFF Provider] Initialization error:', err);
        }
        setError(err instanceof Error ? err : new Error('LIFF initialization failed'));
        setIsInitialized(true); // Mark as initialized even on error to prevent infinite loading
      }
    }

    initializeLIFF();
  }, []);

  const value = useMemo<LIFFContextValue>(() => ({
    liffObject,
    isInitialized,
    isInClient,
    userProfile,
    error,
    refreshProfile,
  }), [liffObject, isInitialized, isInClient, userProfile, error, refreshProfile]);

  return (
    <LIFFContext.Provider value={value}>
      {children}
    </LIFFContext.Provider>
  );
}

/**
 * Hook to access LIFF context.
 *
 * @throws Error if used outside of LIFFProvider
 *
 * @example
 * ```tsx
 * const { isInClient, userProfile, isInitialized } = useLIFF();
 * ```
 */
export function useLIFF(): LIFFContextValue {
  const context = useContext(LIFFContext);

  if (!context) {
    throw new Error('useLIFF must be used within a LIFFProvider');
  }

  return context;
}

/**
 * Hook to get just the loading state.
 * Useful for showing a loading spinner while LIFF initializes.
 *
 * @example
 * ```tsx
 * const { isInitialized } = useLIFFLoading();
 * if (!isInitialized) return <LoadingSpinner />;
 * ```
 */
export function useLIFFLoading(): { isInitialized: boolean; error: Error | null } {
  const context = useContext(LIFFContext);

  if (!context) {
    throw new Error('useLIFFLoading must be used within a LIFFProvider');
  }

  return {
    isInitialized: context.isInitialized,
    error: context.error,
  };
}

/**
 * Hook to get the user profile.
 * Returns null if not in LINE or not logged in.
 *
 * @example
 * ```tsx
 * const { userProfile } = useLIFFProfile();
 * if (userProfile) {
 *   return <span>Welcome, {userProfile.displayName}</span>;
 * }
 * ```
 */
export function useLIFFProfile(): { userProfile: LIFFUserProfile | null; refreshProfile: () => Promise<void> } {
  const context = useContext(LIFFContext);

  if (!context) {
    throw new Error('useLIFFProfile must be used within a LIFFProvider');
  }

  return {
    userProfile: context.userProfile,
    refreshProfile: context.refreshProfile,
  };
}
