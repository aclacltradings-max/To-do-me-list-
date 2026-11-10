import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Native (Android) packaging for FinTrack.
 *
 * The web build in `dist/` is copied into the Android project, so the app ships as a
 * normal installable APK rather than a browser page. Capacitor serves those files from
 * a local origin inside the WebView, which means the app works offline with no service
 * worker involved.
 */
const config: CapacitorConfig = {
  appId: 'com.fintrack.app',
  appName: 'FinTrack',
  webDir: 'dist',
  android: {
    // Let the WebView draw behind the status/navigation bars; the CSS safe-area
    // insets in index.css keep the layout clear of them.
    adjustMarginsForEdgeToEdge: 'auto',
    backgroundColor: '#0f172a',
  },
  server: {
    // `https` scheme gives the WebView a secure origin so localStorage and any
    // future secure-context APIs behave the same as on the web.
    androidScheme: 'https',
  },
};

export default config;
