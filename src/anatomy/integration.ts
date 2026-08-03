/** FigureManager: owns per-figure runtimes and wires the anatomy engine into
 *  the editor — body panel, on-model handles, tap-a-region, undoable slider
 *  commits, bake-to-static, and figure-aware export data. */
import * as THREE from 'three';
import type { Doc } from '../core/doc';
import type { DocEvent } from '../core/doc';
import { History } from '../core/history';
import type { GeoData, SceneObjectData } from '../core/types';
import { newId, identityTransform } from '../core/types';
import type { Viewport } from '../editor/viewport';
import type { CameraRig } from '../editor/camera';
import type { SidePanel } from '../editor/ui';
import { toast } from '../editor/ui';
import type { StrokePoint } from '../editor/input';
import { AnatomyEngine, FigureRuntime, type Measurements } from './engine';
import { cloneCharacter, defaultCharacter, type CharacterParams } from './character';
import { BodyPanel, type BodyPanelHost } from './ui/bodypanel';
import { FigureHandles } from './ui/handles';
import { REGION_TO_GROUP } from './catalog';
import { PRESET_BY_ID } from './presets';
import type { PosePreset, PoseCategory, Vec3 } from './pose/schema';
import { parsePresets, serializePresets } from './pose/schema';
import { solvePose, type ParticipantRest, type SolveResult } from './pose/solver';
import { SHIPPED_POSES } from './pose/library';
import { blendPosePresets, mirrorPreset, rotateIds } from './pose/utils';
import { extractPreset } from './pose/extract';

const CUSTOM_PRESETS_KEY = 'sculptpad-custom-presets';
const CUSTOM_POSES_KEY = 'sculptpad-custom-poses';

export interface FigureManagerDeps {
  doc: Doc;
  history: History;
  viewport: Viewport;
  rig: CameraRig;
  panel: SidePanel;
  getSelection: () => string | null;
  select: (id: string | null) => void;
  requestBooleanUnionAll: (geos: GeoData[]) => Promise<GeoData>;
}

export class FigureManager {
  private runtimes = new Map<string, FigureRuntime>();
  private handles: FigureHandles | null = null;
  private bodyPanel: BodyPanel | null = null;
  private panelFor: string | null = null;
  /** working (uncommitted) params during a live drag */
  private pending = new Map<string, CharacterParams>();
  private handleDrag: { id: string; slider: string; side: 'l' | 'r' | null } | null = null;
  private bakeArmed = false;

  constructor(private deps: FigureManagerDeps) {
    deps.doc.on((e) => this.onDocEvent(e));
  }

  isFigure(id: string | null): boolean {
    return !!id && !!this.deps.doc.get(id)?.character;
  }

  runtimeFor(id: string): FigureRuntime | null {
    return this.runtimes.get(id) ?? null;
  }

  // ------------------------------------------------------------- lifecycle

  private onDocEvent(e: DocEvent): void {
    const { doc } = this.deps;
    if (e.type === 'add') {
      const obj = doc.get(e.id);
      if (obj?.character) this.ensureRuntime(e.id);
    } else if (e.type === 'remove') {
      this.dropRuntime(e.id);
      if (this.panelFor === e.id) this.closePanel();
    } else if (e.type === 'reset') {
      for (const id of [...this.runtimes.keys()]) this.dropRuntime(id);
      this.closePanel();
      for (const obj of doc.list()) if (obj.character) this.ensureRuntime(obj.id);
    } else if (e.type === 'change') {
      const obj = doc.get(e.id);
      if (!obj) return;
      if (e.what === 'character') {
        if (obj.character) {
          this.ensureRuntime(e.id);
          this.pending.delete(e.id);
          this.recompose(e.id);
          if (this.panelFor === e.id) this.bodyPanel?.syncAll();
        } else {
          this.dropRuntime(e.id);
          if (this.panelFor === e.id) this.closePanel();
        }
      } else if (e.what === 'geo' && obj.character) {
        // geometry swapped (bake/undo) → retarget the runtime
        const rt = this.runtimes.get(e.id);
        if (rt) rt.setTarget(this.deps.viewport.meshFor(e.id)?.geometry ?? null);
      }
    }
  }

  private ensureRuntime(id: string): void {
    if (this.runtimes.has(id)) return;
    const rt = new FigureRuntime();
    this.runtimes.set(id, rt);
    rt.onComposed = (res) => {
      if (this.panelFor === id) this.bodyPanel?.updateMeasurements(res.measurements);
      this.updateHandles(id);
      this.deps.viewport.invalidate();
    };
    void rt.engine.ready().then(() => {
      rt.setTarget(this.deps.viewport.meshFor(id)?.geometry ?? null);
      this.recompose(id);
    });
  }

  private dropRuntime(id: string): void {
    this.runtimes.get(id)?.dispose();
    this.runtimes.delete(id);
    this.pending.delete(id);
  }

  private charOf(id: string): CharacterParams | null {
    return this.pending.get(id) ?? this.deps.doc.get(id)?.character ?? null;
  }

  private recompose(id: string): void {
    const c = this.charOf(id);
    const rt = this.runtimes.get(id);
    if (!c || !rt) return;
    rt.request(c, !!this.deps.doc.settings.nsfwEnabled, c.pose);
  }

  // ------------------------------------------------------------ add figure

  async addFigure(preset?: string): Promise<string | null> {
    const engine = AnatomyEngine.shared();
    const t = toast('Preparing body…', { spinner: true, timeout: 0 });
    try {
      await engine.ready();
      const weights = preset ? { ...(PRESET_BY_ID.get(preset)?.weights ?? {}) } : {};
      const character = defaultCharacter(weights);
      const rt = new FigureRuntime();
      const res = await rt.requestAndWait(character, !!this.deps.doc.settings.nsfwEnabled, null);
      const geo = rt.bakeGeoData()!;
      rt.dispose();
      void res;
      const name = this.deps.doc.uniqueName(preset === 'toon' ? 'Toon body' : 'Body');
      const obj: SceneObjectData = {
        id: newId(),
        name,
        geo,
        transform: identityTransform(),
        color: (preset && PRESET_BY_ID.get(preset)?.skin) || '#c69076',
        mirror: null,
        visible: true,
        character
      };
      const doc = this.deps.doc;
      this.deps.history.push({
        label: `Add ${name}`,
        do: () => doc.add(obj),
        undo: () => void doc.remove(obj.id)
      });
      t.close();
      this.deps.select(obj.id);
      this.openPanel(obj.id);
      return obj.id;
    } catch (err) {
      t.close();
      toast(`Body failed: ${err instanceof Error ? err.message : err}`, { timeout: 3000 });
      return null;
    }
  }

  // ------------------------------------------------------------ body panel

  openPanel(id: string, region?: number): void {
    const obj = this.deps.doc.get(id);
    if (!obj?.character) return;
    if (this.panelFor !== id || !this.bodyPanel) {
      this.panelFor = id;
      this.bodyPanel = new BodyPanel(this.makeHost(id));
      const content = this.bodyPanel.content;
      // bake action
      const bakeBtn = document.createElement('button');
      bakeBtn.className = 'ghost-btn bake-btn';
      bakeBtn.textContent = 'Bake body (freeze sliders)';
      bakeBtn.addEventListener('click', () => {
        if (!this.bakeArmed) {
          this.bakeArmed = true;
          bakeBtn.textContent = '⚠ Baking freezes all sliders — tap again';
          bakeBtn.classList.add('armed');
          setTimeout(() => {
            this.bakeArmed = false;
            bakeBtn.textContent = 'Bake body (freeze sliders)';
            bakeBtn.classList.remove('armed');
          }, 3000);
          return;
        }
        void this.bakeFigure(id);
      });
      content.appendChild(bakeBtn);
      this.deps.panel.show('Body', content, () => {
        this.panelFor = null;
        this.setHandlesVisible(false);
      });
      this.setHandlesVisible(true);
    }
    if (region !== undefined) {
      const group = REGION_TO_GROUP[region];
      if (group) this.bodyPanel.openGroup(group);
    }
    const rt = this.runtimes.get(id);
    if (rt?.lastResult) this.bodyPanel.updateMeasurements(rt.lastResult.measurements);
  }

  closePanel(): void {
    if (this.panelFor) {
      this.deps.panel.hide();
      this.panelFor = null;
      this.setHandlesVisible(false);
    }
  }

  private makeHost(id: string): BodyPanelHost {
    const mgr = this;
    const deps = this.deps;
    return {
      getCharacter: () => mgr.charOf(id) ?? defaultCharacter(),
      applyWeights(weights, sideWeights, commit, label) {
        const cur = mgr.charOf(id);
        if (!cur) return;
        // live drags share the sculpt layer by reference — no per-frame copies
        const next: CharacterParams = {
          version: 1,
          weights: { ...weights },
          sideWeights: Object.fromEntries(
            Object.entries(sideWeights).map(([k, v]) => [k, { ...v }])
          ),
          sculptDelta: cur.sculptDelta,
          pose: cur.pose
        };
        if (commit) void mgr.commitCharacter(id, next, label || 'Adjust body');
        else mgr.liveCharacter(id, next);
      },
      setPose(pose) {
        const cur = mgr.charOf(id);
        if (!cur) return;
        const next = cloneCharacter(cur);
        next.pose = pose;
        void mgr.commitCharacter(id, next, 'Pose');
      },
      setSkin(color) {
        const obj = deps.doc.get(id);
        if (!obj || obj.color === color) return;
        const before = obj.color;
        const doc = deps.doc;
        deps.history.push({
          label: 'Skin tone',
          do: () => doc.setProps(id, { color }),
          undo: () => doc.setProps(id, { color: before })
        });
      },
      nsfwEnabled: () => !!deps.doc.settings.nsfwEnabled,
      setNsfwEnabled(on) {
        deps.doc.setSettings({ nsfwEnabled: on });
        mgr.recompose(id);
        toast(on ? 'Adult anatomy module enabled for this project' : 'Adult anatomy module disabled', { timeout: 1800 });
      },
      savePreset(name) {
        const cur = mgr.charOf(id);
        if (!cur) return;
        const list = mgr.customPresetsRaw();
        list.push({ id: `custom_${Date.now()}`, label: name, weights: { ...cur.weights } });
        localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(list));
        toast(`Preset “${name}” saved`, { timeout: 1500 });
      },
      customPresets: () => mgr.customPresetsRaw(),
      // pose library (scene-level)
      poseLibrary: () => mgr.poseLibrary(),
      applyPose: (p) => void mgr.applyPosePreset(p),
      blendPoses: (a, b, t) => void mgr.blendPoses(a, b, t),
      roleSwap: () => void mgr.roleSwap(),
      mirrorPose: () => void mgr.mirrorLastPose(),
      savePose: (name, category) => void mgr.saveCurrentAsPose(name, category),
      importPoses: (json) => mgr.importPoseLibrary(json),
      exportPoses: () => mgr.exportPoseLibrary(),
      clearPose: () => void mgr.clearPose()
    };
  }

  customPresetsRaw(): { id: string; label: string; weights: Record<string, number> }[] {
    try {
      return JSON.parse(localStorage.getItem(CUSTOM_PRESETS_KEY) ?? '[]');
    } catch {
      return [];
    }
  }

  // -------------------------------------------------- live / commit updates

  liveCharacter(id: string, next: CharacterParams): void {
    this.pending.set(id, next);
    this.recompose(id);
  }

  async commitCharacter(id: string, next: CharacterParams, label: string): Promise<void> {
    const doc = this.deps.doc;
    const obj = doc.get(id);
    const rt = this.runtimes.get(id);
    if (!obj?.character || !rt) return;
    const before = obj.character;
    const beforeGeo = obj.geo;
    this.pending.delete(id);
    await rt.requestAndWait(next, !!doc.settings.nsfwEnabled, next.pose);
    const afterGeo = rt.bakeGeoData();
    if (!afterGeo) return;
    this.deps.history.push({
      label,
      do: () => {
        doc.setGeo(id, afterGeo);
        doc.setCharacter(id, next);
      },
      undo: () => {
        doc.setGeo(id, beforeGeo);
        doc.setCharacter(id, before);
      }
    });
  }

  // ------------------------------------------------------- sculpt delta API

  /** Future sculpt brushes write here: deltas ride on top of the morph stack,
   *  so sliders stay live after sculpting. */
  async applySculptDelta(id: string, delta: Float32Array, label = 'Sculpt'): Promise<void> {
    const cur = this.charOf(id);
    if (!cur) return;
    const next = cloneCharacter(cur);
    if (!next.sculptDelta) next.sculptDelta = new Float32Array(delta.length);
    for (let i = 0; i < delta.length; i++) next.sculptDelta[i] += delta[i];
    await this.commitCharacter(id, next, label);
  }

  // ------------------------------------------------------------- handles

  private async ensureHandles(): Promise<FigureHandles | null> {
    if (this.handles) return this.handles;
    const engine = AnatomyEngine.shared();
    await engine.ready();
    if (!engine.topology) return null;
    this.handles = new FigureHandles(engine.topology);
    this.deps.viewport.overlayGroup.add(this.handles.group);
    return this.handles;
  }

  setHandlesVisible(on: boolean): void {
    if (!on) {
      this.handles?.setVisible(false);
      this.deps.viewport.invalidate();
      return;
    }
    void this.ensureHandles().then((h) => {
      if (h && this.panelFor) {
        h.setVisible(true);
        this.updateHandles(this.panelFor);
        this.deps.viewport.invalidate();
      }
    });
  }

  /** Current handle layer, or null while handles are hidden (test probe). */
  handleMode(): 'body' | 'face' | null {
    return this.handles?.visible ? this.handles.mode : null;
  }

  /** Per-frame: keep handle size and the body/face layer in sync with zoom
   *  (the face-puppet handles take over as the camera closes in). */
  frameTick(): boolean {
    if (!this.handles?.visible || !this.panelFor) return false;
    const d = this.deps.rig.dist;
    if (Math.abs(d - this.lastHandleDist) < 1e-4) return false;
    this.lastHandleDist = d;
    this.updateHandles(this.panelFor);
    return true;
  }

  private lastHandleDist = -1;

  private updateHandles(id: string): void {
    if (!this.handles?.visible || this.panelFor !== id) return;
    const rt = this.runtimes.get(id);
    const obj = this.deps.doc.get(id);
    if (!rt?.lastResult || !obj) return;
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(...obj.transform.position),
      new THREE.Quaternion(...obj.transform.quaternion),
      new THREE.Vector3(...obj.transform.scale)
    );
    this.handles.update(rt.lastResult.positions, m, this.deps.rig.dist);
  }

  /** Editor stroke routing: returns true if a handle grabbed the pointer. */
  tryBeginHandleDrag(p: StrokePoint): boolean {
    const id = this.panelFor;
    if (!id || !this.handles?.visible) return false;
    const ray = this.deps.viewport.ray(p.x, p.y);
    const grab = this.handles.beginDrag(ray, this.deps.rig.camera, (slider, side) => {
      const c = this.charOf(id);
      if (!c) return 0;
      const lr = c.sideWeights[slider];
      if (lr && side) return side === 'l' ? lr.l : lr.r;
      return c.weights[slider] ?? 0;
    });
    if (grab) this.handleDrag = { id, ...grab };
    return !!grab;
  }

  handleDragMove(p: StrokePoint): void {
    if (!this.handleDrag || !this.handles) return;
    const w = this.handles.drag2(this.deps.viewport.ray(p.x, p.y));
    if (w === null) return;
    const { id, slider, side } = this.handleDrag;
    const cur = this.charOf(id);
    if (!cur) return;
    const next: CharacterParams = {
      version: 1,
      weights: { ...cur.weights },
      sideWeights: Object.fromEntries(
        Object.entries(cur.sideWeights).map(([k, v]) => [k, { ...v }])
      ),
      sculptDelta: cur.sculptDelta,
      pose: cur.pose
    };
    const lr = next.sideWeights[slider];
    if (lr && side) {
      lr[side] = w;
    } else {
      next.weights[slider] = w;
    }
    this.liveCharacter(id, next);
    if (this.panelFor === id) this.bodyPanel?.syncAll();
  }

  handleDragEnd(): void {
    if (!this.handleDrag || !this.handles) return;
    this.handles.endDrag();
    const { id, slider } = this.handleDrag;
    this.handleDrag = null;
    const pendingC = this.pending.get(id);
    if (pendingC) {
      void this.commitCharacter(id, pendingC, `Adjust ${slider.replace(/^exp_/, '').replace(/_/g, ' ')}`);
    }
  }

  handleDragCancel(): void {
    if (!this.handleDrag || !this.handles) return;
    this.handles.endDrag();
    const { id } = this.handleDrag;
    this.handleDrag = null;
    this.pending.delete(id);
    this.recompose(id);
  }

  // -------------------------------------------------- programmatic helpers

  /** Merge-and-commit weights (used by tests and scripting). */
  async setWeights(id: string, weights: Record<string, number>, label = 'Adjust body'): Promise<void> {
    const cur = this.charOf(id);
    if (!cur) return;
    const next = cloneCharacter(cur);
    next.weights = { ...next.weights, ...weights };
    await this.commitCharacter(id, next, label);
  }

  async setPose(id: string, pose: Record<string, [number, number, number]> | null): Promise<void> {
    const cur = this.charOf(id);
    if (!cur) return;
    const next = cloneCharacter(cur);
    next.pose = pose;
    await this.commitCharacter(id, next, 'Pose');
  }

  measurementsOf(id: string): Measurements | null {
    return this.runtimes.get(id)?.lastResult?.measurements ?? null;
  }

  /** Perf probe for the 60fps DoD: worker compute per frame + full roundtrip.
   *  With latest-wins scheduling a drag stays fluid as long as workerMs fits a
   *  frame; roundtrip only adds (bounded) latency. */
  async composeProbe(id: string, n = 20): Promise<{ workerMs: number; roundtripMs: number }> {
    const rt = this.runtimes.get(id);
    const c = this.charOf(id);
    if (!rt || !c) return { workerMs: -1, roundtripMs: -1 };
    let worker = 0;
    const t0 = performance.now();
    for (let i = 0; i < n; i++) {
      const res = await rt.requestAndWait(c, !!this.deps.doc.settings.nsfwEnabled, c.pose);
      worker += res.composeMs;
    }
    return { workerMs: worker / n, roundtripMs: (performance.now() - t0) / n };
  }

  get draggingHandle(): boolean {
    return !!this.handleDrag;
  }

  // ------------------------------------------------------------- region tap

  /** Tap on a figure → open that region's slider group. */
  handleFigureTap(id: string, vertexIndex: number): void {
    const engine = AnatomyEngine.shared();
    const topo = engine.topology;
    const region = topo && vertexIndex < topo.regions.length ? topo.regions[vertexIndex] : undefined;
    this.openPanel(id, region);
  }

  // ------------------------------------------------------------ pose system

  private lastPoseApply: { preset: PosePreset; ids: string[] } | null = null;

  /** Rest-state snapshot for the retargeting solver (pose-null compose). */
  async restSnapshot(id: string): Promise<ParticipantRest | null> {
    const rt = this.runtimes.get(id);
    const c = this.charOf(id);
    const engine = AnatomyEngine.shared();
    await engine.ready();
    const topo = engine.topology;
    if (!rt || !c || !topo) return null;
    const restChar = { ...c, pose: null };
    const res = await rt.requestAndWait(restChar, !!this.deps.doc.settings.nsfwEnabled, null);
    const landmarks: Record<string, Vec3> = {};
    const landmarkSkin: ParticipantRest['landmarkSkin'] = {};
    for (const [name, vi] of Object.entries(topo.landmarkVerts)) {
      landmarks[name] = [
        res.positions[vi * 3],
        res.positions[vi * 3 + 1],
        res.positions[vi * 3 + 2]
      ];
      landmarkSkin[name] = {
        b: [topo.skinIndex[vi * 2], topo.skinIndex[vi * 2 + 1]],
        w: [topo.skinWeight[vi * 2], topo.skinWeight[vi * 2 + 1]]
      };
    }
    const m = res.measurements;
    const bodyRadius = Math.max(
      (m.shoulderCm / 200) * 0.85,
      (m.chestCm / (200 * Math.PI)) * 1.15,
      (m.hipCm / (200 * Math.PI)) * 1.2
    );
    // restore the live pose after the snapshot compose
    this.recompose(id);
    return {
      joints: res.joints,
      boneNames: topo.bones,
      boneParent: topo.boneParent,
      landmarks,
      landmarkSkin,
      bodyRadius,
      height: m.heightCm / 100
    };
  }

  /** Figures participating in a pose: selected figure is the anchor (role 0),
   *  the rest follow document order. */
  poseParticipants(count: number): string[] {
    const figs = this.deps.doc.list().filter((o) => o.character).map((o) => o.id);
    const sel = this.deps.getSelection();
    if (sel && figs.includes(sel)) {
      figs.splice(figs.indexOf(sel), 1);
      figs.unshift(sel);
    }
    return figs.slice(0, count);
  }

  private yawOf(id: string): number {
    const obj = this.deps.doc.get(id)!;
    const [x, y, z, w] = obj.transform.quaternion;
    // forward vector of the transform, projected to a yaw
    const fx = 2 * (x * z + w * y);
    const fz = 1 - 2 * (x * x + y * y);
    return Math.atan2(fx, fz);
  }

  /** Retarget + apply a pose preset. Returns solver diagnostics. */
  async applyPosePreset(
    preset: PosePreset,
    ids?: string[]
  ): Promise<(SolveResult & { maxPenetration: number }) | null> {
    const doc = this.deps.doc;
    const use = ids ?? this.poseParticipants(preset.participants);
    if (use.length < preset.participants) {
      toast(`“${preset.name}” needs ${preset.participants} bodies (${use.length} in scene)`, { timeout: 2600 });
      return null;
    }
    const rests: ParticipantRest[] = [];
    for (const id of use) {
      const r = await this.restSnapshot(id);
      if (!r) return null;
      rests.push(r);
    }
    const anchorObj = doc.get(use[0])!;
    const result = solvePose(preset, rests, {
      pos: [anchorObj.transform.position[0], 0, anchorObj.transform.position[2]],
      yaw: this.yawOf(use[0])
    });

    // one undoable command across every participant — with freshly baked geo
    // so exports/saves see the posed mesh, not a stale bake
    interface PoseEntry {
      id: string;
      before: { t: SceneObjectData['transform']; c: CharacterParams; g: GeoData };
      after: { t: SceneObjectData['transform']; c: CharacterParams; g: GeoData };
    }
    const entries: PoseEntry[] = [];
    for (let i = 0; i < Math.min(preset.participants, use.length); i++) {
      const id = use[i];
      const obj = doc.get(id)!;
      const before = { t: obj.transform, c: obj.character!, g: obj.geo };
      const pl = result.placements[i];
      const half = pl.yaw / 2;
      const afterC = cloneCharacter(obj.character!);
      afterC.pose = Object.fromEntries(
        Object.entries(pl.rotations).filter(([, e]) => Math.hypot(...e) > 1e-4)
      ) as Record<string, [number, number, number]>;
      const rt = this.runtimes.get(id)!;
      await rt.requestAndWait(afterC, !!doc.settings.nsfwEnabled, afterC.pose);
      const afterG = rt.bakeGeoData()!;
      entries.push({
        id,
        before,
        after: {
          t: {
            position: [pl.pos[0], pl.pos[1], pl.pos[2]] as [number, number, number],
            quaternion: [0, Math.sin(half), 0, Math.cos(half)] as [number, number, number, number],
            scale: obj.transform.scale
          },
          c: afterC,
          g: afterG
        }
      });
    }
    this.deps.history.push({
      label: `Pose: ${preset.name}`,
      do: () => {
        for (const e of entries) {
          doc.setTransform(e.id, e.after.t);
          doc.setGeo(e.id, e.after.g);
          doc.setCharacter(e.id, e.after.c);
        }
      },
      undo: () => {
        for (const e of entries) {
          doc.setTransform(e.id, e.before.t);
          doc.setGeo(e.id, e.before.g);
          doc.setCharacter(e.id, e.before.c);
        }
      }
    });
    this.lastPoseApply = { preset, ids: use.slice(0, preset.participants) };
    return { ...result, maxPenetration: entries.length > 1 ? result.maxPenetration : 0 };
  }

  /** Re-solve the last pose with participants rotated one role over. */
  async roleSwap(): Promise<void> {
    if (!this.lastPoseApply) {
      toast('Apply a pose first', { timeout: 1400 });
      return;
    }
    await this.applyPosePreset(this.lastPoseApply.preset, rotateIds(this.lastPoseApply.ids));
  }

  async mirrorLastPose(): Promise<void> {
    if (!this.lastPoseApply) {
      toast('Apply a pose first', { timeout: 1400 });
      return;
    }
    await this.applyPosePreset(mirrorPreset(this.lastPoseApply.preset), this.lastPoseApply.ids);
  }

  async blendPoses(a: PosePreset, b: PosePreset, t: number): Promise<void> {
    await this.applyPosePreset(blendPosePresets(a, b, t));
  }

  poseLibrary(): { shipped: PosePreset[]; custom: PosePreset[] } {
    return { shipped: SHIPPED_POSES, custom: this.customPosesRaw() };
  }

  customPosesRaw(): PosePreset[] {
    try {
      return parsePresets(localStorage.getItem(CUSTOM_POSES_KEY) ?? '{"presets":[]}');
    } catch {
      return [];
    }
  }

  /** Author a preset from the live scene (all figures, selected = anchor). */
  async saveCurrentAsPose(name: string, category: PoseCategory): Promise<PosePreset | null> {
    const ids = this.poseParticipants(Infinity);
    if (!ids.length) return null;
    const inputs = [];
    for (const id of ids) {
      const rest = await this.restSnapshot(id);
      const obj = this.deps.doc.get(id);
      if (!rest || !obj?.character) return null;
      inputs.push({
        rest,
        pos: [obj.transform.position[0], obj.transform.position[1], obj.transform.position[2]] as Vec3,
        yaw: this.yawOf(id),
        rotations: (obj.character.pose ?? {}) as Record<string, Vec3>
      });
    }
    // non-adult saves get their category from the participant count
    const derived: PoseCategory =
      category === 'nsfw' ? 'nsfw' : inputs.length === 1 ? 'solo' : inputs.length === 2 ? 'duo' : 'trio';
    const preset = extractPreset(inputs, name, derived);
    const list = this.customPosesRaw();
    list.push(preset);
    localStorage.setItem(CUSTOM_POSES_KEY, serializePresets(list));
    toast(`Pose “${name}” saved (${preset.contacts.length} contacts extracted)`, { timeout: 2200 });
    return preset;
  }

  exportPoseLibrary(): string {
    return serializePresets(this.customPosesRaw());
  }

  importPoseLibrary(json: string): number {
    const incoming = parsePresets(json);
    const list = this.customPosesRaw();
    // NSFW-categorized presets only land when the module is enabled
    const usable = incoming.filter(
      (p) => p.category !== 'nsfw' || this.deps.doc.settings.nsfwEnabled
    );
    list.push(...usable);
    localStorage.setItem(CUSTOM_POSES_KEY, serializePresets(list));
    return usable.length;
  }

  async clearPose(): Promise<void> {
    const ids = this.poseParticipants(Infinity);
    for (const id of ids) {
      const c = this.charOf(id);
      if (!c?.pose) continue;
      const next = cloneCharacter(c);
      next.pose = null;
      await this.commitCharacter(id, next, 'Clear pose');
    }
  }

  // ------------------------------------------------------------------ bake

  /** Bake to a plain watertight object: manifold-union of all body parts.
   *  Destroys slider access (warned in the panel before arming). */
  async bakeFigure(id: string): Promise<void> {
    const doc = this.deps.doc;
    const obj = doc.get(id);
    const rt = this.runtimes.get(id);
    const engine = AnatomyEngine.shared();
    if (!obj?.character || !rt?.lastResult || !engine.topology) return;
    const t = toast('Baking body (manifold union)…', { spinner: true, timeout: 0 });
    try {
      const parts = splitFigureParts(
        { positions: rt.lastResult.positions, normals: null, uvs: null, indices: engine.topology.indices },
        engine.topology.parts
      );
      const merged = await this.deps.requestBooleanUnionAll(parts);
      const before = obj.character;
      const beforeGeo = obj.geo;
      this.deps.history.push({
        label: 'Bake body',
        do: () => {
          doc.setGeo(id, merged);
          doc.setCharacter(id, null);
        },
        undo: () => {
          doc.setGeo(id, beforeGeo);
          doc.setCharacter(id, before);
        }
      });
      t.close();
      toast(`Baked — ${(merged.indices.length / 3).toLocaleString()} tris, watertight`, { timeout: 2200 });
    } catch (err) {
      t.close();
      toast(`Bake failed: ${err instanceof Error ? err.message : err}`, { timeout: 3200 });
    }
  }
}

/** Part ranges for an exported figure geo — handles the doubled buffer when
 *  the object also has a live mirror baked in. */
export function figureExportParts(
  geo: GeoData,
  topo: { vertCount: number; indices: Uint32Array; parts: { name: string; vStart: number; vCount: number; iStart: number; iCount: number }[] }
): { vStart: number; vCount: number; iStart: number; iCount: number }[] {
  const copies = Math.max(1, Math.round(geo.positions.length / 3 / topo.vertCount));
  const out: { vStart: number; vCount: number; iStart: number; iCount: number }[] = [];
  for (let c = 0; c < copies; c++) {
    for (const p of topo.parts) {
      out.push({
        vStart: p.vStart + c * topo.vertCount,
        vCount: p.vCount,
        iStart: p.iStart + c * topo.indices.length,
        iCount: p.iCount
      });
    }
  }
  return out;
}

/** Split a figure's geo into its closed parts (for manifold union). */
export function splitFigureParts(
  geo: GeoData,
  parts: { vStart: number; vCount: number; iStart: number; iCount: number }[]
): GeoData[] {
  const out: GeoData[] = [];
  for (const p of parts) {
    const positions = geo.positions.slice(p.vStart * 3, (p.vStart + p.vCount) * 3);
    const indices = new Uint32Array(p.iCount);
    for (let i = 0; i < p.iCount; i++) indices[i] = geo.indices[p.iStart + i] - p.vStart;
    out.push({ positions, normals: null, uvs: null, indices });
  }
  return out;
}

export type { Measurements };
