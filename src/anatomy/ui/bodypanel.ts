/** Body panel: the entire slider hierarchy with Procreate-grade ergonomics.
 *  Search, macro→region→micro accordions, presets + blend, randomize with
 *  per-region locks, measurements, pose check, anatomy-module toggle. */
import { el } from '../../editor/ui';
import { GROUPS, MORPHS, type SliderGroup } from '../catalog';
import { PRESETS, PRESET_BY_ID, blendPresets } from '../presets';
import { TEST_POSES, type CharacterParams } from '../character';
import type { Measurements } from '../engine';

export interface BodyPanelHost {
  getCharacter(): CharacterParams;
  /** live=false means final value → push one undo entry */
  applyWeights(weights: Record<string, number>, sideWeights: Record<string, { l: number; r: number }>, commit: boolean, label: string): void;
  setPose(pose: Record<string, [number, number, number]> | null): void;
  nsfwEnabled(): boolean;
  setNsfwEnabled(on: boolean): void;
  savePreset(name: string): void;
  customPresets(): { id: string; label: string; weights: Record<string, number> }[];
}

const CANON_SNAPS = [-1, -0.5, 0, 0.5, 1];

class SliderWidget {
  root: HTMLElement;
  private fill: HTMLElement;
  private thumb: HTMLElement;
  private valueEl: HTMLElement;
  private fillR: HTMLElement | null = null;
  private thumbR: HTMLElement | null = null;
  private unlinked = false;

  constructor(
    public id: string,
    label: string,
    private bipolar: boolean,
    private panel: BodyPanel
  ) {
    this.root = el('div', 'bslider');
    this.root.dataset.morph = id;
    this.root.dataset.search = label.toLowerCase();
    const top = el('div', 'bslider-top');
    const lab = el('span', 'bslider-label', label);
    this.valueEl = el('span', 'bslider-val');
    const linkBtn = el('button', 'bslider-link', '⇋');
    linkBtn.title = 'Unlink left / right';
    linkBtn.addEventListener('click', () => this.toggleUnlink());
    top.append(lab, el('span', 'flex-spacer'), this.valueEl, linkBtn);
    this.root.appendChild(top);

    const mkTrack = (cls: string): { track: HTMLElement; fill: HTMLElement; thumb: HTMLElement } => {
      const track = el('div', `bslider-track ${cls}`);
      const fill = el('div', 'bslider-fill');
      const thumb = el('div', 'bslider-thumb');
      const detent = el('div', 'bslider-detent');
      detent.style.left = this.bipolar ? '50%' : '0%';
      track.append(detent, fill, thumb);
      this.bindTrack(track, cls === 'right');
      return { track, fill, thumb };
    };
    const t = mkTrack('main');
    this.fill = t.fill;
    this.thumb = t.thumb;
    this.root.appendChild(t.track);
    this.trackMain = t.track;
  }

  private trackMain: HTMLElement;
  private tracksWrapR: HTMLElement | null = null;

  private toggleUnlink(): void {
    this.setUnlinked(!this.unlinked, true);
  }

  setUnlinked(on: boolean, commit: boolean): void {
    if (on === this.unlinked) return;
    this.unlinked = on;
    this.root.classList.toggle('unlinked', on);
    const c = this.panel.host.getCharacter();
    if (on) {
      const track = el('div', 'bslider-track right');
      const fill = el('div', 'bslider-fill');
      const thumb = el('div', 'bslider-thumb');
      const detent = el('div', 'bslider-detent');
      detent.style.left = this.bipolar ? '50%' : '0%';
      track.append(detent, fill, thumb);
      this.bindTrack(track, true);
      this.fillR = fill;
      this.thumbR = thumb;
      this.tracksWrapR = track;
      this.root.appendChild(track);
      this.trackMain.classList.add('left');
      if (commit) {
        const w = c.weights[this.id] ?? 0;
        const sw = { ...c.sideWeights, [this.id]: { l: w, r: w } };
        this.panel.host.applyWeights(c.weights, sw, true, 'Unlink sides');
      }
    } else {
      this.tracksWrapR?.remove();
      this.fillR = null;
      this.thumbR = null;
      this.trackMain.classList.remove('left');
      if (commit) {
        const lr = c.sideWeights[this.id];
        const sw = { ...c.sideWeights };
        delete sw[this.id];
        const weights = { ...c.weights, [this.id]: lr ? (lr.l + lr.r) / 2 : (c.weights[this.id] ?? 0) };
        this.panel.host.applyWeights(weights, sw, true, 'Link sides');
      }
    }
  }

  private valueFromX(track: HTMLElement, clientX: number): number {
    const r = track.getBoundingClientRect();
    const t = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    return this.bipolar ? t * 2 - 1 : t;
  }

  private bindTrack(track: HTMLElement, isRight: boolean): void {
    let dragging = false;
    let startVal = 0;
    let lastTapT = 0;
    let fineAccum = 0;
    let lastX = 0;
    let lastMoveT = 0;
    let holdSnapped = false;

    track.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      const now = performance.now();
      if (now - lastTapT < 300) {
        // double-tap → reset to anatomical average
        this.commitValue(0, isRight, 'Reset slider');
        lastTapT = 0;
        return;
      }
      lastTapT = now;
      dragging = true;
      holdSnapped = false;
      track.setPointerCapture(e.pointerId);
      startVal = this.currentValue(isRight);
      fineAccum = this.valueFromX(track, e.clientX);
      lastX = e.clientX;
      lastMoveT = now;
      this.liveValue(this.applyDetent(fineAccum), isRight);
      this.root.classList.add('dragging');
    });
    track.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      const dt = Math.max(1, now - lastMoveT);
      const speed = Math.abs(dx) / dt; // px per ms
      if (Math.abs(dx) > 0.5) {
        lastMoveT = now;
        holdSnapped = false;
      }
      lastX = e.clientX;
      const r = track.getBoundingClientRect();
      const range = this.bipolar ? 2 : 1;
      // slow drag = fine precision (¼ speed under ~50 px/s)
      const fine = speed < 0.05 ? 0.25 : 1;
      fineAccum += (dx / r.width) * range * fine;
      fineAccum = Math.max(this.bipolar ? -1 : 0, Math.min(1, fineAccum));
      // hold-to-snap to canon values
      if (now - lastMoveT > 420 && !holdSnapped) {
        const nearest = CANON_SNAPS.reduce((a, b) =>
          Math.abs(b - fineAccum) < Math.abs(a - fineAccum) ? b : a
        );
        if (Math.abs(nearest - fineAccum) < 0.18) {
          fineAccum = nearest;
          holdSnapped = true;
        }
      }
      this.liveValue(this.applyDetent(fineAccum), isRight);
    });
    const up = (e: PointerEvent): void => {
      if (!dragging) return;
      dragging = false;
      this.root.classList.remove('dragging');
      const v = this.applyDetent(fineAccum);
      if (Math.abs(v - startVal) > 1e-4) {
        this.commitValue(v, isRight, 'Adjust ' + this.id.replace(/_/g, ' '));
      }
      void e;
    };
    track.addEventListener('pointerup', up);
    track.addEventListener('pointercancel', up);
  }

  /** center detent: gentle snap to the anatomical average */
  private applyDetent(v: number): number {
    return Math.abs(v) < 0.035 ? 0 : v;
  }

  private currentValue(isRight: boolean): number {
    const c = this.panel.host.getCharacter();
    const lr = c.sideWeights[this.id];
    if (lr) return isRight ? lr.r : lr.l;
    return c.weights[this.id] ?? 0;
  }

  private liveValue(v: number, isRight: boolean): void {
    const c = this.panel.host.getCharacter();
    const { weights, sideWeights } = this.buildPatch(c, v, isRight);
    this.panel.host.applyWeights(weights, sideWeights, false, '');
    this.render(c, v, isRight);
  }

  private commitValue(v: number, isRight: boolean, label: string): void {
    const c = this.panel.host.getCharacter();
    const { weights, sideWeights } = this.buildPatch(c, v, isRight);
    this.panel.host.applyWeights(weights, sideWeights, true, label);
    this.sync();
  }

  private buildPatch(
    c: CharacterParams,
    v: number,
    isRight: boolean
  ): { weights: Record<string, number>; sideWeights: Record<string, { l: number; r: number }> } {
    if (this.unlinked || c.sideWeights[this.id]) {
      const lr = c.sideWeights[this.id] ?? { l: c.weights[this.id] ?? 0, r: c.weights[this.id] ?? 0 };
      const next = isRight ? { l: lr.l, r: v } : { l: v, r: lr.r };
      return { weights: c.weights, sideWeights: { ...c.sideWeights, [this.id]: next } };
    }
    return { weights: { ...c.weights, [this.id]: v }, sideWeights: c.sideWeights };
  }

  private render(_c: CharacterParams, v: number, isRight: boolean): void {
    const pct = this.bipolar ? (v + 1) / 2 : v;
    const fill = isRight && this.fillR ? this.fillR : this.fill;
    const thumb = isRight && this.thumbR ? this.thumbR : this.thumb;
    thumb.style.left = `${pct * 100}%`;
    if (this.bipolar) {
      fill.style.left = `${Math.min(50, pct * 100)}%`;
      fill.style.width = `${Math.abs(pct - 0.5) * 100}%`;
    } else {
      fill.style.left = '0';
      fill.style.width = `${pct * 100}%`;
    }
    if (!isRight) {
      this.valueEl.textContent = `${Math.round(pct * 100)}%`;
    }
  }

  /** re-read value(s) from the character (after undo/preset/randomize) */
  sync(): void {
    const c = this.panel.host.getCharacter();
    const lr = c.sideWeights[this.id];
    if (lr && !this.unlinked) this.setUnlinked(true, false);
    if (!lr && this.unlinked) this.setUnlinked(false, false);
    if (lr) {
      this.render(c, lr.l, false);
      this.render(c, lr.r, true);
    } else {
      this.render(c, c.weights[this.id] ?? 0, false);
    }
  }
}

export class BodyPanel {
  content: HTMLElement;
  private widgets = new Map<string, SliderWidget>();
  private groupEls = new Map<SliderGroup, { wrap: HTMLElement; body: HTMLElement; locked: boolean }>();
  private measureEl: HTMLElement;
  private gateNotice: HTMLElement;
  private blendA = 'average_fem';
  private blendB = 'superhero';
  private asymJitter = false;
  private nsfwSection: HTMLElement | null = null;

  constructor(public host: BodyPanelHost) {
    this.content = el('div', 'body-panel');

    // search
    const search = el('input') as HTMLInputElement;
    search.type = 'search';
    search.placeholder = 'Search sliders…';
    search.className = 'body-search';
    search.addEventListener('input', () => this.filter(search.value));
    this.content.appendChild(search);

    // measurements
    this.measureEl = el('div', 'body-measure');
    this.content.appendChild(this.measureEl);
    this.gateNotice = el('div', 'body-gate-notice');
    this.gateNotice.textContent =
      'Adult anatomy is disabled while proportions are in a child-coded range.';
    this.content.appendChild(this.gateNotice);

    this.buildPresets();
    this.buildRandomize();
    this.buildPose();

    for (const g of GROUPS) {
      if (g.id === 'nsfw') continue; // appended conditionally below
      this.buildGroup(g.id, g.label);
    }
    this.buildNsfw();
    this.syncAll();
  }

  private buildGroup(id: SliderGroup, label: string): HTMLElement {
    const wrap = el('div', 'body-group');
    const head = el('button', 'body-group-head');
    const lock = el('button', 'body-lock', '🔓');
    lock.title = 'Lock group against randomize';
    head.append(el('span', '', label), el('span', 'flex-spacer'), lock);
    const body = el('div', 'body-group-body');
    const entry = { wrap, body, locked: false };
    lock.addEventListener('click', (e) => {
      e.stopPropagation();
      entry.locked = !entry.locked;
      lock.textContent = entry.locked ? '🔒' : '🔓';
      lock.classList.toggle('locked', entry.locked);
    });
    head.addEventListener('click', () => wrap.classList.toggle('open'));
    wrap.append(head, body);
    for (const m of MORPHS.filter((m) => m.group === id)) {
      const w = new SliderWidget(m.id, m.label, m.bipolar, this);
      this.widgets.set(m.id, w);
      body.appendChild(w.root);
    }
    this.groupEls.set(id, entry);
    this.content.appendChild(wrap);
    return wrap;
  }

  private buildPresets(): void {
    const wrap = el('div', 'body-group open');
    const head = el('button', 'body-group-head');
    head.append(el('span', '', 'Presets'));
    const body = el('div', 'body-group-body');
    head.addEventListener('click', () => wrap.classList.toggle('open'));

    const chipRow = el('div', 'preset-chips');
    const renderChips = (): void => {
      chipRow.replaceChildren();
      for (const p of [...PRESETS, ...this.host.customPresets()]) {
        const chip = el('button', 'preset-chip', p.label);
        chip.addEventListener('click', () => {
          const c = this.host.getCharacter();
          this.host.applyWeights({ ...p.weights }, c.sideWeights, true, `Preset: ${p.label}`);
          this.syncAll();
        });
        chipRow.appendChild(chip);
      }
    };
    renderChips();
    body.appendChild(chipRow);

    // blend any two presets
    const blendRow = el('div', 'blend-row');
    const selA = el('select') as HTMLSelectElement;
    const selB = el('select') as HTMLSelectElement;
    const fillSel = (sel: HTMLSelectElement, def: string): void => {
      for (const p of [...PRESETS, ...this.host.customPresets()]) {
        const o = el('option', '', p.label) as HTMLOptionElement;
        o.value = p.id;
        sel.appendChild(o);
      }
      sel.value = def;
    };
    fillSel(selA, this.blendA);
    fillSel(selB, this.blendB);
    selA.addEventListener('change', () => (this.blendA = selA.value));
    selB.addEventListener('change', () => (this.blendB = selB.value));
    const blendSlider = el('input') as HTMLInputElement;
    blendSlider.type = 'range';
    blendSlider.min = '0';
    blendSlider.max = '1';
    blendSlider.step = '0.01';
    blendSlider.value = '0.5';
    const applyBlend = (commit: boolean): void => {
      const a = PRESET_BY_ID.get(this.blendA)?.weights ?? this.host.customPresets().find((p) => p.id === this.blendA)?.weights ?? {};
      const b = PRESET_BY_ID.get(this.blendB)?.weights ?? this.host.customPresets().find((p) => p.id === this.blendB)?.weights ?? {};
      const mixed = blendPresets(a, b, parseFloat(blendSlider.value));
      const c = this.host.getCharacter();
      this.host.applyWeights(mixed, c.sideWeights, commit, 'Blend presets');
      if (commit) this.syncAll();
    };
    blendSlider.addEventListener('input', () => applyBlend(false));
    blendSlider.addEventListener('change', () => applyBlend(true));
    blendRow.append(selA, el('span', 'blend-x', '×'), selB);
    body.appendChild(blendRow);
    body.appendChild(blendSlider);

    // save custom
    const saveBtn = el('button', 'ghost-btn', 'Save current as preset');
    saveBtn.addEventListener('click', () => {
      const name = prompt('Preset name', 'My body');
      if (name?.trim()) {
        this.host.savePreset(name.trim());
        renderChips();
        selA.replaceChildren();
        selB.replaceChildren();
        fillSel(selA, this.blendA);
        fillSel(selB, this.blendB);
      }
    });
    body.appendChild(saveBtn);

    wrap.append(head, body);
    this.content.appendChild(wrap);
  }

  private buildRandomize(): void {
    const row = el('div', 'randomize-row');
    const btn = el('button', 'ghost-btn', '🎲 Randomize');
    btn.addEventListener('click', () => this.randomize());
    const jitterLab = el('label', 'jitter-label');
    const jitter = el('input') as HTMLInputElement;
    jitter.type = 'checkbox';
    jitter.addEventListener('change', () => (this.asymJitter = jitter.checked));
    jitterLab.append(jitter, el('span', '', 'natural asymmetry'));
    row.append(btn, jitterLab);
    this.content.appendChild(row);
  }

  private randomize(): void {
    const c = this.host.getCharacter();
    const weights: Record<string, number> = { ...c.weights };
    const sideWeights: Record<string, { l: number; r: number }> = { ...c.sideWeights };
    const gauss = (): number => {
      let s = 0;
      for (let i = 0; i < 4; i++) s += Math.random();
      return (s / 4 - 0.5) * 2; // roughly gaussian in −1…1
    };
    for (const m of MORPHS) {
      if (m.nsfw) continue;
      const group = this.groupEls.get(m.group);
      if (group?.locked) continue;
      const v = m.bipolar ? gauss() * 0.55 : Math.max(0, gauss() * 0.35);
      weights[m.id] = Math.max(m.bipolar ? -1 : 0, Math.min(1, v));
      delete sideWeights[m.id];
      if (this.asymJitter && m.bipolar && Math.random() < 0.3 && (m.group === 'head' || m.group === 'arms' || m.group === 'legs')) {
        const j = (Math.random() - 0.5) * 0.12;
        sideWeights[m.id] = { l: weights[m.id] + j, r: weights[m.id] - j };
      }
    }
    this.host.applyWeights(weights, sideWeights, true, 'Randomize');
    this.syncAll();
  }

  private buildPose(): void {
    const row = el('div', 'pose-row');
    row.appendChild(el('span', 'pose-label', 'Pose check'));
    for (const p of TEST_POSES) {
      const chip = el('button', 'preset-chip pose-chip', p.label);
      chip.addEventListener('click', () => {
        for (const c of row.querySelectorAll('.pose-chip')) c.classList.remove('active');
        chip.classList.add('active');
        this.host.setPose(Object.keys(p.pose).length ? p.pose : null);
      });
      if (p.id === 'rest') chip.classList.add('active');
      row.appendChild(chip);
    }
    this.content.appendChild(row);
  }

  private buildNsfw(): void {
    // settings toggle lives at the bottom; group only renders when enabled
    const toggleRow = el('div', 'nsfw-toggle-row');
    const lab = el('label', 'jitter-label');
    const cb = el('input') as HTMLInputElement;
    cb.type = 'checkbox';
    cb.checked = this.host.nsfwEnabled();
    cb.addEventListener('change', () => {
      this.host.setNsfwEnabled(cb.checked);
      this.rebuildNsfwSection();
    });
    lab.append(cb, el('span', '', 'Adult anatomy module (this project)'));
    toggleRow.appendChild(lab);
    toggleRow.appendChild(
      el('p', 'panel-note', 'Off by default. Adult-proportioned figures only — explicit morphs auto-disable for child-coded proportions.')
    );
    this.content.appendChild(toggleRow);
    this.rebuildNsfwSection();
  }

  private rebuildNsfwSection(): void {
    this.nsfwSection?.remove();
    this.nsfwSection = null;
    const removed = this.groupEls.get('nsfw');
    if (removed) {
      for (const m of MORPHS.filter((m) => m.group === 'nsfw')) this.widgets.delete(m.id);
      this.groupEls.delete('nsfw');
    }
    if (!this.host.nsfwEnabled()) return;
    const wrap = this.buildGroup('nsfw', 'Anatomy (adult)');
    this.nsfwSection = wrap;
    // keep the toggle row at the very bottom
    this.content.appendChild(this.content.querySelector('.nsfw-toggle-row')!);
  }

  openGroup(id: SliderGroup): void {
    const g = this.groupEls.get(id);
    if (!g) return;
    g.wrap.classList.add('open');
    g.wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  filter(q: string): void {
    const needle = q.trim().toLowerCase();
    for (const w of this.widgets.values()) {
      const hit = !needle || (w.root.dataset.search ?? '').includes(needle) || w.id.includes(needle);
      w.root.style.display = hit ? '' : 'none';
    }
    for (const [, g] of this.groupEls) {
      if (needle) g.wrap.classList.add('open');
      const any = [...g.body.children].some((c) => (c as HTMLElement).style.display !== 'none');
      g.wrap.style.display = any ? '' : 'none';
    }
    if (!needle) {
      for (const [, g] of this.groupEls) g.wrap.style.display = '';
    }
  }

  updateMeasurements(m: Measurements): void {
    this.measureEl.textContent =
      `${m.heightCm.toFixed(0)} cm · ${m.headUnits.toFixed(1)} heads · ` +
      `chest ${m.chestCm.toFixed(0)} · waist ${m.waistCm.toFixed(0)} · hip ${m.hipCm.toFixed(0)} cm`;
    this.gateNotice.classList.toggle('visible', m.gated);
  }

  syncAll(): void {
    for (const w of this.widgets.values()) w.sync();
  }
}
