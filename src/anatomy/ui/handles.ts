/** On-model drag handles: grab shoulders/waist/hips/chin/… directly on the
 *  mesh. Handles map to the same sliders as the panel, so both input styles
 *  stay in sync (and unlinked sliders let each side's handle drive its half).
 *
 *  Two layers share the system: body handles (proportion sliders) when the
 *  camera is framing the figure, and face handles (expression sliders) that
 *  take over once you zoom in close — drag a brow up, pull the chin down,
 *  close an eyelid. One-finger drags work on both; no Pencil required. */
import * as THREE from 'three';
import type { TopologyLite } from '../engine';
import { MORPHS } from '../catalog';

export interface HandleDef {
  landmark: string;
  slider: string;
  /** world drag direction that maps to +weight (x flips on the mirrored handle) */
  axis: [number, number, number];
  /** weight change per meter of drag */
  scale: number;
  mirrored: boolean;
  kind: 'body' | 'face';
}

/** camera distance below which the face-puppet layer replaces body handles */
export const FACE_MODE_DIST = 1.2;

export const HANDLE_DEFS: HandleDef[] = [
  { landmark: 'shoulderTipL', slider: 'shoulder_width', axis: [1, 0, 0], scale: 7, mirrored: true, kind: 'body' },
  { landmark: 'waistSideL', slider: 'waist_width', axis: [1, 0, 0], scale: 9, mirrored: true, kind: 'body' },
  { landmark: 'hipSideL', slider: 'hip_width', axis: [1, 0, 0], scale: 8, mirrored: true, kind: 'body' },
  { landmark: 'thighSideL', slider: 'thigh_girth', axis: [1, 0, 0], scale: 10, mirrored: true, kind: 'body' },
  { landmark: 'crown', slider: 'height', axis: [0, 1, 0], scale: 3.2, mirrored: false, kind: 'body' },
  { landmark: 'chin', slider: 'chin_length', axis: [0, -1, 0], scale: 30, mirrored: false, kind: 'body' },
  { landmark: 'bustL', slider: 'bust_size', axis: [0, 0, 1], scale: 11, mirrored: true, kind: 'body' },
  { landmark: 'bellyFront', slider: 'belly', axis: [0, 0, 1], scale: 11, mirrored: false, kind: 'body' },
  { landmark: 'gluteApex', slider: 'glute_size', axis: [0, 0, -1], scale: 11, mirrored: false, kind: 'body' },
  { landmark: 'calfL', slider: 'calf_girth', axis: [0, 0, -1], scale: 14, mirrored: true, kind: 'body' },
  { landmark: 'wristL', slider: 'arm_length', axis: [0, -1, 0], scale: 6, mirrored: true, kind: 'body' },
  { landmark: 'earL', slider: 'ear_size', axis: [1, 0, 0], scale: 24, mirrored: true, kind: 'body' },
  { landmark: 'toeL', slider: 'foot_length', axis: [0, 0, 1], scale: 16, mirrored: true, kind: 'body' },
  // face puppet: vertical/lateral drags that read well from a front view
  { landmark: 'browL', slider: 'exp_brow_raise', axis: [0, 1, 0], scale: 30, mirrored: true, kind: 'face' },
  { landmark: 'eyeL', slider: 'exp_eyes_close', axis: [0, -1, 0], scale: 40, mirrored: true, kind: 'face' },
  { landmark: 'mouthCornerL', slider: 'exp_smile', axis: [0, 1, 0], scale: 34, mirrored: true, kind: 'face' },
  { landmark: 'chin', slider: 'exp_jaw_open', axis: [0, -1, 0], scale: 22, mirrored: false, kind: 'face' },
  { landmark: 'cheekL', slider: 'exp_cheek_puff', axis: [1, 0, 0], scale: 30, mirrored: true, kind: 'face' },
  { landmark: 'noseTip', slider: 'exp_sneer', axis: [0, 1, 0], scale: 40, mirrored: false, kind: 'face' }
];

/** unipolar sliders never go below 0 (a negative weight is a dead zone) */
const SLIDER_MIN = new Map(MORPHS.map((m): [string, number] => [m.id, m.bipolar ? -1 : 0]));

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
  private matFace: THREE.MeshBasicMaterial;
  private matHot: THREE.MeshBasicMaterial;
  private faceMode = false;
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
    this.matFace = new THREE.MeshBasicMaterial({ color: '#ff8db8', depthTest: false, transparent: true, opacity: 0.9 });
    this.matHot = new THREE.MeshBasicMaterial({ color: '#ffb14c', depthTest: false, transparent: true, opacity: 0.95 });
    this.group.renderOrder = 10;
    for (const def of HANDLE_DEFS) {
      if (!(def.landmark in topo.landmarkVerts)) continue;
      const mk = (isMirror: boolean): void => {
        const mesh = new THREE.Mesh(HANDLE_GEO, this.baseMat(def));
        mesh.renderOrder = 10;
        this.handles.push({ def, mesh, isMirror });
        this.group.add(mesh);
      };
      mk(false);
      if (def.mirrored) mk(true);
    }
    this.group.visible = false;
  }

  private baseMat(def: HandleDef): THREE.MeshBasicMaterial {
    return def.kind === 'face' ? this.matFace : this.mat;
  }

  setVisible(on: boolean): void {
    this.group.visible = on;
  }

  get visible(): boolean {
    return this.group.visible;
  }

  /** which layer is live right now (for tests / UI hints) */
  get mode(): 'body' | 'face' {
    return this.faceMode ? 'face' : 'body';
  }

  /** Reposition handles from composed vertex positions; scale with distance
   *  so hit targets stay finger-sized. Zooming past FACE_MODE_DIST swaps the
   *  body layer for the face-puppet layer. */
  update(positions: Float32Array, objMatrix: THREE.Matrix4, camDist: number): void {
    this.faceMode = camDist < FACE_MODE_DIST;
    const r = Math.max(0.008, camDist * 0.008);
    const v = new THREE.Vector3();
    for (const h of this.handles) {
      const active = (h.def.kind === 'face') === this.faceMode;
      h.mesh.visible = active || this.drag?.h === h;
      if (!h.mesh.visible) continue;
      const vi = this.topo.landmarkVerts[h.def.landmark];
      v.set(positions[vi * 3], positions[vi * 3 + 1], positions[vi * 3 + 2]);
      if (h.isMirror) v.x = -v.x;
      v.applyMatrix4(objMatrix);
      h.mesh.position.copy(v);
      h.mesh.scale.setScalar(h.def.kind === 'face' ? r * 0.85 : r);
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
    const targets = this.handles.filter((h) => h.mesh.visible).map((h) => h.mesh);
    const hits = this.raycaster.intersectObjects(targets, false);
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
    const min = SLIDER_MIN.get(d.h.def.slider) ?? -1;
    return Math.max(min, Math.min(1, d.startWeight + disp * d.h.def.scale));
  }

  endDrag(): { slider: string; side: 'l' | 'r' | null } | null {
    const d = this.drag;
    if (!d) return null;
    d.h.mesh.material = this.baseMat(d.h.def);
    this.drag = null;
    const side = d.h.def.mirrored ? (d.h.isMirror ? 'r' : 'l') : null;
    return { slider: d.h.def.slider, side };
  }

  get dragging(): boolean {
    return this.drag !== null;
  }

  dispose(): void {
    this.mat.dispose();
    this.matFace.dispose();
    this.matHot.dispose();
  }
}
