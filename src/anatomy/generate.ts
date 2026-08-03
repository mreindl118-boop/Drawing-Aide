/** Procedural base-body generator.
 *
 *  Emits the body as a set of closed, slightly-overlapping loft parts
 *  (torso, head, neck, limbs, hands, feet, groin patch) sharing one vertex
 *  buffer. Emission order and counts are ALWAYS identical, so re-running with
 *  patched params yields morph deltas on the shared topology.
 *
 *  Silhouettes are Catmull-Rom interpolated through anatomical stations, so
 *  girth changes stay C1-continuous — clean flowing lines are structural,
 *  not authored per-morph.
 */
import { BASE_PARAMS, type GenParams } from './params';

export const REGION = {
  face: 0,
  neck: 1,
  shoulders: 2,
  chest: 3,
  waist: 4,
  arms: 5,
  hands: 6,
  legs: 7,
  feet: 8,
  groin: 9
} as const;
export type RegionId = (typeof REGION)[keyof typeof REGION];

export const BONES = [
  'pelvis',
  'spine',
  'chest',
  'neck',
  'head',
  'upperArmL',
  'forearmL',
  'handL',
  'upperArmR',
  'forearmR',
  'handR',
  'thighL',
  'shinL',
  'footL',
  'thighR',
  'shinR',
  'footR'
] as const;
export const BONE_PARENT: number[] = [-1, 0, 1, 2, 3, 2, 5, 6, 2, 8, 9, 0, 11, 12, 0, 14, 15];
export const B = Object.fromEntries(BONES.map((n, i) => [n, i])) as Record<
  (typeof BONES)[number],
  number
>;

/** loft resolutions — the worker's ring-measurement math depends on these */
export const TORSO_RADIAL = 44;
export const TORSO_SUBDIV = 4;
/** torso station indices (bottom→top) used for circumference measurements */
export const TORSO_STATION = { glute: 1, hip: 2, waist: 4, chest: 7 } as const;

export interface Topology {
  vertCount: number;
  indices: Uint32Array;
  uvs: Float32Array;
  regions: Uint8Array;
  side: Float32Array; // −1 right … +1 left, smooth blend at midline
  skinIndex: Uint16Array; // 2 bones/vertex
  skinWeight: Float32Array; // 2 weights/vertex
  parts: { name: string; vStart: number; vCount: number; iStart: number; iCount: number }[];
  landmarkVerts: Record<string, number>;
}

export interface GenResult {
  positions: Float32Array;
  joints: Float32Array; // BONES.length × 3
  landmarks: Record<string, [number, number, number]>;
}

type V3 = [number, number, number];

interface Station {
  p: V3;
  w: number;
  df: number;
  db: number;
  n: number;
  region: RegionId;
  b0: number;
  b1: number;
  bt: number; // 0 → all b0, 1 → all b1
}

function se(c: number, n: number): number {
  return Math.sign(c) * Math.pow(Math.abs(c), 2 / n);
}

/** Monotone cubic (Fritsch–Carlson) through station values: C1-smooth like
 *  Catmull-Rom but never overshoots, so dense rings can't pinch or fold the
 *  loft between unevenly spaced stations. */
function monoInterp(vals: number[], seg: number, t: number): number {
  const n = vals.length;
  const d = (i: number): number => vals[Math.min(n - 1, i + 1)] - vals[Math.max(0, i)];
  const slope = (i: number): number => {
    if (i <= 0) return d(0);
    if (i >= n - 1) return d(n - 2);
    const a = d(i - 1);
    const b = d(i);
    if (a * b <= 0) return 0;
    return (2 * a * b) / (a + b); // harmonic mean, sign-safe
  };
  const y0 = vals[seg];
  const y1 = vals[Math.min(n - 1, seg + 1)];
  const m0 = slope(seg);
  const m1 = slope(seg + 1);
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    (2 * t3 - 3 * t2 + 1) * y0 +
    (t3 - 2 * t2 + t) * m0 +
    (-2 * t3 + 3 * t2) * y1 +
    (t3 - t2) * m1
  );
}

function norm(v: V3): V3 {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}

function cross(a: V3, b: V3): V3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

class Emitter {
  cursor = 0;
  positions: Float32Array;
  // topology recording (first run only)
  record: boolean;
  uvs: number[] = [];
  regions: number[] = [];
  skinIndex: number[] = [];
  skinWeight: number[] = [];
  indices: number[] = [];
  parts: Topology['parts'] = [];
  private partVStart = 0;
  private partIStart = 0;

  constructor(record: boolean, expectedVerts: number) {
    this.record = record;
    this.positions = new Float32Array(expectedVerts * 3);
  }

  beginPart(): void {
    this.partVStart = this.cursor;
    this.partIStart = this.indices.length;
  }

  endPart(name: string): void {
    if (this.record) {
      this.parts.push({
        name,
        vStart: this.partVStart,
        vCount: this.cursor - this.partVStart,
        iStart: this.partIStart,
        iCount: this.indices.length - this.partIStart
      });
    }
  }

  vert(x: number, y: number, z: number, u: number, v: number, region: number, b0: number, b1: number, bt: number): number {
    const i = this.cursor++;
    if (i * 3 + 2 >= this.positions.length) {
      const bigger = new Float32Array(Math.ceil(this.positions.length * 1.6) + 3072);
      bigger.set(this.positions);
      this.positions = bigger;
    }
    this.positions[i * 3] = x;
    this.positions[i * 3 + 1] = y;
    this.positions[i * 3 + 2] = z;
    if (this.record) {
      this.uvs.push(u, v);
      this.regions.push(region);
      const w1 = Math.min(1, Math.max(0, bt));
      this.skinIndex.push(b0, b1);
      this.skinWeight.push(1 - w1, w1);
    }
    return i;
  }

  quad(a: number, b: number, c: number, d: number): void {
    if (!this.record) return;
    // outward (CCW) winding for the ring frames this generator emits
    this.indices.push(a, d, b, b, d, c);
  }

  tri(a: number, b: number, c: number): void {
    if (this.record) this.indices.push(a, c, b);
  }
}

interface LoftOpts {
  /** rounded end caps: dome height in meters (0 = flat fan) */
  startDome?: number;
  endDome?: number;
}

/** Loft closed tube through stations. `ref` orients ring frames.
 *  Rings duplicate the seam vertex for clean UVs. */
function loft(
  em: Emitter,
  name: string,
  stations: Station[],
  radial: number,
  subdiv: number,
  ref: V3,
  opts: LoftOpts = {}
): void {
  em.beginPart();
  const nS = stations.length;
  const ringsN = (nS - 1) * subdiv + 1;
  const rings: number[][] = [];
  const centers: V3[] = [];

  // interpolate stations (monotone cubic — dense rings must never fold)
  const chan = (get: (s: Station) => number): number[] => stations.map(get);
  const px = chan((s) => s.p[0]);
  const py = chan((s) => s.p[1]);
  const pz = chan((s) => s.p[2]);
  const ws = chan((s) => s.w);
  const dfs = chan((s) => s.df);
  const dbs = chan((s) => s.db);
  const ns = chan((s) => s.n);
  const interp: Station[] = [];
  for (let seg = 0; seg < nS - 1; seg++) {
    for (let j = 0; j < subdiv; j++) {
      const t = j / subdiv;
      const b = stations[seg];
      const c = stations[seg + 1];
      interp.push({
        p: [monoInterp(px, seg, t), monoInterp(py, seg, t), monoInterp(pz, seg, t)],
        w: monoInterp(ws, seg, t),
        df: monoInterp(dfs, seg, t),
        db: monoInterp(dbs, seg, t),
        n: monoInterp(ns, seg, t),
        region: b.region,
        b0: b.b0,
        b1: b.b1,
        bt: b.bt + (c.bt - b.bt) * t
      });
    }
  }
  interp.push(stations[nS - 1]);

  const framesAcc: { x: V3; z: V3 }[] = [];
  // overall loft direction guards ring frames against tangent flips
  const first = stations[0].p;
  const last = stations[nS - 1].p;
  const overall = norm([last[0] - first[0], last[1] - first[1], last[2] - first[2]]);

  for (let r = 0; r < ringsN; r++) {
    const st = interp[r];
    centers.push(st.p);
    // frame from tangent
    const prev = interp[Math.max(0, r - 1)].p;
    const next = interp[Math.min(ringsN - 1, r + 1)].p;
    let tan = norm([next[0] - prev[0], next[1] - prev[1], next[2] - prev[2]]);
    if (tan[0] * overall[0] + tan[1] * overall[1] + tan[2] * overall[2] < 0.25) {
      tan = overall;
    }
    const xDir = norm(cross(tan, ref));
    const zDir = norm(cross(xDir, tan));
    const ring: number[] = [];
    framesAcc.push({ x: xDir, z: zDir });
    for (let k = 0; k <= radial; k++) {
      const th = (k / radial) * Math.PI * 2;
      const fx = se(Math.cos(th), st.n);
      const fz = se(Math.sin(th), st.n);
      const rx = fx * st.w;
      const rz = fz * (fz >= 0 ? st.df : st.db);
      const x = st.p[0] + xDir[0] * rx + zDir[0] * rz;
      const y = st.p[1] + xDir[1] * rx + zDir[1] * rz;
      const z = st.p[2] + xDir[2] * rx + zDir[2] * rz;
      ring.push(
        em.vert(x, y, z, k / radial, r / (ringsN - 1), st.region, st.b0, st.b1, st.bt)
      );
    }
    rings.push(ring);
  }
  for (let r = 0; r < ringsN - 1; r++) {
    for (let k = 0; k < radial; k++) {
      em.quad(rings[r][k], rings[r][k + 1], rings[r + 1][k + 1], rings[r + 1][k]);
    }
  }

  // caps: rounded dome (extra shrunk ring + apex) or flat fan
  const cap = (atStart: boolean, domeH: number): void => {
    const i = atStart ? 0 : ringsN - 1;
    const ring = rings[i];
    const st = interp[i];
    const center = centers[i];
    const frame = framesAcc[i];
    const nb = centers[atStart ? 1 : ringsN - 2];
    const out = norm([center[0] - nb[0], center[1] - nb[1], center[2] - nb[2]]);
    const mkRing = (scaleR: number, off: number): number[] => {
      const rr: number[] = [];
      for (let k = 0; k <= radial; k++) {
        const th = (k / radial) * Math.PI * 2;
        const fx = se(Math.cos(th), st.n) * st.w * scaleR;
        const fz0 = se(Math.sin(th), st.n);
        const fz = fz0 * (fz0 >= 0 ? st.df : st.db) * scaleR;
        rr.push(
          em.vert(
            center[0] + frame.x[0] * fx + frame.z[0] * fz + out[0] * off,
            center[1] + frame.x[1] * fx + frame.z[1] * fz + out[1] * off,
            center[2] + frame.x[2] * fx + frame.z[2] * fz + out[2] * off,
            0.5,
            atStart ? 0 : 1,
            st.region,
            st.b0,
            st.b1,
            st.bt
          )
        );
      }
      return rr;
    };
    let lastRing = ring;
    if (domeH > 0) {
      const mid = mkRing(0.62, domeH * 0.62);
      for (let k = 0; k < radial; k++) {
        if (atStart) em.quad(mid[k], mid[k + 1], ring[k + 1], ring[k]);
        else em.quad(ring[k], ring[k + 1], mid[k + 1], mid[k]);
      }
      lastRing = mid;
    }
    const apex = em.vert(
      center[0] + out[0] * domeH,
      center[1] + out[1] * domeH,
      center[2] + out[2] * domeH,
      0.5,
      atStart ? 0 : 1,
      st.region,
      st.b0,
      st.b1,
      st.bt
    );
    for (let k = 0; k < radial; k++) {
      if (atStart) em.tri(apex, lastRing[k + 1], lastRing[k]);
      else em.tri(apex, lastRing[k], lastRing[k + 1]);
    }
  };
  cap(true, opts.startDome ?? 0);
  cap(false, opts.endDome ?? 0);
  em.endPart(name);
}

// station shorthand
function st(
  p: V3,
  w: number,
  df: number,
  db: number,
  n: number,
  region: RegionId,
  b0: number,
  b1 = b0,
  bt = 0
): Station {
  return { p, w, df, db, n, region, b0, b1, bt };
}

/** Emit the whole body. Same call order every time. */
export function emitBody(P: GenParams, em: Emitter): {
  joints: Float32Array;
  landmarks: Record<string, [number, number, number]>;
} {
  const landmarks: Record<string, [number, number, number]> = {};
  const joints = new Float32Array(BONES.length * 3);
  const setJ = (bone: number, p: V3): void => {
    joints[bone * 3] = p[0];
    joints[bone * 3 + 1] = p[1];
    joints[bone * 3 + 2] = p[2];
  };

  // ------------------------------------------------------------------ torso
  const crotchY = P.hipY - 0.055;
  const gluteY = P.hipY + 0.02;
  const hipTopY = (P.hipY + P.waistY) / 2 + 0.02;
  const neckTopTorso = P.neckBaseY + 0.02;
  loft(
    em,
    'torso',
    [
      st([0, crotchY, P.pelvisZ], P.pelvisW * 0.5, P.pelvisDf * 0.55, P.pelvisDb * 0.6, 2.6, REGION.waist, B.pelvis),
      st([0, gluteY, P.pelvisZ], P.pelvisW, P.pelvisDf * P.bellyRound, P.pelvisDb * P.gluteRound, P.torsoN, REGION.waist, B.pelvis),
      st([0, hipTopY, P.pelvisZ * 0.5], P.hipW, P.hipDf, P.hipDb, P.torsoN, REGION.waist, B.pelvis, B.spine, 0.35),
      st([0, P.navelY, P.waistZ], (P.waistW + P.hipW) / 2, (P.waistDf + P.hipDf) / 2 * P.bellyRound, (P.waistDb + P.hipDb) / 2, P.waistN, REGION.waist, B.pelvis, B.spine, 0.6),
      st([0, P.waistY, P.waistZ], P.waistW, P.waistDf * P.bellyRound, P.waistDb, P.waistN, REGION.waist, B.spine),
      st([0, (P.waistY + P.chestY) / 2, P.waistZ * 0.5], P.ribW, P.ribDf, P.ribDb, P.torsoN, REGION.chest, B.spine, B.chest, 0.5),
      st([0, P.chestY - 0.05, P.chestZ * 0.7], (P.ribW + P.chestW) / 2, ((P.ribDf + P.chestDf) / 2) * 0.97, (P.ribDb + P.chestDb) / 2, P.torsoN, REGION.chest, B.chest),
      st([0, P.chestY, P.chestZ], P.chestW, P.chestDf, P.chestDb, P.torsoN, REGION.chest, B.chest),
      st([0, P.upperChestY, P.upperChestZ], P.upperChestW, P.upperChestDf, P.upperChestDb, P.torsoN, REGION.chest, B.chest),
      st([0, P.shoulderY, P.upperChestZ], P.upperChestW * 1.04, P.upperChestDf * 0.92, P.upperChestDb * 0.92, P.torsoN - 0.15, REGION.shoulders, B.chest),
      st([0, neckTopTorso, P.neckZ], P.neckR * 1.5, P.neckR * 1.5, P.neckR * 1.5, 2, REGION.shoulders, B.chest)
    ],
    TORSO_RADIAL,
    TORSO_SUBDIV,
    [0, 0, 1],
    { startDome: 0.012, endDome: 0.008 }
  );
  landmarks.waistSideL = [P.waistW, P.waistY, P.waistZ];
  landmarks.hipSideL = [P.hipW, hipTopY, 0];
  landmarks.gluteApex = [0, gluteY + 0.02, P.pelvisZ - P.pelvisDb * P.gluteRound];
  landmarks.bellyFront = [0, P.navelY, P.waistZ + P.waistDf];
  landmarks.bustL = [P.chestW * 0.45, P.chestY, P.chestZ + P.chestDf];
  landmarks.shoulderTipL = [P.shoulderHalf, P.shoulderY, P.upperChestZ];

  setJ(B.pelvis, [0, P.hipY + 0.03, P.pelvisZ]);
  setJ(B.spine, [0, P.waistY, P.waistZ]);
  setJ(B.chest, [0, P.chestY, P.chestZ]);

  // ------------------------------------------------------------------- neck
  loft(
    em,
    'neck',
    [
      st([0, P.neckBaseY - 0.025, P.neckZ], P.neckR * 1.1, P.neckR * 1.12, P.neckR * 1.22, 2.1, REGION.neck, B.neck),
      st([0, P.neckBaseY + 0.02, P.neckZ], P.neckR * 0.96, P.neckR * 0.94, P.neckR * 1.02, 2, REGION.neck, B.neck),
      st([0, P.headBaseY + 0.06, P.neckZ + 0.006], P.neckR * 0.78, P.neckR * 0.76, P.neckR * 0.84, 2, REGION.neck, B.neck, B.head, 0.7)
    ],
    18,
    3,
    [0, 0, 1]
  );
  setJ(B.neck, [0, P.neckBaseY, P.neckZ]);
  setJ(B.head, [0, P.headBaseY, P.neckZ]);

  // ------------------------------------------------------------------- head
  const hb = P.headBaseY;
  const hz = P.headZ;
  loft(
    em,
    'head',
    [
      st([0, hb - P.chinDrop, hz + 0.002], P.jawW * 0.96, P.jawDf * 0.92, P.headDb * 0.74, 2.0, REGION.face, B.head),
      st([0, hb + 0.018, hz + 0.006], P.jawW, P.jawDf, P.headDb * 0.76, 2.0, REGION.face, B.head),
      st([0, hb + 0.048, hz + 0.003], P.jawW * 1.07, P.jawDf * 1.03, P.headDb * 0.85, 1.98, REGION.face, B.head),
      st([0, hb + 0.078, hz], P.headW * 0.93, P.headDf * 0.97, P.headDb * 0.93, P.craniumN, REGION.face, B.head),
      st([0, hb + 0.108, hz], P.headW, P.headDf, P.headDb, P.craniumN, REGION.face, B.head),
      st([0, hb + 0.145, hz - 0.003], P.headW * 0.99, P.headDf * 0.9, P.headDb * 1.02, P.craniumN, REGION.face, B.head),
      st([0, P.crownY - 0.02, hz - 0.012], P.headW * 0.8, P.headDf * 0.72, P.headDb * 0.8, 2.05, REGION.face, B.head)
    ],
    52,
    6,
    [0, 0, 1],
    { startDome: 0.014, endDome: 0.022 }
  );
  const eyeY = hb + 0.108;
  landmarks.crown = [0, P.crownY, hz - 0.01];
  landmarks.chin = [0, hb - P.chinDrop, hz + 0.015 + P.jawDf * 0.4];
  landmarks.noseTip = [0, eyeY - 0.028, hz + P.headDf];
  landmarks.browL = [P.headW * 0.42, eyeY + 0.025, hz + P.headDf * 0.9];
  landmarks.eyeL = [P.headW * 0.42, eyeY, hz + P.headDf * 0.88];
  landmarks.cheekL = [P.headW * 0.8, eyeY - 0.035, hz + P.headDf * 0.45];
  landmarks.jawSideL = [P.jawW, hb + 0.02, hz + 0.008];
  landmarks.mouth = [0, hb + 0.048, hz + P.jawDf * 1.05];
  landmarks.earL = [P.headW, eyeY - 0.012, hz - 0.012];
  landmarks.foreheadC = [0, hb + 0.14, hz + P.headDf * 0.9];

  // ------------------------------------------------------------------- arms
  for (const sgn of [1, -1]) {
    const side = sgn === 1 ? 'L' : 'R';
    const sh: V3 = [sgn * P.shoulderHalf, P.shoulderY - 0.028, P.upperChestZ];
    const dir: V3 = norm([sgn * Math.sin(P.armAbduct), -Math.cos(P.armAbduct), 0]);
    const elbow: V3 = [sh[0] + dir[0] * P.upperArmLen, sh[1] + dir[1] * P.upperArmLen, sh[2] + 0.008];
    const fDir: V3 = norm([sgn * Math.sin(P.armAbduct * 0.8), -Math.cos(P.armAbduct * 0.8), 0.06]);
    const wrist: V3 = [
      elbow[0] + fDir[0] * P.forearmLen,
      elbow[1] + fDir[1] * P.forearmLen,
      elbow[2] + fDir[2] * P.forearmLen
    ];
    const bU = side === 'L' ? B.upperArmL : B.upperArmR;
    const bF = side === 'L' ? B.forearmL : B.forearmR;
    const mid = (a: V3, b2: V3, t: number): V3 => [
      a[0] + (b2[0] - a[0]) * t,
      a[1] + (b2[1] - a[1]) * t,
      a[2] + (b2[2] - a[2]) * t
    ];
    loft(
      em,
      `arm${side}`,
      [
        st([sh[0] - dir[0] * 0.05, sh[1] - dir[1] * 0.05, sh[2]], P.upperArmR * 1.34, P.upperArmR * 1.34, P.upperArmR * 1.34, 2, REGION.shoulders, bU),
        st(mid(sh, elbow, 0.4), P.upperArmR, P.upperArmR * 1.05, P.upperArmR, 2.05, REGION.arms, bU),
        st(elbow, P.elbowR, P.elbowR, P.elbowR * 1.05, 2.1, REGION.arms, bU, bF, 0.5),
        st(mid(elbow, wrist, 0.35), P.forearmR, P.forearmR, P.forearmR, 2.05, REGION.arms, bF),
        st(wrist, P.wristR, P.wristR * 0.85, P.wristR * 0.85, 2.2, REGION.arms, bF)
      ],
      20,
      4,
      [0, 0, 1]
    );
    landmarks[`elbow${side}`] = elbow;
    landmarks[`wrist${side}`] = wrist;
    setJ(side === 'L' ? B.upperArmL : B.upperArmR, sh);
    setJ(side === 'L' ? B.forearmL : B.forearmR, elbow);
    setJ(side === 'L' ? B.handL : B.handR, wrist);

    // ---- hand: palm + 4 fingers + thumb
    const bH = side === 'L' ? B.handL : B.handR;
    const hDir = fDir;
    const xAxis = norm(cross(hDir, [0, 0, 1])); // across palm
    const knuckle: V3 = [
      wrist[0] + hDir[0] * P.palmLen,
      wrist[1] + hDir[1] * P.palmLen,
      wrist[2] + hDir[2] * P.palmLen
    ];
    loft(
      em,
      `palm${side}`,
      [
        st(wrist, P.wristR * 1.05, P.wristR * 0.75, P.wristR * 0.75, 2.4, REGION.hands, bH),
        st(mid(wrist, knuckle, 0.55), P.palmW, P.palmT, P.palmT, 3, REGION.hands, bH),
        st(knuckle, P.palmW * 0.95, P.palmT * 0.95, P.palmT * 0.95, 3, REGION.hands, bH)
      ],
      12,
      3,
      [0, 0, 1],
      { endDome: 0.005 }
    );
    const fingerLens = [0.82, 1, 0.94, 0.78];
    for (let f = 0; f < 4; f++) {
      const off = (f / 3 - 0.5) * 2 * P.palmW * 0.72;
      const base: V3 = [
        knuckle[0] + xAxis[0] * off,
        knuckle[1] + xAxis[1] * off,
        knuckle[2] + xAxis[2] * off
      ];
      const len = P.fingerLen * fingerLens[f];
      const tip: V3 = [base[0] + hDir[0] * len, base[1] + hDir[1] * len, base[2] + hDir[2] * len];
      loft(
        em,
        `finger${side}${f}`,
        [
          st([base[0] - hDir[0] * 0.012, base[1] - hDir[1] * 0.012, base[2] - hDir[2] * 0.012], P.fingerR * 1.1, P.fingerR * 1.1, P.fingerR * 1.1, 2, REGION.hands, bH),
          st(mid(base, tip, 0.5), P.fingerR, P.fingerR, P.fingerR, 2, REGION.hands, bH),
          st(tip, P.fingerR * 0.72, P.fingerR * 0.72, P.fingerR * 0.72, 2, REGION.hands, bH)
        ],
        8,
        2,
        [0, 0, 1],
        { endDome: 0.005 }
      );
    }
    // thumb
    const tBase: V3 = mid(wrist, knuckle, 0.3);
    const tDir = norm([hDir[0] + sgn * 0.9, hDir[1] * 0.4, hDir[2] + 0.5]);
    const tLen = P.fingerLen * 0.7;
    const tTip: V3 = [tBase[0] + tDir[0] * tLen, tBase[1] + tDir[1] * tLen, tBase[2] + tDir[2] * tLen];
    loft(
      em,
      `thumb${side}`,
      [
        st(tBase, P.fingerR * 1.3, P.fingerR * 1.3, P.fingerR * 1.3, 2, REGION.hands, bH),
        st(mid(tBase, tTip, 0.5), P.fingerR * 1.15, P.fingerR * 1.15, P.fingerR * 1.15, 2, REGION.hands, bH),
        st(tTip, P.fingerR * 0.8, P.fingerR * 0.8, P.fingerR * 0.8, 2, REGION.hands, bH)
      ],
      8,
      2,
      [0, 0, 1],
      { endDome: 0.005 }
    );
    landmarks[`handTip${side}`] = [
      knuckle[0] + hDir[0] * P.fingerLen,
      knuckle[1] + hDir[1] * P.fingerLen,
      knuckle[2] + hDir[2] * P.fingerLen
    ];
    landmarks[`palm${side}`] = mid(wrist, knuckle, 0.6);
  }

  // ------------------------------------------------------------------- legs
  for (const sgn of [1, -1]) {
    const side = sgn === 1 ? 'L' : 'R';
    const hipS: V3 = [sgn * P.legSpread, P.hipY, 0];
    const knee: V3 = [sgn * P.legSpread * 0.94, P.kneeY, 0.004];
    const ankle: V3 = [sgn * P.legSpread * 0.9, P.ankleY, -0.012];
    const bT = side === 'L' ? B.thighL : B.thighR;
    const bS = side === 'L' ? B.shinL : B.shinR;
    const calfY = P.kneeY - (P.kneeY - P.ankleY) * 0.32;
    loft(
      em,
      `leg${side}`,
      [
        st([hipS[0], hipS[1] + 0.06, 0], P.thighR * 0.93, P.thighDf * 0.96, P.thighDb * 1.0, P.limbN + 0.35, REGION.legs, bT),
        st([hipS[0], hipS[1] - 0.06, 0.002], P.thighR, P.thighDf, P.thighDb, P.limbN + 0.15, REGION.legs, bT),
        st([sgn * P.legSpread * 0.96, (P.hipY + P.kneeY) / 2, 0.004], P.thighR * 0.82, P.thighDf * 0.85, P.thighDb * 0.82, P.limbN, REGION.legs, bT),
        st(knee, P.kneeR, P.kneeR, P.kneeR * 0.95, P.limbN, REGION.legs, bT, bS, 0.5),
        st([sgn * P.legSpread * 0.92, calfY, 0], P.calfR, P.calfR * 0.9, P.calfR * 0.9 + P.calfBack, P.limbN, REGION.legs, bS),
        st([sgn * P.legSpread * 0.9, (calfY + P.ankleY) / 2, -0.006], P.calfR * 0.72, P.calfR * 0.68, P.calfR * 0.75, P.limbN, REGION.legs, bS),
        st(ankle, P.ankleR, P.ankleR, P.ankleR * 1.05, P.limbN, REGION.legs, bS)
      ],
      22,
      4,
      [0, 0, 1],
      { startDome: 0.022, endDome: 0.012 }
    );
    landmarks[`thighSide${side}`] = [sgn * (P.legSpread + P.thighR), P.hipY - 0.05, 0];
    landmarks[`calf${side}`] = [sgn * P.legSpread * 0.92, calfY, -P.calfR * 0.9 - P.calfBack];
    landmarks[`knee${side}`] = knee;
    setJ(bT, hipS);
    setJ(bS, knee);
    setJ(side === 'L' ? B.footL : B.footR, ankle);

    // ---- foot: horizontal loft heel → toes (ring frame in XY plane)
    const bFt = side === 'L' ? B.footL : B.footR;
    const fx = sgn * P.legSpread * 0.9;
    loft(
      em,
      `foot${side}`,
      [
        st([fx, P.footH * 0.52, -0.065], P.footW * 0.82, P.footH * 0.42, P.footH * 0.52, 2.6, REGION.feet, bFt),
        st([fx, P.footH * 0.46, 0.015], P.footW * 0.92, P.footH * 0.38, P.footH * 0.46, 2.7, REGION.feet, bFt),
        st([fx + sgn * 0.006, P.footH * 0.4, P.footLen - 0.13], P.footW * 1.12, P.footH * 0.3, P.footH * 0.4, 2.8, REGION.feet, bFt),
        st([fx + sgn * 0.008, P.footH * 0.32, P.footLen - 0.075], P.footW, P.footH * 0.22, P.footH * 0.32, 2.8, REGION.feet, bFt)
      ],
      16,
      3,
      [0, 1, 0],
      { startDome: 0.01, endDome: 0.012 }
    );
    landmarks[`toe${side}`] = [fx, P.footH * 0.3, P.footLen - 0.06];
    landmarks[`heel${side}`] = [fx, P.footH * 0.4, -0.075];
  }

  // ---------------------------------------------------- groin patch (nsfw)
  // A small closed capsule nested inside the pelvis at neutral; the anatomy
  // module's morphs translate/scale it outward. Same topology always present.
  {
    const gz = P.pelvisZ + P.pelvisDf * 0.08 + P.groinOut;
    const gy = crotchY + 0.045;
    const s = 0.026 * P.groinScale;
    loft(
      em,
      'groin',
      [
        st([0, gy - s * 1.4, gz], s * 0.5, s * 0.5, s * 0.5, 2, REGION.groin, B.pelvis),
        st([0, gy - s * 0.4, gz + s * 0.3], s, s * 0.9, s * 0.7, 2, REGION.groin, B.pelvis),
        st([0, gy + s * 0.8, gz + s * 0.15], s * 0.95, s * 0.8, s * 0.6, 2, REGION.groin, B.pelvis)
      ],
      12,
      2,
      [0, 0, 1]
    );
    landmarks.groinC = [0, gy, gz + s];
  }

  landmarks.neckBase = [0, P.neckBaseY, P.neckZ];
  landmarks.chestC = [0, P.chestY, P.chestZ + P.chestDf];
  landmarks.backC = [0, P.chestY - 0.03, P.chestZ - P.chestDb];
  return { joints, landmarks };
}

// -------------------------------------------------------------- public API

let cachedTopo: Topology | null = null;
let vertCountCache = 0;

export function buildTopology(): Topology {
  if (cachedTopo) return cachedTopo;
  const em = new Emitter(true, 6000);
  const { landmarks } = emitBody(BASE_PARAMS, em);
  vertCountCache = em.cursor;
  const side = new Float32Array(em.cursor);
  for (let i = 0; i < em.cursor; i++) {
    side[i] = Math.max(-1, Math.min(1, em.positions[i * 3] / 0.05));
  }
  // landmark → nearest vertex; L-suffixed landmarks get an auto-mirrored R
  const nearest = (p: [number, number, number]): number => {
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < em.cursor; i++) {
      const dx = em.positions[i * 3] - p[0];
      const dy = em.positions[i * 3 + 1] - p[1];
      const dz = em.positions[i * 3 + 2] - p[2];
      const d = dx * dx + dy * dy + dz * dz;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return best;
  };
  const landmarkVerts: Record<string, number> = {};
  for (const [name, p] of Object.entries(landmarks)) {
    landmarkVerts[name] = nearest(p);
    if (name.endsWith('L') && Math.abs(p[0]) > 0.015) {
      const rName = name.slice(0, -1) + 'R';
      if (!(rName in landmarks)) {
        landmarkVerts[rName] = nearest([-p[0], p[1], p[2]]);
      }
    }
  }
  cachedTopo = {
    vertCount: em.cursor,
    indices: new Uint32Array(em.indices),
    uvs: new Float32Array(em.uvs),
    regions: new Uint8Array(em.regions),
    side,
    skinIndex: new Uint16Array(em.skinIndex),
    skinWeight: new Float32Array(em.skinWeight),
    parts: em.parts,
    landmarkVerts
  };
  return cachedTopo;
}

export function generateBody(params: GenParams): GenResult {
  if (!vertCountCache) buildTopology();
  const em = new Emitter(false, vertCountCache);
  const { joints, landmarks } = emitBody(params, em);
  return {
    positions: em.positions.length === vertCountCache * 3 ? em.positions : em.positions.slice(0, vertCountCache * 3),
    joints,
    landmarks
  };
}
