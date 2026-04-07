/**
 * ZenPlanner — LINE LIFF Integration
 * Agent 8: LIFF_INTEGRATION
 *
 * Provides LIFF initialization and utility functions for LINE integration.
 */

import liff, { Liff } from '@line/liff';

export interface LIFFUserProfile {
  userId: string;
  displayName: string;
  pictureUrl: string;
  statusMessage?: string;
  email?: string;
}

export interface FlexMessageObject {
  type: 'flex';
  altText: string;
  contents: {
    type: 'bubble';
    hero?: {
      type: 'image';
      url: string;
      size: 'full';
      aspectRatio: '20:13';
    };
    body: {
      type: 'box';
      layout: 'vertical';
      contents: Array<{
        type: 'text';
        text: string;
        wrap?: boolean;
        weight?: string;
        size?: string;
      }>;
    };
    footer?: {
      type: 'box';
      layout: 'vertical';
      contents: Array<{
        type: 'button';
        action: {
          type: 'uri';
          label: string;
          uri: string;
        };
        style?: string;
      }>;
    };
  };
}

let liffInstance: Liff | null = null;
let isInitialized = false;

/**
 * Initialize LIFF SDK with the configured LIFF ID.
 * Uses NEXT_PUBLIC_LIFF_ID from environment variables.
 *
 * @returns Promise that resolves when LIFF is ready
 * @throws Error if LIFF ID is not configured
 */
export async function initLIFF(): Promise<void> {
  // Return if already initialized
  if (isInitialized && liffInstance) {
    return;
  }

  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

  // Real LIFF IDs are numeric-alphanumeric, e.g. "1234567890-AbcDef12"
  const isRealLiffId = !!liffId && /^\d+-\w+$/.test(liffId);

  if (!isRealLiffId) {
    console.warn('[LIFF] NEXT_PUBLIC_LIFF_ID not configured or is a placeholder. LIFF features disabled.');
    liffInstance = createMockLiff();
    isInitialized = true;
    return;
  }

  try {
    await liff.init({ liffId });
    liffInstance = liff;
    isInitialized = true;
    console.log('[LIFF] Initialized successfully');
  } catch (error) {
    console.error('[LIFF] Initialization failed:', error);
    // Use mock on failure
    liffInstance = createMockLiff();
    isInitialized = true;
  }
}

/**
 * Create a mock LIFF object for when LIFF is not available
 * (standalone browser or initialization failure)
 */
function createMockLiff(): Liff {
  return {
    isInitialized: () => false,
    isInClient: () => false,
    login: () => {},
    logout: () => {},
    getProfile: () => Promise.resolve(null),
    getIDToken: () => null,
    getAccessToken: () => null,
    sendMessages: () => Promise.resolve(false),
    shareTargetPicker: () => Promise.resolve(false),
    openWindow: () => {},
    closeWindow: () => {},
    getLineVersion: () => null,
  } as unknown as Liff;
}

/**
 * Get the LIFF instance.
 *
 * @returns The LIFF instance
 */
export function getLIFF(): Liff {
  if (!liffInstance) {
    return createMockLiff();
  }
  return liffInstance;
}

/**
 * Get the user's LINE profile.
 * Returns null if not in LINE or not logged in.
 *
 * @returns User profile object or null
 */
export async function getUserProfile(): Promise<LIFFUserProfile | null> {
  try {
    const liffObj = getLIFF();

    if (!liffObj.isInClient()) {
      console.log('[LIFF] Not running in LINE client, skipping profile fetch');
      return null;
    }

    const profile = await liffObj.getProfile();
    if (!profile) {
      return null;
    }

    return {
      userId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl || '',
      statusMessage: profile.statusMessage,
    };
  } catch (error) {
    console.error('[LIFF] Failed to get user profile:', error);
    return null;
  }
}

/**
 * Check if the app is running inside LINE's in-app browser.
 *
 * @returns true if running in LINE
 */
export async function isInLIFF(): Promise<boolean> {
  try {
    const liffObj = getLIFF();
    return liffObj.isInClient();
  } catch {
    return false;
  }
}

/**
 * Check if LIFF is initialized and available.
 *
 * @returns true if LIFF is initialized
 */
export async function isLIFFInitialized(): Promise<boolean> {
  return isInitialized;
}

/**
 * Share a message to LINE using shareTargetPicker.
 * Falls back to sendMessages if shareTargetPicker is not available.
 *
 * @param message - Flex message object to share
 * @returns Promise that resolves when sharing is complete
 */
export async function shareToLINE(message: FlexMessageObject): Promise<boolean> {
  try {
    const liffObj = getLIFF();

    if (!liffObj.isInClient()) {
      console.log('[LIFF] Not in LINE client, share disabled');
      return false;
    }

    // Try shareTargetPicker first (allows user to choose recipient)
    if (liffObj.shareTargetPicker) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await liffObj.shareTargetPicker([message as any]);
      console.log('[LIFF] shareTargetPicker result:', result);
      return Boolean(result);
    }

    // Fallback to sendMessages
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await liffObj.sendMessages([message as any]);
    console.log('[LIFF] sendMessages completed');
    return true;
  } catch (error) {
    console.error('[LIFF] Failed to share to LINE:', error);
    return false;
  }
}

/**
 * Open an external URL using LINE's external browser.
 * Uses liff.openWindow() when in LINE client.
 *
 * @param url - The URL to open
 * @param external - Whether to open in external browser (default: false for in-app)
 */
export function openExternal(url: string, external: boolean = false): void {
  const liffObj = getLIFF();

  if (liffObj && liffObj.isInClient() && liffObj.openWindow) {
    liffObj.openWindow({
      url,
      external: external,
    });
  } else {
    // Fallback to regular window.open for standalone browsers
    window.open(url, '_blank');
  }
}

/**
 * Get the LINE ID token for authentication.
 * Used to exchange with Supabase for user authentication.
 *
 * @returns ID token string or null
 */
export function getLINEIdToken(): string | null {
  try {
    const liffObj = getLIFF();
    const token = liffObj.getIDToken();
    return token;
  } catch {
    return null;
  }
}

/**
 * Get the LINE access token.
 *
 * @returns Access token string or null
 */
export function getLINIAccessToken(): string | null {
  try {
    const liffObj = getLIFF();
    const token = liffObj.getAccessToken();
    return token;
  } catch {
    return null;
  }
}

/**
 * Close the LINE LIFF app.
 */
export function closeLIFF(): void {
  if (liffInstance && liffInstance.closeWindow) {
    liffInstance.closeWindow();
  }
}

/**
 * Login with LINE (redirects to LINE login page).
 * Use this for external browser fallback authentication.
 */
export function lineLogin(): void {
  const liffObj = getLIFF();

  if (liffObj && liffObj.isInClient()) {
    // In LINE client, use implicit login
    liffObj.login();
  } else {
    // In external browser, redirect to LINE OAuth
    const returnUrl = typeof window !== 'undefined' ? window.location.href : '/';
    const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_LIFF_ID}&redirect_uri=${encodeURIComponent(returnUrl)}&scope=openid%20profile&state=login`;
    window.location.href = lineAuthUrl;
  }
}

/**
 * Logout from LINE (clears LIFF session).
 */
export async function lineLogout(): Promise<void> {
  try {
    const liffObj = getLIFF();
    if (liffObj.logout) {
      liffObj.logout();
    }
  } catch (error) {
    console.error('[LIFF] Logout failed:', error);
  }
}

