/** Save-as-preset: auto-extract a semantic pose preset from the live scene —
 *  rotations from each figure's pose, contact constraints from landmark pairs
 *  that are actually touching, role frames from relative placement normalized
 *  by body dimensions, ground contacts from supports near the floor. */
import type { PosePreset, PoseCategory, RolePose, Contact, Vec3 } from './schema';
import { LANDMARK_CHAIN } from './schema';
import { fk, landmarkWorld, type ParticipantRest, type ParticipantState } from './solver';
import { newId } from '../../core/types';

export interface ExtractInput {
  rest: ParticipantRest;
  pos: Vec3;
  yaw: number;
  rotations: Record<string, Vec3>;
}

const CONTACT_LANDMARKS = Object.keys(LANDMARK_CHAIN);
const CONTACT_THRESHOLD = 0.07;

export function extractPreset(
  participants: ExtractInput[],
  name: string,
  category: PoseCategory
): PosePreset {
  const states: ParticipantState[] = participants.map((p) => ({
    rest: p.rest,
    pos: p.pos,
    yaw: p.yaw,
    rotations: p.rotations
  }));
  const fks = states.map((s) => fk(s));

  // world landmark table
  const lms = states.map((s, i) => {
    const out: Record<string, Vec3> = {};
    for (const lm of CONTACT_LANDMARKS) {
      const w = landmarkWorld(s, fks[i], lm);
      if (w) out[lm] = w;
    }
    return out;
  });

  // contacts: cross-participant landmark pairs that are touching
  const contacts: Contact[] = [];
  for (let i = 0; i < states.length; i++) {
    for (let j = i + 1; j < states.length; j++) {
      const pairs: { a: string; b: string; d: number }[] = [];
      for (const [la, pa] of Object.entries(lms[i])) {
        for (const [lb, pb] of Object.entries(lms[j])) {
          const d = Math.hypot(pa[0] - pb[0], pa[1] - pb[1], pa[2] - pb[2]);
          if (d < CONTACT_THRESHOLD) pairs.push({ a: la, b: lb, d });
        }
      }
      // effector pairs first, then distance — and one contact per limb chain,
      // so an incidental face-near-hand proximity can't hijack a solved arm
      const chainOf = (lm: string): string | null => {
        const info = LANDMARK_CHAIN[lm];
        return info ? `${info.kind}${info.side}` : null;
      };
      pairs.sort((x, y) => {
        const cx = (chainOf(x.a) ? 1 : 0) + (chainOf(x.b) ? 1 : 0);
        const cy = (chainOf(y.a) ? 1 : 0) + (chainOf(y.b) ? 1 : 0);
        if (cx !== cy) return cy - cx;
        return x.d - y.d;
      });
      const usedChains = new Set<string>();
      const usedA = new Set<string>();
      const usedB = new Set<string>();
      for (const p of pairs) {
        if (usedA.has(p.a) || usedB.has(p.b)) continue;
        const ca = chainOf(p.a);
        const cb = chainOf(p.b);
        if (ca && usedChains.has(`${i}:${ca}`)) continue;
        if (cb && usedChains.has(`${j}:${cb}`)) continue;
        // pure body-to-body proximities must be genuinely touching
        if (!ca && !cb && p.d > 0.045) continue;
        if (ca) usedChains.add(`${i}:${ca}`);
        if (cb) usedChains.add(`${j}:${cb}`);
        usedA.add(p.a);
        usedB.add(p.b);
        contacts.push({
          a: { role: i, landmark: p.a },
          b: { role: j, landmark: p.b },
          gap: Math.round(p.d * 100) / 100,
          priority: contacts.length === 0 ? 1 : 2
        });
        if (contacts.length >= 6) break;
      }
    }
  }

  // roles: rotations + frames relative to the anchor + ground supports
  const anchor = states[0];
  const roles: RolePose[] = states.map((s, i) => {
    const grounded: string[] = [];
    const checks: [string, string][] = [
      ['footL', 'heelL'],
      ['footR', 'heelR'],
      ['kneeL', 'kneeL'],
      ['kneeR', 'kneeR'],
      ['glutes', 'gluteApex'],
      ['palmL', 'palmL'],
      ['palmR', 'palmR']
    ];
    for (const [support, lm] of checks) {
      const w = landmarkWorld(s, fks[i], lm);
      if (w && w[1] < 0.09) grounded.push(support);
    }
    // feet win over knees when both are low (standing)
    const g = grounded.includes('footL') || grounded.includes('footR')
      ? grounded.filter((x) => !x.startsWith('knee') || grounded.length <= 2)
      : grounded;

    const role: RolePose = {
      rotations: Object.fromEntries(
        Object.entries(s.rotations).map(([k, v]) => [k, [...v] as Vec3])
      ),
      grounded: g.length ? g : ['footL', 'footR'],
      gaze: null
    };
    if (i > 0) {
      const rel: Vec3 = [s.pos[0] - anchor.pos[0], 0, s.pos[2] - anchor.pos[2]];
      const D = Math.hypot(rel[0], rel[2]);
      const cy = Math.cos(-anchor.yaw);
      const sy = Math.sin(-anchor.yaw);
      const local: Vec3 = [rel[0] * cy - rel[2] * sy, 0, rel[0] * sy + rel[2] * cy];
      const dirYawWorld = Math.atan2(rel[0], rel[2]);
      role.frame = {
        dir: D > 1e-4 ? [local[0] / D, 0, local[2] / D] : [0, 0, 1],
        distanceScale: D / Math.max(0.05, anchor.rest.bodyRadius + s.rest.bodyRadius),
        faceYaw: normalizeAngle(s.yaw - (dirYawWorld + Math.PI))
      };
    }
    return role;
  });

  return {
    version: 1,
    id: `custom_${newId().slice(0, 8)}`,
    name,
    category,
    participants: states.length,
    roles,
    contacts
  };
}

function normalizeAngle(a: number): number {
  while (a > Math.PI) a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a;
}
