/** Adaptive pose retargeting: role-frame placement from real body dimensions
 *  → two-bone IK honoring contact constraints scaled to actual limb lengths
 *  → body-volume-aware collision separation → ground-contact snap.
 *
 *  Everything runs on the skeleton in world space using the SAME math as the
 *  worker's CPU skinning (R = Rz·Ry·Rx locals, world = parent·T(j)·R·T(−j)),
 *  so the solved locals reproduce exactly on the mesh. */
import type { PosePreset, RolePose, Vec3 } from './schema';
import { LANDMARK_CHAIN } from './schema';

// ---------------------------------------------------------------- small math

type M3 = number[]; // row-major 3×3

function mulM3(a: M3, b: M3): M3 {
  const o = new Array<number>(9);
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++)
      o[r * 3 + c] = a[r * 3] * b[c] + a[r * 3 + 1] * b[3 + c] + a[r * 3 + 2] * b[6 + c];
  return o;
}

function mulM3V(m: M3, v: Vec3): Vec3 {
  return [
    m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
    m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
    m[6] * v[0] + m[7] * v[1] + m[8] * v[2]
  ];
}

function transposeM3(m: M3): M3 {
  return [m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]];
}

/** worker convention: R = Rz(c)·Ry(b)·Rx(a) */
function eulerToM3(e: Vec3): M3 {
  const [ax, ay, az] = e;
  const cx = Math.cos(ax), sx = Math.sin(ax);
  const cy = Math.cos(ay), sy = Math.sin(ay);
  const cz = Math.cos(az), sz = Math.sin(az);
  return [
    cy * cz, cz * sy * sx - sz * cx, cz * sy * cx + sz * sx,
    cy * sz, sz * sy * sx + cz * cx, sz * sy * cx - cz * sx,
    -sy, cy * sx, cy * cx
  ];
}

/** inverse of eulerToM3 (ZYX-style extraction) */
function m3ToEuler(m: M3): Vec3 {
  const sy = -m[6];
  const cy = Math.sqrt(Math.max(0, 1 - sy * sy));
  if (cy > 1e-6) {
    return [Math.atan2(m[7], m[8]), Math.asin(sy), Math.atan2(m[3], m[0])];
  }
  return [Math.atan2(-m[5], m[4]), Math.asin(sy), 0];
}

function sub(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}
function add(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}
function scale(a: Vec3, s: number): Vec3 {
  return [a[0] * s, a[1] * s, a[2] * s];
}
function len(a: Vec3): number {
  return Math.hypot(a[0], a[1], a[2]);
}
function norm(a: Vec3): Vec3 {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
}
function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
function cross(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

/** rotation matrix taking unit vector `from` to unit vector `to` (min twist) */
function rotBetween(from: Vec3, to: Vec3): M3 {
  const c = dot(from, to);
  const axis = cross(from, to);
  const s = len(axis);
  if (s < 1e-8) {
    if (c > 0) return [1, 0, 0, 0, 1, 0, 0, 0, 1];
    // opposite: rotate π around any perpendicular
    const perp = Math.abs(from[0]) < 0.9 ? cross(from, [1, 0, 0]) : cross(from, [0, 1, 0]);
    return axisAngle(norm(perp), Math.PI);
  }
  return axisAngle(scale(axis, 1 / s), Math.atan2(s, c));
}

function axisAngle(axis: Vec3, angle: number): M3 {
  const [x, y, z] = axis;
  const c = Math.cos(angle), s = Math.sin(angle), t = 1 - c;
  return [
    t * x * x + c, t * x * y - s * z, t * x * z + s * y,
    t * x * y + s * z, t * y * y + c, t * y * z - s * x,
    t * x * z - s * y, t * y * z + s * x, t * z * z + c
  ];
}

function yawM3(yaw: number): M3 {
  return eulerToM3([0, yaw, 0]);
}

// ------------------------------------------------------------- participant

/** Rest-state snapshot for one character (from a pose-null compose). */
export interface ParticipantRest {
  /** local rest joint positions, BONES order (17×3) */
  joints: Float32Array;
  boneNames: string[];
  boneParent: number[];
  /** rest positions of named landmarks (character-local) */
  landmarks: Record<string, Vec3>;
  /** 2-bone skin per landmark */
  landmarkSkin: Record<string, { b: [number, number]; w: [number, number] }>;
  /** derived dims */
  bodyRadius: number; // horizontal half-extent for spacing/collision
  height: number;
}

export interface ParticipantState {
  rest: ParticipantRest;
  /** world placement (yaw-only rotation + position) */
  pos: Vec3;
  yaw: number;
  /** local rotations being solved (euler XYZ), bone name → e */
  rotations: Record<string, Vec3>;
}

interface FK {
  /** world affine per bone: 3×3 + translation */
  R: M3[];
  t: Vec3[];
  joints: Vec3[]; // world joint pivots
}

function fk(p: ParticipantState): FK {
  const n = p.rest.boneNames.length;
  const rootR = yawM3(p.yaw);
  const R: M3[] = [];
  const t: Vec3[] = [];
  const joints: Vec3[] = [];
  for (let b = 0; b < n; b++) {
    const e = p.rotations[p.rest.boneNames[b]] ?? [0, 0, 0];
    const Rl = eulerToM3(e as Vec3);
    const j: Vec3 = [p.rest.joints[b * 3], p.rest.joints[b * 3 + 1], p.rest.joints[b * 3 + 2]];
    // local affine: x → Rl(x − j) + j
    const par = p.rest.boneParent[b];
    let Rw: M3;
    let tw: Vec3;
    if (par < 0) {
      // root: object yaw+pos applied outermost: x → rootR(Rl(x−j)+j) + pos
      Rw = mulM3(rootR, Rl);
      const inner = add(scale(mulM3V(Rl, j), -1), j); // j − Rl·j
      tw = add(mulM3V(rootR, inner), p.pos);
    } else {
      Rw = mulM3(R[par], Rl);
      const inner = add(scale(mulM3V(Rl, j), -1), j);
      tw = add(mulM3V(R[par], inner), t[par]);
    }
    R.push(Rw);
    t.push(tw);
    joints.push(add(mulM3V(Rw, j), tw));
  }
  return { R, t, joints };
}

/** world position of a named landmark via its skin (matches mesh skinning) */
function landmarkWorld(p: ParticipantState, f: FK, name: string): Vec3 | null {
  const rest = p.rest.landmarks[name];
  const skin = p.rest.landmarkSkin[name];
  if (!rest || !skin) return null;
  let out: Vec3 = [0, 0, 0];
  for (let k = 0; k < 2; k++) {
    const w = skin.w[k];
    if (w < 1e-4) continue;
    const b = skin.b[k];
    out = add(out, scale(add(mulM3V(f.R[b], rest), f.t[b]), w));
  }
  return out;
}

// -------------------------------------------------------------- two-bone IK

const CHAINS = {
  armL: { upper: 'upperArmL', lower: 'forearmL', endLm: 'palmL' },
  armR: { upper: 'upperArmR', lower: 'forearmR', endLm: 'palmR' },
  legL: { upper: 'thighL', lower: 'shinL', endLm: 'toeL' },
  legR: { upper: 'thighR', lower: 'shinR', endLm: 'toeR' }
} as const;

/** Solve upper+lower locals so the chain's effector lands on `target` (world).
 *  Limb lengths come from the participant's actual rest skeleton. */
function solveTwoBone(
  p: ParticipantState,
  chainKey: keyof typeof CHAINS,
  effectorLm: string,
  target: Vec3
): void {
  const chain = CHAINS[chainKey];
  const bi = (n: string): number => p.rest.boneNames.indexOf(n);
  const iu = bi(chain.upper);
  const il = bi(chain.lower);
  const f = fk(p);
  const S = f.joints[iu];
  // effector offset beyond the lower joint (wrist→palm etc.), from rest pose
  const effRest = p.rest.landmarks[effectorLm];
  if (!effRest) return;
  const jl: Vec3 = [p.rest.joints[il * 3], p.rest.joints[il * 3 + 1], p.rest.joints[il * 3 + 2]];
  const ju: Vec3 = [p.rest.joints[iu * 3], p.rest.joints[iu * 3 + 1], p.rest.joints[iu * 3 + 2]];
  const L1 = len(sub(jl, ju));
  const L2 = len(sub(effRest, jl));
  if (L1 < 1e-4 || L2 < 1e-4) return;

  const toT = sub(target, S);
  const d = Math.min(Math.max(len(toT), Math.abs(L1 - L2) + 1e-3), L1 + L2 - 1e-3);
  const nDir = norm(toT);

  // elbow/knee hint: arms bend back-and-out, legs bend forward (character space)
  const rootR = yawM3(p.yaw);
  const isArm = chainKey.startsWith('arm');
  const hintLocal: Vec3 = isArm
    ? [chainKey === 'armL' ? 0.35 : -0.35, -0.25, -1]
    : [0, 0.25, 1];
  const hint = mulM3V(rootR, hintLocal);
  let m = sub(hint, scale(nDir, dot(hint, nDir)));
  if (len(m) < 1e-5) m = cross(nDir, [0, 1, 0]);
  m = norm(m);

  const cosA = (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d);
  const a = Math.acos(Math.min(1, Math.max(-1, cosA)));
  const mid = add(S, add(scale(nDir, L1 * Math.cos(a)), scale(m, L1 * Math.sin(a))));

  // desired world dirs for both segments
  const uDir = norm(sub(mid, S));
  const lDir = norm(sub(add(S, scale(nDir, d)), mid));

  // current rest directions transformed by the PARENT's world rotation
  const parentIdx = p.rest.boneParent[iu];
  const Rparent = parentIdx >= 0 ? f.R[parentIdx] : rootR;
  const uRestDir = norm(sub(jl, ju));
  const lRestDir = norm(sub(effRest, jl));

  // upper: local rotation such that Rparent·Rlocal maps uRestDir → uDir
  const RuWorldDesired = rotBetween(mulM3V(Rparent, uRestDir), uDir);
  const RuWorld = mulM3(RuWorldDesired, Rparent);
  const RuLocal = mulM3(transposeM3(Rparent), RuWorld);
  p.rotations[chain.upper] = m3ToEuler(RuLocal);

  // recompute with the new upper to get the lower's parent rotation
  const f2 = fk(p);
  const RupperWorld = f2.R[iu];
  const RlWorldDesired = rotBetween(mulM3V(RupperWorld, lRestDir), lDir);
  const RlWorld = mulM3(RlWorldDesired, RupperWorld);
  const RlLocal = mulM3(transposeM3(RupperWorld), RlWorld);
  p.rotations[chain.lower] = m3ToEuler(RlLocal);
}

/** total reach of a chain: both segments + effector offset, from rest bones */
function chainReach(p: ParticipantState, chainKey: keyof typeof CHAINS): number {
  const chain = CHAINS[chainKey];
  const bi = (n: string): number => p.rest.boneNames.indexOf(n);
  const iu = bi(chain.upper);
  const il = bi(chain.lower);
  const ju: Vec3 = [p.rest.joints[iu * 3], p.rest.joints[iu * 3 + 1], p.rest.joints[iu * 3 + 2]];
  const jl: Vec3 = [p.rest.joints[il * 3], p.rest.joints[il * 3 + 1], p.rest.joints[il * 3 + 2]];
  const eff = p.rest.landmarks[chain.endLm] ?? jl;
  return len(sub(jl, ju)) + len(sub(eff, jl));
}

/** world position of a chain's root joint (shoulder / hip socket) */
function chainOrigin(p: ParticipantState, f: FK, chainKey: keyof typeof CHAINS): Vec3 {
  const chain = CHAINS[chainKey];
  return f.joints[p.rest.boneNames.indexOf(chain.upper)];
}

/** Lean the spine toward an arm target that's below reach — a tall figure
 *  bends down to hug a small one. Accumulates gently, clamped. */
function spineAssist(
  p: ParticipantState,
  f: FK,
  chainKey: keyof typeof CHAINS,
  target: Vec3
): void {
  if (!chainKey.startsWith('arm')) return;
  const o = chainOrigin(p, f, chainKey);
  const reach = chainReach(p, chainKey);
  const need = len(sub(target, o));
  const short = need - reach;
  if (short < 0.02) return;
  const drop = o[1] - target[1];
  if (drop < 0.1) return; // only assist downward reaches
  const cur = p.rotations.spine ?? [0, 0, 0];
  const extra = Math.min(0.14, short * 0.6);
  const next = Math.min(0.55, cur[0] + extra);
  p.rotations.spine = [next, cur[1], cur[2]];
}

// ------------------------------------------------------------------- solver

export interface SolveResult {
  /** per participant: world pos, yaw, solved local rotations */
  placements: { pos: Vec3; yaw: number; rotations: Record<string, Vec3> }[];
  /** residual distance per contact after solving (m) */
  contactErrors: number[];
  /** worst residual torso-capsule overlap between participants (m, ≤0 clear) */
  maxPenetration: number;
}

const IK_LANDMARK_TO_CHAIN: Record<string, keyof typeof CHAINS> = {
  palmL: 'armL',
  palmR: 'armR',
  handTipL: 'armL',
  handTipR: 'armR',
  wristL: 'armL',
  wristR: 'armR',
  toeL: 'legL',
  toeR: 'legR',
  heelL: 'legL',
  heelR: 'legR'
};

export function solvePose(
  preset: PosePreset,
  rests: ParticipantRest[],
  anchor: { pos: Vec3; yaw: number }
): SolveResult {
  const n = Math.min(preset.participants, rests.length);
  const states: ParticipantState[] = [];

  // 1 ── place role frames from real body dimensions
  for (let i = 0; i < n; i++) {
    const role: RolePose = preset.roles[i] ?? preset.roles[0];
    let pos: Vec3;
    let yaw: number;
    if (i === 0 || !role.frame) {
      pos = [anchor.pos[0], 0, anchor.pos[2]];
      yaw = anchor.yaw;
    } else {
      const fr = role.frame;
      const D = fr.distanceScale * (rests[0].bodyRadius + rests[i].bodyRadius);
      const dirWorld = mulM3V(yawM3(anchor.yaw), norm([fr.dir[0], 0, fr.dir[2]]));
      pos = add([anchor.pos[0], 0, anchor.pos[2]], scale(dirWorld, D));
      const dirYaw = Math.atan2(dirWorld[0], dirWorld[2]);
      yaw = dirYaw + Math.PI + fr.faceYaw;
    }
    states.push({
      rest: rests[i],
      pos,
      yaw,
      rotations: Object.fromEntries(
        Object.entries(role.rotations).map(([k, v]) => [k, [...v] as Vec3])
      )
    });
  }

  const contacts = [...preset.contacts]
    .filter((c) => c.a.role < n && c.b.role < n)
    .sort((x, y) => x.priority - y.priority);

  const snapGround = (): void => {
    for (let i = 0; i < n; i++) {
      const role = preset.roles[i] ?? preset.roles[0];
      const p = states[i];
      const supports = role.grounded ?? ['footL', 'footR'];
      if (!supports.length) continue; // explicitly airborne/carried
      const f = fk(p);
      let minY = Infinity;
      for (const s of supports) {
        const lm =
          s === 'footL' ? 'heelL' : s === 'footR' ? 'heelR' : s === 'glutes' ? 'gluteApex' : s;
        const w = landmarkWorld(p, f, lm);
        if (w) minY = Math.min(minY, w[1]);
        if (s === 'footL' || s === 'footR') {
          const t = landmarkWorld(p, f, s === 'footL' ? 'toeL' : 'toeR');
          if (t) minY = Math.min(minY, t[1]);
        }
      }
      if (Number.isFinite(minY)) p.pos = [p.pos[0], p.pos[1] - minY, p.pos[2]];
      // safety clamp: no body part digs below the floor (raise only)
      const f2 = fk(p);
      let low = Infinity;
      for (const lm of ['heelL', 'heelR', 'toeL', 'toeR', 'kneeL', 'kneeR', 'gluteApex', 'palmL', 'palmR']) {
        const w = landmarkWorld(p, f2, lm);
        if (w) low = Math.min(low, w[1]);
      }
      if (Number.isFinite(low) && low < -0.02) {
        p.pos = [p.pos[0], p.pos[1] - low, p.pos[2]];
      }
    }
  };

  // 2 ── iterate: ground-settle → contact IK → collision separation …
  //      (grounded bodies settle FIRST so contacts target final heights)
  for (let iter = 0; iter < 7; iter++) {
    snapGround();
    // a limb chain solved by a higher-priority contact is claimed for the
    // rest of this iteration — later contacts must not hijack it
    const claimed = new Set<string>();
    for (const c of contacts) {
      const pa = states[c.a.role];
      const pb = states[c.b.role];
      const fa = fk(pa);
      const fb = fk(pb);
      // resolve target fallbacks: keep the authored landmark while the
      // reaching limb can actually get there, else the first reachable alt
      const lmA = c.a.landmark;
      const A = landmarkWorld(pa, fa, lmA);
      if (!A) continue;
      const chainForA = LANDMARK_CHAIN[lmA] ? IK_LANDMARK_TO_CHAIN[lmA] : undefined;
      const reach = chainForA ? chainReach(pa, chainForA) : Infinity;
      const shoulderW = chainForA ? chainOrigin(pa, fa, chainForA) : A;
      const candsB = [c.b.landmark, ...(c.b.alt ?? [])];
      let lmB = c.b.landmark;
      let B: Vec3 | null = null;
      let fallback: { lm: string; w: Vec3; d: number } | null = null;
      for (const lb of candsB) {
        const wb = landmarkWorld(pb, fb, lb);
        if (!wb) continue;
        const need = len(sub(wb, shoulderW));
        if (need <= reach * 0.97) {
          lmB = lb;
          B = wb;
          break;
        }
        if (!fallback || need < fallback.d) fallback = { lm: lb, w: wb, d: need };
      }
      if (!B && fallback) {
        lmB = fallback.lm;
        B = fallback.w;
      }
      if (!B) continue;
      const gapVec = sub(B, A);
      const dist = len(gapVec);
      const err = dist - c.gap;
      if (Math.abs(err) < 0.01) continue;

      let chainA = LANDMARK_CHAIN[lmA] ? IK_LANDMARK_TO_CHAIN[lmA] : undefined;
      let chainB = LANDMARK_CHAIN[lmB] ? IK_LANDMARK_TO_CHAIN[lmB] : undefined;
      if (chainA && claimed.has(`${c.a.role}:${chainA}`)) chainA = undefined;
      if (chainB && claimed.has(`${c.b.role}:${chainB}`)) chainB = undefined;
      if (chainA) claimed.add(`${c.a.role}:${chainA}`);
      if (chainB) claimed.add(`${c.b.role}:${chainB}`);

      if (chainA && chainB) {
        // meet in the middle — clamped into BOTH reach spheres so a tall and a
        // tiny body agree on a point both can actually touch
        let midPt = add(A, scale(gapVec, 0.5));
        const oA = chainOrigin(pa, fa, chainA);
        const oB = chainOrigin(pb, fb, chainB);
        const rA = chainReach(pa, chainA) * 0.97;
        const rB = chainReach(pb, chainB) * 0.97;
        for (let k = 0; k < 3; k++) {
          const dA = sub(midPt, oA);
          if (len(dA) > rA) midPt = add(oA, scale(norm(dA), rA));
          const dB = sub(midPt, oB);
          if (len(dB) > rB) midPt = add(oB, scale(norm(dB), rB));
        }
        solveTwoBone(pa, chainA, lmA, add(midPt, scale(norm(gapVec), -c.gap / 2)));
        solveTwoBone(pb, chainB, lmB, add(midPt, scale(norm(gapVec), c.gap / 2)));
      } else if (chainA) {
        solveTwoBone(pa, chainA, lmA, add(B, scale(norm(gapVec), -c.gap)));
        if (c.priority === 1) spineAssist(pa, fa, chainA, B);
      } else if (chainB) {
        solveTwoBone(pb, chainB, lmB, add(A, scale(norm(gapVec), c.gap)));
        if (c.priority === 1) spineAssist(pb, fb, chainB, A);
      }

      // priority-1 contacts may move roots when limbs alone can't close the gap
      if (c.priority === 1 && c.a.role !== c.b.role) {
        const fa2 = fk(pa);
        const fb2 = fk(pb);
        const A2 = landmarkWorld(pa, fa2, lmA)!;
        const B2 = landmarkWorld(pb, fb2, lmB)!;
        const errVec = sub(B2, A2);
        const remaining = len(errVec) - c.gap;
        if (remaining > 0.03) {
          const dir = norm(errVec);
          const step = Math.min(remaining, 0.3);
          const legA = chainA?.startsWith('leg');
          const legB = chainB?.startsWith('leg');
          if (legA) {
            // legs climb: full-3D root motion (flyer mounts a support)
            pa.pos = add(pa.pos, scale(dir, step * 0.9));
          } else if (legB) {
            pb.pos = sub(pb.pos, scale(dir, step * 0.9));
          } else {
            // arm/torso contacts close the gap horizontally
            const pull = scale([dir[0], 0, dir[2]], step * 0.5);
            pa.pos = add(pa.pos, pull);
            pb.pos = sub(pb.pos, pull);
          }
        }
      }
    }

    // 3 ── body-volume collision: torso capsules from the POSED pelvis/chest
    //      joints (a kneeling base and a mounted flyer don't falsely collide)
    const torsos = states.map((s) => {
      const f = fk(s);
      const pelvisJ = f.joints[s.rest.boneNames.indexOf('pelvis')];
      const chestJ = f.joints[s.rest.boneNames.indexOf('chest')];
      return {
        cx: (pelvisJ[0] + chestJ[0]) / 2,
        cz: (pelvisJ[2] + chestJ[2]) / 2,
        lo: Math.min(pelvisJ[1], chestJ[1]) - 0.08,
        hi: Math.max(pelvisJ[1], chestJ[1]) + 0.12
      };
    });
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const ti = torsos[i];
        const tj = torsos[j];
        if (ti.lo > tj.hi - 0.04 || tj.lo > ti.hi - 0.04) continue;
        const dx = tj.cx - ti.cx;
        const dz = tj.cz - ti.cz;
        const d = Math.hypot(dx, dz);
        const minD = (states[i].rest.bodyRadius + states[j].rest.bodyRadius) * 0.82;
        if (d < minD && d > 1e-5) {
          const push: Vec3 = [(dx / d) * ((minD - d) / 2), 0, (dz / d) * ((minD - d) / 2)];
          states[i].pos = sub(states[i].pos, push);
          states[j].pos = add(states[j].pos, push);
          torsos[i].cx -= push[0];
          torsos[i].cz -= push[2];
          torsos[j].cx += push[0];
          torsos[j].cz += push[2];
        }
      }
    }
  }

  // 4 ── final ground settle after the last contact pass
  snapGround();

  // 5 ── gaze: aim neck+head at the target
  for (let i = 0; i < n; i++) {
    const role = preset.roles[i] ?? preset.roles[0];
    if (!role.gaze) continue;
    const p = states[i];
    const f = fk(p);
    let targetPt: Vec3 | null = null;
    if ('role' in role.gaze && role.gaze.role < n) {
      const other = states[role.gaze.role];
      targetPt = landmarkWorld(other, fk(other), 'foreheadC');
    } else if ('forward' in role.gaze) {
      const head = landmarkWorld(p, f, 'foreheadC');
      if (head) targetPt = add(head, mulM3V(yawM3(p.yaw), role.gaze.forward));
    }
    if (!targetPt) continue;
    const head = landmarkWorld(p, f, 'foreheadC');
    if (!head) continue;
    const dir = norm(sub(targetPt, head));
    const local = mulM3V(transposeM3(yawM3(p.yaw)), dir);
    const yaw = Math.atan2(local[0], local[2]);
    const pitch = Math.atan2(local[1], Math.hypot(local[0], local[2]));
    const base = p.rotations.head ?? [0, 0, 0];
    p.rotations.head = [
      base[0] - Math.max(-0.6, Math.min(0.6, pitch)) * 0.7,
      base[1] + Math.max(-1.1, Math.min(1.1, yaw)) * 0.7,
      base[2]
    ];
  }

  // residuals for verification (fallback-aware: best candidate pair counts)
  const contactErrors = contacts.map((c) => {
    const pa = states[c.a.role];
    const pb = states[c.b.role];
    const fa = fk(pa);
    const fb = fk(pb);
    let best = Infinity;
    for (const la of [c.a.landmark, ...(c.a.alt ?? [])]) {
      const A = landmarkWorld(pa, fa, la);
      if (!A) continue;
      for (const lb of [c.b.landmark, ...(c.b.alt ?? [])]) {
        const B = landmarkWorld(pb, fb, lb);
        if (!B) continue;
        best = Math.min(best, Math.abs(len(sub(B, A)) - c.gap));
      }
    }
    return best;
  });

  // final interpenetration audit with the posed torso capsules
  let maxPenetration = -Infinity;
  const finalTorsos = states.map((s) => {
    const f = fk(s);
    const pelvisJ = f.joints[s.rest.boneNames.indexOf('pelvis')];
    const chestJ = f.joints[s.rest.boneNames.indexOf('chest')];
    return {
      cx: (pelvisJ[0] + chestJ[0]) / 2,
      cz: (pelvisJ[2] + chestJ[2]) / 2,
      lo: Math.min(pelvisJ[1], chestJ[1]) - 0.08,
      hi: Math.max(pelvisJ[1], chestJ[1]) + 0.12
    };
  });
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const ti = finalTorsos[i];
      const tj = finalTorsos[j];
      if (ti.lo > tj.hi - 0.04 || tj.lo > ti.hi - 0.04) continue;
      const d = Math.hypot(tj.cx - ti.cx, tj.cz - ti.cz);
      maxPenetration = Math.max(
        maxPenetration,
        (states[i].rest.bodyRadius + states[j].rest.bodyRadius) * 0.82 - d
      );
    }
  }
  if (!Number.isFinite(maxPenetration)) maxPenetration = 0;

  return {
    placements: states.map((s) => ({ pos: s.pos, yaw: s.yaw, rotations: s.rotations })),
    contactErrors,
    maxPenetration
  };
}

/** Torso-capsule interpenetration depth between two solved participants (m);
 *  ≤ 0 means clear. Used by the regression suite. */
export function torsoPenetration(a: ParticipantState, b: ParticipantState): number {
  const d = Math.hypot(b.pos[0] - a.pos[0], b.pos[2] - a.pos[2]);
  return (a.rest.bodyRadius + b.rest.bodyRadius) * 0.82 - d;
}

export { fk, landmarkWorld };
export type { FK };
