/// <reference lib="webworker" />
/** Anatomy engine worker on the MakeHuman (CC0) mesh backend: owns the morph
 *  library and does ALL per-frame math off the main thread — delta
 *  composition (MH sculpted targets + synthesized bone-space morphs +
 *  gaussian fields), sculpt layer, CPU pose skinning, normals, cavity and
 *  painted skin tint, measurements. */
import { loadMH, type MHData } from './mh/backend';
import { MH_MAP, type SynthSpec, type MHSource } from './mh/mapping';
import { MORPHS, type MorphDef } from './catalog';
import { bakeFields } from './fields';

interface BakedDir {
  delta: Float32Array;
  jointDelta: Float32Array;
}
interface BakedMorph {
  def: MorphDef;
  pos: BakedDir | null;
  neg: BakedDir | null;
}

interface Topo {
  vertCount: number;
  indices: Uint32Array;
  uvs: Float32Array;
  regions: Uint8Array;
  side: Float32Array;
  skinIndex: Uint16Array;
  skinWeight: Float32Array;
  parts: { name: string; vStart: number; vCount: number; iStart: number; iCount: number }[];
  landmarkVerts: Record<string, number>;
}

let mh: MHData;
let topo: Topo;
let basePos: Float32Array;
let baseJoints: Float32Array;
let BONES: string[];
let BONE_PARENT: number[];
let baked = new Map<string, BakedMorph>();
let landmarkBase: Record<string, [number, number, number]>;

// scratch buffers (reused every compose)
let work: Float32Array;
let normals: Float32Array;
let jointsOut: Float32Array;
// vertex adjacency (built once) drives per-vertex cavity shading
let adjOff: Uint32Array;
let adjList: Uint32Array;
let cavity: Float32Array;
/** static per-vertex skin-feature tint (lips, brows, blush…) — multipliers
 *  baked from the base mesh; vertices carry them through every morph */
let featureTint: Float32Array;
let tintOut: Float32Array;

// ----------------------------------------------------------- synth morphs

const boneIdx = (name: string): number => BONES.indexOf(name);
/** distal joint each bone points toward (for girth/length axes) */
let boneTail: Record<string, [number, number, number]>;

function buildBoneTails(): void {
  const j = (b: string): [number, number, number] => {
    const i = boneIdx(b) * 3;
    return [baseJoints[i], baseJoints[i + 1], baseJoints[i + 2]];
  };
  const lm = (n: string): [number, number, number] => {
    const v = topo.landmarkVerts[n];
    return [basePos[v * 3], basePos[v * 3 + 1], basePos[v * 3 + 2]];
  };
  boneTail = {
    pelvis: j('spine'), spine: j('chest'), chest: j('neck'), neck: j('head'),
    head: [j('head')[0], j('head')[1] + 0.15, j('head')[2]],
    upperArmL: j('forearmL'), forearmL: j('handL'), handL: lm('handTipL'),
    upperArmR: j('forearmR'), forearmR: j('handR'), handR: lm('handTipR'),
    thighL: j('shinL'), shinL: j('footL'), footL: lm('toeL'),
    thighR: j('shinR'), shinR: j('footR'), footR: lm('toeR')
  };
}

function boneWeightOf(v: number, set: Set<number>): number {
  let w = 0;
  if (set.has(topo.skinIndex[v * 2])) w += topo.skinWeight[v * 2];
  if (set.has(topo.skinIndex[v * 2 + 1])) w += topo.skinWeight[v * 2 + 1];
  return w;
}

function isDescendant(b: number, set: Set<number>): boolean {
  let cur = b;
  while (cur >= 0) {
    if (set.has(cur)) return true;
    cur = BONE_PARENT[cur];
  }
  return false;
}

/** chain root = most proximal set member above bone b */
function chainRootOf(b: number, set: Set<number>): number {
  let cur = b;
  let root = b;
  while (cur >= 0) {
    if (set.has(cur)) root = cur;
    cur = BONE_PARENT[cur];
  }
  return root;
}

function synthInto(spec: SynthSpec, delta: Float32Array, jointDelta: Float32Array): void {
  const bc = mh.bodyCount;
  if (spec.kind === 'band') {
    const yOf = { waist: 'waistSideL', hip: 'hipSideL', chest: 'bustL' } as const;
    let yc: number;
    if (spec.y === 'rib') {
      yc = (baseJoints[boneIdx('chest') * 3 + 1] + landmarkBase.waistSideL[1]) / 2;
    } else {
      yc = landmarkBase[yOf[spec.y]][1];
    }
    const zc = baseJoints[boneIdx('spine') * 3 + 2];
    const s2 = 2 * spec.width * spec.width;
    for (let v = 0; v < bc; v++) {
      const r = topo.regions[v];
      if (r !== 2 && r !== 3 && r !== 4 && r !== 9) continue;
      const py = basePos[v * 3 + 1];
      const w = Math.exp(-((py - yc) ** 2) / s2);
      if (w < 0.01) continue;
      delta[v * 3] += basePos[v * 3] * spec.amount[0] * w;
      delta[v * 3 + 2] += (basePos[v * 3 + 2] - zc) * spec.amount[1] * w;
    }
    return;
  }
  const boneNames = 'bones' in spec ? spec.bones : [spec.bone];
  const set = new Set<number>(boneNames.map(boneIdx));
  if (spec.kind === 'shift') {
    for (let v = 0; v < bc; v++) {
      const w = boneWeightOf(v, set);
      if (w < 1e-3) continue;
      delta[v * 3] += spec.vec[0] * w;
      delta[v * 3 + 1] += spec.vec[1] * w;
      delta[v * 3 + 2] += spec.vec[2] * w;
    }
    for (let b = 0; b < BONES.length; b++) {
      if (b !== 0 && isDescendant(b, set) && !set.has(b)) {
        jointDelta[b * 3] += spec.vec[0];
        jointDelta[b * 3 + 1] += spec.vec[1];
        jointDelta[b * 3 + 2] += spec.vec[2];
      } else if (set.has(b)) {
        jointDelta[b * 3] += spec.vec[0] * 0.5;
        jointDelta[b * 3 + 1] += spec.vec[1] * 0.5;
        jointDelta[b * 3 + 2] += spec.vec[2] * 0.5;
      }
    }
    return;
  }
  if (spec.kind === 'scaleAt') {
    const bi = boneIdx(spec.bone);
    const jx = baseJoints[bi * 3], jy = baseJoints[bi * 3 + 1], jz = baseJoints[bi * 3 + 2];
    for (let v = 0; v < bc; v++) {
      const w = boneWeightOf(v, set);
      if (w < 1e-3) continue;
      delta[v * 3] += (basePos[v * 3] - jx) * spec.amount[0] * w;
      delta[v * 3 + 1] += (basePos[v * 3 + 1] - jy) * spec.amount[1] * w;
      delta[v * 3 + 2] += (basePos[v * 3 + 2] - jz) * spec.amount[2] * w;
    }
    for (let b = 0; b < BONES.length; b++) {
      if (isDescendant(b, set)) {
        jointDelta[b * 3] += (baseJoints[b * 3] - jx) * spec.amount[0];
        jointDelta[b * 3 + 1] += (baseJoints[b * 3 + 1] - jy) * spec.amount[1];
        jointDelta[b * 3 + 2] += (baseJoints[b * 3 + 2] - jz) * spec.amount[2];
      }
    }
    return;
  }
  // girth / length share per-bone axes
  const axes = new Map<number, { j: [number, number, number]; a: [number, number, number]; len: number; root: number }>();
  for (const bi of set) {
    const j: [number, number, number] = [baseJoints[bi * 3], baseJoints[bi * 3 + 1], baseJoints[bi * 3 + 2]];
    const t = boneTail[BONES[bi]];
    const a: [number, number, number] = [t[0] - j[0], t[1] - j[1], t[2] - j[2]];
    const len = Math.hypot(...a) || 1;
    axes.set(bi, { j, a: [a[0] / len, a[1] / len, a[2] / len], len, root: chainRootOf(bi, set) });
  }
  for (let v = 0; v < bc; v++) {
    const w = boneWeightOf(v, set);
    if (w < 1e-3) continue;
    const b0 = topo.skinIndex[v * 2];
    const bi = set.has(b0) ? b0 : topo.skinIndex[v * 2 + 1];
    const ax = axes.get(bi);
    if (!ax) continue;
    const px = basePos[v * 3] - ax.j[0];
    const py = basePos[v * 3 + 1] - ax.j[1];
    const pz = basePos[v * 3 + 2] - ax.j[2];
    const along = px * ax.a[0] + py * ax.a[1] + pz * ax.a[2];
    if (spec.kind === 'girth') {
      delta[v * 3] += (px - along * ax.a[0]) * spec.amount * w;
      delta[v * 3 + 1] += (py - along * ax.a[1]) * spec.amount * w;
      delta[v * 3 + 2] += (pz - along * ax.a[2]) * spec.amount * w;
    } else {
      // length: stretch along the CHAIN root axis so segments stay connected
      const root = axes.get(ax.root) ?? ax;
      const rx = basePos[v * 3] - root.j[0];
      const ry = basePos[v * 3 + 1] - root.j[1];
      const rz = basePos[v * 3 + 2] - root.j[2];
      const rAlong = rx * root.a[0] + ry * root.a[1] + rz * root.a[2];
      delta[v * 3] += root.a[0] * rAlong * spec.amount * w;
      delta[v * 3 + 1] += root.a[1] * rAlong * spec.amount * w;
      delta[v * 3 + 2] += root.a[2] * rAlong * spec.amount * w;
    }
  }
  if (spec.kind === 'length') {
    for (let b = 0; b < BONES.length; b++) {
      if (!isDescendant(b, set)) continue;
      const root = axes.get(chainRootOf(b, set));
      if (!root) continue;
      const rx = baseJoints[b * 3] - root.j[0];
      const ry = baseJoints[b * 3 + 1] - root.j[1];
      const rz = baseJoints[b * 3 + 2] - root.j[2];
      const rAlong = rx * root.a[0] + ry * root.a[1] + rz * root.a[2];
      jointDelta[b * 3] += root.a[0] * rAlong * spec.amount;
      jointDelta[b * 3 + 1] += root.a[1] * rAlong * spec.amount;
      jointDelta[b * 3 + 2] += root.a[2] * rAlong * spec.amount;
    }
  }
}

// ------------------------------------------------------------ morph baking

function applySource(src: MHSource, def: MorphDef, dir: 'pos' | 'neg', delta: Float32Array, jointDelta: Float32Array): void {
  if (src.bundle) {
    for (const [name, scale] of src.bundle) {
      const d = mh.deltas.get(name);
      if (!d) {
        console.warn(`[mh] missing bundle delta ${name} for ${def.id}`);
        continue;
      }
      for (let k = 0; k < d.idx.length; k++) {
        const v = d.idx[k];
        delta[v * 3] += d.dxyz[k * 3] * scale;
        delta[v * 3 + 1] += d.dxyz[k * 3 + 1] * scale;
        delta[v * 3 + 2] += d.dxyz[k * 3 + 2] * scale;
      }
      for (let i = 0; i < jointDelta.length; i++) jointDelta[i] += d.joints[i] * scale;
    }
  }
  if (src.synth) for (const s of src.synth) synthInto(s, delta, jointDelta);
  if (src.fields) {
    const spec = dir === 'pos' ? def.pos : def.neg;
    if (spec?.fields) bakeFields(spec.fields, basePos, landmarkBase, delta);
  }
}

function bakeDir(def: MorphDef, dir: 'pos' | 'neg'): BakedDir | null {
  const spec = dir === 'pos' ? def.pos : def.neg;
  const map = MH_MAP[def.id]?.[dir];
  if (!spec && !map) return null;
  const delta = new Float32Array(basePos.length);
  const jointDelta = new Float32Array(baseJoints.length);
  let any = false;
  if (map) {
    applySource(map, def, dir, delta, jointDelta);
    any = true;
  } else if (spec?.fields) {
    bakeFields(spec.fields, basePos, landmarkBase, delta);
    any = true;
  }
  if (!any) return null;
  return { delta, jointDelta };
}

async function init(): Promise<void> {
  mh = await loadMH();
  basePos = mh.basePos;
  baseJoints = mh.baseJoints;
  BONES = mh.bones;
  BONE_PARENT = mh.boneParent;
  // derive cap-vertex base positions from their rings
  deriveCaps(basePos);
  topo = {
    vertCount: mh.vertCount,
    indices: mh.indices,
    uvs: mh.uvs,
    regions: mh.regions,
    side: mh.side,
    skinIndex: mh.skinIndex,
    skinWeight: mh.skinWeight,
    parts: mh.parts,
    landmarkVerts: mh.landmarkVerts
  };
  landmarkBase = {};
  for (const [name, v] of Object.entries(mh.landmarkVerts)) {
    landmarkBase[name] = [basePos[v * 3], basePos[v * 3 + 1], basePos[v * 3 + 2]];
  }
  buildBoneTails();
  const dead: string[] = [];
  for (const def of MORPHS) {
    const pos = bakeDir(def, 'pos');
    const neg = bakeDir(def, 'neg');
    if (!pos && !neg) dead.push(def.id);
    baked.set(def.id, { def, pos, neg });
  }
  if (dead.length) console.warn('[mh] sliders with no MH source (inert):', dead.join(', '));
  work = new Float32Array(basePos.length);
  normals = new Float32Array(basePos.length);
  jointsOut = new Float32Array(baseJoints.length);
  buildAdjacency();
  bakeFeatureTint();
}

/** cap verts (appended after body verts) = average of their boundary ring */
function deriveCaps(arr: Float32Array): void {
  mh.caps.forEach((ring, ci) => {
    const v = mh.bodyCount + ci;
    let x = 0, y = 0, z = 0;
    for (const r of ring) {
      x += arr[r * 3];
      y += arr[r * 3 + 1];
      z += arr[r * 3 + 2];
    }
    arr[v * 3] = x / ring.length;
    arr[v * 3 + 1] = y / ring.length;
    arr[v * 3 + 2] = z / ring.length;
  });
  deriveEyes(arr);
}

/** eyeball spheres rigidly follow their anchor helper verts (which morph
 *  targets move): translate with the centroid, scale with the mean radius */
function deriveEyes(arr: Float32Array): void {
  if (arr === basePos) return; // base already seats the spheres
  for (const eye of mh.eyes) {
    let bx = 0, by = 0, bz = 0, nx = 0, ny = 0, nz = 0;
    for (let k = 0; k < eye.anchorCount; k++) {
      const v = eye.anchorStart + k;
      bx += basePos[v * 3]; by += basePos[v * 3 + 1]; bz += basePos[v * 3 + 2];
      nx += arr[v * 3]; ny += arr[v * 3 + 1]; nz += arr[v * 3 + 2];
    }
    bx /= eye.anchorCount; by /= eye.anchorCount; bz /= eye.anchorCount;
    nx /= eye.anchorCount; ny /= eye.anchorCount; nz /= eye.anchorCount;
    let rb = 0, rn = 0;
    for (let k = 0; k < eye.anchorCount; k++) {
      const v = eye.anchorStart + k;
      rb += Math.hypot(basePos[v * 3] - bx, basePos[v * 3 + 1] - by, basePos[v * 3 + 2] - bz);
      rn += Math.hypot(arr[v * 3] - nx, arr[v * 3 + 1] - ny, arr[v * 3 + 2] - nz);
    }
    const s = rb > 1e-9 ? rn / rb : 1;
    for (let k = 0; k < eye.sphereCount; k++) {
      const v = eye.sphereStart + k;
      arr[v * 3] = nx + (basePos[v * 3] - bx) * s;
      arr[v * 3 + 1] = ny + (basePos[v * 3 + 1] - by) * s;
      arr[v * 3 + 2] = nz + (basePos[v * 3 + 2] - bz) * s;
    }
  }
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
  tintOut = new Float32Array(vc * 3);
}

/** Paint skin features as per-vertex color multipliers on the base mesh:
 *  vermilion lips, brow strokes, lash-line darkening, subsurface blush on
 *  cheeks/nose/ears/joints. Multipliers compose with any skin tone, so a
 *  goblin keeps its green and an elf its pallor — features just read. */
function bakeFeatureTint(): void {
  const vc = topo.vertCount;
  featureTint = new Float32Array(vc * 3).fill(1);
  const L = landmarkBase;
  const mul = (v: number, r: number, g: number, b: number, w: number): void => {
    if (w <= 0) return;
    featureTint[v * 3] *= 1 + (r - 1) * w;
    featureTint[v * 3 + 1] *= 1 + (g - 1) * w;
    featureTint[v * 3 + 2] *= 1 + (b - 1) * w;
  };
  const gauss = (d2: number, r: number): number => Math.exp(-d2 / (2 * r * r));
  const d2To = (v: number, p: [number, number, number], sx = 1, sy = 1, sz = 1): number => {
    const dx = (basePos[v * 3] - p[0]) / sx;
    const dy = (basePos[v * 3 + 1] - p[1]) / sy;
    const dz = (basePos[v * 3 + 2] - p[2]) / sz;
    return dx * dx + dy * dy + dz * dz;
  };
  const mouth = L.mouth;
  const cornerL = L.mouthCornerL;
  const eyeL = L.eyeL;
  const browL = L.browL;
  for (let v = 0; v < vc; v++) {
    // vermilion lips: band along the mouth line out to the corners
    if (mouth && cornerL) {
      const ax = Math.abs(basePos[v * 3]);
      const halfW = Math.abs(cornerL[0]) * 1.15;
      const along = Math.min(1, ax / halfW);
      const dy = basePos[v * 3 + 1] - (mouth[1] + 0.001 - along * along * 0.002);
      const dz = basePos[v * 3 + 2] - mouth[2];
      if (ax < halfW * 1.35 && dz > -0.02) {
        const lipH = dy > 0 ? 0.0052 : 0.0058;
        const w = Math.exp(-(dy * dy) / (2 * lipH * lipH)) * gauss(Math.max(0, ax - halfW) ** 2, 0.006) * Math.max(0, Math.min(1, (dz + 0.008) / 0.012));
        mul(v, 1.22, 0.56, 0.5, Math.min(1, w * 0.95));
      }
    }
    // brow strokes: tilted band just above the socket rim
    if (browL && eyeL) {
      for (const s of [1, -1]) {
        const bx = browL[0] * s;
        const dx = basePos[v * 3] - bx;
        const dy = basePos[v * 3 + 1] - (Math.max(browL[1], eyeL[1] + 0.014) + dx * s * 0.14);
        const dz = basePos[v * 3 + 2] - browL[2];
        if (dz > -0.025 && dz < 0.02) {
          const w = Math.exp(-(dx * dx) / (2 * 0.013 * 0.013)) * Math.exp(-(dy * dy) / (2 * 0.0032 * 0.0032));
          mul(v, 0.45, 0.38, 0.35, Math.min(1, w));
        }
      }
    }
    // lash line + soft periorbital shading
    if (eyeL) {
      for (const s of [1, -1]) {
        const p: [number, number, number] = [eyeL[0] * s, eyeL[1] + 0.0065, eyeL[2]];
        const w = gauss(d2To(v, p, 1.6, 0.4, 1), 0.005);
        mul(v, 0.62, 0.58, 0.58, w * 0.65);
        const soft = gauss(d2To(v, [eyeL[0] * s, eyeL[1], eyeL[2]], 1.4, 1, 1), 0.014);
        mul(v, 0.94, 0.91, 0.93, soft * 0.3);
      }
    }
  }
  // eyeball parts: sclera, iris ring, pupil (painted around the forward pole)
  for (const part of topo.parts) {
    if (part.name !== 'eyeL' && part.name !== 'eyeR') continue;
    // eyeball center + forward extent
    let cx = 0, cy = 0, cz = 0, zMax = -Infinity;
    for (let v = part.vStart; v < part.vStart + part.vCount; v++) {
      cx += basePos[v * 3];
      cy += basePos[v * 3 + 1];
      cz += basePos[v * 3 + 2];
      if (basePos[v * 3 + 2] > zMax) zMax = basePos[v * 3 + 2];
    }
    cx /= part.vCount;
    cy /= part.vCount;
    cz /= part.vCount;
    const R = Math.max(0.004, zMax - cz);
    for (let v = part.vStart; v < part.vStart + part.vCount; v++) {
      // angle from the forward (+z) pole
      const dx = basePos[v * 3] - cx;
      const dy = basePos[v * 3 + 1] - cy;
      const dz = basePos[v * 3 + 2] - cz;
      const len = Math.hypot(dx, dy, dz) || 1;
      const polar = Math.acos(Math.max(-1, Math.min(1, dz / len))); // 0 at front pole
      void R;
      if (polar < 0.22) {
        featureTint[v * 3] = 0.05; // pupil
        featureTint[v * 3 + 1] = 0.05;
        featureTint[v * 3 + 2] = 0.06;
      } else if (polar < 0.5) {
        featureTint[v * 3] = 0.28; // iris (dark warm — reads as any eye color)
        featureTint[v * 3 + 1] = 0.24;
        featureTint[v * 3 + 2] = 0.2;
      } else if (polar < 0.58) {
        featureTint[v * 3] = 0.5; // limbal ring softening
        featureTint[v * 3 + 1] = 0.5;
        featureTint[v * 3 + 2] = 0.5;
      } else {
        featureTint[v * 3] = 1.55; // sclera: lifted well above skin tone
        featureTint[v * 3 + 1] = 1.5;
        featureTint[v * 3 + 2] = 1.45;
      }
    }
  }
  // subsurface blush zones: warm scatter where skin is thin / blood is close
  const blush: [string, number, number][] = [
    ['cheekL', 0.032, 0.5], ['noseTip', 0.014, 0.55], ['earL', 0.02, 0.6],
    ['chin', 0.02, 0.3], ['kneeL', 0.03, 0.3], ['elbowL', 0.025, 0.3],
    ['heelL', 0.025, 0.35], ['mouthCornerL', 0.012, 0.4]
  ];
  for (const [name, r, strength] of blush) {
    const p = L[name];
    if (!p) continue;
    for (const s of Math.abs(p[0]) > 1e-6 ? [1, -1] : [1]) {
      const q: [number, number, number] = [p[0] * s, p[1], p[2]];
      for (let v = 0; v < vc; v++) {
        const w = gauss(d2To(v, q), r) * strength;
        if (w > 0.01) mul(v, 1.08, 0.93, 0.88, w);
      }
    }
  }
}

/** Concavity = mean signed elevation of neighbors above the tangent plane:
 *  positive in creases and pits, negative on ridges. */
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
  const pd = m.pos?.delta ?? null;
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

/** slice circumference at height y: angular-bin the torso outline and sum
 *  chords — robust on an unstructured mesh */
const BINS = 48;
const binR = new Float32Array(BINS);
let torsoVerts: Uint32Array;
function sliceCircumference(y: number, halfBand = 0.012): number {
  if (!torsoVerts) {
    const list: number[] = [];
    for (let v = 0; v < mh.bodyCount; v++) {
      const r = topo.regions[v];
      if (r === 2 || r === 3 || r === 4 || r === 9) list.push(v);
    }
    torsoVerts = new Uint32Array(list);
  }
  binR.fill(0);
  let cx = 0, cz = 0, n = 0;
  for (const v of torsoVerts) {
    if (Math.abs(work[v * 3 + 1] - y) > halfBand) continue;
    cx += work[v * 3];
    cz += work[v * 3 + 2];
    n++;
  }
  if (n < 8) return 0;
  cx /= n;
  cz /= n;
  for (const v of torsoVerts) {
    if (Math.abs(work[v * 3 + 1] - y) > halfBand) continue;
    const dx = work[v * 3] - cx;
    const dz = work[v * 3 + 2] - cz;
    const bin = Math.floor(((Math.atan2(dz, dx) + Math.PI) / (2 * Math.PI)) * BINS) % BINS;
    const rad = Math.hypot(dx, dz);
    if (rad > binR[bin]) binR[bin] = rad;
  }
  let len = 0;
  for (let b = 0; b < BINS; b++) {
    const r0 = binR[b] || binR[(b + BINS - 1) % BINS];
    const r1 = binR[(b + 1) % BINS] || r0;
    const a0 = (b / BINS) * 2 * Math.PI;
    const a1 = ((b + 1) / BINS) * 2 * Math.PI;
    const x0 = r0 * Math.cos(a0), z0 = r0 * Math.sin(a0);
    const x1 = r1 * Math.cos(a1), z1 = r1 * Math.sin(a1);
    len += Math.hypot(x1 - x0, z1 - z0);
  }
  return len;
}

const lmY = (name: string): number => work[topo.landmarkVerts[name] * 3 + 1];
const lmX = (name: string): number => work[topo.landmarkVerts[name] * 3];

function measure(): Measurements {
  let hMax = -Infinity;
  for (let v = 0; v < mh.bodyCount; v++) if (work[v * 3 + 1] > hMax) hMax = work[v * 3 + 1];
  const heelY = Math.min(lmY('heelL'), lmY('heelR')) - 0.015;
  const height = hMax - Math.min(0, heelY);
  const headH = Math.max(0.05, lmY('crown') - lmY('chin') + 0.02);
  const thighY = jointsOut[BONES.indexOf('thighL') * 3 + 1];
  const ankleY = jointsOut[BONES.indexOf('footL') * 3 + 1];
  return {
    heightCm: height * 100,
    headUnits: height / headH,
    shoulderCm: Math.abs(lmX('shoulderTipL')) * 2 * 100,
    chestCm: sliceCircumference(lmY('bustL')) * 100,
    waistCm: sliceCircumference(lmY('waistSideL')) * 100,
    hipCm: Math.max(sliceCircumference(lmY('hipSideL')), sliceCircumference(lmY('gluteApex'))) * 100,
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
  deriveCaps(work);
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

  deriveCaps(work);
  if (req.pose && Object.keys(req.pose).length) applyPose(req.pose);
  computeNormals();
  computeCavity();

  // final vertex tint = baked skin features × live crevice shading
  for (let v = 0; v < cavity.length; v++) {
    const k = Math.min(1, Math.max(0, cavity[v] - 0.025) * 3.5);
    tintOut[v * 3] = featureTint[v * 3] * (1 - 0.18 * k);
    tintOut[v * 3 + 1] = featureTint[v * 3 + 1] * (1 - 0.28 * k);
    tintOut[v * 3 + 2] = featureTint[v * 3 + 2] * (1 - 0.33 * k);
  }

  const positions = work.slice();
  const norms = normals.slice();
  const joints = jointsOut.slice();
  const tint = tintOut.slice();
  (self as unknown as Worker).postMessage(
    {
      type: 'composed',
      id: req.id,
      positions,
      normals: norms,
      joints,
      tint,
      measurements: m,
      composeMs: performance.now() - t0
    },
    [positions.buffer, norms.buffer, joints.buffer, tint.buffer]
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
    if (m.pos) {
      names.push(m.def.bipolar ? `${m.def.id}_pos` : m.def.id);
      arrays.push(m.pos.delta.slice());
    }
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

let initPromise: Promise<void> | null = null;

self.onmessage = (e: MessageEvent) => {
  const msg = e.data;
  const run = async (): Promise<void> => {
    if (msg.type === 'init') {
      initPromise = init();
      await initPromise;
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
      await initPromise;
      compose(msg as ComposeReq);
    } else if (msg.type === 'deltas') {
      await initPromise;
      sendDeltas(msg.id, !!msg.includeNsfw);
    }
  };
  run().catch((err) => {
    (self as unknown as Worker).postMessage({
      type: 'error',
      id: msg.id,
      error: err instanceof Error ? err.message : String(err)
    });
  });
};
