/** Preset library: every preset is a morph recipe on the shared topology, so
 *  any two blend cleanly — goblin × pin-up and orc × superhero are intended
 *  use. Weights are −1…+1 (0 = anthropometric average / neutral).
 *  Every preset is an adult figure. */

export interface Preset {
  id: string;
  label: string;
  category: 'realistic' | 'heroic' | 'anime' | 'fantasy';
  weights: Record<string, number>;
}

export const PRESETS: Preset[] = [
  // ---------------------------------------------------------- realistic
  { id: 'average_masc', label: 'Average masc', category: 'realistic',
    weights: { frame: -0.75 } },
  { id: 'average_fem', label: 'Average fem', category: 'realistic',
    weights: { frame: 0.75 } },
  { id: 'athletic', label: 'Athletic', category: 'realistic',
    weights: { muscle: 0.55, body_fat: -0.35, v_taper: 0.4, waist_definition: 0.3, calf_shape: 0.25 } },
  { id: 'heavyset', label: 'Heavyset', category: 'realistic',
    weights: { build: 0.7, body_fat: 0.65, belly: 0.5, waist_definition: -0.4, thigh_girth: 0.3, upper_arm_girth: 0.25, neck_girth: 0.3 } },
  { id: 'lanky', label: 'Lanky', category: 'realistic',
    weights: { height: 0.6, build: -0.6, arm_length: 0.45, leg_length: 0.5, muscle: -0.3, shoulder_width: -0.2, finger_length: 0.3 } },
  { id: 'elderly', label: 'Elderly', category: 'realistic',
    weights: { age: 0.85, muscle: -0.3, posture_chest_lift: -0.35 } },
  { id: 'powerlifter', label: 'Powerlifter', category: 'realistic',
    weights: { muscle: 0.9, build: 0.55, body_fat: 0.3, neck_girth: 0.6, shoulder_width: 0.5, waist_width: 0.35, thigh_girth: 0.6, forearm_girth: 0.5, upper_arm_girth: 0.6, calf_girth: 0.5 } },
  { id: 'dancer', label: 'Dancer', category: 'realistic',
    weights: { build: -0.35, muscle: 0.3, leg_length: 0.4, posture_chest_lift: 0.4, waist_definition: 0.35, calf_shape: 0.35, neck_length: 0.25, foot_length: 0.15 } },

  // ------------------------------------------------------------- heroic
  { id: 'superhero', label: 'Superhero', category: 'heroic',
    weights: { head_units: 0.85, muscle: 0.75, v_taper: 0.85, frame: -0.7, shoulder_width: 0.5, waist_width: -0.3, chest_depth: 0.4, jaw_width: 0.35, chin_length: 0.25, calf_shape: 0.3, posture_chest_lift: 0.4 } },
  { id: 'pinup', label: 'Pin-up', category: 'heroic',
    weights: { frame: 0.85, glamour: 0.8, waist_hip_ratio: 0.5, bust_size: 0.35, bust_lift: 0.4, glute_size: 0.35, glute_shape: 0.3, hip_flare: 0.45, lower_back_arch: 0.35, leg_length: 0.3, waist_definition: 0.45, posture_chest_lift: 0.35 } },
  { id: 'barbarian', label: 'Barbarian bulk', category: 'heroic',
    weights: { muscle: 0.95, build: 0.7, height: 0.5, shoulder_width: 0.7, neck_girth: 0.7, chest_depth: 0.55, forearm_girth: 0.6, upper_arm_girth: 0.7, thigh_girth: 0.6, hand_size: 0.4, jaw_width: 0.5, brow_ridge: 0.35 } },
  { id: 'waif', label: 'Waif', category: 'heroic',
    weights: { build: -0.8, muscle: -0.5, height: 0.2, neck_length: 0.3, eye_size: 0.35, jaw_width: -0.4, wrist_girth: -0.5, waist_width: -0.4, shoulder_width: -0.45, ankle_girth: -0.4 } },
  { id: 'toon', label: 'Toon', category: 'heroic',
    weights: { head_units: -0.55, eye_size: 0.7, hand_size: 0.4, nose_length: -0.4, jaw_width: -0.2, build: 0.15, foot_length: 0.3 } },
  { id: 'chibi', label: 'Chibi', category: 'heroic',
    weights: { head_units: -1, eye_size: 0.9, nose_length: -0.7, mouth_width: -0.2, hand_size: 0.3, build: 0.2 } },

  // -------------------------------------------------------------- anime
  { id: 'waifu', label: 'Waifu (anime)', category: 'anime',
    weights: { frame: 1, head_units: -0.2, eye_size: 0.95, nose_length: -0.6, jaw_width: -0.45, chin_length: -0.2, mouth_width: -0.25, glamour: 0.7, bust_size: 0.9, bust_lift: 0.6, waist_hip_ratio: 0.85, waist_width: -0.5, hip_flare: 0.6, glute_size: 0.45, leg_length: 0.45, thigh_girth: 0.15, neck_girth: -0.3 } },
  { id: 'husbando', label: 'Husbando (anime)', category: 'anime',
    weights: { frame: -0.9, head_units: 0.5, eye_size: 0.4, nose_length: -0.35, v_taper: 0.7, muscle: 0.5, jaw_width: 0.2, chin_length: 0.3, shoulder_width: 0.4, waist_width: -0.25, neck_length: 0.2 } },

  // ------------------------------------------------------------ fantasy
  { id: 'goblin', label: 'Goblin', category: 'fantasy',
    weights: { height: -0.9, head_units: -0.45, ear_length: 1, ear_point: 0.8, nose_length: 0.6, nose_tip: -0.4, jaw_width: -0.3, chin_point: 0.5, limb_ratio: 0.7, hunch: 0.55, build: -0.5, hand_size: 0.5, finger_length: 0.6, finger_thickness: -0.3, eye_size: 0.4, brow_ridge: 0.25 } },
  { id: 'orc', label: 'Orc', category: 'fantasy',
    weights: { height: 0.4, build: 0.6, muscle: 0.85, brow_ridge: 0.9, tusks: 0.9, jaw_width: 0.6, hunch: 0.35, shoulder_width: 0.6, neck_girth: 0.6, hand_size: 0.45, nose_length: -0.3, chest_depth: 0.4 } },
  { id: 'elf', label: 'Elf', category: 'fantasy',
    weights: { height: 0.35, build: -0.45, ear_length: 0.9, ear_point: 1, cheekbone_height: 0.5, cheekbone_width: 0.3, jaw_width: -0.35, chin_length: 0.2, eye_tilt: 0.45, eye_size: 0.25, neck_length: 0.35, leg_length: 0.35, finger_length: 0.4, waist_width: -0.2 } },
  { id: 'dwarf', label: 'Dwarf', category: 'fantasy',
    weights: { height: -0.8, build: 0.65, muscle: 0.6, leg_length: -0.6, arm_length: -0.2, shoulder_width: 0.55, chest_depth: 0.5, hand_size: 0.35, jaw_width: 0.45, brow_ridge: 0.4, neck_girth: 0.5, forearm_girth: 0.5, nose_length: 0.35 } }
];

export const PRESET_BY_ID = new Map(PRESETS.map((p) => [p.id, p]));

/** Linear blend of two recipes; missing keys are 0. */
export function blendPresets(
  a: Record<string, number>,
  b: Record<string, number>,
  t: number
): Record<string, number> {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  const out: Record<string, number> = {};
  for (const k of keys) {
    const v = (a[k] ?? 0) * (1 - t) + (b[k] ?? 0) * t;
    if (Math.abs(v) > 1e-4) out[k] = v;
  }
  return out;
}
