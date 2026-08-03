/// <reference lib="webworker" />
/** Anatomy engine worker: owns the baked morph library and does ALL per-frame
 *  math off the main thread — delta composition, sculpt layer, CPU skinning
 *  for pose preview, normals, measurements. */
import { BASE_PARAMS, patched } from './params';
import {
  buildTopology,
  generateBody,
  BONES,
  BONE_PARENT,
  TORSO_RADIAL,
  TORSO_SUBDIV,
  TORSO_STATION,
  type Topology
} from './generate';
import { MORPHS, type MorphDef } from './catalog';
import { bakeFields } from './fields';
import { BASE_DETAIL } from './detail';

interface BakedDir {
  delta: Float32Array;
  jointDelta: Float32Array;
}
interface BakedMorph {
  def: MorphDef;
  pos: BakedDir;
  neg: BakedDir | null;
}

let topo: Topology;
let basePos: Float32Array;
let baseJoints: Float32Array;
let baked = new Map<string, BakedMorph>();
let landmarkBase: Record<string, [number, number, number]>;
/** always-on anatomical surface detail (face, clavicles, abs, creases…) */
let detailDelta: Float32Array;

// scratch buffers (reused every compose)
let work: Float32Array;
let normals: Float32Array;
let jointsOut: Float32Array;
// vertex adjacency (built once) drives per-vertex cavity shading
let adjOff: Uint32Array;
let adjList: Uint32Array;
let cavity: Float32Array;

function bakeDir(def: MorphDef, dir: 'pos' | 'neg'): BakedDir | null {
  const spec = dir === 'pos' ? def.pos : def.neg;
  if (!spec) return null;
  const delta = new Float32Array(basePos.length);
  const jointDelta = new Float32Array(baseJoints.length);
  if (spec.params) {
    const res = generateBody(patched(BASE_PARAMS, spec.params(BASE_PARAMS)));
    for (let i = 0; i < delta.length; i++) delta[i] = res.positions[i] - basePos[i];
    for (let i = 0; i < jointDelta.length; i++) jointDelta[i] = res.joints[i] - baseJoints[i];
  }
  if (spec.fields) {
    bakeFields(spec.fields, basePos, landmarkBase, delta);
  }
  return { delta, jointDelta };
}

function init(): void {
  topo = buildTopology();
  const base = generateBody(BASE_PARAMS);
  basePos = base.positions;
  baseJoints = base.joints;
  landmarkBase = base.landmarks;
  for (const def of MORPHS) {
    baked.set(def.id, {
      def,
      pos: bakeDir(def, 'pos')!,
      neg: bakeDir(def, 'neg')
    });
  }
  detailDelta = new Float32Array(basePos.length);
  bakeFields(BASE_DETAIL, basePos, landmarkBase, detailDelta);
  work = new Float32Array(basePos.length);
  normals = new Float32Array(basePos.length);
  jointsOut = new Float32Array(baseJoints.length);
  buildAdjacency();
}

function buildAdjacency(): void {
  const vc = topo.vertCount;
  const sets: Set<number>[] = Array.from({ length: vc }, () => new Set());
  const idx = topo.indices;
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t], b = idx[t + 1], c = idx[t + 2];
    sets[a].add(b).add(c);
    sets[b].add(a).add(c);
    sets[c].add(a).add(b);
  }
  let total = 0;
  for (const s of sets) total += s.size;
  adjOff = new Uint32Array(vc + 1);
  adjList = new Uint32Array(total);
  let k = 0;
  for (let v = 0; v < vc; v++) {
    adjOff[v] = k;
    for (const n of sets[v]) adjList[k++] = n;
  }
  adjOff[vc] = k;
  cavity = new Float32Array(vc);
}

/** Concavity = mean signed elevation of neighbors above the tangent plane:
 *  positive in creases and pits, negative on ridges. The main thread turns
 *  this into crevice darkening on the skin material. */
function computeCavity(): void {
  const vc = topo.vertCount;
  for (let v = 0; v < vc; v++) {
    const px = work[v * 3], py = work[v * 3 + 1], pz = work[v * 3 + 2];
    const nx = normals[v * 3], ny = normals[v * 3 + 1], nz = normals[v * 3 + 2];
    let c = 0;
    const s = adjOff[v], e = adjOff[v + 1];
    for (let k = s; k < e; k++) {
      const n = adjList[k];
      const dx = work[n * 3] - px, dy = work[n * 3 + 1] - py, dz = work[n * 3 + 2] - pz;
      const l = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
      c += (dx * nx + dy * ny + dz * nz) / l;
    }
    cavity[v] = e > s ? c / (e - s) : 0;
  }
}

// --------------------------------------------------------------- composing

interface ComposeReq {
  type: 'compose';
  id: number;
  weights: Record<string, number>;
  sideWeights: Record<string, { l: number; r: number }>;
  pose: Record<string, [number, number, number]> | null;
  sculptDelta: Float32Array | null;
  nsfwEnabled: boolean;
}

function addDelta(m: BakedMorph, w: number, joints: boolean): void {
  const dir = w >= 0 ? m.pos : m.neg;
  if (!dir) return;
  const a = Math.abs(w);
  if (a < 1e-4) return;
  const d = dir.delta;
  for (let i = 0; i < work.length; i++) work[i] += d[i] * a;
  if (joints) {
    const jd = dir.jointDelta;
    for (let i = 0; i < jointsOut.length; i++) jointsOut[i] += jd[i] * a;
  }
}

function addDeltaSided(m: BakedMorph, l: number, r: number): void {
  const side = topo.side;
  const pd = m.pos.delta;
  const nd = m.neg?.delta ?? null;
  for (let v = 0; v < side.length; v++) {
    const s01 = (side[v] + 1) / 2; // 0 = right, 1 = left
    const w = r + (l - r) * s01;
    if (Math.abs(w) < 1e-4) continue;
    const d = w >= 0 ? pd : nd;
    if (!d) continue;
    const a = Math.abs(w);
    work[v * 3] += d[v * 3] * a;
    work[v * 3 + 1] += d[v * 3 + 1] * a;
    work[v * 3 + 2] += d[v * 3 + 2] * a;
  }
  // joints follow the averaged weight so the rig stays centered-sane
  const avg = (l + r) / 2;
  const dir = avg >= 0 ? m.pos : m.neg;
  if (dir) {
    const a = Math.abs(avg);
    for (let i = 0; i < jointsOut.length; i++) jointsOut[i] += dir.jointDelta[i] * a;
  }
}

interface Measurements {
  heightCm: number;
  headUnits: number;
  shoulderCm: number;
  chestCm: number;
  waistCm: number;
  hipCm: number;
  inseamCm: number;
  gated: boolean;
}

const RING_VERTS = TORSO_RADIAL + 1; // seam vertex duplicated

function ringCircumference(partName: string, station: number): number {
  const part = topo.parts.find((p) => p.name === partName)!;
  const ringStart = part.vStart + station * TORSO_SUBDIV * RING_VERTS;
  let len = 0;
  for (let k = 0; k < RING_VERTS - 1; k++) {
    const a = (ringStart + k) * 3;
    const b = (ringStart + k + 1) * 3;
    len += Math.hypot(work[b] - work[a], work[b + 1] - work[a + 1], work[b + 2] - work[a + 2]);
  }
  return len;
}

function measure(): Measurements {
  const lv = topo.landmarkVerts;
  const y = (name: string): number => work[lv[name] * 3 + 1];
  const x = (name: string): number => work[lv[name] * 3];
  // true head span: y-range of the head part (landmark verts quantize badly)
  const headPart = topo.parts.find((p) => p.name === 'head')!;
  let hMin = Infinity;
  let hMax = -Infinity;
  for (let v = headPart.vStart; v < headPart.vStart + headPart.vCount; v++) {
    const vy = work[v * 3 + 1];
    if (vy < hMin) hMin = vy;
    if (vy > hMax) hMax = vy;
  }
  const heelY = Math.min(y('heelL'), y('heelR')) - 0.02;
  const height = hMax - Math.min(0, heelY);
  const headH = Math.max(0.05, hMax - hMin);
  const shoulderSpan = Math.abs(x('shoulderTipL')) * 2;
  const thighY = jointsOut[11 * 3 + 1]; // thighL
  const ankleY = jointsOut[13 * 3 + 1]; // footL
  return {
    heightCm: height * 100,
    headUnits: height / headH,
    shoulderCm: shoulderSpan * 100,
    chestCm: ringCircumference('torso', TORSO_STATION.chest) * 100,
    waistCm: ringCircumference('torso', TORSO_STATION.waist) * 100,
    hipCm:
      Math.max(
        ringCircumference('torso', TORSO_STATION.glute),
        ringCircumference('torso', TORSO_STATION.hip)
      ) * 100,
    inseamCm: (thighY - ankleY + 0.07) * 100,
    gated: false
  };
}

/** Hard rule: explicit anatomy never combines with child-coded proportions.
 *  Evaluated on the measured figure (post-morph), not just slider positions. */
function childCoded(m: Measurements): boolean {
  return m.headUnits < 5.5 || m.heightCm < 125;
}

// ------------------------------------------------------------ pose skinning

type Mat4 = Float64Array;

function eulerXYZ(e: [number, number, number]): number[] {
  const [ax, ay, az] = e;
  const cx = Math.cos(ax), sx = Math.sin(ax);
  const cy = Math.cos(ay), sy = Math.sin(ay);
  const cz = Math.cos(az), sz = Math.sin(az);
  // R = Rz * Ry * Rx (column-major 3x3 as row-major array here)
  return [
    cy * cz, cz * sy * sx - sz * cx, cz * sy * cx + sz * sx,
    cy * sz, sz * sy * sx + cz * cx, sz * sy * cx - cz * sx,
    -sy, cy * sx, cy * cx
  ];
}

function applyPose(pose: Record<string, [number, number, number]>): void {
  const n = BONES.length;
  const world: Mat4[] = [];
  for (let b = 0; b < n; b++) {
    const e = pose[BONES[b]] ?? [0, 0, 0];
    const R = eulerXYZ(e);
    const jx = jointsOut[b * 3];
    const jy = jointsOut[b * 3 + 1];
    const jz = jointsOut[b * 3 + 2];
    // local = T(j) R T(-j)  → affine [R | j - R*j]
    const tx = jx - (R[0] * jx + R[1] * jy + R[2] * jz);
    const ty = jy - (R[3] * jx + R[4] * jy + R[5] * jz);
    const tz = jz - (R[6] * jx + R[7] * jy + R[8] * jz);
    const local = new Float64Array([R[0], R[1], R[2], tx, R[3], R[4], R[5], ty, R[6], R[7], R[8], tz]);
    const p = BONE_PARENT[b];
    if (p < 0) {
      world.push(local);
    } else {
      const P = world[p];
      const M = new Float64Array(12);
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          M[r * 4 + c] = P[r * 4] * local[c] + P[r * 4 + 1] * local[4 + c] + P[r * 4 + 2] * local[8 + c];
        }
        M[r * 4 + 3] = P[r * 4] * local[3] + P[r * 4 + 1] * local[7] + P[r * 4 + 2] * local[11] + P[r * 4 + 3];
      }
      world.push(M);
    }
  }
  // skin vertices (2 bones each)
  const si = topo.skinIndex;
  const sw = topo.skinWeight;
  for (let v = 0; v < si.length / 2; v++) {
    const px = work[v * 3], py = work[v * 3 + 1], pz = work[v * 3 + 2];
    let ox = 0, oy = 0, oz = 0;
    for (let k = 0; k < 2; k++) {
      const w = sw[v * 2 + k];
      if (w < 1e-4) continue;
      const M = world[si[v * 2 + k]];
      ox += w * (M[0] * px + M[1] * py + M[2] * pz + M[3]);
      oy += w * (M[4] * px + M[5] * py + M[6] * pz + M[7]);
      oz += w * (M[8] * px + M[9] * py + M[10] * pz + M[11]);
    }
    work[v * 3] = ox;
    work[v * 3 + 1] = oy;
    work[v * 3 + 2] = oz;
  }
  // pose joints too (for handle/skeleton display)
  for (let b = 0; b < n; b++) {
    const p = BONE_PARENT[b];
    const M = p < 0 ? world[b] : world[p];
    const jx = jointsOut[b * 3], jy = jointsOut[b * 3 + 1], jz = jointsOut[b * 3 + 2];
    jointsOut[b * 3] = M[0] * jx + M[1] * jy + M[2] * jz + M[3];
    jointsOut[b * 3 + 1] = M[4] * jx + M[5] * jy + M[6] * jz + M[7];
    jointsOut[b * 3 + 2] = M[8] * jx + M[9] * jy + M[10] * jz + M[11];
  }
}

function computeNormals(): void {
  normals.fill(0);
  const idx = topo.indices;
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t] * 3, b = idx[t + 1] * 3, c = idx[t + 2] * 3;
    const abx = work[b] - work[a], aby = work[b + 1] - work[a + 1], abz = work[b + 2] - work[a + 2];
    const acx = work[c] - work[a], acy = work[c + 1] - work[a + 1], acz = work[c + 2] - work[a + 2];
    const nx = aby * acz - abz * acy;
    const ny = abz * acx - abx * acz;
    const nz = abx * acy - aby * acx;
    normals[a] += nx; normals[a + 1] += ny; normals[a + 2] += nz;
    normals[b] += nx; normals[b + 1] += ny; normals[b + 2] += nz;
    normals[c] += nx; normals[c + 1] += ny; normals[c + 2] += nz;
  }
  for (let v = 0; v < normals.length; v += 3) {
    const l = Math.hypot(normals[v], normals[v + 1], normals[v + 2]) || 1;
    normals[v] /= l;
    normals[v + 1] /= l;
    normals[v + 2] /= l;
  }
}

function compose(req: ComposeReq): void {
  const t0 = performance.now();
  work.set(basePos);
  for (let i = 0; i < work.length; i++) work[i] += detailDelta[i];
  jointsOut.set(baseJoints);

  // pass 1: everything except the anatomy module
  const nsfwActive: [BakedMorph, number][] = [];
  for (const [id, w] of Object.entries(req.weights)) {
    const m = baked.get(id);
    if (!m) continue;
    if (req.sideWeights[id]) continue;
    if (m.def.nsfw) {
      if (req.nsfwEnabled) nsfwActive.push([m, w]);
      continue;
    }
    addDelta(m, w, true);
  }
  for (const [id, lr] of Object.entries(req.sideWeights)) {
    const m = baked.get(id);
    if (!m || m.def.nsfw) continue;
    addDeltaSided(m, lr.l, lr.r);
  }

  // sculpt layer rides on top of morphs — sliders stay live
  if (req.sculptDelta && req.sculptDelta.length === work.length) {
    for (let i = 0; i < work.length; i++) work[i] += req.sculptDelta[i];
  }

  // measurements + child-coded gate BEFORE explicit anatomy is added
  const m = measure();
  let gated = false;
  if (nsfwActive.length) {
    if (childCoded(m)) {
      gated = true;
    } else {
      for (const [bm, w] of nsfwActive) addDelta(bm, w, false);
    }
  }
  m.gated = gated;

  if (req.pose && Object.keys(req.pose).length) applyPose(req.pose);
  computeNormals();
  computeCavity();

  const positions = work.slice();
  const norms = normals.slice();
  const joints = jointsOut.slice();
  const cav = cavity.slice();
  (self as unknown as Worker).postMessage(
    {
      type: 'composed',
      id: req.id,
      positions,
      normals: norms,
      joints,
      cavity: cav,
      measurements: m,
      composeMs: performance.now() - t0
    },
    [positions.buffer, norms.buffer, joints.buffer, cav.buffer]
  );
}

// ------------------------------------------------------------------- deltas

function sendDeltas(id: number, includeNsfw: boolean): void {
  // for GLB blendshape export: every direction as its own target
  const names: string[] = [];
  const arrays: Float32Array[] = [];
  for (const m of baked.values()) {
    // anatomy-module targets only ship when the project has the module on
    if (m.def.nsfw && !includeNsfw) continue;
    names.push(m.def.bipolar ? `${m.def.id}_pos` : m.def.id);
    arrays.push(m.pos.delta.slice());
    if (m.neg) {
      names.push(`${m.def.id}_neg`);
      arrays.push(m.neg.delta.slice());
    }
  }
  (self as unknown as Worker).postMessage(
    { type: 'deltas', id, names, arrays },
    arrays.map((a) => a.buffer)
  );
}

self.onmessage = (e: MessageEvent) => {
  const msg = e.data;
  try {
    if (msg.type === 'init') {
      init();
      const t = topo;
      (self as unknown as Worker).postMessage({
        type: 'ready',
        vertCount: t.vertCount,
        indices: t.indices,
        uvs: t.uvs,
        regions: t.regions,
        side: t.side,
        skinIndex: t.skinIndex,
        skinWeight: t.skinWeight,
        parts: t.parts,
        landmarkVerts: t.landmarkVerts,
        baseJoints: baseJoints.slice(),
        bones: BONES.slice(),
        boneParent: BONE_PARENT.slice()
      });
    } else if (msg.type === 'compose') {
      compose(msg as ComposeReq);
    } else if (msg.type === 'deltas') {
      sendDeltas(msg.id, !!msg.includeNsfw);
    }
  } catch (err) {
    (self as unknown as Worker).postMessage({
      type: 'error',
      id: msg.id,
      error: err instanceof Error ? err.message : String(err)
    });
  }
};
