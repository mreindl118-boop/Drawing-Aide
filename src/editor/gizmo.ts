import * as THREE from 'three';
import { TransformControls } from 'three/addons/controls/TransformControls.js';

export type GizmoMode = 'translate' | 'rotate' | 'scale';

const HOLD_MS = 350;
const GRID_SNAP = 0.25;
const ANGLE_SNAP = THREE.MathUtils.degToRad(15);
const SCALE_SNAP = 0.1;

/** TransformControls wrapper with Procreate-style hold-to-snap: keep the
 *  pointer still mid-drag and the transform starts snapping to grid/angles. */
export class Gizmo {
  tc: TransformControls;
  private lastMove = 0;
  private snapping = false;
  onDragState: ((dragging: boolean) => void) | null = null;
  onChange: (() => void) | null = null;
  onSnapState: ((snapping: boolean) => void) | null = null;

  constructor(camera: THREE.Camera, dom: HTMLElement, scene: THREE.Scene) {
    this.tc = new TransformControls(camera, dom);
    this.tc.setSize(1.1);
    scene.add(this.tc.getHelper());
    this.tc.addEventListener('dragging-changed', (e) => {
      const dragging = e.value as boolean;
      if (dragging) {
        this.lastMove = performance.now();
        this.setSnap(false);
      }
      this.onDragState?.(dragging);
    });
    this.tc.addEventListener('change', () => this.onChange?.());
    dom.addEventListener('pointermove', () => {
      if (this.tc.dragging) this.lastMove = performance.now();
    });
  }

  get dragging(): boolean {
    return this.tc.dragging;
  }

  get active(): boolean {
    return this.tc.object !== undefined && this.tc.object !== null;
  }

  /** True if the pointer is over a gizmo handle (so the tool should yield). */
  get hot(): boolean {
    return this.tc.dragging || this.tc.axis !== null;
  }

  attach(obj: THREE.Object3D): void {
    this.tc.attach(obj);
  }

  detach(): void {
    this.tc.detach();
  }

  setMode(mode: GizmoMode): void {
    this.tc.setMode(mode);
  }

  get mode(): GizmoMode {
    return this.tc.mode as GizmoMode;
  }

  private setSnap(on: boolean): void {
    if (on === this.snapping) return;
    this.snapping = on;
    this.tc.setTranslationSnap(on ? GRID_SNAP : null);
    this.tc.setRotationSnap(on ? ANGLE_SNAP : null);
    this.tc.setScaleSnap(on ? SCALE_SNAP : null);
    this.onSnapState?.(on);
  }

  /** Call once per frame; returns true while dragging (keeps render loop hot). */
  update(): boolean {
    if (this.tc.dragging) {
      this.setSnap(performance.now() - this.lastMove > HOLD_MS);
      return true;
    }
    return false;
  }

  dispose(): void {
    this.tc.dispose();
  }
}
