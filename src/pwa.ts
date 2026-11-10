/**
 * Registers the service worker that makes the app work offline.
 *
 * Only registered in production builds: in dev, Vite serves modules on demand
 * and caching them would break hot reloading.
 */
export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;
  if (!import.meta.env.PROD) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .catch((error) => {
        // A failed registration must never break the app — it only costs
        // offline support.
        console.warn('Service worker registration failed:', error);
      });
  });
}
