/** Auto-update flow (mobile-critical): registerType 'prompt' — the user is
 *  never hard-reloaded mid-edit. Update checks run on launch, whenever the
 *  (often-suspended) iOS PWA returns to the foreground, and every 30 minutes.
 *  A waiting version surfaces as a non-blocking toast with a Restart action,
 *  suppressed while a stroke/transform/export is in progress; autosave is
 *  flushed before the reload so a restart never loses work. */
import { registerSW } from 'virtual:pwa-register';
import { el, toast } from '../editor/ui';

export interface UpdateHost {
  isBusy(): boolean;
  flushSaves(): Promise<void>;
}

const CHECK_INTERVAL_MS = 30 * 60 * 1000;

export class UpdateManager {
  host: UpdateHost | null = null;
  private updateSW: (reload?: boolean) => Promise<void>;
  private registration: ServiceWorkerRegistration | null = null;
  private needRefresh = false;
  private toastEl: HTMLElement | null = null;
  private retryTimer: number | null = null;

  constructor() {
    this.updateSW = registerSW({
      immediate: true,
      onNeedRefresh: () => {
        this.needRefresh = true;
        this.maybeShowToast();
      },
      onRegisteredSW: (_url, reg) => {
        this.registration = reg ?? null;
      }
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') void this.check(false);
    });
    window.setInterval(() => void this.check(false), CHECK_INTERVAL_MS);
  }

  /** Ask the SW for a new version. `manual` gives explicit feedback. */
  async check(manual: boolean): Promise<void> {
    if (this.needRefresh) {
      this.maybeShowToast();
      if (manual) toast(`v${__APP_VERSION__ /* current */} → update ready`, { timeout: 1600 });
      return;
    }
    const t = manual ? toast('Checking for updates…', { spinner: true, timeout: 0 }) : null;
    try {
      await this.registration?.update();
    } catch {
      // offline — silently skip
    }
    // onNeedRefresh fires async if a new SW is installing; give it a moment
    await new Promise((r) => setTimeout(r, 2500));
    t?.close();
    if (manual && !this.needRefresh) {
      toast(`Up to date — v${__APP_VERSION__}`, { timeout: 1800 });
    }
  }

  /** Show the restart toast unless the user is mid-gesture; retry shortly after. */
  private maybeShowToast(): void {
    if (this.toastEl) return;
    if (this.host?.isBusy()) {
      if (this.retryTimer === null) {
        this.retryTimer = window.setTimeout(() => {
          this.retryTimer = null;
          this.maybeShowToast();
        }, 1500);
      }
      return;
    }
    const root = document.querySelector('.toast-root') ?? this.ensureToastRoot();
    const t = el('div', 'toast show update-toast');
    t.appendChild(el('span', '', 'New version ready'));
    const btn = el('button', 'toast-action', 'Restart');
    btn.addEventListener('click', () => void this.applyUpdate());
    t.appendChild(btn);
    const later = el('button', 'toast-dismiss', 'Later');
    later.addEventListener('click', () => {
      t.remove();
      this.toastEl = null;
      // resurface on next foreground/check
    });
    t.appendChild(later);
    root.appendChild(t);
    this.toastEl = t;
  }

  private ensureToastRoot(): HTMLElement {
    const r = el('div', 'toast-root');
    document.body.appendChild(r);
    return r;
  }

  /** Flush all persistence, then swap the waiting SW in and reload. */
  async applyUpdate(): Promise<void> {
    try {
      await this.host?.flushSaves();
    } catch {
      // saving is best-effort here; the debounced autosave has usually run
    }
    await this.updateSW(true);
  }

  get updateAvailable(): boolean {
    return this.needRefresh;
  }
}

export function versionInfo(): { version: string; builtAt: string } {
  return { version: __APP_VERSION__, builtAt: __BUILD_DATE__ };
}

let shared: UpdateManager | null = null;

/** App-wide singleton (main.ts boots it; settings panels reuse it). */
export function updateManager(): UpdateManager {
  if (!shared) shared = new UpdateManager();
  return shared;
}
