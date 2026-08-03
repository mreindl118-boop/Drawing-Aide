import * as THREE from 'three';
import { Doc } from '../core/doc';
import { History, type Command } from '../core/history';
import {
  cloneTransform,
  identityTransform,
  newId,
  type GeoData,
  type MirrorAxis,
  type ProjectMeta,
  type SceneObjectData,
  type Transform
} from '../core/types';
import { fromBufferGeometry, geoBounds, matrixFromTransform, mergeGeos, triCount } from '../core/geo';
import { getProject, getScene, putProject, putScene } from '../core/store';
import { CameraRig } from './camera';
import { Viewport } from './viewport';
import { PointerGestures, type StrokePoint } from './input';
import { Gizmo, type GizmoMode } from './gizmo';
import { QuickShape, buildQuickShapeGeometry, type Make3DKind, type QuickShapeResult } from './quickshape';
import { BooleanEngine } from './booleans';
import { bakeObjectGeo, collectExportMeshes, deliverFile, exportGLB, exportOBJ, exportSTL, type FigureGLBData } from './exporter';
import { EdgeSlider, ICONS, SidePanel, el, iconBtn, segmented, shortcutOverlay, sliderRow, toast } from './ui';
import { FigureManager, figureExportParts, splitFigureParts } from '../anatomy/integration';
import { AnatomyEngine } from '../anatomy/engine';
import { cloneCharacter } from '../anatomy/character';
import { updateManager, versionInfo } from '../app/updates';

type Tool = 'move' | 'draw' | 'boolean';

const PALETTE = ['#9aa0ab', '#e8695a', '#f0a24b', '#e5c95c', '#7cba6d', '#5aa9e6', '#9b7fe8', '#e884b8'];
/** figures pick from skin tones (incl. fantasy) instead of the object palette */
const FIGURE_PALETTE = ['#f1d3c0', '#e0b092', '#c69076', '#b57f52', '#8d5a35', '#5f3a22', '#7a9a52', '#8f9bb0'];
const GRID_SNAP = 0.25;

type PrimitiveKind = 'sphere' | 'cube' | 'cylinder' | 'capsule' | 'torus' | 'plane';

export class Editor {
  doc = new Doc();
  history = new History();
  rig = new CameraRig();
  viewport: Viewport;
  gestures: PointerGestures;
  gizmo: Gizmo;
  quickshape: QuickShape;
  booleans = new BooleanEngine();
  panel: SidePanel;
  figures!: FigureManager;

  tool: Tool = 'move';
  selection: string | null = null;
  size = 1; // brush/creation size in world units

  private root: HTMLElement;
  private stage: HTMLElement;
  private meta: ProjectMeta;
  private saveTimer: number | null = null;
  private thumbDue = 0;
  private cameraDirty = false;
  private disposed = false;

  // free-drag (move tool) state
  private drag: {
    id: string;
    start: Transform;
    plane: THREE.Plane;
    grabOffset: THREE.Vector3;
    startPt: { x: number; y: number };
    moved: number;
    lastMoveT: number;
    raw: THREE.Vector3;
    vertexIndex: number;
  } | null = null;

  // draw preview state
  private preview: {
    qs: QuickShapeResult;
    mesh: THREE.Mesh;
    kind: Make3DKind;
    size: number;
    round: number;
  } | null = null;

  // boolean tool state
  private boolA: string | null = null;

  // UI refs
  private toolButtons = new Map<Tool, HTMLButtonElement>();
  private gizmoButtons = new Map<GizmoMode, HTMLButtonElement>();
  private undoBtn!: HTMLButtonElement;
  private redoBtn!: HTMLButtonElement;
  private mirrorBtn!: HTMLButtonElement;
  private mirrorAxisWrap!: HTMLElement;
  private matcapBtn!: HTMLButtonElement;
  private objectBar!: HTMLElement;
  private sizeSlider!: EdgeSlider;

  static async open(root: HTMLElement, projectId: string): Promise<Editor> {
    const meta = (await getProject(projectId)) ?? {
      id: projectId,
      name: 'Untitled',
      created: Date.now(),
      modified: Date.now(),
      thumb: null
    };
    const scene = await getScene(projectId);
    const editor = new Editor(root, meta);
    editor.doc.load(scene ?? null);
    if (editor.doc.camera) editor.rig.setState(editor.doc.camera);
    editor.history.clear();
    return editor;
  }

  constructor(root: HTMLElement, meta: ProjectMeta) {
    this.root = root;
    this.meta = meta;
    root.replaceChildren();
    root.className = 'editor-root';

    this.stage = el('div', 'stage');
    root.appendChild(this.stage);

    this.viewport = new Viewport(this.stage, this.doc, this.rig);
    this.gizmo = new Gizmo(this.rig.camera, this.viewport.renderer.domElement, this.viewport.scene);
    this.quickshape = new QuickShape(this.stage, this.rig, (x, y) => this.viewport.ray(x, y));
    this.panel = new SidePanel(root);
    this.figures = new FigureManager({
      doc: this.doc,
      history: this.history,
      viewport: this.viewport,
      rig: this.rig,
      panel: this.panel,
      getSelection: () => this.selection,
      select: (id) => this.select(id),
      requestBooleanUnionAll: (geos) => this.booleans.unionAll(geos)
    });

    this.buildChrome();
    this.bindGizmo();
    this.bindKeyboard();

    this.gestures = new PointerGestures(this.viewport.renderer.domElement, {
      strokeStart: (p) => this.strokeStart(p),
      strokeMove: (p) => this.strokeMove(p),
      strokeEnd: (p) => this.strokeEnd(p),
      strokeCancel: () => this.strokeCancel(),
      orbit: (dx, dy) => this.rig.orbit(dx, dy),
      dolly: (f) => this.rig.dolly(f),
      roll: (a) => this.rig.roll(a),
      pan: (dx, dy) => this.rig.pan(dx, dy, this.stage.clientHeight),
      tapUndo: () => this.undo(),
      tapRedo: () => this.redo()
    });

    this.viewport.onFrame = () => {
      const busy = this.gizmo.update();
      this.quickshape.update();
      this.updateFreeDragSnap();
      const handlesMoved = this.figures.frameTick();
      return busy || handlesMoved;
    };

    this.doc.on((e) => {
      this.scheduleSave();
      if (e.type === 'remove' && e.id === this.selection) this.select(null);
      if (e.type === 'reset') this.select(null);
    });
    this.history.onChange = () => this.refreshUndoButtons();

    const origApply = this.rig.apply.bind(this.rig);
    this.rig.apply = () => {
      origApply();
      this.cameraDirty = true;
    };

    window.addEventListener('pagehide', this.onPageHide);
    document.addEventListener('visibilitychange', this.onVisChange);
    this.cameraSaveInterval = window.setInterval(() => {
      if (this.cameraDirty) {
        this.cameraDirty = false;
        this.scheduleSave();
      }
    }, 5000);

    this.refreshUndoButtons();
    this.refreshMirrorUI();
    this.refreshToolUI();
  }

  private cameraSaveInterval = 0;

  private onPageHide = (): void => {
    void this.saveNow(true);
  };

  private onVisChange = (): void => {
    if (document.visibilityState === 'hidden') void this.saveNow(true);
  };

  // ------------------------------------------------------------------ chrome

  private buildChrome(): void {
    // top bar
    const bar = el('div', 'top-bar');
    const left = el('div', 'bar-group');
    const back = iconBtn('back', 'Gallery', () => {
      void this.saveNow(true).then(() => {
        location.hash = '#/';
      });
    });
    const name = el('span', 'project-name', this.meta.name);
    name.addEventListener('click', () => {
      const n = prompt('Project name', this.meta.name);
      if (n?.trim()) {
        this.meta.name = n.trim();
        name.textContent = this.meta.name;
        this.scheduleSave();
      }
    });
    left.append(back, name);

    const mid = el('div', 'bar-group');
    this.undoBtn = iconBtn('undo', 'Undo', () => this.undo());
    this.redoBtn = iconBtn('redo', 'Redo', () => this.redo());
    mid.append(this.undoBtn, this.redoBtn);

    const right = el('div', 'bar-group');
    this.mirrorBtn = iconBtn('mirror', 'Symmetry (S)', () => this.toggleMirror());
    this.mirrorAxisWrap = el('div', 'mirror-axes');
    for (const axis of ['x', 'y', 'z'] as MirrorAxis[]) {
      const b = el('button', 'axis-btn', axis.toUpperCase());
      b.addEventListener('click', () => this.setMirrorAxis(axis));
      this.mirrorAxisWrap.appendChild(b);
    }
    this.matcapBtn = iconBtn('matcap', 'Matcap (M)', () => this.toggleMatcap());
    const help = iconBtn('help', 'Shortcuts (?)', () => document.body.appendChild(shortcutOverlay()));
    const gear = iconBtn('gear', 'Settings', () => this.openSettingsPanel());
    const share = iconBtn('share', 'Export', () => this.openExportPanel());
    right.append(this.mirrorBtn, this.mirrorAxisWrap, this.matcapBtn, help, gear, share);

    bar.append(left, mid, right);
    this.root.appendChild(bar);

    // tool tray
    const tray = el('div', 'tool-tray');
    const mkTool = (tool: Tool, icon: string, label: string): void => {
      const b = iconBtn(icon, label, () => this.setTool(tool));
      this.toolButtons.set(tool, b);
      tray.appendChild(b);
    };
    mkTool('move', 'select', 'Move / select');
    mkTool('draw', 'draw', 'QuickShape draw');
    const prims = iconBtn('prims', 'Add primitive', () => this.togglePrimTray());
    tray.appendChild(prims);
    mkTool('boolean', 'boolean', 'Boolean union / subtract');
    tray.appendChild(el('div', 'tray-sep'));
    for (const mode of ['translate', 'rotate', 'scale'] as GizmoMode[]) {
      const icon = mode === 'translate' ? 'move' : mode === 'rotate' ? 'rotate' : 'scale';
      const label = mode === 'translate' ? 'Move gizmo (W)' : mode === 'rotate' ? 'Rotate gizmo (E)' : 'Scale gizmo (R)';
      const b = iconBtn(icon, label, () => this.setGizmoMode(mode));
      b.classList.add('gizmo-btn');
      this.gizmoButtons.set(mode, b);
      tray.appendChild(b);
    }
    this.root.appendChild(tray);

    // primitive fly-out
    const primTray = el('div', 'prim-tray');
    const prims6: [PrimitiveKind, string][] = [
      ['sphere', 'Sphere'],
      ['cube', 'Cube'],
      ['cylinder', 'Cylinder'],
      ['capsule', 'Capsule'],
      ['torus', 'Torus'],
      ['plane', 'Plane']
    ];
    for (const [kind, label] of prims6) {
      const b = iconBtn(kind, label, () => {
        this.addPrimitive(kind);
        primTray.classList.remove('open');
      });
      const wrap = el('div', 'prim-item');
      wrap.append(b, el('span', 'prim-label', label));
      primTray.appendChild(wrap);
    }
    // parametric bodies (anatomy engine)
    const bodies: [string | undefined, string][] = [
      [undefined, 'Body'],
      ['toon', 'Toon body']
    ];
    for (const [preset, label] of bodies) {
      const b = iconBtn('body', label, () => {
        void this.figures.addFigure(preset);
        primTray.classList.remove('open');
      });
      const wrap = el('div', 'prim-item');
      wrap.append(b, el('span', 'prim-label', label));
      primTray.appendChild(wrap);
    }
    this.root.appendChild(primTray);
    this.primTray = primTray;

    // left-edge size slider (Procreate style); log scale 0.05..4
    this.sizeSlider = new EdgeSlider(
      this.root,
      this.sizeTo01(this.size),
      (v01) => {
        this.size = this.sizeFrom01(v01);
      },
      (v01) => `${this.sizeFrom01(v01).toFixed(2)}`
    );

    // floating object bar (selection actions)
    this.objectBar = el('div', 'object-bar');
    this.root.appendChild(this.objectBar);
  }

  private primTray!: HTMLElement;

  private togglePrimTray(): void {
    this.primTray.classList.toggle('open');
  }

  private sizeTo01(size: number): number {
    return (Math.log(size) - Math.log(0.05)) / (Math.log(4) - Math.log(0.05));
  }

  private sizeFrom01(v: number): number {
    return Math.exp(Math.log(0.05) + v * (Math.log(4) - Math.log(0.05)));
  }

  adjustSize(factor: number): void {
    this.size = Math.max(0.05, Math.min(4, this.size * factor));
    this.sizeSlider.set(this.sizeTo01(this.size));
    toast(`Size ${this.size.toFixed(2)}`, { timeout: 900 });
  }

  private refreshToolUI(): void {
    for (const [tool, b] of this.toolButtons) {
      b.classList.toggle('active', tool === this.tool);
    }
    for (const [mode, b] of this.gizmoButtons) {
      b.classList.toggle('active', this.tool === 'move' && mode === this.gizmo.mode);
    }
  }

  private refreshUndoButtons(): void {
    this.undoBtn.disabled = !this.history.canUndo;
    this.redoBtn.disabled = !this.history.canRedo;
  }

  private refreshMirrorUI(): void {
    const on = this.doc.settings.mirrorOn;
    this.mirrorBtn.classList.toggle('active', on);
    this.mirrorAxisWrap.classList.toggle('visible', on);
    const axis = this.doc.settings.mirrorDefault;
    for (const b of [...this.mirrorAxisWrap.children] as HTMLElement[]) {
      b.classList.toggle('active', b.textContent?.toLowerCase() === axis);
    }
    this.matcapBtn.classList.toggle('active', this.doc.settings.matcap);
  }

  private refreshObjectBar(): void {
    this.objectBar.replaceChildren();
    const obj = this.selection ? this.doc.get(this.selection) : null;
    if (!obj) {
      this.objectBar.classList.remove('visible');
      return;
    }
    this.objectBar.classList.add('visible');
    if (obj.character) {
      // figures get a headline entry point to the anatomy sliders
      const b = el('button', 'body-open-btn');
      b.innerHTML = ICONS.body + '<span>Body</span>';
      b.title = 'Anatomy sliders';
      b.addEventListener('click', () => this.figures.openPanel(obj.id));
      this.objectBar.appendChild(b);
      this.objectBar.appendChild(el('div', 'tray-sep-v'));
    }
    for (const c of obj.character ? FIGURE_PALETTE : PALETTE) {
      const dot = el('button', 'color-dot');
      dot.style.background = c;
      if (c === obj.color) dot.classList.add('active');
      dot.addEventListener('click', () => this.setColor(obj.id, c));
      this.objectBar.appendChild(dot);
    }
    this.objectBar.appendChild(el('div', 'tray-sep-v'));
    this.objectBar.appendChild(iconBtn('duplicate', 'Duplicate (⌘D)', () => this.duplicateSelected()));
    this.objectBar.appendChild(iconBtn('trash', 'Delete', () => this.deleteSelected()));
  }

  // ------------------------------------------------------------------- tools

  setTool(tool: Tool): void {
    if (this.tool === tool) return;
    this.cancelPreview();
    this.boolA = null;
    this.tool = tool;
    if (tool !== 'move') {
      this.gizmo.detach();
    } else if (this.selection) {
      this.attachGizmo(this.selection);
    }
    if (tool === 'boolean') {
      this.viewport.setSelected(null);
      toast('Boolean: tap the first object', { timeout: 2600 });
    }
    if (tool === 'draw') {
      toast('Draw a shape — hold still to snap it clean', { timeout: 2600 });
    }
    this.refreshToolUI();
  }

  cycleTool(): void {
    const order: Tool[] = ['move', 'draw', 'boolean'];
    this.setTool(order[(order.indexOf(this.tool) + 1) % order.length]);
  }

  setGizmoMode(mode: GizmoMode): void {
    this.setTool('move');
    this.gizmo.setMode(mode);
    this.refreshToolUI();
  }

  // ------------------------------------------------------------ stroke logic

  private figureHandleStroke = false;

  private strokeStart(p: StrokePoint): boolean {
    if (this.gizmo.hot) return false; // gizmo owns this pointer
    if (this.figures.tryBeginHandleDrag(p)) {
      this.figureHandleStroke = true;
      return true;
    }
    if (this.tool === 'draw') {
      if (this.preview) this.cancelPreview();
      return this.quickshape.start(p);
    }
    if (this.tool === 'move') {
      const hit = this.viewport.pickDetail(p.x, p.y);
      if (hit) {
        this.beginFreeDrag(hit.id, p, hit.vertexIndex);
        return true;
      }
      // empty space: let single-finger/LMB orbit; a clean tap deselects
      this.drag = null;
      this.emptyStroke = { x: p.x, y: p.y, moved: 0 };
      return true;
    }
    // boolean tool: taps only
    this.emptyStroke = { x: p.x, y: p.y, moved: 0 };
    return true;
  }

  private emptyStroke: { x: number; y: number; moved: number } | null = null;

  private strokeMove(p: StrokePoint): void {
    if (this.figureHandleStroke) {
      this.figures.handleDragMove(p);
      return;
    }
    if (this.tool === 'draw' && this.quickshape.isActive) {
      this.quickshape.move(p);
      return;
    }
    if (this.drag) {
      this.updateFreeDrag(p);
      return;
    }
    if (this.emptyStroke) {
      const dx = p.x - this.emptyStroke.x;
      const dy = p.y - this.emptyStroke.y;
      this.emptyStroke.moved += Math.hypot(dx, dy);
      if (this.tool !== 'boolean') this.rig.orbit(dx, dy);
      this.emptyStroke.x = p.x;
      this.emptyStroke.y = p.y;
    }
  }

  private strokeEnd(p: StrokePoint): void {
    if (this.figureHandleStroke) {
      this.figureHandleStroke = false;
      this.figures.handleDragEnd();
      return;
    }
    if (this.tool === 'draw') {
      const result = this.quickshape.end();
      if (result) this.openMake3DPanel(result);
      return;
    }
    if (this.drag) {
      this.endFreeDrag();
      return;
    }
    if (this.emptyStroke) {
      const wasTap = this.emptyStroke.moved < 8;
      this.emptyStroke = null;
      if (!wasTap) return;
      if (this.tool === 'boolean') {
        const hit = this.viewport.pick(p.x, p.y);
        if (hit) this.booleanPick(hit);
        return;
      }
      this.select(null);
    }
  }

  private strokeCancel(): void {
    if (this.figureHandleStroke) {
      this.figureHandleStroke = false;
      this.figures.handleDragCancel();
      return;
    }
    if (this.quickshape.isActive) this.quickshape.cancel();
    if (this.drag) {
      // restore original transform
      this.doc.setTransform(this.drag.id, this.drag.start);
      this.drag = null;
    }
    this.emptyStroke = null;
  }

  // ------------------------------------------------------- move / free drag

  private beginFreeDrag(id: string, p: StrokePoint, vertexIndex = 0): void {
    const obj = this.doc.get(id)!;
    const pos = new THREE.Vector3(...obj.transform.position);
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(this.rig.forward().negate(), pos);
    const ray = this.viewport.ray(p.x, p.y);
    const hit = new THREE.Vector3();
    ray.intersectPlane(plane, hit);
    this.drag = {
      id,
      start: cloneTransform(obj.transform),
      plane,
      grabOffset: pos.clone().sub(hit),
      startPt: { x: p.x, y: p.y },
      moved: 0,
      lastMoveT: performance.now(),
      raw: pos.clone(),
      vertexIndex
    };
  }

  private updateFreeDrag(p: StrokePoint): void {
    const d = this.drag!;
    d.moved = Math.max(d.moved, Math.hypot(p.x - d.startPt.x, p.y - d.startPt.y));
    if (d.moved < 6) return; // tap tolerance before we start moving
    const ray = this.viewport.ray(p.x, p.y);
    const hit = new THREE.Vector3();
    if (!ray.intersectPlane(d.plane, hit)) return;
    d.raw = hit.add(d.grabOffset);
    d.lastMoveT = performance.now();
    const obj = this.doc.get(d.id)!;
    const t = cloneTransform(obj.transform);
    t.position = [d.raw.x, d.raw.y, d.raw.z];
    this.doc.setTransform(d.id, t);
  }

  /** Hold-to-snap for free drags, evaluated per frame. */
  private updateFreeDragSnap(): void {
    const d = this.drag;
    if (!d || d.moved < 6) return;
    if (performance.now() - d.lastMoveT > 350) {
      const obj = this.doc.get(d.id)!;
      const snapped: [number, number, number] = [
        Math.round(d.raw.x / GRID_SNAP) * GRID_SNAP,
        Math.round(d.raw.y / GRID_SNAP) * GRID_SNAP,
        Math.round(d.raw.z / GRID_SNAP) * GRID_SNAP
      ];
      const cur = obj.transform.position;
      if (snapped.some((v, i) => Math.abs(v - cur[i]) > 1e-6)) {
        const t = cloneTransform(obj.transform);
        t.position = snapped;
        this.doc.setTransform(d.id, t);
      }
    }
  }

  private endFreeDrag(): void {
    const d = this.drag!;
    this.drag = null;
    const obj = this.doc.get(d.id);
    if (!obj) return;
    if (d.moved < 6) {
      // it was a tap: select — and on a figure, open that region's sliders
      this.doc.setTransform(d.id, d.start);
      this.select(d.id);
      if (this.figures.isFigure(d.id)) {
        this.figures.handleFigureTap(d.id, d.vertexIndex);
      }
      return;
    }
    const before = d.start;
    const after = cloneTransform(obj.transform);
    this.history.pushDone(this.cmdTransform(d.id, before, after, 'Move'));
    this.select(d.id);
  }

  // ------------------------------------------------------------------ gizmo

  private bindGizmo(): void {
    let before: Transform | null = null;
    this.gizmo.onDragState = (dragging) => {
      const id = this.selection;
      if (!id) return;
      const obj = this.doc.get(id);
      if (!obj) return;
      if (dragging) {
        before = cloneTransform(obj.transform);
      } else if (before) {
        const after = cloneTransform(obj.transform);
        const changed = JSON.stringify(before) !== JSON.stringify(after);
        if (changed) {
          this.history.pushDone(this.cmdTransform(id, before, after, 'Transform'));
        }
        before = null;
      }
      this.viewport.invalidate();
    };
    this.gizmo.onChange = () => {
      const id = this.selection;
      if (!id || !this.gizmo.dragging) {
        this.viewport.invalidate();
        return;
      }
      const mesh = this.viewport.meshFor(id);
      if (!mesh) return;
      this.doc.setTransform(id, {
        position: mesh.position.toArray() as [number, number, number],
        quaternion: [mesh.quaternion.x, mesh.quaternion.y, mesh.quaternion.z, mesh.quaternion.w],
        scale: mesh.scale.toArray() as [number, number, number]
      });
    };
    this.gizmo.onSnapState = (on) => {
      if (on) toast('Snapping', { timeout: 700 });
    };
  }

  private attachGizmo(id: string): void {
    const mesh = this.viewport.meshFor(id);
    if (mesh) this.gizmo.attach(mesh);
  }

  // -------------------------------------------------------------- selection

  select(id: string | null): void {
    const prev = this.selection;
    this.selection = id;
    this.viewport.setSelected(id);
    if (id && this.tool === 'move') this.attachGizmo(id);
    else this.gizmo.detach();
    // picking up a figure surfaces its anatomy sliders right away
    if (id && id !== prev && this.figures.isFigure(id)) this.figures.openPanel(id);
    this.refreshObjectBar();
  }

  // --------------------------------------------------------------- commands

  private cmdTransform(id: string, before: Transform, after: Transform, label: string): Command {
    const doc = this.doc;
    return {
      label,
      do: () => doc.setTransform(id, after),
      undo: () => doc.setTransform(id, before)
    };
  }

  private cmdAdd(obj: SceneObjectData, label: string): Command {
    const doc = this.doc;
    return {
      label,
      do: () => doc.add(obj),
      undo: () => void doc.remove(obj.id)
    };
  }

  private cmdRemove(id: string, label: string): Command {
    const doc = this.doc;
    let removed: { obj: SceneObjectData; index: number } | null = null;
    return {
      label,
      do: () => {
        removed = doc.remove(id);
      },
      undo: () => {
        if (removed) doc.add(removed.obj, removed.index);
      }
    };
  }

  // ------------------------------------------------------------- primitives

  addPrimitive(kind: PrimitiveKind): void {
    const s = this.size;
    let g: THREE.BufferGeometry;
    switch (kind) {
      case 'sphere':
        g = new THREE.SphereGeometry(0.5, 48, 32);
        break;
      case 'cube':
        g = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);
        break;
      case 'cylinder':
        g = new THREE.CylinderGeometry(0.5, 0.5, 1, 48, 1);
        break;
      case 'capsule':
        g = new THREE.CapsuleGeometry(0.35, 0.6, 12, 32);
        break;
      case 'torus':
        g = new THREE.TorusGeometry(0.5, 0.18, 20, 48);
        break;
      case 'plane':
        g = new THREE.PlaneGeometry(1, 1, 2, 2);
        break;
    }
    g.scale(s, s, s);
    const geo = fromBufferGeometry(g);
    g.dispose();
    const bounds = geoBounds(geo);
    const target = this.rig.target;
    const pos: [number, number, number] = [
      Math.round(target.x / GRID_SNAP) * GRID_SNAP,
      Math.max(Math.round(target.y / GRID_SNAP) * GRID_SNAP, -bounds.min.y),
      Math.round(target.z / GRID_SNAP) * GRID_SNAP
    ];
    const name = this.doc.uniqueName(kind[0].toUpperCase() + kind.slice(1));
    const obj: SceneObjectData = {
      id: newId(),
      name,
      geo,
      transform: { ...identityTransform(), position: pos },
      color: PALETTE[0],
      mirror: this.doc.settings.mirrorOn ? this.doc.settings.mirrorDefault : null,
      visible: true
    };
    this.history.push(this.cmdAdd(obj, `Add ${name}`));
    this.setTool('move');
    this.select(obj.id);
  }

  duplicateSelected(): void {
    const obj = this.selection ? this.doc.get(this.selection) : null;
    if (!obj) return;
    const copy: SceneObjectData = {
      ...obj,
      id: newId(),
      name: this.doc.uniqueName(obj.name),
      transform: cloneTransform(obj.transform),
      character: obj.character ? cloneCharacter(obj.character) : obj.character
    };
    copy.transform.position[0] += 0.5;
    this.history.push(this.cmdAdd(copy, `Duplicate ${obj.name}`));
    this.select(copy.id);
  }

  deleteSelected(): void {
    const id = this.selection;
    if (!id) return;
    const name = this.doc.get(id)?.name ?? 'object';
    this.select(null);
    this.history.push(this.cmdRemove(id, `Delete ${name}`));
  }

  setColor(id: string, color: string): void {
    const obj = this.doc.get(id);
    if (!obj) return;
    const before = obj.color;
    const doc = this.doc;
    this.history.push({
      label: 'Color',
      do: () => doc.setProps(id, { color }),
      undo: () => doc.setProps(id, { color: before })
    });
    this.refreshObjectBar();
  }

  // ---------------------------------------------------------------- mirror

  toggleMirror(): void {
    const turningOn = !this.doc.settings.mirrorOn;
    this.doc.setSettings({ mirrorOn: turningOn });
    // also applies to the selected object, undoably
    const obj = this.selection ? this.doc.get(this.selection) : null;
    if (obj) {
      const before = obj.mirror;
      const after = turningOn ? this.doc.settings.mirrorDefault : null;
      const doc = this.doc;
      const id = obj.id;
      this.history.push({
        label: 'Symmetry',
        do: () => doc.setProps(id, { mirror: after }),
        undo: () => doc.setProps(id, { mirror: before })
      });
    }
    toast(turningOn ? `Symmetry on (${(this.doc.settings.mirrorDefault ?? 'x').toUpperCase()})` : 'Symmetry off', { timeout: 1200 });
    this.refreshMirrorUI();
  }

  setMirrorAxis(axis: MirrorAxis): void {
    this.doc.setSettings({ mirrorDefault: axis, mirrorOn: true });
    const obj = this.selection ? this.doc.get(this.selection) : null;
    if (obj) {
      const before = obj.mirror;
      const doc = this.doc;
      const id = obj.id;
      this.history.push({
        label: 'Symmetry axis',
        do: () => doc.setProps(id, { mirror: axis }),
        undo: () => doc.setProps(id, { mirror: before })
      });
    }
    this.refreshMirrorUI();
  }

  toggleMatcap(): void {
    this.doc.setSettings({ matcap: !this.doc.settings.matcap });
    this.refreshMirrorUI();
  }

  // ------------------------------------------------------------- quickshape

  private openMake3DPanel(qs: QuickShapeResult): void {
    this.cancelPreview();
    const closed = qs.fit.closed;
    const defKind: Make3DKind = closed ? 'extrude' : 'tube';
    const mesh = new THREE.Mesh(
      undefined,
      new THREE.MeshStandardMaterial({
        color: '#5aa9e6',
        roughness: 0.5,
        transparent: true,
        opacity: 0.85
      })
    );
    this.viewport.overlayGroup.add(mesh);
    this.preview = { qs, mesh, kind: defKind, size: this.size * 0.6, round: 0.5 };
    if (!this.rebuildPreview()) {
      this.cancelPreview();
      return;
    }

    const content = el('div');
    const kinds: { value: Make3DKind; label: string }[] = closed
      ? [
          { value: 'extrude', label: 'Extrude' },
          { value: 'lathe', label: 'Lathe' },
          { value: 'inflate', label: 'Inflate' },
          { value: 'tube', label: 'Tube' }
        ]
      : [
          { value: 'tube', label: 'Tube' },
          { value: 'extrude', label: 'Ribbon' },
          { value: 'lathe', label: 'Lathe' }
        ];
    content.appendChild(segmented(kinds, defKind, (k) => {
      if (!this.preview) return;
      this.preview.kind = k;
      this.rebuildPreview();
    }));
    content.appendChild(
      sliderRow('Size', 0.02, 2, this.preview.size, 0.01, (v) => {
        if (!this.preview) return;
        this.preview.size = v;
        this.rebuildPreview();
      })
    );
    content.appendChild(
      sliderRow('Roundness', 0, 1, this.preview.round, 0.01, (v) => {
        if (!this.preview) return;
        this.preview.round = v;
        this.rebuildPreview();
      })
    );
    const fitNote = el('p', 'panel-note', `Snapped: ${qs.fit.kind}${qs.fit.closed ? ' (closed)' : ''}`);
    content.appendChild(fitNote);
    const actions = el('div', 'panel-actions');
    const add = el('button', 'primary-btn', 'Add shape');
    add.addEventListener('click', () => this.commitPreview());
    const cancel = el('button', 'ghost-btn', 'Discard');
    cancel.addEventListener('click', () => {
      this.cancelPreview();
      this.panel.hide();
    });
    actions.append(add, cancel);
    content.appendChild(actions);
    this.panel.show('Make 3D', content, () => this.cancelPreview());
  }

  private rebuildPreview(): boolean {
    const p = this.preview;
    if (!p) return false;
    const built = buildQuickShapeGeometry(p.qs, { kind: p.kind, size: p.size, round: p.round });
    if (!built) return false;
    p.mesh.geometry.dispose();
    p.mesh.geometry = built.geometry;
    p.mesh.position.copy(built.position);
    p.mesh.quaternion.copy(built.quaternion);
    this.viewport.invalidate();
    return true;
  }

  private commitPreview(): void {
    const p = this.preview;
    if (!p) return;
    const geo = fromBufferGeometry(p.mesh.geometry);
    const kindName = p.kind === 'extrude' ? 'Extrude' : p.kind === 'lathe' ? 'Lathe' : p.kind === 'inflate' ? 'Inflate' : 'Tube';
    const obj: SceneObjectData = {
      id: newId(),
      name: this.doc.uniqueName(kindName),
      geo,
      transform: {
        position: p.mesh.position.toArray() as [number, number, number],
        quaternion: [p.mesh.quaternion.x, p.mesh.quaternion.y, p.mesh.quaternion.z, p.mesh.quaternion.w],
        scale: [1, 1, 1]
      },
      color: PALETTE[0],
      mirror: this.doc.settings.mirrorOn ? this.doc.settings.mirrorDefault : null,
      visible: true
    };
    this.cancelPreview();
    this.panel.hide();
    this.history.push(this.cmdAdd(obj, `Add ${obj.name}`));
    this.setTool('move');
    this.select(obj.id);
  }

  private cancelPreview(): void {
    if (!this.preview) return;
    this.viewport.overlayGroup.remove(this.preview.mesh);
    this.preview.mesh.geometry.dispose();
    (this.preview.mesh.material as THREE.Material).dispose();
    this.preview = null;
    this.viewport.invalidate();
  }

  // --------------------------------------------------------------- booleans

  private booleanPick(id: string): void {
    if (this.figures.isFigure(id)) {
      toast('Bake the body first (Body panel → Bake) to use booleans on it', { timeout: 2600 });
      return;
    }
    if (!this.boolA) {
      this.boolA = id;
      this.viewport.setSelected(id);
      toast('Now tap the second object', { timeout: 2200 });
      return;
    }
    if (this.boolA === id) return;
    const a = this.boolA;
    const b = id;
    const content = el('div');
    content.appendChild(el('p', 'panel-note', `${this.doc.get(a)?.name} ● ${this.doc.get(b)?.name}`));
    const actions = el('div', 'panel-actions vertical');
    const union = el('button', 'primary-btn', 'Union (A + B)');
    union.addEventListener('click', () => void this.runBoolean('union', a, b));
    const subtract = el('button', 'primary-btn', 'Subtract (A − B)');
    subtract.addEventListener('click', () => void this.runBoolean('difference', a, b));
    const cancel = el('button', 'ghost-btn', 'Cancel');
    cancel.addEventListener('click', () => {
      this.panel.hide();
      this.boolA = null;
      this.viewport.setSelected(null);
    });
    actions.append(union, subtract, cancel);
    content.appendChild(actions);
    this.panel.show('Boolean', content, () => {
      this.boolA = null;
    });
  }

  private bakeObject(id: string): GeoData {
    return bakeObjectGeo(this.doc.get(id)!);
  }

  private async runBoolean(op: 'union' | 'difference', aId: string, bId: string): Promise<void> {
    this.panel.hide();
    const a = this.doc.get(aId);
    const b = this.doc.get(bId);
    if (!a || !b) return;
    const t = toast(op === 'union' ? 'Union…' : 'Subtract…', { spinner: true, timeout: 0 });
    try {
      const geoA = this.bakeObject(aId);
      const geoB = this.bakeObject(bId);
      const result = await this.booleans.boolean(op, geoA, geoB);
      const doc = this.doc;
      const beforeGeo = a.geo;
      const beforeT = cloneTransform(a.transform);
      const beforeMirror = a.mirror;
      const removeB = this.cmdRemove(bId, 'remove B');
      const label = op === 'union' ? 'Union' : 'Subtract';
      this.history.push(
        History.group(label, [
          {
            label,
            do: () => {
              doc.setGeo(aId, result);
              doc.setTransform(aId, identityTransform());
              doc.setProps(aId, { mirror: null });
            },
            undo: () => {
              doc.setGeo(aId, beforeGeo);
              doc.setTransform(aId, beforeT);
              doc.setProps(aId, { mirror: beforeMirror });
            }
          },
          removeB
        ])
      );
      t.close();
      toast(`${label} done — ${triCount(result).toLocaleString()} tris`, { timeout: 1800 });
      this.setTool('move');
      this.select(aId);
    } catch (err) {
      t.close();
      toast(`Boolean failed: ${err instanceof Error ? err.message : err}`, { timeout: 3500 });
      this.boolA = null;
      this.viewport.setSelected(null);
    }
  }

  // ----------------------------------------------------------------- export

  /** Figures are overlapping closed parts — union them watertight for
   *  STL/OBJ and for the manifold check. */
  private async prepFigureMeshes(meshes: ReturnType<typeof collectExportMeshes>): Promise<void> {
    const topo = AnatomyEngine.shared().topology;
    if (!topo) return;
    for (const m of meshes) {
      if (!m.isFigure) continue;
      const parts = figureExportParts(m.geo, topo);
      m.geo = await this.booleans.unionAll(splitFigureParts(m.geo, parts));
    }
  }

  private buildFigureGLBData(): Promise<import('./exporter').FigureGLBData | null> {
    return (async () => {
      const figs = this.doc.list().filter((o) => o.visible && o.character);
      if (!figs.length) return null;
      const engine = AnatomyEngine.shared();
      await engine.ready();
      const topo = engine.topology!;
      const { names, arrays } = await engine.getDeltas(!!this.doc.settings.nsfwEnabled);
      const { generateBody } = await import('../anatomy/generate');
      const { BASE_PARAMS } = await import('../anatomy/params');
      const { bakeFields } = await import('../anatomy/fields');
      const { BASE_DETAIL } = await import('../anatomy/detail');
      const gen = generateBody(BASE_PARAMS);
      const basePositions = gen.positions.slice();
      // exported base carries the always-on surface-detail layer, matching
      // what the engine renders
      const detail = new Float32Array(basePositions.length);
      bakeFields(BASE_DETAIL, gen.positions, gen.landmarks, detail);
      for (let i = 0; i < basePositions.length; i++) basePositions[i] += detail[i];
      const instances = figs.map((o) => {
        const c = o.character!;
        const influences = names.map((n) => {
          const id = n.replace(/_(pos|neg)$/, '');
          const lr = c.sideWeights[id];
          const w = lr ? (lr.l + lr.r) / 2 : (c.weights[id] ?? 0);
          if (n.endsWith('_pos')) return Math.max(0, w);
          if (n.endsWith('_neg')) return Math.max(0, -w);
          return Math.max(0, w);
        });
        return {
          name: o.name,
          color: o.color,
          influences,
          matrix: matrixFromTransform(o.transform)
        };
      });
      return {
        shared: {
          vertCount: topo.vertCount,
          indices: topo.indices,
          uvs: topo.uvs,
          skinIndex: topo.skinIndex,
          skinWeight: topo.skinWeight,
          baseJoints: topo.baseJoints,
          bones: topo.bones,
          boneParent: topo.boneParent,
          basePositions,
          targetNames: names,
          targetDeltas: arrays
        },
        instances
      };
    })();
  }

  private openExportPanel(): void {
    const content = el('div');
    let format: 'stl' | 'obj' | 'glb' = 'stl';
    let mmPerUnit = 10;
    let glbMorphs = true;
    const hasFigures = this.doc.list().some((o) => o.visible && o.character);

    const stlOpts = el('div');
    const sizeNote = el('p', 'panel-note');
    const manifoldNote = el('p', 'panel-note', 'Checking watertightness…');
    const updateSize = (): void => {
      const box = this.viewport.sceneBounds();
      if (!box) {
        sizeNote.textContent = 'Scene is empty';
        return;
      }
      const s = box.getSize(new THREE.Vector3());
      sizeNote.textContent = `Print size: ${(s.x * mmPerUnit).toFixed(1)} × ${(s.z * mmPerUnit).toFixed(1)} × ${(s.y * mmPerUnit).toFixed(1)} mm`;
    };
    stlOpts.appendChild(
      sliderRow('mm per unit', 1, 100, mmPerUnit, 1, (v) => {
        mmPerUnit = v;
        updateSize();
      })
    );
    stlOpts.append(sizeNote, manifoldNote);
    updateSize();

    // manifold check (async, non-blocking; figures pre-unioned like the export)
    void (async () => {
      const meshes = collectExportMeshes(this.doc);
      if (!meshes.length) {
        manifoldNote.textContent = 'Nothing to export';
        return;
      }
      try {
        await this.prepFigureMeshes(meshes);
        const merged = mergeGeos(meshes.map((m) => m.geo));
        const check = await this.booleans.check(merged);
        manifoldNote.textContent = check.manifold
          ? `✓ Watertight · ${check.tris.toLocaleString()} triangles`
          : `⚠ Not watertight (${check.status}) — exports anyway; auto-remesh lands with sculpt mode`;
      } catch {
        manifoldNote.textContent = 'Watertight check unavailable';
      }
    })();

    // GLB option: ship the slider library as blendshapes (Blender-editable)
    const glbOpts = el('div');
    glbOpts.style.display = 'none';
    if (hasFigures) {
      const lab = el('label', 'jitter-label');
      const cb = el('input') as HTMLInputElement;
      cb.type = 'checkbox';
      cb.checked = glbMorphs;
      cb.addEventListener('change', () => (glbMorphs = cb.checked));
      lab.append(cb, el('span', '', 'Body sliders as blendshapes + rig'));
      glbOpts.appendChild(lab);
    }

    content.appendChild(
      segmented(
        [
          { value: 'stl', label: 'STL' },
          { value: 'obj', label: 'OBJ' },
          { value: 'glb', label: 'GLB' }
        ],
        format,
        (f) => {
          format = f;
          stlOpts.style.display = f === 'stl' ? '' : 'none';
          glbOpts.style.display = f === 'glb' && hasFigures ? '' : 'none';
        }
      )
    );
    content.appendChild(stlOpts);
    content.appendChild(glbOpts);
    content.appendChild(
      el(
        'p',
        'panel-note',
        'STL: mm, Z-up for slicers · OBJ: UVs included for Procreate · GLB: Y-up for Blender'
      )
    );
    const actions = el('div', 'panel-actions');
    const exportBtn = el('button', 'primary-btn', 'Export');
    exportBtn.addEventListener('click', () => void doExport());
    actions.appendChild(exportBtn);
    content.appendChild(actions);

    const doExport = async (): Promise<void> => {
      const meshes = collectExportMeshes(this.doc);
      if (!meshes.length) {
        toast('Nothing to export', { timeout: 1600 });
        return;
      }
      const t = toast('Exporting…', { spinner: true, timeout: 0 });
      this.exporting = true;
      try {
        const base = this.meta.name.replace(/[^\w-]+/g, '_') || 'sculptpad';
        let blob: Blob;
        let filename: string;
        if (format === 'stl') {
          await this.prepFigureMeshes(meshes);
          blob = exportSTL(meshes, mmPerUnit);
          filename = `${base}.stl`;
        } else if (format === 'obj') {
          await this.prepFigureMeshes(meshes);
          blob = exportOBJ(meshes);
          filename = `${base}.obj`;
        } else {
          let figData: FigureGLBData | null = null;
          let staticMeshes = meshes;
          if (hasFigures && glbMorphs) {
            figData = await this.buildFigureGLBData();
            staticMeshes = meshes.filter((m) => !m.isFigure);
          }
          blob = await exportGLB(staticMeshes, figData ?? undefined);
          filename = `${base}.glb`;
        }
        t.close();
        const how = await deliverFile(filename, blob);
        toast(how === 'shared' ? 'Sent to share sheet' : `Downloaded ${filename}`, { timeout: 2000 });
        this.panel.hide();
      } catch (err) {
        t.close();
        toast(`Export failed: ${err instanceof Error ? err.message : err}`, { timeout: 3500 });
      } finally {
        this.exporting = false;
      }
    };

    this.panel.show('Export', content);
  }

  // --------------------------------------------------------------- settings

  private openSettingsPanel(): void {
    const content = el('div');
    const info = versionInfo();
    const built = new Date(info.builtAt);
    content.appendChild(el('p', 'panel-note', `SculptPad v${info.version}`));
    content.appendChild(
      el('p', 'panel-note', `Built ${built.toLocaleDateString()} ${built.toLocaleTimeString()}`)
    );
    const checkBtn = el('button', 'ghost-btn', 'Check for updates');
    checkBtn.addEventListener('click', () => void updateManager().check(true));
    content.appendChild(checkBtn);
    content.appendChild(
      el(
        'p',
        'panel-note',
        'On iPad: open in Safari → Share → Add to Home Screen for the fullscreen app. Updates install on restart via the toast.'
      )
    );
    this.panel.show('Settings', content);
  }

  /** True while an interaction is mid-flight — used to defer the update toast. */
  get busy(): boolean {
    return (
      this.quickshape.isActive ||
      this.drag !== null ||
      this.gizmo.dragging ||
      this.figureHandleStroke ||
      this.emptyStroke !== null ||
      this.exporting
    );
  }

  private exporting = false;

  // ------------------------------------------------------------ undo / redo

  undo(): void {
    const label = this.history.undo();
    if (label) toast(`Undo — ${label}`, { timeout: 900 });
  }

  redo(): void {
    const label = this.history.redo();
    if (label) toast(`Redo — ${label}`, { timeout: 900 });
  }

  // -------------------------------------------------------------- keyboard

  private keyHandler = (e: KeyboardEvent): void => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) this.redo();
      else this.undo();
      return;
    }
    if (mod && e.key.toLowerCase() === 'd') {
      e.preventDefault();
      this.duplicateSelected();
      return;
    }
    if (mod) return;
    switch (e.key) {
      case '[':
        this.adjustSize(1 / 1.15);
        break;
      case ']':
        this.adjustSize(1.15);
        break;
      case 's':
      case 'S':
        this.toggleMirror();
        break;
      case 'm':
      case 'M':
        this.toggleMatcap();
        break;
      case 'Tab':
        e.preventDefault();
        this.cycleTool();
        break;
      case 'w':
      case 'W':
        this.setGizmoMode('translate');
        break;
      case 'e':
      case 'E':
        this.setGizmoMode('rotate');
        break;
      case 'r':
      case 'R':
        this.setGizmoMode('scale');
        break;
      case 'f':
      case 'F':
        this.rig.frame(this.viewport.sceneBounds());
        break;
      case '?':
        document.body.appendChild(shortcutOverlay());
        break;
      case 'Backspace':
      case 'Delete':
        this.deleteSelected();
        break;
      case 'Escape':
        if (this.panel.isOpen) {
          this.panel.hide();
          this.cancelPreview();
        } else this.select(null);
        break;
    }
  };

  private bindKeyboard(): void {
    window.addEventListener('keydown', this.keyHandler);
  }

  // ------------------------------------------------------------ persistence

  private scheduleSave(): void {
    if (this.saveTimer !== null) clearTimeout(this.saveTimer);
    this.saveTimer = window.setTimeout(() => {
      this.saveTimer = null;
      void this.saveNow(false);
    }, 800);
  }

  async saveNow(withThumb: boolean): Promise<void> {
    if (this.disposed) return;
    this.doc.camera = this.rig.state();
    const snap = this.doc.snapshot();
    this.meta.modified = Date.now();
    const now = performance.now();
    if (withThumb || now > this.thumbDue) {
      this.thumbDue = now + 10_000;
      try {
        this.meta.thumb = this.viewport.captureThumb();
      } catch {
        // thumbnail is best-effort
      }
    }
    await putScene(this.meta.id, snap);
    await putProject({ ...this.meta });
  }

  dispose(): void {
    this.disposed = true;
    if (this.saveTimer !== null) clearTimeout(this.saveTimer);
    clearInterval(this.cameraSaveInterval);
    window.removeEventListener('keydown', this.keyHandler);
    window.removeEventListener('pagehide', this.onPageHide);
    document.removeEventListener('visibilitychange', this.onVisChange);
    this.gizmo.dispose();
    this.viewport.dispose();
    this.root.replaceChildren();
  }
}
