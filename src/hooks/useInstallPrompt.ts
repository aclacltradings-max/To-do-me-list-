import { useCallback, useEffect, useRef, useState } from 'react';

/** The `beforeinstallprompt` event, which is not in the DOM lib yet. */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt: () => Promise<void>;
}

export type Platform = 'android' | 'ios' | 'desktop' | 'other';

/** Where the app is running, which decides the manual install instructions. */
function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    return 'ios';
  }
  if (/Android/i.test(ua)) return 'android';
  if (/Macintosh|Windows|Linux|CrOS/i.test(ua)) return 'desktop';
  return 'other';
}

/** Already launched from an installed icon rather than a browser tab. */
function detectStandalone(): boolean {
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return iosStandalone || window.matchMedia('(display-mode: standalone)').matches;
}

export interface InstallState {
  /** An install prompt is available and `promptInstall()` will do something. */
  canInstall: boolean;
  /** The app is already installed and running as an app. */
  isInstalled: boolean;
  /** Roughly which platform we are on, for manual instructions. */
  platform: Platform;
  /** True when we should offer the "Install" button. */
  showInstall: boolean;
  /** Fire the native install prompt. Resolves to the user's choice. */
  promptInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
  /** Set once the app has been installed during this session. */
  justInstalled: boolean;
}

// `beforeinstallprompt` fires very early — often before React mounts — so the
// event is captured at module load and buffered for the hook to pick up.
let deferredPrompt: BeforeInstallPromptEvent | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    // Stop Chrome's own mini-infobar so we can present install in our UI.
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
  });
}

/**
 * Exposes whether the app can be installed and lets the UI trigger the prompt.
 *
 * Browsers differ here:
 *  - Chrome/Edge/Android fire `beforeinstallprompt` and support a native prompt.
 *  - iOS Safari never fires it, so we can only show manual instructions.
 *  - Firefox does not support installing PWAs on desktop at all.
 */
export function useInstallPrompt(): InstallState {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(deferredPrompt);
  const [isInstalled, setIsInstalled] = useState(detectStandalone);
  const [justInstalled, setJustInstalled] = useState(false);
  const [platform] = useState<Platform>(detectPlatform);
  const awaitingChoice = useRef(false);

  // The event may have arrived between render and effect, so poll briefly.
  useEffect(() => {
    if (deferredPrompt) {
      setPromptEvent(deferredPrompt);
      return;
    }
    const id = window.setInterval(() => {
      if (deferredPrompt) {
        setPromptEvent(deferredPrompt);
        window.clearInterval(id);
      }
    }, 300);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const onInstalled = () => {
      setIsInstalled(true);
      setJustInstalled(true);
      setPromptEvent(null);
    };
    const onPrompt = (event: Event) => {
      event.preventDefault();
      deferredPrompt = event as BeforeInstallPromptEvent;
      setPromptEvent(deferredPrompt);
    };
    window.addEventListener('appinstalled', onInstalled);
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => {
      window.removeEventListener('appinstalled', onInstalled);
      window.removeEventListener('beforeinstallprompt', onPrompt);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    // Guard against double-invocation (React StrictMode, fast double clicks):
    // a prompt event can only be used once, and calling prompt() twice throws.
    if (!promptEvent || awaitingChoice.current) return 'unavailable' as const;
    awaitingChoice.current = true;
    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setJustInstalled(true);
      }
      setPromptEvent(null);
      deferredPrompt = null;
      return outcome;
    } catch {
      return 'unavailable' as const;
    } finally {
      awaitingChoice.current = false;
    }
  }, [promptEvent]);

  return {
    canInstall: promptEvent !== null,
    isInstalled,
    platform,
    // Offer installation whenever we have a prompt, or on iOS where the
    // user must do it by hand.
    showInstall: !isInstalled && (promptEvent !== null || platform === 'ios'),
    promptInstall,
    justInstalled,
  };
}
