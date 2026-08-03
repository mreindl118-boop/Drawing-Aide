/** On-model drag handles: grab shoulders/waist/hips/chin/… directly on the
 *  mesh. Handles map to the same sliders as the panel, so both input styles
 *  stay in sync (and unlinked sliders let each side's handle drive its half). */
import * as THREE from 'three';
import type { TopologyLite } from '../engine';

export interface HandleDef {
  landmark: string;
  slider: string;
  /** world drag direction that maps to +weight (x flips on the mirrored handle) */
  axis: [number, number, number];
  /** weight change per meter of drag */
  scale: number;
  mirrored: boolean;
}

export const HANDLE_DEFS: HandleDef[] = [
  { landmark: 'shoulderTipL', slider: 'shoulder_width', axis: [1, 0, 0], scale: 7, mirrored: true },
  { landmark: 'waistSideL', slider: 'waist_width', axis: [1, 0, 0], scale: 9, mirrored: true },
  { landmark: 'hipSideL', slider: 'hip_width', axis: [1, 0, 0], scale: 8, mirrored: true },
  { landmark: 'thighSideL', slider: 'thigh_girth', axis: [1, 0, 0], scale: 10, mirrored: true },
  { landmark: 'crown', slider: 'height', axis: [0, 1, 0], scale: 3.2, mirrored: false },
  { landmark: 'chin', slider: 'chin_length', axis: [0, -1, 0], scale: 30, mirrored: false },
  { landmark: 'bustL', slider: 'bust_size', axis: [0, 0, 1], scale: 11, mirrored: true },
  { landmark: 'bellyFront', slider: 'belly', axis: [0, 0, 1], scale: 11, mirrored: false },
  { landmark: 'gluteApex', slider: 'glute_size', axis: [0, 0, -1], scale: 11, mirrored: false },
  { landmark: 'calfL', slider: 'calf_girth', axis: [0, 0, -1], scale: 14, mirrored: true },
  { landmark: 'wristL', slider: 'arm_length', axis: [0, -1, 0], scale: 6, mirrored: true },
  { landmark: 'earL', slider: 'ear_size', axis: [1, 0, 0], scale: 24, mirrored: true },
  { landmark: 'toeL', slider: 'foot_length', axis: [0, 0, 1], scale: 16, mirrored: true }
];

interface HandleInstance {
  def: HandleDef;
  mesh: THREE.Mesh;
  isMirror: boolean;
}

const HANDLE_GEO = new THREE.SphereGeometry(1, 12, 8);

export class FigureHandles {
  group = new THREE.Group();
  private handles: HandleInstance[] = [];
  private mat: THREE.MeshBasicMaterial;
  private matHot: THREE.MeshBasicMaterial;
  private raycaster = new THREE.Raycaster();
  private drag: {
    h: HandleInstance;
    plane: THREE.Plane;
    startPoint: THREE.Vector3;
    startWeight: number;
    axis: THREE.Vector3;
  } | null = null;

  constructor(private topo: TopologyLite) {
    this.mat = new THREE.MeshBasicMaterial({ color: '#4c8dff', depthTest: false, transparent: true, opacity: 0.85 });
    this.matHot = new THREE.MeshBasicMaterial({ color: '#ffb14c', depthTest: false, transparent: true, opacity: 0.95 });
    this.group.renderOrder = 10;
    for (const def of HANDLE_DEFS) {
      if (!(def.landmark in topo.landmarkVerts)) continue;
      const mk = (isMirror: boolean): void => {
        const mesh = new THREE.Mesh(HANDLE_GEO, this.mat);
        mesh.renderOrder = 10;
        this.handles.push({ def, mesh, isMirror });
        this.group.add(mesh);
      };
      mk(false);
      if (def.mirrored) mk(true);
    }
    this.group.visible = false;
  }

  setVisible(on: boolean): void {
    this.group.visible = on;
  }

  get visible(): boolean {
    return this.group.visible;
  }

  /** Reposition handles from composed vertex positions; scale with distance
   *  so hit targets stay finger-sized. */
  update(positions: Float32Array, objMatrix: THREE.Matrix4, camDist: number): void {
    const r = Math.max(0.008, camDist * 0.008);
    const v = new THREE.Vector3();
    for (const h of this.handles) {
      const vi = this.topo.landmarkVerts[h.def.landmark];
      v.set(positions[vi * 3], positions[vi * 3 + 1], positions[vi * 3 + 2]);
      if (h.isMirror) v.x = -v.x;
      v.applyMatrix4(objMatrix);
      h.mesh.position.copy(v);
      h.mesh.scale.setScalar(r);
    }
  }

  /** Try to grab a handle. Returns the slider id + side, or null. */
  beginDrag(
    ray: THREE.Ray,
    camera: THREE.Camera,
    currentWeight: (slider: string, side: 'l' | 'r' | null) => number
  ): { slider: string; side: 'l' | 'r' | null } | null {
    if (!this.group.visible) return null;
    this.raycaster.ray.copy(ray);
    this.raycaster.params.Points.threshold = 0.05;
    const hits = this.raycaster.intersectObjects(this.handles.map((h) => h.mesh), false);
    if (!hits.length) return null;
    const h = this.handles.find((x) => x.mesh === hits[0].object)!;
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(camDir, h.mesh.position);
    const start = new THREE.Vector3();
    ray.intersectPlane(plane, start);
    const axis = new THREE.Vector3(...h.def.axis);
    if (h.isMirror) axis.x = -axis.x;
    const side = h.def.mirrored ? (h.isMirror ? 'r' : 'l') : null;
    this.drag = {
      h,
      plane,
      startPoint: start,
      startWeight: currentWeight(h.def.slider, side),
      axis
    };
    h.mesh.material = this.matHot;
    return { slider: h.def.slider, side };
  }

  /** Returns the new weight for the grabbed slider. */
  drag2(ray: THREE.Ray): number | null {
    const d = this.drag;
    if (!d) return null;
    const p = new THREE.Vector3();
    if (!ray.intersectPlane(d.plane, p)) return null;
    const disp = p.sub(d.startPoint).dot(d.axis);
    return Math.max(-1, Math.min(1, d.startWeight + disp * d.h.def.scale));
  }

  endDrag(): { slider: string; side: 'l' | 'r' | null } | null {
    const d = this.drag;
    if (!d) return null;
    d.h.mesh.material = this.mat;
    this.drag = null;
    const side = d.h.def.mirrored ? (d.h.isMirror ? 'r' : 'l') : null;
    return { slider: d.h.def.slider, side };
  }

  get dragging(): boolean {
    return this.drag !== null;
  }

  dispose(): void {
    this.mat.dispose();
    this.matHot.dispose();
  }
}
