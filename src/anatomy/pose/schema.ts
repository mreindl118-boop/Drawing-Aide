/** Pose presets are SEMANTIC, never absolute: normalized local joint
 *  rotations (proportion-independent), contact constraints between named
 *  body landmarks, landmark-anchored role frames whose spacing derives from
 *  real body dimensions at apply time, gaze targets, and ground contacts.
 *  That is what lets one Warm Hug retarget from chibi × heroic to
 *  goblin × pin-up without manual fixing. */

export type Vec3 = [number, number, number];

export interface RoleFrame {
  /** horizontal direction from the anchor, in anchor-local space (+z = anchor's front) */
  dir: Vec3;
  /** distance = distanceScale × (anchorBodyRadius + selfBodyRadius) */
  distanceScale: number;
  /** yaw relative to "facing the anchor" (0 = face-to-face) */
  faceYaw: number;
}

export interface RolePose {
  /** normalized local joint rotations, euler XYZ radians on the shared rig */
  rotations: Record<string, Vec3>;
  /** planted supports: 'footL' | 'footR' | 'kneeL' | 'kneeR' | 'glutes' | 'palmL' | 'palmR' */
  grounded: string[];
  /** look at another participant's head, or along a fixed character-local dir */
  gaze?: { role: number } | { forward: Vec3 } | null;
  /** relative placement (absent on role 0 — the anchor) */
  frame?: RoleFrame;
  /** searchable role tag ('lifter', 'carried', …) — any character fits any role */
  tag?: string;
}

export interface ContactEnd {
  role: number;
  landmark: string;
  /** fallback landmarks when the primary is out of reach for this body combo
   *  (a chibi hugging a heroic torso lands on the waist, not the spine) */
  alt?: string[];
}

export interface Contact {
  a: ContactEnd;
  b: ContactEnd;
  /** desired gap in meters (0 = touching) */
  gap: number;
  /** 1 = highest: may pull participants together; ≥2 solve with limbs only */
  priority: number;
}

export type PoseCategory = 'solo' | 'duo' | 'trio' | 'nsfw';

export interface PosePreset {
  version: 1;
  id: string;
  name: string;
  category: PoseCategory;
  participants: number;
  roles: RolePose[];
  contacts: Contact[];
}

/** landmark → the limb chain that can reach it (IK), or null (root-driven) */
export const LANDMARK_CHAIN: Record<string, { side: 'L' | 'R'; kind: 'arm' | 'leg' } | null> = {
  palmL: { side: 'L', kind: 'arm' },
  palmR: { side: 'R', kind: 'arm' },
  handTipL: { side: 'L', kind: 'arm' },
  handTipR: { side: 'R', kind: 'arm' },
  wristL: { side: 'L', kind: 'arm' },
  wristR: { side: 'R', kind: 'arm' },
  toeL: { side: 'L', kind: 'leg' },
  toeR: { side: 'R', kind: 'leg' },
  heelL: { side: 'L', kind: 'leg' },
  heelR: { side: 'R', kind: 'leg' },
  kneeL: null,
  kneeR: null,
  foreheadC: null,
  chestC: null,
  backC: null,
  shoulderTipL: null,
  shoulderTipR: null,
  crown: null,
  gluteApex: null,
  hipSideL: null,
  hipSideR: null,
  earL: null,
  earR: null,
  mouth: null,
  bellyFront: null
};

export function serializePresets(presets: PosePreset[]): string {
  return JSON.stringify({ sculptpadPoses: 1, presets }, null, 2);
}

export function parsePresets(json: string): PosePreset[] {
  const data = JSON.parse(json);
  const list = Array.isArray(data) ? data : data.presets;
  if (!Array.isArray(list)) throw new Error('not a pose library file');
  return list.filter(
    (p): p is PosePreset =>
      p && typeof p.name === 'string' && Array.isArray(p.roles) && Array.isArray(p.contacts)
  );
}
