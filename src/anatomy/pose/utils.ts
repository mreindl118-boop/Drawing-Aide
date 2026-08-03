/** Pose preset transforms: mirroring, blending, role rotation. */
import type { PosePreset, RolePose, Vec3 } from './schema';

function mirrorName(n: string): string {
  if (n.endsWith('L')) return n.slice(0, -1) + 'R';
  if (n.endsWith('R')) return n.slice(0, -1) + 'L';
  return n;
}

/** Mirror across the character's X plane: euler [a,b,c] → [a,−b,−c] under the
 *  engine's Rz·Ry·Rx convention, with L/R bone + landmark swaps. */
export function mirrorPreset(p: PosePreset): PosePreset {
  const mirrorRole = (r: RolePose): RolePose => ({
    ...r,
    rotations: Object.fromEntries(
      Object.entries(r.rotations).map(([bone, e]) => [
        mirrorName(bone),
        [e[0], -e[1], -e[2]] as Vec3
      ])
    ),
    grounded: r.grounded.map(mirrorName),
    frame: r.frame
      ? { ...r.frame, dir: [-r.frame.dir[0], r.frame.dir[1], r.frame.dir[2]], faceYaw: -r.frame.faceYaw }
      : undefined,
    gaze: r.gaze && 'forward' in r.gaze
      ? { forward: [-r.gaze.forward[0], r.gaze.forward[1], r.gaze.forward[2]] }
      : r.gaze
  });
  return {
    ...p,
    id: `${p.id}_mirror`,
    roles: p.roles.map(mirrorRole),
    contacts: p.contacts.map((ct) => ({
      ...ct,
      a: { role: ct.a.role, landmark: mirrorName(ct.a.landmark) },
      b: { role: ct.b.role, landmark: mirrorName(ct.b.landmark) }
    }))
  };
}

// euler ↔ quat under q = qz·qy·qx
type Quat = [number, number, number, number]; // x y z w

function eulerToQuat(e: Vec3): Quat {
  const [x, y, z] = e;
  const cx = Math.cos(x / 2), sx = Math.sin(x / 2);
  const cy = Math.cos(y / 2), sy = Math.sin(y / 2);
  const cz = Math.cos(z / 2), sz = Math.sin(z / 2);
  // qz * qy * qx
  return [
    sx * cy * cz - cx * sy * sz,
    cx * sy * cz + sx * cy * sz,
    cx * cy * sz - sx * sy * cz,
    cx * cy * cz + sx * sy * sz
  ];
}

function quatToEuler(q: Quat): Vec3 {
  const [x, y, z, w] = q;
  const sinp = 2 * (w * y - z * x);
  const yy = Math.abs(sinp) >= 1 ? (Math.sign(sinp) * Math.PI) / 2 : Math.asin(sinp);
  return [
    Math.atan2(2 * (w * x + y * z), 1 - 2 * (x * x + y * y)),
    yy,
    Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z))
  ];
}

function slerp(a: Quat, b: Quat, t: number): Quat {
  let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
  const bb: Quat = d < 0 ? [-b[0], -b[1], -b[2], -b[3]] : [...b];
  if (d < 0) d = -d;
  if (d > 0.9995) {
    const o: Quat = [
      a[0] + (bb[0] - a[0]) * t,
      a[1] + (bb[1] - a[1]) * t,
      a[2] + (bb[2] - a[2]) * t,
      a[3] + (bb[3] - a[3]) * t
    ];
    const l = Math.hypot(...o) || 1;
    return o.map((v) => v / l) as Quat;
  }
  const th = Math.acos(d);
  const s = Math.sin(th);
  const wa = Math.sin((1 - t) * th) / s;
  const wb = Math.sin(t * th) / s;
  return [
    a[0] * wa + bb[0] * wb,
    a[1] * wa + bb[1] * wb,
    a[2] * wa + bb[2] * wb,
    a[3] * wa + bb[3] * wb
  ];
}

/** Blend two presets (rotations slerped, frames lerped; contacts and grounds
 *  switch at t = 0.5 — constraints don't interpolate). */
export function blendPosePresets(a: PosePreset, b: PosePreset, t: number): PosePreset {
  const n = Math.max(a.roles.length, b.roles.length);
  const roles: RolePose[] = [];
  for (let i = 0; i < n; i++) {
    const ra = a.roles[Math.min(i, a.roles.length - 1)];
    const rb = b.roles[Math.min(i, b.roles.length - 1)];
    const bones = new Set([...Object.keys(ra.rotations), ...Object.keys(rb.rotations)]);
    const rotations: Record<string, Vec3> = {};
    for (const bone of bones) {
      const qa = eulerToQuat(ra.rotations[bone] ?? [0, 0, 0]);
      const qb = eulerToQuat(rb.rotations[bone] ?? [0, 0, 0]);
      rotations[bone] = quatToEuler(slerp(qa, qb, t));
    }
    const src = t < 0.5 ? ra : rb;
    let frame = src.frame;
    if (ra.frame && rb.frame) {
      frame = {
        dir: [
          ra.frame.dir[0] + (rb.frame.dir[0] - ra.frame.dir[0]) * t,
          0,
          ra.frame.dir[2] + (rb.frame.dir[2] - ra.frame.dir[2]) * t
        ],
        distanceScale:
          ra.frame.distanceScale + (rb.frame.distanceScale - ra.frame.distanceScale) * t,
        faceYaw: ra.frame.faceYaw + (rb.frame.faceYaw - ra.frame.faceYaw) * t
      };
    }
    roles.push({ rotations, grounded: src.grounded, gaze: src.gaze, frame, tag: src.tag });
  }
  const src = t < 0.5 ? a : b;
  return {
    version: 1,
    id: `${a.id}_x_${b.id}`,
    name: `${a.name} × ${b.name}`,
    category: src.category,
    participants: Math.max(a.participants, b.participants),
    roles,
    contacts: src.contacts
  };
}

/** Rotate role assignment: participant list shifts by one. */
export function rotateIds<T>(ids: T[]): T[] {
  return ids.length < 2 ? ids : [...ids.slice(1), ids[0]];
}
