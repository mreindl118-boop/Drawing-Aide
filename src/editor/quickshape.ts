import * as THREE from 'three';
import type { StrokePoint } from './input';
import type { CameraRig } from './camera';
import { fitStroke, type FitResult, type Pt } from './fit';

export type Make3DKind = 'extrude' | 'lathe' | 'inflate' | 'tube';

export interface QuickShapeResult {
  fit: FitResult;
  /** plane basis: shape (u,v) → world = origin + u·U + v·V */
  origin: THREE.Vector3;
  u: THREE.Vector3;
  v: THREE.Vector3;
  n: THREE.Vector3;
}

const HOLD_MS = 420;
const HOLD_DIST_PX = 6;

/** Captures a stroke on the drawing plane, renders live ink on a 2D overlay
 *  canvas, and snaps to a clean fitted shape when the pointer holds still. */
export class QuickShape {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private rawScreen: { x: number; y: number; p: number }[] = [];
  private rawPlane: Pt[] = [];
  private active = false;
  private snapped: FitResult | null = null;
  private lastMoveT = 0;
  private lastPt: { x: number; y: number } | null = null;
  private plane = new THREE.Plane();
  private origin = new THREE.Vector3();
  private u = new THREE.Vector3();
  private v = new THREE.Vector3();
  private n = new THREE.Vector3();

  onSnap: (() => void) | null = null;

  constructor(
    private container: HTMLElement,
    private rig: CameraRig,
    private rayAt: (x: number, y: number) => THREE.Ray
  ) {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'ink-overlay';
    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d')!;
    new ResizeObserver(() => this.resize()).observe(container);
    this.resize();
  }

  private resize(): void {
    const dpr = Math.min(devicePixelRatio, 2);
    this.canvas.width = this.container.clientWidth * dpr;
    this.canvas.height = this.container.clientHeight * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  get isActive(): boolean {
    return this.active;
  }

  get didSnap(): boolean {
    return this.snapped !== null;
  }

  /** Set up the drawing plane: through the orbit target, facing the camera —
   *  snapped to the nearest world axis when the view is close to one. */
  private setupPlane(): void {
    const fwd = this.rig.forward().negate(); // plane normal towards camera
    const axes = [
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 0, 1)
    ];
    let normal = fwd.clone();
    for (const a of axes) {
      const d = fwd.dot(a);
      if (Math.abs(d) > Math.cos(THREE.MathUtils.degToRad(22))) {
        normal = a.multiplyScalar(Math.sign(d));
        break;
      }
    }
    this.n.copy(normal);
    this.origin.copy(this.rig.target);
    this.plane.setFromNormalAndCoplanarPoint(this.n, this.origin);
    const helper = Math.abs(this.n.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, 0, -1);
    this.u.crossVectors(helper, this.n).normalize();
    this.v.crossVectors(this.n, this.u).normalize();
  }

  private toPlane(x: number, y: number): Pt | null {
    const ray = this.rayAt(x, y);
    const hit = new THREE.Vector3();
    if (!ray.intersectPlane(this.plane, hit)) return null;
    hit.sub(this.origin);
    return { x: hit.dot(this.u), y: hit.dot(this.v) };
  }

  start(p: StrokePoint): boolean {
    this.setupPlane();
    const pt = this.toPlane(p.x, p.y);
    if (!pt) return false;
    this.active = true;
    this.snapped = null;
    this.rawScreen = [{ x: p.x, y: p.y, p: p.pressure }];
    this.rawPlane = [pt];
    this.lastMoveT = performance.now();
    this.lastPt = { x: p.x, y: p.y };
    return true;
  }

  move(p: StrokePoint): void {
    if (!this.active || this.snapped) return;
    const moved = this.lastPt ? Math.hypot(p.x - this.lastPt.x, p.y - this.lastPt.y) : 0;
    if (moved > HOLD_DIST_PX / 2) {
      this.lastMoveT = performance.now();
      this.lastPt = { x: p.x, y: p.y };
    }
    const pt = this.toPlane(p.x, p.y);
    if (!pt) return;
    this.rawScreen.push({ x: p.x, y: p.y, p: p.pressure });
    this.rawPlane.push(pt);
    this.draw();
  }

  /** Called every frame while a stroke is live; snaps after a stationary hold. */
  update(): void {
    if (!this.active || this.snapped) return;
    if (
      performance.now() - this.lastMoveT > HOLD_MS &&
      this.rawScreen.length > 8 &&
      this.strokeScreenLength() > 30
    ) {
      const fit = fitStroke(this.rawPlane, true);
      if (fit) {
        this.snapped = fit;
        this.draw();
        this.onSnap?.();
      }
    }
  }

  private strokeScreenLength(): number {
    let l = 0;
    for (let i = 1; i < this.rawScreen.length; i++) {
      l += Math.hypot(
        this.rawScreen[i].x - this.rawScreen[i - 1].x,
        this.rawScreen[i].y - this.rawScreen[i - 1].y
      );
    }
    return l;
  }

  /** End the stroke; returns the shape (snapped if held, else cleaned freehand). */
  end(): QuickShapeResult | null {
    if (!this.active) return null;
    this.active = false;
    const fit = this.snapped ?? fitStroke(this.rawPlane, false);
    this.clearInk();
    if (!fit || fit.points.length < 2) return null;
    return {
      fit,
      origin: this.origin.clone(),
      u: this.u.clone(),
      v: this.v.clone(),
      n: this.n.clone()
    };
  }

  cancel(): void {
    this.active = false;
    this.snapped = null;
    this.clearInk();
  }

  private clearInk(): void {
    this.ctx.clearRect(0, 0, this.container.clientWidth, this.container.clientHeight);
  }

  /** Project plane-space fitted points back to screen for preview ink. */
  private planeToScreen(pt: Pt): { x: number; y: number } {
    const world = this.origin
      .clone()
      .addScaledVector(this.u, pt.x)
      .addScaledVector(this.v, pt.y);
    const p = world.project(this.rig.camera);
    return {
      x: ((p.x + 1) / 2) * this.container.clientWidth,
      y: ((1 - p.y) / 2) * this.container.clientHeight
    };
  }

  private draw(): void {
    const ctx = this.ctx;
    this.clearInk();
    if (this.snapped) {
      const pts = this.snapped.points.map((p) => this.planeToScreen(p));
      ctx.strokeStyle = '#4c8dff';
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.shadowColor = 'rgba(76,141,255,0.8)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      if (this.snapped.closed) ctx.closePath();
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else {
      ctx.strokeStyle = 'rgba(240,242,248,0.92)';
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      const pts = this.rawScreen;
      for (let i = 1; i < pts.length; i++) {
        ctx.lineWidth = 1.5 + 3 * (pts[i].p || 0.5);
        ctx.beginPath();
        ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
        ctx.lineTo(pts[i].x, pts[i].y);
        ctx.stroke();
      }
    }
  }
}

// ------------------------------------------------------------- mesh building

export interface Make3DParams {
  kind: Make3DKind;
  /** extrude depth / inflate thickness / tube radius, world units */
  size: number;
  /** inflate roundness 0..1 */
  round: number;
}

/** Build a preview/final geometry from a QuickShape result. Returns geometry
 *  in local space + the world transform to place it. */
export function buildQuickShapeGeometry(
  qs: QuickShapeResult,
  params: Make3DParams
): { geometry: THREE.BufferGeometry; position: THREE.Vector3; quaternion: THREE.Quaternion } | null {
  const { fit } = qs;
  const basis = new THREE.Matrix4().makeBasis(qs.u, qs.v, qs.n);
  const quaternion = new THREE.Quaternion().setFromRotationMatrix(basis);
  const position = qs.origin.clone();

  // center the shape so the object's origin is its centroid
  let cx = 0;
  let cy = 0;
  for (const p of fit.points) {
    cx += p.x;
    cy += p.y;
  }
  cx /= fit.points.length;
  cy /= fit.points.length;
  const pts = fit.points.map((p) => new THREE.Vector2(p.x - cx, p.y - cy));
  position.addScaledVector(qs.u, cx).addScaledVector(qs.v, cy);

  let geometry: THREE.BufferGeometry;

  if (params.kind === 'tube') {
    const pts3 = pts.map((p) => new THREE.Vector3(p.x, p.y, 0));
    if (pts3.length < 2) return null;
    const curve = new THREE.CatmullRomCurve3(pts3, fit.closed, 'centripetal');
    geometry = new THREE.TubeGeometry(
      curve,
      Math.min(220, pts3.length * 3),
      Math.max(0.005, params.size),
      14,
      fit.closed
    );
  } else if (params.kind === 'lathe') {
    // revolve around the vertical (v) axis at the profile's left edge
    let minX = Infinity;
    for (const p of pts) minX = Math.min(minX, p.x);
    const profile = pts.map((p) => new THREE.Vector2(Math.max(0.001, p.x - minX), p.y));
    if (fit.closed) profile.push(profile[0].clone());
    geometry = new THREE.LatheGeometry(profile, 56);
    position.addScaledVector(qs.u, minX);
  } else {
    if (!fit.closed || pts.length < 3) {
      // open stroke: fall back to a ribbon extrude along the stroke
      if (pts.length < 2) return null;
      const shape = ribbonShape(pts, Math.max(0.01, params.size * 0.25));
      geometry = new THREE.ExtrudeGeometry(shape, {
        depth: Math.max(0.01, params.size),
        bevelEnabled: false,
        curveSegments: 16
      });
      geometry.translate(0, 0, -params.size / 2);
    } else {
      const shape = new THREE.Shape(pts);
      if (params.kind === 'extrude') {
        geometry = new THREE.ExtrudeGeometry(shape, {
          depth: Math.max(0.01, params.size),
          bevelEnabled: false,
          curveSegments: 24
        });
        geometry.translate(0, 0, -params.size / 2);
      } else {
        // inflate: pillow via a fat rounded bevel on a thin extrude
        const r = Math.max(0.01, params.size * (0.35 + 0.6 * params.round));
        const depth = Math.max(0.01, params.size * 0.25);
        geometry = new THREE.ExtrudeGeometry(shape, {
          depth,
          bevelEnabled: true,
          bevelThickness: r,
          bevelSize: r * 0.85,
          bevelSegments: Math.max(3, Math.round(3 + params.round * 5)),
          curveSegments: 24
        });
        geometry.translate(0, 0, -depth / 2);
      }
    }
  }

  return { geometry, position, quaternion };
}

/** Thicken an open polyline into a closed outline (simple normal offset). */
function ribbonShape(pts: THREE.Vector2[], halfWidth: number): THREE.Shape {
  const left: THREE.Vector2[] = [];
  const right: THREE.Vector2[] = [];
  for (let i = 0; i < pts.length; i++) {
    const prev = pts[Math.max(0, i - 1)];
    const next = pts[Math.min(pts.length - 1, i + 1)];
    const t = new THREE.Vector2(next.x - prev.x, next.y - prev.y);
    const len = t.length() || 1;
    const n = new THREE.Vector2(-t.y / len, t.x / len);
    left.push(new THREE.Vector2(pts[i].x + n.x * halfWidth, pts[i].y + n.y * halfWidth));
    right.push(new THREE.Vector2(pts[i].x - n.x * halfWidth, pts[i].y - n.y * halfWidth));
  }
  const shape = new THREE.Shape();
  shape.setFromPoints([...left, ...right.reverse()]);
  return shape;
}
