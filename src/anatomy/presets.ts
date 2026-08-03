/** Preset library: every preset is a morph recipe on the shared MakeHuman
 *  (CC0) topology, so any two blend cleanly — goblin × pin-up and
 *  orc × superhero are intended use. Weights are −1…+1 (0 = anthropometric
 *  average / neutral). Every preset is an adult figure. */

export interface Preset {
  id: string;
  label: string;
  category: 'realistic' | 'heroic' | 'anime' | 'fantasy';
  /** default skin tone applied with the preset (goblin green, elf pale, …) */
  skin?: string;
  weights: Record<string, number>;
}

export const PRESETS: Preset[] = [
  // ---------------------------------------------------------- realistic
  { id: 'average_masc', label: 'Average masc', category: 'realistic', skin: '#c69076',
    weights: {
      frame: -1, muscle: 0.18, body_fat: 0.1, jaw_width: 0.12, brow_depth: 0.2,
      features_european: 0.4, features_african: 0.12, features_asian: 0.12,
      forearm_girth: 0.1, hand_size: 0.08
    } },
  { id: 'average_fem', label: 'Average fem', category: 'realistic', skin: '#d8a98f',
    weights: {
      frame: 1, body_fat: 0.15, bust_size: 0.12, lip_fullness: 0.18,
      features_european: 0.35, features_african: 0.15, features_asian: 0.15,
      eye_size: 0.12, cheekbone_height: 0.15, waist_definition: 0.12
    } },
  { id: 'athletic', label: 'Athletic', category: 'realistic', skin: '#b97f60',
    weights: {
      frame: -0.5, muscle: 0.75, body_fat: -0.5, v_taper: 0.5, waist_definition: 0.3,
      shoulder_width: 0.22, thigh_girth: 0.15, calf_girth: 0.2, calf_shape: 0.3,
      features_african: 0.35, features_european: 0.3, neck_girth: 0.15,
      posture_chest_lift: 0.25, muscle_definition: 0.45
    } },
  { id: 'heavyset', label: 'Heavyset', category: 'realistic', skin: '#d3a284',
    weights: {
      frame: -0.6, body_fat: 0.95, build: 0.45, belly: 0.55, waist_width: 0.5,
      neck_girth: 0.4, glute_size: 0.3, soft_folds: 0.6, chin_length: -0.1,
      upper_arm_girth: 0.3, thigh_girth: 0.35, ankle_girth: 0.25,
      features_european: 0.45, foot_width: 0.2
    } },
  { id: 'lanky', label: 'Lanky', category: 'realistic', skin: '#e3bfa4',
    weights: {
      frame: -0.8, height: 0.7, build: -0.75, muscle: -0.4, arm_length: 0.5,
      leg_length: 0.5, shoulder_width: -0.3, neck_length: 0.4, finger_length: 0.4,
      wrist_girth: -0.35, ankle_girth: -0.3, nose_length: 0.25, chin_length: 0.2,
      features_european: 0.5, posture_shoulder_set: -0.25
    } },
  { id: 'elderly', label: 'Elderly', category: 'realistic', skin: '#d9b49a',
    weights: {
      frame: -0.4, age: 1, muscle: -0.35, posture_chest_lift: -0.4, hunch: 0.22,
      soft_folds: 0.35, lip_fullness: -0.3, ear_size: 0.3, nose_length: 0.2,
      eye_size: -0.15, neck_girth: -0.15, features_european: 0.4, glute_size: -0.2
    } },
  { id: 'powerlifter', label: 'Powerlifter', category: 'realistic', skin: '#c08b66',
    weights: {
      frame: -1, muscle: 1, build: 0.55, body_fat: 0.4, neck_girth: 0.7, traps: 0.8,
      shoulder_width: 0.5, waist_width: 0.4, thigh_girth: 0.6, upper_arm_girth: 0.6,
      forearm_girth: 0.5, calf_girth: 0.45, belly: 0.3, hand_size: 0.25,
      jaw_width: 0.3, features_european: 0.35, features_african: 0.2, chest_depth: 0.4
    } },
  { id: 'dancer', label: 'Dancer', category: 'realistic', skin: '#caa07f',
    weights: {
      frame: 0.8, muscle: 0.45, body_fat: -0.45, leg_length: 0.45,
      posture_chest_lift: 0.45, waist_definition: 0.35, calf_shape: 0.4,
      neck_length: 0.25, glute_size: 0.15, features_african: 0.3,
      features_european: 0.25, muscle_definition: 0.25, foot_length: 0.1
    } },

  // ------------------------------------------------------------- heroic
  { id: 'superhero', label: 'Superhero', category: 'heroic', skin: '#bd8663',
    weights: {
      frame: -1, muscle: 0.9, v_taper: 0.9, height: 0.65, head_units: 0.5,
      shoulder_width: 0.55, jaw_width: 0.35, chin_length: 0.2, waist_width: -0.3,
      thigh_girth: 0.35, calf_girth: 0.3, neck_girth: 0.35, chest_depth: 0.35,
      muscle_definition: 0.6, posture_chest_lift: 0.35, features_european: 0.4
    } },
  { id: 'pinup', label: 'Pin-up', category: 'heroic', skin: '#e0b092',
    weights: {
      frame: 1, height: 0.3, glamour: 0.8, bust_size: 0.65, bust_lift: 0.4, waist_width: -0.55,
      hip_width: 0.45, glute_size: 0.5, lip_fullness: 0.4, eye_size: 0.2,
      leg_length: 0.3, body_fat: 0.1, waist_definition: 0.4, cheekbone_height: 0.25,
      features_european: 0.45, posture_chest_lift: 0.3
    } },
  { id: 'barbarian', label: 'Barbarian bulk', category: 'heroic', skin: '#b57f52',
    weights: {
      frame: -1, muscle: 0.95, build: 0.65, height: 0.35, body_fat: 0.3,
      traps: 0.7, brow_ridge: 0.45, brow_depth: 0.4, jaw_width: 0.4,
      neck_girth: 0.55, forearm_girth: 0.55, hand_size: 0.3, chest_depth: 0.45,
      shoulder_width: 0.4, belly: 0.15, nose_bridge_width: 0.25, features_european: 0.5
    } },
  { id: 'waif', label: 'Waif', category: 'heroic', skin: '#ecd0bd',
    weights: {
      frame: 1, build: -0.75, body_fat: -0.35, height: -0.15, eye_size: 0.35,
      lip_fullness: 0.2, neck_length: 0.3, shoulder_width: -0.35, wrist_girth: -0.45,
      waist_width: -0.35, features_asian: 0.25, features_european: 0.35,
      chin_length: -0.15, nose_length: -0.2
    } },
  { id: 'toon', label: 'Toon', category: 'heroic', skin: '#f0c9a8',
    weights: {
      head_units: -0.55, eye_size: 0.85, mouth_width: 0.3, nose_length: -0.55,
      hand_size: 0.3, build: -0.2, jaw_width: -0.2, chin_length: -0.2,
      brow_depth: -0.2, lip_fullness: 0.15
    } },
  { id: 'chibi', label: 'Chibi', category: 'heroic', skin: '#f2d4bb',
    weights: {
      head_units: -1, height: -0.85, eye_size: 0.95, nose_length: -0.7,
      mouth_width: 0.2, build: -0.3, hand_size: 0.2, jaw_width: -0.3,
      chin_length: -0.3
    } },

  // -------------------------------------------------------------- anime
  { id: 'waifu', label: 'Waifu (anime)', category: 'anime', skin: '#eeceb8',
    weights: {
      frame: 1, head_units: -0.3, eye_size: 0.75, eye_tilt: 0.2, nose_length: -0.6,
      nose_bridge_width: -0.3, mouth_width: -0.15, lip_fullness: 0.25,
      jaw_width: -0.35, chin_length: -0.25, chin_point: 0.2, features_asian: 0.55,
      waist_width: -0.3, leg_length: 0.35, bust_size: 0.35, neck_length: 0.2,
      cheekbone_width: -0.15
    } },
  { id: 'husbando', label: 'Husbando (anime)', category: 'anime', skin: '#e0b596',
    weights: {
      frame: -0.9, head_units: 0.3, eye_size: 0.35, jaw_width: -0.1,
      chin_point: 0.3, nose_length: -0.2, nose_bridge_width: -0.2,
      features_asian: 0.5, v_taper: 0.55, muscle: 0.5, body_fat: -0.35,
      shoulder_width: 0.3, neck_length: 0.15, cheekbone_height: 0.3,
      leg_length: 0.25, brow_depth: 0.1
    } },

  // ------------------------------------------------------------ fantasy
  { id: 'goblin', label: 'Goblin', category: 'fantasy', skin: '#7a9a52',
    weights: {
      frame: -0.7, height: -0.62, build: -0.35, head_units: -0.3, age: 0.4,
      ear_size: 0.9, ear_point: 1, ear_length: 0.7, brow_ridge: 0.7, brow_depth: 0.5,
      nose_length: 0.6, nose_tip: -0.45, nostril_flare: 0.6, jaw_forward: 0.55,
      tusks: 0.4, hunch: 0.55, limb_ratio: 0.8, muscle: 0.25, body_fat: -0.3,
      eye_size: 0.35, chin_point: -0.3, mouth_width: 0.3, hand_size: 0.25,
      finger_length: 0.35, cheekbone_width: 0.25
    } },
  { id: 'orc', label: 'Orc', category: 'fantasy', skin: '#6f8d5c',
    weights: {
      frame: -1, muscle: 0.85, build: 0.5, height: 0.15, brow_ridge: 0.9,
      brow_depth: 0.5, tusks: 0.9, jaw_forward: 0.7, jaw_width: 0.5,
      nose_bridge_width: 0.45, nostril_flare: 0.5, nose_tip: -0.3, hunch: 0.3,
      shoulder_width: 0.4, hand_size: 0.3, traps: 0.6, chin_length: 0.2,
      neck_girth: 0.5, chest_depth: 0.4, ear_point: 0.45, features_african: 0.25
    } },
  { id: 'elf', label: 'Elf', category: 'fantasy', skin: '#e9cdb2',
    weights: {
      frame: 0.75, height: 0.35, build: -0.5, body_fat: -0.3, ear_point: 1,
      ear_length: 0.85, ear_size: 0.3, cheekbone_height: 0.5, eye_tilt: 0.35,
      eye_size: 0.3, jaw_width: -0.35, chin_point: 0.3, nose_bridge_width: -0.3,
      nose_length: -0.1, neck_length: 0.3, leg_length: 0.3,
      features_asian: 0.3, features_european: 0.45, lip_fullness: 0.1,
      posture_chest_lift: 0.2
    } },
  { id: 'dwarf', label: 'Dwarf', category: 'fantasy', skin: '#c68f5e',
    weights: {
      frame: -1, height: -0.55, build: 0.6, muscle: 0.7, head_units: -0.15,
      shoulder_width: 0.45, chest_depth: 0.5, arm_length: -0.15, leg_length: -0.45,
      hand_size: 0.3, neck_girth: 0.5, brow_depth: 0.45, brow_ridge: 0.25,
      jaw_width: 0.35, nose_length: 0.35, nose_bridge_width: 0.3,
      forearm_girth: 0.5, age: 0.3, features_european: 0.5, foot_width: 0.3
    } }
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
