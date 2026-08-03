/** Preset library: every preset is a morph recipe on the shared topology, so
 *  any two blend cleanly — goblin × pin-up and orc × superhero are intended
 *  use. Weights are −1…+1 (0 = anthropometric average / neutral).
 *  Every preset is an adult figure. */

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
      frame: -0.75, muscle: 0.12, muscle_definition: 0.14, traps: 0.15,
      body_fat: 0.08, soft_folds: 0.06, brow_depth: 0.2, jaw_width: 0.15,
      chin_length: 0.12, nose_length: 0.12, nose_bridge_width: 0.1,
      forearm_girth: 0.1, calf_shape: 0.1, foot_width: 0.1
    } },
  { id: 'average_fem', label: 'Average fem', category: 'realistic', skin: '#d8a98f',
    weights: {
      frame: 0.75, body_fat: 0.12, soft_folds: 0.1, bust_lift: 0.1,
      hip_curve: 0.2, glute_shape: 0.15, thigh_hip_transition: 0.15,
      lip_fullness: 0.25, eye_size: 0.15, cheekbone_height: 0.2,
      jaw_width: -0.15, brow_depth: -0.15, neck_length: 0.1, waist_definition: 0.15
    } },
  { id: 'athletic', label: 'Athletic', category: 'realistic', skin: '#b97f60',
    weights: {
      muscle: 0.55, muscle_definition: 0.55, body_fat: -0.35, v_taper: 0.4,
      waist_definition: 0.3, calf_shape: 0.35, traps: 0.25, chest_depth: 0.15,
      thigh_taper: 0.2, posture_chest_lift: 0.25, cheekbone_width: 0.15,
      jaw_width: 0.1, neck_girth: 0.12, forearm_girth: 0.2, glute_shape: -0.25
    } },
  { id: 'heavyset', label: 'Heavyset', category: 'realistic', skin: '#d3a284',
    weights: {
      build: 0.7, body_fat: 0.65, soft_folds: 0.65, belly: 0.5,
      waist_definition: -0.4, thigh_girth: 0.3, upper_arm_girth: 0.25,
      neck_girth: 0.3, chin_length: -0.15, cheekbone_width: 0.15,
      wrist_girth: 0.2, ankle_girth: 0.25, glute_size: 0.2, chest_depth: 0.2,
      posture_shoulder_set: -0.15, foot_width: 0.2
    } },
  { id: 'lanky', label: 'Lanky', category: 'realistic', skin: '#e3bfa4',
    weights: {
      height: 0.6, build: -0.6, arm_length: 0.45, leg_length: 0.5,
      muscle: -0.3, shoulder_width: -0.2, finger_length: 0.3,
      neck_length: 0.3, chin_length: 0.25, nose_length: 0.3, cheekbone_width: -0.2,
      wrist_girth: -0.3, ankle_girth: -0.25, knee_width: 0.15,
      posture_shoulder_set: -0.25, ribcage_taper: 0.2
    } },
  { id: 'elderly', label: 'Elderly', category: 'realistic', skin: '#d9b49a',
    weights: {
      age: 0.85, muscle: -0.3, posture_chest_lift: -0.35, soft_folds: 0.3,
      brow_depth: 0.25, eye_size: -0.2, nose_length: 0.25, ear_size: 0.3,
      lip_fullness: -0.35, neck_girth: -0.15, hunch: 0.15,
      chest_depth: -0.15, glute_size: -0.25, calf_girth: -0.2
    } },
  { id: 'powerlifter', label: 'Powerlifter', category: 'realistic', skin: '#c08b66',
    weights: {
      muscle: 0.9, muscle_definition: 0.45, build: 0.55, body_fat: 0.3,
      soft_folds: 0.2, traps: 0.85, neck_girth: 0.6, shoulder_width: 0.5,
      waist_width: 0.35, thigh_girth: 0.6, forearm_girth: 0.5,
      upper_arm_girth: 0.6, calf_girth: 0.5, belly: 0.25, chest_depth: 0.4,
      jaw_width: 0.35, cheekbone_width: 0.25, hand_size: 0.25, brow_depth: 0.2
    } },
  { id: 'dancer', label: 'Dancer', category: 'realistic', skin: '#caa07f',
    weights: {
      build: -0.35, muscle: 0.3, muscle_definition: 0.4, leg_length: 0.4,
      posture_chest_lift: 0.4, waist_definition: 0.35, calf_shape: 0.45,
      neck_length: 0.25, foot_length: 0.15, thigh_taper: 0.3,
      glute_shape: -0.3, shoulder_width: -0.1, cheekbone_height: 0.25,
      posture_pelvis_tilt: 0.15, ankle_girth: -0.3, eye_tilt: 0.1
    } },

  // ------------------------------------------------------------- heroic
  { id: 'superhero', label: 'Superhero', category: 'heroic', skin: '#bd8663',
    weights: {
      head_units: 0.85, muscle: 0.75, muscle_definition: 0.75, v_taper: 0.85,
      frame: -0.7, traps: 0.45, shoulder_width: 0.5, waist_width: -0.3,
      chest_depth: 0.4, jaw_width: 0.35, chin_length: 0.25, chin_point: 0.2,
      calf_shape: 0.3, posture_chest_lift: 0.4, brow_depth: 0.3,
      cheekbone_width: 0.25, nose_bridge_width: 0.1, neck_girth: 0.3, glute_shape: -0.3
    } },
  { id: 'pinup', label: 'Pin-up', category: 'heroic', skin: '#e0b092',
    weights: {
      frame: 0.85, glamour: 0.8, waist_hip_ratio: 0.5, bust_size: 0.35,
      bust_lift: 0.4, glute_size: 0.35, glute_shape: 0.3, hip_flare: 0.45,
      lower_back_arch: 0.35, leg_length: 0.3, waist_definition: 0.45,
      posture_chest_lift: 0.35, soft_folds: 0.12, lip_fullness: 0.45,
      eye_size: 0.25, eye_tilt: 0.2, cheekbone_height: 0.35, jaw_width: -0.2,
      thigh_hip_transition: 0.3, ankle_girth: -0.2, neck_length: 0.15
    } },
  { id: 'barbarian', label: 'Barbarian bulk', category: 'heroic', skin: '#b57f52',
    weights: {
      muscle: 0.95, muscle_definition: 0.6, build: 0.7, height: 0.5,
      traps: 0.7, shoulder_width: 0.7, neck_girth: 0.7, chest_depth: 0.55,
      forearm_girth: 0.6, upper_arm_girth: 0.7, thigh_girth: 0.6,
      hand_size: 0.4, jaw_width: 0.5, brow_ridge: 0.35, brow_depth: 0.35,
      soft_folds: 0.15, belly: 0.15, nose_bridge_width: 0.25,
      cheekbone_width: 0.3, foot_width: 0.25, posture_shoulder_set: -0.1
    } },
  { id: 'waif', label: 'Waif', category: 'heroic', skin: '#ecd0bd',
    weights: {
      build: -0.8, muscle: -0.5, height: 0.2, neck_length: 0.3,
      eye_size: 0.35, jaw_width: -0.4, wrist_girth: -0.5, waist_width: -0.4,
      shoulder_width: -0.45, ankle_girth: -0.4, cheekbone_height: 0.3,
      cheekbone_width: -0.2, lip_fullness: 0.15, chin_length: -0.1,
      chest_depth: -0.25, glute_size: -0.2, thigh_girth: -0.3, posture_shoulder_set: -0.2
    } },
  { id: 'toon', label: 'Toon', category: 'heroic', skin: '#f0c9a8',
    weights: {
      head_units: -0.55, eye_size: 0.7, hand_size: 0.4, nose_length: -0.4,
      jaw_width: -0.2, build: 0.15, foot_length: 0.3, mouth_width: 0.25,
      cheekbone_height: 0.2, chin_length: -0.25, ear_size: 0.2,
      belly: 0.15, soft_folds: 0.1, finger_thickness: 0.3
    } },
  { id: 'chibi', label: 'Chibi', category: 'heroic', skin: '#f2d4bb',
    weights: {
      head_units: -1, eye_size: 0.9, nose_length: -0.7, mouth_width: -0.2,
      hand_size: 0.3, build: 0.2, soft_folds: 0.12, chin_length: -0.35,
      jaw_width: -0.15, cheekbone_height: 0.15, ear_size: -0.15,
      finger_thickness: 0.35, foot_width: 0.2
    } },

  // -------------------------------------------------------------- anime
  { id: 'waifu', label: 'Waifu (anime)', category: 'anime', skin: '#eeceb8',
    weights: {
      frame: 1, head_units: -0.2, eye_size: 0.95, eye_tilt: 0.25,
      nose_length: -0.6, jaw_width: -0.45, chin_length: -0.2, chin_point: 0.25,
      mouth_width: -0.25, lip_fullness: 0.3, glamour: 0.7, bust_size: 0.9,
      bust_lift: 0.6, waist_hip_ratio: 0.85, waist_width: -0.5, hip_flare: 0.6,
      glute_size: 0.45, glute_shape: 0.3, leg_length: 0.45, thigh_girth: 0.15,
      thigh_hip_transition: 0.3, neck_girth: -0.3, cheekbone_height: 0.25,
      soft_folds: 0.08, ankle_girth: -0.25
    } },
  { id: 'husbando', label: 'Husbando (anime)', category: 'anime', skin: '#e0b596',
    weights: {
      frame: -0.9, head_units: 0.5, eye_size: 0.4, eye_tilt: 0.15,
      nose_length: -0.35, nose_bridge_width: -0.15, v_taper: 0.7, muscle: 0.5,
      muscle_definition: 0.5, jaw_width: 0.2, chin_length: 0.3, chin_point: 0.2,
      shoulder_width: 0.4, waist_width: -0.25, neck_length: 0.2,
      cheekbone_height: 0.3, cheekbone_width: 0.15, brow_depth: 0.1, traps: 0.2
    } },

  // ------------------------------------------------------------ fantasy
  { id: 'goblin', label: 'Goblin', category: 'fantasy', skin: '#7a9a52',
    weights: {
      height: -0.9, head_units: -0.45, ear_length: 1, ear_point: 0.8,
      ear_angle: 0.5, nose_length: 0.6, nose_tip: -0.4, nose_bridge_width: -0.2,
      jaw_width: -0.3, chin_point: 0.5, chin_length: 0.2, limb_ratio: 0.7,
      hunch: 0.55, build: -0.5, hand_size: 0.5, finger_length: 0.6,
      finger_thickness: -0.3, eye_size: 0.4, eye_tilt: 0.35, brow_ridge: 0.25,
      cheekbone_width: 0.25, mouth_width: 0.3, belly: 0.25, muscle_definition: 0.2,
      knee_width: 0.25, posture_pelvis_tilt: -0.2
    } },
  { id: 'orc', label: 'Orc', category: 'fantasy', skin: '#6f8d5c',
    weights: {
      height: 0.4, build: 0.6, muscle: 0.85, muscle_definition: 0.55,
      traps: 0.6, brow_ridge: 0.9, tusks: 0.9, jaw_width: 0.6, hunch: 0.35,
      shoulder_width: 0.6, neck_girth: 0.6, hand_size: 0.45, nose_length: -0.3,
      nose_bridge_width: 0.35, chest_depth: 0.4, ear_point: 0.35,
      cheekbone_width: 0.35, eye_size: -0.2, lip_fullness: -0.2,
      chin_length: 0.2, soft_folds: 0.12, foot_width: 0.3
    } },
  { id: 'elf', label: 'Elf', category: 'fantasy', skin: '#e9cdb2',
    weights: {
      height: 0.35, build: -0.45, ear_length: 0.9, ear_point: 1,
      cheekbone_height: 0.5, cheekbone_width: 0.3, jaw_width: -0.35,
      chin_length: 0.2, chin_point: 0.25, eye_tilt: 0.45, eye_size: 0.25,
      neck_length: 0.35, leg_length: 0.35, finger_length: 0.4,
      waist_width: -0.2, nose_length: -0.15, nose_bridge_width: -0.2,
      lip_fullness: 0.1, brow_depth: -0.2, muscle_definition: 0.2,
      posture_chest_lift: 0.25, ankle_girth: -0.25, wrist_girth: -0.25
    } },
  { id: 'dwarf', label: 'Dwarf', category: 'fantasy', skin: '#c68f5e',
    weights: {
      height: -0.8, build: 0.65, muscle: 0.6, muscle_definition: 0.35,
      traps: 0.5, leg_length: -0.6, arm_length: -0.2, shoulder_width: 0.55,
      chest_depth: 0.5, hand_size: 0.35, jaw_width: 0.45, brow_ridge: 0.4,
      brow_depth: 0.3, neck_girth: 0.5, forearm_girth: 0.5, nose_length: 0.35,
      nose_bridge_width: 0.3, cheekbone_width: 0.3, belly: 0.3, soft_folds: 0.2,
      foot_width: 0.35, finger_thickness: 0.3, ear_size: 0.15
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
