/** The shipped pose library: 20 solo · 20 duo · 10 trio+, all SFW.
 *  Authored compositionally on the canonical rig; retargeting handles every
 *  body. The NSFW category ships EMPTY by design — it is populated only by
 *  user-authored presets through the save-as-preset flow.
 *
 *  Conventions (character faces +z, y up):
 *   upperArm z± = raise out to the side · x− = raise forward
 *   thigh x− = raise forward · shin x+ = bend knee · spine x+ = lean forward
 */
import type { PosePreset, RolePose, Vec3, Contact } from './schema';

const D = Math.PI / 180;
const deg = (x: number, y: number, z: number): Vec3 => [x * D, y * D, z * D];

type Rot = Record<string, Vec3>;

// ---- reusable building blocks --------------------------------------------

const relaxedArms: Rot = {
  upperArmL: deg(-4, 0, -12),
  upperArmR: deg(-4, 0, 12),
  forearmL: deg(-8, 0, 0),
  forearmR: deg(-8, 0, 0)
};

const stand: Rot = { ...relaxedArms };

const sitFloor: Rot = {
  // shins tuck back under the thighs so heels stay at floor level
  thighL: deg(-82, 0, 28),
  thighR: deg(-82, 0, -28),
  shinL: deg(146, 0, 0),
  shinR: deg(146, 0, 0),
  spine: deg(6, 0, 0),
  ...relaxedArms
};

const kneelOne: Rot = {
  // right knee down, left foot planted forward
  thighL: deg(-88, 0, 6),
  shinL: deg(88, 0, 0),
  thighR: deg(-12, 0, -6),
  shinR: deg(112, 0, 0),
  spine: deg(6, 0, 0),
  ...relaxedArms
};

function solo(
  id: string,
  name: string,
  rotations: Rot,
  opts: Partial<RolePose> & { contacts?: Contact[] } = {}
): PosePreset {
  const { contacts = [], ...role } = opts;
  return {
    version: 1,
    id,
    name,
    category: 'solo',
    participants: 1,
    roles: [{ rotations, grounded: role.grounded ?? ['footL', 'footR'], gaze: role.gaze ?? null, tag: role.tag }],
    contacts
  };
}

function multi(
  id: string,
  name: string,
  category: 'duo' | 'trio',
  roles: RolePose[],
  contacts: Contact[]
): PosePreset {
  return { version: 1, id, name, category, participants: roles.length, roles, contacts };
}

const face = (dx: number, dz: number, dist: number, faceYaw = 0): RolePose['frame'] => ({
  dir: [dx, 0, dz],
  distanceScale: dist,
  faceYaw
});

const c = (
  roleA: number,
  lmA: string,
  roleB: number,
  lmB: string,
  gap = 0.02,
  priority = 1
): Contact => ({ a: { role: roleA, landmark: lmA }, b: { role: roleB, landmark: lmB }, gap, priority });

// ---- solo (20) ------------------------------------------------------------

export const SOLO_POSES: PosePreset[] = [
  solo('idle_relaxed', 'Idle Relaxed', { ...stand, head: deg(2, 4, 0), spine: deg(2, 0, 2) }),
  solo('contrapposto', 'Confident Contrapposto', {
    ...relaxedArms,
    pelvis: deg(0, 0, 6),
    spine: deg(0, 8, -7),
    chest: deg(0, 5, -3),
    head: deg(0, -10, 3),
    thighR: deg(-8, 0, -7),
    shinR: deg(16, 0, 0)
  }),
  solo(
    'hero_landing',
    'Hero Landing',
    {
      thighL: deg(-96, 0, 22),
      shinL: deg(112, 0, 0),
      thighR: deg(-18, 0, -14),
      shinR: deg(96, 0, 0),
      spine: deg(26, 0, 0),
      chest: deg(10, 0, 0),
      head: deg(-26, 0, 0),
      upperArmL: deg(-30, 0, 55),
      upperArmR: deg(-8, 0, 30),
      forearmR: deg(-15, 0, 0)
    },
    { grounded: ['footL', 'kneeR', 'palmR'] }
  ),
  solo('sprint', 'Sprint Mid-Stride', {
    spine: deg(18, 0, 0),
    thighL: deg(-70, 0, 4),
    shinL: deg(55, 0, 0),
    thighR: deg(30, 0, -4),
    shinR: deg(85, 0, 0),
    upperArmL: deg(35, 0, -8),
    forearmL: deg(-95, 0, 0),
    upperArmR: deg(-45, 0, 8),
    forearmR: deg(-80, 0, 0),
    head: deg(-12, 0, 0)
  }, { grounded: ['footR'] }),
  solo('walk_key', 'Walk Cycle Key', {
    spine: deg(4, 0, 0),
    thighL: deg(-24, 0, 2),
    thighR: deg(14, 0, -2),
    shinR: deg(22, 0, 0),
    upperArmL: deg(14, 0, -8),
    upperArmR: deg(-16, 0, 8),
    forearmR: deg(-24, 0, 0)
  }),
  solo('crouch_ready', 'Crouch Ready', {
    thighL: deg(-95, 0, 20),
    thighR: deg(-95, 0, -20),
    shinL: deg(118, 0, 0),
    shinR: deg(118, 0, 0),
    spine: deg(24, 0, 0),
    head: deg(-20, 0, 0),
    upperArmL: deg(-24, 0, 18),
    upperArmR: deg(-24, 0, -18),
    forearmL: deg(-40, 0, 0),
    forearmR: deg(-40, 0, 0)
  }),
  solo('sit_casual', 'Sitting Casual', {
    ...sitFloor,
    thighL: deg(-84, 0, 20),
    thighR: deg(-80, 0, -26),
    spine: deg(-4, 0, 0),
    upperArmL: deg(-16, 0, -6),
    forearmL: deg(-30, 0, 0)
  }, { grounded: ['glutes'] }),
  solo('floor_crossleg', 'Floor Cross-Legged', {
    thighL: deg(-78, 34, 52),
    thighR: deg(-78, -34, -52),
    shinL: deg(148, 0, 24),
    shinR: deg(148, 0, -24),
    spine: deg(4, 0, 0),
    ...relaxedArms
  }, { grounded: ['glutes'] }),
  solo('kneel_one', 'Kneel One-Knee', kneelOne, { grounded: ['footL', 'kneeR'] }),
  solo('jump_apex', 'Jump Apex', {
    thighL: deg(-58, 0, 10),
    shinL: deg(85, 0, 0),
    thighR: deg(-40, 0, -10),
    shinR: deg(70, 0, 0),
    spine: deg(-6, 0, 0),
    upperArmL: deg(0, 0, 135),
    upperArmR: deg(0, 0, -135),
    forearmL: deg(0, 0, 15),
    forearmR: deg(0, 0, -15),
    head: deg(-8, 0, 0)
  }, { grounded: [] }),
  solo('lotus', 'Meditation Lotus', {
    thighL: deg(-80, 42, 58),
    thighR: deg(-80, -42, -58),
    shinL: deg(150, 0, 30),
    shinR: deg(150, 0, -30),
    spine: deg(-2, 0, 0),
    upperArmL: deg(-18, 0, -14),
    upperArmR: deg(-18, 0, 14),
    forearmL: deg(-52, 18, 0),
    forearmR: deg(-52, -18, 0),
    head: deg(6, 0, 0)
  }, { grounded: ['glutes'] }),
  solo('wall_lean', 'Wall Lean', {
    spine: deg(-7, 0, 3),
    pelvis: deg(4, 0, -3),
    thighL: deg(-14, 0, 4),
    shinL: deg(20, 0, 0),
    upperArmL: deg(0, 0, -8),
    upperArmR: deg(-6, 0, 14),
    forearmR: deg(-70, 0, 0),
    head: deg(0, 14, 0)
  }),
  solo('arms_crossed', 'Arms-Crossed Guard', {
    upperArmL: deg(-38, 24, -18),
    forearmL: deg(-92, 38, 0),
    upperArmR: deg(-38, -24, 18),
    forearmR: deg(-92, -38, 0),
    spine: deg(-4, 0, 0),
    head: deg(-4, 0, 0)
  }, {
    contacts: [c(0, 'wristL', 0, 'wristR', 0.04, 2)]
  }),
  solo('phone_slouch', 'Phone Slouch', {
    spine: deg(16, 0, 0),
    chest: deg(10, 0, 0),
    head: deg(28, 0, 0),
    upperArmL: deg(-30, -18, -6),
    forearmL: deg(-108, 22, 0),
    upperArmR: deg(-26, 14, 8),
    forearmR: deg(-112, -20, 0)
  }),
  solo('victory', 'Victory Cheer', {
    upperArmL: deg(-18, 0, 150),
    upperArmR: deg(-18, 0, -150),
    forearmL: deg(0, 0, 20),
    forearmR: deg(0, 0, -20),
    spine: deg(-8, 0, 0),
    head: deg(-14, 0, 0),
    thighL: deg(-8, 0, 8)
  }),
  solo('defeated', 'Defeated Slump', {
    spine: deg(28, 0, 0),
    chest: deg(14, 0, 0),
    head: deg(34, 0, 0),
    thighL: deg(-10, 0, 6),
    shinL: deg(14, 0, 0),
    thighR: deg(-10, 0, -6),
    shinR: deg(14, 0, 0),
    upperArmL: deg(4, 0, -4),
    upperArmR: deg(4, 0, 4)
  }),
  solo('thinker', 'Thinker Chin-Rest', {
    ...sitFloor,
    spine: deg(18, 0, 0),
    head: deg(10, 6, 0),
    upperArmR: deg(-38, -16, 10),
    forearmR: deg(-118, -8, 0),
    upperArmL: deg(-14, 0, -8),
    forearmL: deg(-40, 0, 0)
  }, {
    grounded: ['glutes'],
    contacts: [c(0, 'palmR', 0, 'chin', 0.03, 2)]
  }),
  solo('bow', 'Formal Bow', {
    spine: deg(52, 0, 0),
    chest: deg(14, 0, 0),
    head: deg(10, 0, 0),
    upperArmL: deg(6, 0, -10),
    upperArmR: deg(6, 0, 10)
  }),
  solo('salute', 'Salute', {
    spine: deg(-3, 0, 0),
    upperArmR: deg(-18, -30, -78),
    forearmR: deg(-118, -34, 0),
    upperArmL: deg(0, 0, -6),
    head: deg(-2, 0, 0)
  }, {
    contacts: [c(0, 'palmR', 0, 'browR', 0.04, 2)]
  }),
  solo('stretch', 'Overhead Stretch', {
    upperArmL: deg(-8, 0, 168),
    upperArmR: deg(-8, 0, -168),
    forearmL: deg(0, 0, 6),
    forearmR: deg(0, 0, -6),
    spine: deg(-10, 0, 4),
    chest: deg(-4, 0, 2),
    head: deg(-12, 0, 0)
  })
];

// ---- duo (20) -------------------------------------------------------------

const standRole = (extra: Rot = {}, opts: Partial<RolePose> = {}): RolePose => ({
  rotations: { ...stand, ...extra },
  grounded: opts.grounded ?? ['footL', 'footR'],
  gaze: opts.gaze,
  frame: opts.frame,
  tag: opts.tag
});

export const DUO_POSES: PosePreset[] = [
  multi('handshake', 'Handshake', 'duo', [
    standRole({}, { gaze: { role: 1 } }),
    standRole({}, { gaze: { role: 0 }, frame: face(0, 1, 1.15) })
  ], [c(0, 'palmR', 1, 'palmR', 0.015, 1)]),

  multi('high_five', 'High-Five', 'duo', [
    standRole({ upperArmR: deg(-95, 0, -55), forearmR: deg(-20, 0, 0) }, { gaze: { role: 1 } }),
    standRole({ upperArmR: deg(-95, 0, -55), forearmR: deg(-20, 0, 0) }, { gaze: { role: 0 }, frame: face(0, 1, 1.25) })
  ], [c(0, 'palmR', 1, 'palmR', 0.01, 1)]),

  multi('fist_bump', 'Fist Bump', 'duo', [
    standRole({}, { gaze: { role: 1 } }),
    standRole({}, { gaze: { role: 0 }, frame: face(0, 1, 1.2) })
  ], [c(0, 'handTipR', 1, 'handTipR', 0.01, 1)]),

  multi('warm_hug', 'Warm Hug', 'duo', [
    standRole({ head: deg(4, 10, 0) }, { tag: 'hugger' }),
    standRole({ head: deg(4, -10, 0) }, { frame: face(0, 1, 0.62), tag: 'hugged' })
  ], [
    // target fallbacks let a short-armed hugger land on the waist/shoulder
    // instead of wrapping to the spine — how a chibi hugs a heroic torso
    { a: { role: 0, landmark: 'palmL' }, b: { role: 1, landmark: 'backC', alt: ['waistSideR', 'hipSideR'] }, gap: 0.02, priority: 1 },
    { a: { role: 0, landmark: 'palmR' }, b: { role: 1, landmark: 'backC', alt: ['waistSideL', 'hipSideL'] }, gap: 0.02, priority: 1 },
    { a: { role: 1, landmark: 'palmL' }, b: { role: 0, landmark: 'backC', alt: ['waistSideR', 'shoulderTipR'] }, gap: 0.02, priority: 1 },
    { a: { role: 1, landmark: 'palmR' }, b: { role: 0, landmark: 'backC', alt: ['waistSideL', 'shoulderTipL'] }, gap: 0.02, priority: 1 }
  ]),

  multi('lift_spin_hug', 'Lift-and-Spin Hug', 'duo', [
    standRole({ spine: deg(-8, 0, 0) }, { tag: 'lifter' }),
    standRole(
      { thighL: deg(-30, 0, 10), shinL: deg(40, 0, 0), thighR: deg(-24, 0, -10), shinR: deg(46, 0, 0), spine: deg(6, 0, 0) },
      { frame: face(0, 1, 0.5), grounded: [], tag: 'lifted' }
    )
  ], [
    c(0, 'palmL', 1, 'hipSideL', 0.02, 1),
    c(0, 'palmR', 1, 'hipSideR', 0.02, 1),
    c(1, 'palmL', 0, 'shoulderTipL', 0.03, 2),
    c(1, 'palmR', 0, 'shoulderTipR', 0.03, 2)
  ]),

  multi('forehead_touch', 'Forehead Touch', 'duo', [
    standRole({ head: deg(14, 0, 0), spine: deg(4, 0, 0) }),
    standRole({ head: deg(14, 0, 0), spine: deg(4, 0, 0) }, { frame: face(0, 1, 0.72) })
  ], [
    c(0, 'foreheadC', 1, 'foreheadC', 0.015, 1),
    c(0, 'palmR', 1, 'shoulderTipL', 0.03, 2),
    c(1, 'palmR', 0, 'shoulderTipL', 0.03, 2)
  ]),

  multi('slow_dance', 'Slow-Dance Frame', 'duo', [
    standRole({ head: deg(0, 8, 0) }, { gaze: { role: 1 }, tag: 'lead' }),
    standRole({ head: deg(0, -8, 0) }, { gaze: { role: 0 }, frame: face(0, 1, 0.72), tag: 'follow' })
  ], [
    c(0, 'palmR', 1, 'waistSideL', 0.02, 1),
    c(1, 'palmL', 0, 'shoulderTipR', 0.02, 1),
    c(0, 'palmL', 1, 'palmR', 0.015, 2)
  ]),

  multi('dance_dip', 'Dance Dip', 'duo', [
    standRole({ spine: deg(14, 0, 0), thighL: deg(-28, 0, 6), shinL: deg(36, 0, 0) }, { tag: 'lead' }),
    standRole(
      { spine: deg(-34, 0, 0), chest: deg(-12, 0, 0), head: deg(-16, 0, 0), thighR: deg(-24, 0, -8), shinR: deg(30, 0, 0) },
      { frame: face(0, 1, 0.6), grounded: ['footL'], tag: 'dipped' }
    )
  ], [
    c(0, 'palmR', 1, 'backC', 0.02, 1),
    c(0, 'palmL', 1, 'palmR', 0.02, 2)
  ]),

  multi('tango_hold', 'Tango Hold', 'duo', [
    standRole({ spine: deg(0, 10, 0), head: deg(0, 24, 0) }, { tag: 'lead' }),
    standRole({ spine: deg(0, -10, 0), head: deg(0, -24, 0) }, { frame: face(0.25, 1, 0.68) })
  ], [
    c(0, 'palmR', 1, 'backC', 0.02, 1),
    c(1, 'palmL', 0, 'shoulderTipR', 0.02, 2),
    c(0, 'palmL', 1, 'palmR', 0.015, 1)
  ]),

  multi('piggyback', 'Piggyback', 'duo', [
    standRole({ spine: deg(18, 0, 0), upperArmL: deg(-30, 16, -20), forearmL: deg(-70, 0, 0), upperArmR: deg(-30, -16, 20), forearmR: deg(-70, 0, 0) }, { tag: 'carrier' }),
    standRole(
      { thighL: deg(-82, 0, 26), shinL: deg(70, 0, 0), thighR: deg(-82, 0, -26), shinR: deg(70, 0, 0), spine: deg(12, 0, 0) },
      { frame: face(0, -1, 0.34, Math.PI), grounded: [], tag: 'carried' }
    )
  ], [
    c(1, 'palmL', 0, 'shoulderTipL', 0.02, 1),
    c(1, 'palmR', 0, 'shoulderTipR', 0.02, 1)
  ]),

  multi('shoulder_carry', 'Shoulder Carry', 'duo', [
    standRole({ upperArmR: deg(-60, 0, -30), forearmR: deg(-45, 0, 0) }, { tag: 'carrier' }),
    standRole(
      { ...sitFloor, spine: deg(-4, 0, 0) },
      { frame: face(0, -1, 0.2, Math.PI), grounded: [], tag: 'carried' }
    )
  ], [c(1, 'palmR', 0, 'crown', 0.04, 2)]),

  multi('bridal_carry', 'Bridal Carry', 'duo', [
    standRole({ spine: deg(6, 0, 0), upperArmL: deg(-52, 20, -14), forearmL: deg(-60, 0, 0), upperArmR: deg(-48, -22, 14), forearmR: deg(-64, 0, 0) }, { tag: 'carrier' }),
    standRole(
      { thighL: deg(-70, 0, 8), shinL: deg(48, 0, 0), thighR: deg(-64, 0, -8), shinR: deg(52, 0, 0), spine: deg(10, 0, 6) },
      { frame: face(0.9, 0.45, 0.5, -Math.PI / 2), grounded: [], gaze: { role: 0 }, tag: 'carried' }
    )
  ], [c(1, 'palmR', 0, 'shoulderTipL', 0.03, 1)]),

  multi('back_to_back', 'Back-to-Back Heroes', 'duo', [
    standRole({ upperArmL: deg(-30, 0, 40), upperArmR: deg(-30, 0, -40), forearmL: deg(-60, 0, 0), forearmR: deg(-60, 0, 0) }),
    standRole(
      { upperArmL: deg(-30, 0, 40), upperArmR: deg(-30, 0, -40), forearmL: deg(-60, 0, 0), forearmR: deg(-60, 0, 0) },
      { frame: face(0, -1, 0.3, Math.PI) }
    )
  ], [c(0, 'backC', 1, 'backC', 0.04, 1)]),

  multi('sparring', 'Sparring Guard vs Jab', 'duo', [
    standRole(
      { spine: deg(8, -14, 0), thighL: deg(-16, 0, 4), thighR: deg(10, 0, -4), shinR: deg(18, 0, 0), upperArmL: deg(-40, 22, -8), forearmL: deg(-100, 10, 0), upperArmR: deg(-88, 0, 6), forearmR: deg(-8, 0, 0) },
      { tag: 'jabber' }
    ),
    standRole(
      { spine: deg(10, 10, 0), upperArmL: deg(-52, 26, -4), forearmL: deg(-110, 14, 0), upperArmR: deg(-52, -26, 4), forearmR: deg(-110, -14, 0), head: deg(6, 0, 0) },
      { frame: face(0, 1, 1.05), tag: 'guard' }
    )
  ], [c(0, 'handTipR', 1, 'foreheadC', 0.18, 2)]),

  multi('sword_clash', 'Sword Clash Lock', 'duo', [
    standRole({ spine: deg(12, 0, 0), thighL: deg(-24, 0, 6), shinL: deg(30, 0, 0), upperArmL: deg(-70, 20, -10), forearmL: deg(-40, 0, 0), upperArmR: deg(-70, -20, 10), forearmR: deg(-40, 0, 0) }),
    standRole(
      { spine: deg(12, 0, 0), thighL: deg(-24, 0, 6), shinL: deg(30, 0, 0), upperArmL: deg(-70, 20, -10), forearmL: deg(-40, 0, 0), upperArmR: deg(-70, -20, 10), forearmR: deg(-40, 0, 0) },
      { frame: face(0, 1, 1.0) }
    )
  ], [c(0, 'handTipR', 1, 'handTipR', 0.06, 1)]),

  multi('hand_in_hand', 'Hand-in-Hand Walk', 'duo', [
    standRole({ thighL: deg(-18, 0, 2), thighR: deg(10, 0, -2), shinR: deg(16, 0, 0) }),
    standRole(
      { thighL: deg(-18, 0, 2), thighR: deg(10, 0, -2), shinR: deg(16, 0, 0) },
      { frame: face(1, 0, 0.95, Math.PI) }
    )
  ], [c(0, 'palmL', 1, 'palmR', 0.01, 1)]),

  multi('whisper', 'Whisper Secret', 'duo', [
    standRole({ spine: deg(8, 14, 0), head: deg(4, 22, 0), upperArmR: deg(-46, -24, 6), forearmR: deg(-96, -20, 0) }, { tag: 'whisperer' }),
    standRole({ head: deg(0, -18, 4) }, { frame: face(0.75, 0.65, 0.72, Math.PI / 3) })
  ], [c(0, 'palmR', 1, 'earL', 0.05, 1)]),

  multi('toast_clink', 'Toast Clink', 'duo', [
    standRole({ upperArmR: deg(-58, -12, -8), forearmR: deg(-72, 0, 0), head: deg(-4, 6, 0) }, { gaze: { role: 1 } }),
    standRole({ upperArmR: deg(-58, -12, -8), forearmR: deg(-72, 0, 0), head: deg(-4, 6, 0) }, { gaze: { role: 0 }, frame: face(0, 1, 1.0) })
  ], [c(0, 'handTipR', 1, 'handTipR', 0.05, 1)]),

  multi('helping_up', 'Helping Hand Up', 'duo', [
    standRole({ spine: deg(18, 0, 0), thighL: deg(-16, 0, 4), shinL: deg(22, 0, 0) }, { tag: 'helper' }),
    standRole(
      { ...sitFloor, spine: deg(14, 0, 0), upperArmR: deg(-70, 0, 6), forearmR: deg(-16, 0, 0) },
      { frame: face(0, 1, 0.95), grounded: ['glutes'], tag: 'helped' }
    )
  ], [c(0, 'palmR', 1, 'palmR', 0.01, 1)]),

  multi('tender_kiss', 'Tender Kiss', 'duo', [
    standRole({ head: deg(8, 0, 6), spine: deg(3, 0, 0) }),
    standRole({ head: deg(8, 0, -6), spine: deg(3, 0, 0) }, { frame: face(0, 1, 0.66) })
  ], [
    c(0, 'mouth', 1, 'mouth', 0.02, 1),
    c(0, 'palmR', 1, 'waistSideL', 0.03, 2),
    c(1, 'palmL', 0, 'shoulderTipR', 0.03, 2)
  ])
];

// ---- trio+ (10) -----------------------------------------------------------

export const TRIO_POSES: PosePreset[] = [
  multi('huddle', 'Group Huddle', 'trio', [
    standRole({ spine: deg(14, 0, 0), head: deg(12, 0, 0) }),
    standRole({ spine: deg(14, 0, 0), head: deg(12, 0, 0) }, { frame: face(0.87, 0.5, 0.85, 0) }),
    standRole({ spine: deg(14, 0, 0), head: deg(12, 0, 0) }, { frame: face(-0.87, 0.5, 0.85, 0) })
  ], [
    c(0, 'palmR', 1, 'shoulderTipL', 0.03, 1),
    c(1, 'palmR', 2, 'shoulderTipL', 0.03, 1),
    c(2, 'palmR', 0, 'shoulderTipL', 0.03, 1)
  ]),

  multi('album_cover', 'Band Album Cover', 'trio', [
    standRole({ ...SOLO_POSES[1].roles[0].rotations }),
    standRole({ upperArmL: deg(-8, 0, -14), head: deg(0, 12, 0) }, { frame: face(1, 0.1, 0.9, Math.PI * 0.12) }),
    standRole({ ...stand, head: deg(0, -12, 0) }, { frame: face(-1, 0.1, 0.9, -Math.PI * 0.12) })
  ], []),

  multi('triple_high_five', 'Triple High-Five', 'trio', [
    standRole({ upperArmR: deg(-120, 0, -35), forearmR: deg(-12, 0, 0), head: deg(-14, 0, 0) }),
    standRole({ upperArmR: deg(-120, 0, -35), forearmR: deg(-12, 0, 0), head: deg(-14, 0, 0) }, { frame: face(0.87, 0.5, 1.0, 0) }),
    standRole({ upperArmR: deg(-120, 0, -35), forearmR: deg(-12, 0, 0), head: deg(-14, 0, 0) }, { frame: face(-0.87, 0.5, 1.0, 0) })
  ], [
    c(0, 'palmR', 1, 'palmR', 0.05, 1),
    c(1, 'palmR', 2, 'palmR', 0.05, 1)
  ]),

  multi('campfire', 'Campfire Circle', 'trio', [
    { rotations: { ...sitFloor }, grounded: ['glutes'] },
    { rotations: { ...sitFloor }, grounded: ['glutes'], frame: face(0.87, 0.5, 1.6, 0) },
    { rotations: { ...sitFloor }, grounded: ['glutes'], frame: face(-0.87, 0.5, 1.6, 0) }
  ], []),

  multi('podium', 'Victory Podium', 'trio', [
    standRole({ ...SOLO_POSES[14].roles[0].rotations }, { tag: 'first' }),
    standRole({ ...stand, upperArmR: deg(-18, 0, -12) }, { frame: face(1, 0, 1.15, Math.PI * 0.05), tag: 'second' }),
    standRole({ ...stand, head: deg(4, 8, 0) }, { frame: face(-1, 0, 1.15, -Math.PI * 0.05), tag: 'third' })
  ], []),

  multi('triangle', 'Back-to-Back Triangle', 'trio', [
    standRole({ upperArmL: deg(-40, 0, 30), upperArmR: deg(-40, 0, -30), forearmL: deg(-70, 0, 0), forearmR: deg(-70, 0, 0) }),
    standRole({ upperArmL: deg(-40, 0, 30), upperArmR: deg(-40, 0, -30), forearmL: deg(-70, 0, 0), forearmR: deg(-70, 0, 0) }, { frame: face(0.87, -0.5, 0.38, Math.PI) }),
    standRole({ upperArmL: deg(-40, 0, 30), upperArmR: deg(-40, 0, -30), forearmL: deg(-70, 0, 0), forearmR: deg(-70, 0, 0) }, { frame: face(-0.87, -0.5, 0.38, Math.PI) })
  ], [
    c(0, 'backC', 1, 'backC', 0.12, 2),
    c(0, 'backC', 2, 'backC', 0.12, 2)
  ]),

  multi('selfie', 'Group Selfie', 'trio', [
    standRole({ upperArmR: deg(-115, -20, -20), forearmR: deg(-10, 0, 0), head: deg(-10, 6, 0) }, { tag: 'holder' }),
    standRole({ spine: deg(4, 10, 0), head: deg(-6, 14, 0) }, { frame: face(1, 0.15, 0.72, Math.PI * 0.08) }),
    standRole({ spine: deg(4, -10, 0), head: deg(-6, -14, 0) }, { frame: face(-1, 0.15, 0.72, -Math.PI * 0.08) })
  ], [
    c(1, 'palmL', 0, 'shoulderTipR', 0.04, 2),
    c(2, 'palmR', 0, 'shoulderTipL', 0.04, 2)
  ]),

  multi('charge_wedge', 'Team Charge Wedge', 'trio', [
    standRole({ ...SOLO_POSES[3].roles[0].rotations }, { grounded: ['footR'], tag: 'point' }),
    standRole({ ...SOLO_POSES[3].roles[0].rotations }, { grounded: ['footR'], frame: face(0.85, -0.7, 1.3, Math.PI) }),
    standRole({ ...SOLO_POSES[3].roles[0].rotations }, { grounded: ['footR'], frame: face(-0.85, -0.7, 1.3, Math.PI) })
  ], []),

  multi('council', 'Council Debate', 'trio', [
    standRole({ upperArmR: deg(-64, 0, 4), forearmR: deg(-30, 0, 0), head: deg(-4, 0, 0) }, { tag: 'speaker' }),
    standRole({ ...SOLO_POSES[12].roles[0].rotations }, { frame: face(0.87, 0.55, 1.25, 0), gaze: { role: 0 } }),
    standRole({ ...SOLO_POSES[16].roles[0].rotations }, { frame: face(-0.87, 0.55, 1.25, 0), gaze: { role: 0 }, grounded: ['glutes'] })
  ], []),

  multi('pyramid_base', 'Cheer Pyramid Base', 'trio', [
    // two all-fours bases side by side (thighs vertical, shins folded back —
    // ground snap drops the root so knees land at the floor), one flyer on top
    { rotations: { thighL: deg(-6, 0, 8), shinL: deg(92, 0, 0), thighR: deg(-6, 0, -8), shinR: deg(92, 0, 0), spine: deg(62, 0, 0), chest: deg(14, 0, 0), head: deg(-34, 0, 0), upperArmL: deg(-56, 0, -6), forearmL: deg(-10, 0, 0), upperArmR: deg(-56, 0, 6), forearmR: deg(-10, 0, 0) }, grounded: ['kneeL', 'kneeR', 'palmL', 'palmR'], tag: 'base' },
    { rotations: { thighL: deg(-6, 0, 8), shinL: deg(92, 0, 0), thighR: deg(-6, 0, -8), shinR: deg(92, 0, 0), spine: deg(62, 0, 0), chest: deg(14, 0, 0), head: deg(-34, 0, 0), upperArmL: deg(-56, 0, -6), forearmL: deg(-10, 0, 0), upperArmR: deg(-56, 0, 6), forearmR: deg(-10, 0, 0) }, grounded: ['kneeL', 'kneeR', 'palmL', 'palmR'], frame: face(1, 0, 0.8, Math.PI), tag: 'base' },
    { rotations: { ...stand, upperArmL: deg(0, 0, 145), upperArmR: deg(0, 0, -145), thighL: deg(0, 0, 10), thighR: deg(0, 0, -10), head: deg(-6, 0, 0) }, grounded: [], frame: face(0.5, 0, 0.45, 0), tag: 'flyer' }
  ], [
    c(2, 'heelL', 0, 'backC', 0.03, 1),
    c(2, 'heelR', 1, 'backC', 0.03, 1)
  ])
];

export const SHIPPED_POSES: PosePreset[] = [...SOLO_POSES, ...DUO_POSES, ...TRIO_POSES];

export const POSE_BY_ID = new Map(SHIPPED_POSES.map((p) => [p.id, p]));
