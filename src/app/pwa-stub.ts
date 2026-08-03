/** Stand-in for 'virtual:pwa-register' in the single-file demo build (no
 *  service worker there — updates come from republishing the page). */
export function registerSW(_opts?: unknown): (reload?: boolean) => Promise<void> {
  return async () => {};
}
