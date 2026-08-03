/** Small DOM helpers + chrome components. Plain TS/DOM — the render loop
 *  never touches any of this. */

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls?: string,
  text?: string
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

export const ICONS: Record<string, string> = {
  back: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  undo: '<svg viewBox="0 0 24 24"><path d="M8 6L4 10l4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 10h9a6 6 0 0 1 0 12h-2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  redo: '<svg viewBox="0 0 24 24"><path d="M16 6l4 4-4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 10h-9a6 6 0 0 0 0 12h2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  mirror: '<svg viewBox="0 0 24 24"><path d="M12 3v18" stroke="currentColor" stroke-width="1.6" stroke-dasharray="2.5 2.5"/><path d="M9 7L4 12l5 5zM15 7l5 5-5 5z" fill="currentColor"/></svg>',
  matcap: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="9.5" cy="9.5" r="3" fill="currentColor" opacity="0.55"/></svg>',
  share: '<svg viewBox="0 0 24 24"><path d="M12 15V4M8 7l4-4 4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 12v7a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  help: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M9.6 9.4a2.6 2.6 0 1 1 3.6 2.9c-.8.4-1.2.9-1.2 1.9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="17.2" r="1.1" fill="currentColor"/></svg>',
  select: '<svg viewBox="0 0 24 24"><path d="M6 3l12 9.5-5.4.8 3 5.6-2.6 1.4-3-5.6L6 18.5z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/></svg>',
  move: '<svg viewBox="0 0 24 24"><path d="M12 2v20M2 12h20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 2l-2.5 3h5zM12 22l-2.5-3h5zM2 12l3-2.5v5zM22 12l-3-2.5v5z" fill="currentColor"/></svg>',
  rotate: '<svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-3-6.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M17.6 2.6l.3 4-4-.6z" fill="currentColor"/></svg>',
  scale: '<svg viewBox="0 0 24 24"><rect x="4" y="10" width="10" height="10" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M14 10L20 4M20 4h-5M20 4v5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  draw: '<svg viewBox="0 0 24 24"><path d="M4 20c4 1 7-.5 8.5-3L20 8.5a2.1 2.1 0 0 0-3-3L8.5 14C6 15.5 4.5 17 4 20z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  prims: '<svg viewBox="0 0 24 24"><path d="M12 3l7 4v9l-7 4-7-4V7z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/><path d="M12 3v9m0 0l7-5m-7 5L5 7" fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.7"/></svg>',
  boolean: '<svg viewBox="0 0 24 24"><circle cx="9.5" cy="12" r="5.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="14.5" cy="12" r="5.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M5 7h14M10 7V5h4v2m-8 0l1 13h10l1-13" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  duplicate: '<svg viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M16 4H6a2 2 0 0 0-2 2v10" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  // primitive glyphs
  sphere: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.9"/><ellipse cx="12" cy="12" rx="8" ry="3" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.7"/></svg>',
  cube: '<svg viewBox="0 0 24 24"><path d="M12 3l7 4v9l-7 4-7-4V7z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/><path d="M12 12v8m0-8l7-5m-7 5L5 7" fill="none" stroke="currentColor" stroke-width="1.3" opacity="0.7"/></svg>',
  cylinder: '<svg viewBox="0 0 24 24"><ellipse cx="12" cy="6" rx="7" ry="2.8" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M5 6v12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8V6" fill="none" stroke="currentColor" stroke-width="1.9"/></svg>',
  capsule: '<svg viewBox="0 0 24 24"><rect x="7" y="3" width="10" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.9"/></svg>',
  torus: '<svg viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="9" ry="6" fill="none" stroke="currentColor" stroke-width="1.9"/><ellipse cx="12" cy="12" rx="3.5" ry="1.8" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
  plane: '<svg viewBox="0 0 24 24"><path d="M4 17l5-10h11l-5 10z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/></svg>',
  body: '<svg viewBox="0 0 24 24"><circle cx="12" cy="4.6" r="2.4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 7.5v6m0 0l-3 7m3-7l3 7M6.5 10c1.8-1.6 9.2-1.6 11 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 2.8v2.6m0 13.2v2.6M4.5 7.7l2.2 1.3m10.6 6l2.2 1.3m0-8.6l-2.2 1.3m-10.6 6l-2.2 1.3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
};

export function iconBtn(icon: string, label: string, onClick?: () => void): HTMLButtonElement {
  const b = el('button', 'icon-btn');
  b.innerHTML = ICONS[icon] ?? '';
  b.title = label;
  b.setAttribute('aria-label', label);
  if (onClick) b.addEventListener('click', onClick);
  return b;
}

// ------------------------------------------------------------------- toasts

export interface ToastHandle {
  update(msg: string): void;
  close(): void;
}

let toastRoot: HTMLElement | null = null;

export function toast(
  msg: string,
  opts: { spinner?: boolean; timeout?: number } = {}
): ToastHandle {
  if (!toastRoot) {
    toastRoot = el('div', 'toast-root');
    document.body.appendChild(toastRoot);
  }
  const t = el('div', 'toast');
  if (opts.spinner) t.appendChild(el('span', 'spinner'));
  const span = el('span', '', msg);
  t.appendChild(span);
  toastRoot.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  let closed = false;
  const close = (): void => {
    if (closed) return;
    closed = true;
    t.classList.remove('show');
    setTimeout(() => t.remove(), 250);
  };
  if (opts.timeout !== 0) setTimeout(close, opts.timeout ?? 2200);
  return { update: (m) => (span.textContent = m), close };
}

// --------------------------------------------------------------- side panel

/** Non-blocking side panel (never a modal): slides in from the right, the
 *  viewport stays fully interactive. */
export class SidePanel {
  root: HTMLElement;
  private body: HTMLElement;
  private titleEl: HTMLElement;
  onClose: (() => void) | null = null;

  constructor(parent: HTMLElement) {
    this.root = el('div', 'side-panel');
    const head = el('div', 'side-panel-head');
    this.titleEl = el('div', 'side-panel-title');
    const close = iconBtn('close', 'Close', () => {
      this.hide();
      this.onClose?.();
    });
    head.append(this.titleEl, close);
    this.body = el('div', 'side-panel-body');
    this.root.append(head, this.body);
    parent.appendChild(this.root);
  }

  show(title: string, content: HTMLElement, onClose?: () => void): void {
    this.titleEl.textContent = title;
    this.body.replaceChildren(content);
    this.onClose = onClose ?? null;
    this.root.classList.add('open');
  }

  hide(): void {
    this.root.classList.remove('open');
  }

  get isOpen(): boolean {
    return this.root.classList.contains('open');
  }
}

// ------------------------------------------------------------------ sliders

export function sliderRow(
  label: string,
  min: number,
  max: number,
  value: number,
  step: number,
  onInput: (v: number) => void
): HTMLElement {
  const row = el('div', 'slider-row');
  const lab = el('label', '', label);
  const val = el('span', 'slider-val', fmtVal(value));
  const input = el('input') as HTMLInputElement;
  input.type = 'range';
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  input.value = String(value);
  input.addEventListener('input', () => {
    const v = parseFloat(input.value);
    val.textContent = fmtVal(v);
    onInput(v);
  });
  const top = el('div', 'slider-top');
  top.append(lab, val);
  row.append(top, input);
  return row;
}

function fmtVal(v: number): string {
  return Math.abs(v) >= 10 ? v.toFixed(0) : v.toFixed(2).replace(/\.?0+$/, '');
}

export function segmented<T extends string>(
  options: { value: T; label: string }[],
  value: T,
  onChange: (v: T) => void
): HTMLElement {
  const wrap = el('div', 'segmented');
  const btns = new Map<T, HTMLButtonElement>();
  for (const o of options) {
    const b = el('button', 'seg-btn', o.label);
    if (o.value === value) b.classList.add('active');
    b.addEventListener('click', () => {
      for (const x of btns.values()) x.classList.remove('active');
      b.classList.add('active');
      onChange(o.value);
    });
    btns.set(o.value, b);
    wrap.appendChild(b);
  }
  return wrap;
}

// ----------------------------------------------------- left edge size slider

/** Procreate-style vertical slider hugging the left edge. Value is 0..1;
 *  mapping to real units is the caller's business. */
export class EdgeSlider {
  root: HTMLElement;
  private fill: HTMLElement;
  private bubble: HTMLElement;
  private value01: number;

  constructor(
    parent: HTMLElement,
    initial01: number,
    private onInput: (v01: number) => void,
    private format: (v01: number) => string
  ) {
    this.value01 = initial01;
    this.root = el('div', 'edge-slider');
    const track = el('div', 'edge-track');
    this.fill = el('div', 'edge-fill');
    track.appendChild(this.fill);
    this.bubble = el('div', 'edge-bubble');
    this.root.append(track, this.bubble);
    parent.appendChild(this.root);
    this.render();

    let dragging = false;
    const set = (clientY: number): void => {
      const r = track.getBoundingClientRect();
      const v = 1 - (clientY - r.top) / r.height;
      this.value01 = Math.max(0, Math.min(1, v));
      this.render();
      this.bubble.textContent = this.format(this.value01);
      this.onInput(this.value01);
    };
    this.root.addEventListener('pointerdown', (e) => {
      dragging = true;
      this.root.setPointerCapture(e.pointerId);
      this.root.classList.add('dragging');
      set(e.clientY);
      e.stopPropagation();
    });
    this.root.addEventListener('pointermove', (e) => {
      if (dragging) set(e.clientY);
    });
    const up = (): void => {
      dragging = false;
      this.root.classList.remove('dragging');
    };
    this.root.addEventListener('pointerup', up);
    this.root.addEventListener('pointercancel', up);
  }

  private render(): void {
    this.fill.style.height = `${this.value01 * 100}%`;
  }

  set(v01: number): void {
    this.value01 = Math.max(0, Math.min(1, v01));
    this.render();
  }

  get(): number {
    return this.value01;
  }
}

// ------------------------------------------------------------ shortcut sheet

export function shortcutOverlay(): HTMLElement {
  const rows: [string, string][] = [
    ['1 finger / Pencil / LMB', 'Active tool (select · drag · draw)'],
    ['2-finger drag · RMB/MMB drag', 'Orbit'],
    ['Pinch · wheel', 'Zoom'],
    ['2-finger twist', 'Roll'],
    ['3-finger drag · shift+wheel / shift+drag', 'Pan'],
    ['2-finger tap · ⌘Z', 'Undo'],
    ['3-finger tap · ⇧⌘Z', 'Redo'],
    ['Draw, then hold still', 'QuickShape snap'],
    ['Hold still while transforming', 'Snap to grid / 15°'],
    ['W / E / R', 'Move / Rotate / Scale gizmo'],
    ['Tab', 'Cycle tool'],
    ['[ ]', 'Size down / up'],
    ['S', 'Toggle symmetry'],
    ['M', 'Toggle matcap'],
    ['F', 'Frame view'],
    ['⌘D', 'Duplicate'],
    ['⌫ / Delete', 'Delete selected'],
    ['?', 'This overlay']
  ];
  const wrap = el('div', 'shortcut-overlay');
  const card = el('div', 'shortcut-card');
  card.appendChild(el('h2', '', 'Gestures & shortcuts'));
  const table = el('div', 'shortcut-table');
  for (const [k, v] of rows) {
    const key = el('div', 'shortcut-key');
    key.appendChild(el('kbd', '', k));
    table.append(key, el('div', 'shortcut-desc', v));
  }
  card.appendChild(table);
  card.appendChild(el('p', 'shortcut-hint', 'Tap anywhere to close'));
  wrap.appendChild(card);
  wrap.addEventListener('pointerdown', () => wrap.remove());
  return wrap;
}
