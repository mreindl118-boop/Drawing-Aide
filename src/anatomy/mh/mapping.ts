/** Slider → MakeHuman-backend source mapping.
 *
 *  Every slider in the catalog composes from up to three source kinds:
 *   - bundle: a converted MakeHuman target delta (sculpted, highest quality)
 *   - synth:  a bone-space geometric morph computed at init (girths, lengths,
 *             postures, proportions — things MH has no single target for)
 *   - fields: the slider's own gaussian FieldOps from the catalog (baked
 *             against MakeHuman landmarks) — used automatically when a
 *             morph def carries fields and has no entry here.
 */

export type SynthSpec =
  /** radial scale ⊥ to the bone axis, weighted by skin weight */
  | { kind: 'girth'; bones: string[]; amount: number }
  /** scale along the chain axis around the chain root (lengthens limbs) */
  | { kind: 'length'; bones: string[]; amount: number }
  /** uniform scale around a joint, weighted by skin weight */
  | { kind: 'scaleAt'; bone: string; amount: [number, number, number] }
  /** translate weighted verts */
  | { kind: 'shift'; bones: string[]; vec: [number, number, number] }
  /** gaussian y-band xz scale around the torso axis (pinch / flare) */
  | { kind: 'band'; y: 'waist' | 'hip' | 'rib' | 'chest'; width: number; amount: [number, number] };

export interface MHSource {
  bundle?: [name: string, scale: number][];
  synth?: SynthSpec[];
  /** also bake the def's own fields (default true when def has fields and no bundle/synth) */
  fields?: boolean;
}

export interface MHMorphMap {
  pos?: MHSource;
  neg?: MHSource;
}

const B = (name: string, scale = 1): [string, number] => [name, scale];

/** sliders not listed here fall back to their catalog fields (or go inert
 *  if they were generator-param morphs — the build fails loudly on those) */
export const MH_MAP: Record<string, MHMorphMap> = {
  // ------------------------------------------------------------- macros
  height: { pos: { bundle: [B('macro.height_pos', 0.35)] }, neg: { bundle: [B('macro.height_neg', 2.0)] } },
  frame: { pos: { bundle: [B('macro.frame_pos')] }, neg: { bundle: [B('macro.frame_neg')] } },
  muscle: { pos: { bundle: [B('macro.muscle_pos')] }, neg: { bundle: [B('macro.muscle_neg')] } },
  body_fat: { pos: { bundle: [B('macro.weight_pos')] }, neg: { bundle: [B('macro.weight_neg')] } },
  age: { pos: { bundle: [B('macro.age_pos')] }, neg: { bundle: [B('macro.age_pos', -0.35)] } },
  build: {
    pos: { bundle: [B('macro.weight_pos', 0.75), B('macro.muscle_pos', 0.4)] },
    neg: { bundle: [B('macro.weight_neg', 0.8), B('macro.muscle_neg', 0.35)] }
  },
  waist_hip_ratio: {
    pos: { bundle: [B('detail.waist_width.neg', 0.8), B('detail.hip_width.pos', 0.6)] },
    neg: { bundle: [B('detail.waist_width.pos', 0.7), B('detail.hip_width.neg', 0.5)] }
  },
  glamour: {
    pos: {
      bundle: [B('detail.waist_width.neg', 0.55), B('detail.hip_width.pos', 0.35), B('detail.bust_size.pos', 0.45), B('detail.glute_size.pos', 0.35)],
      synth: [{ kind: 'length', bones: ['thighL', 'shinL', 'thighR', 'shinR'], amount: 0.04 }]
    }
  },
  head_units: {
    // heroic 8+: smaller head, longer legs
    pos: {
      synth: [
        { kind: 'scaleAt', bone: 'head', amount: [-0.09, -0.09, -0.09] },
        { kind: 'length', bones: ['thighL', 'shinL', 'thighR', 'shinR'], amount: 0.07 }
      ]
    },
    // chibi: big head, short limbs
    neg: {
      synth: [
        { kind: 'scaleAt', bone: 'head', amount: [0.62, 0.62, 0.62] },
        { kind: 'length', bones: ['thighL', 'shinL', 'thighR', 'shinR'], amount: -0.24 },
        { kind: 'length', bones: ['upperArmL', 'forearmL', 'upperArmR', 'forearmR'], amount: -0.2 },
        { kind: 'shift', bones: ['head', 'neck'], vec: [0, -0.045, 0] }
      ]
    }
  },

  // -------------------------------------------------- bundle-backed details
  cranium_width: { pos: { bundle: [B('detail.cranium_width.pos')] }, neg: { bundle: [B('detail.cranium_width.neg')] } },
  forehead_height: { pos: { bundle: [B('detail.forehead_height.pos')] }, neg: { bundle: [B('detail.forehead_height.neg')] } },
  brow_depth: { pos: { bundle: [B('detail.brow_depth.pos')], fields: true }, neg: { bundle: [B('detail.brow_depth.neg')], fields: true } },
  eye_size: { pos: { bundle: [B('detail.eye_size.pos')] }, neg: { bundle: [B('detail.eye_size.neg')] } },
  eye_spacing: { pos: { bundle: [B('detail.eye_spacing.pos')] }, neg: { bundle: [B('detail.eye_spacing.neg')] } },
  eye_tilt: { pos: { bundle: [B('detail.eye_tilt.pos')] }, neg: { bundle: [B('detail.eye_tilt.neg')] } },
  eye_depth: { pos: { bundle: [B('detail.eye_depth.pos')] }, neg: { bundle: [B('detail.eye_depth.neg')] } },
  cheekbone_height: { pos: { bundle: [B('detail.cheekbone_height.pos')] }, neg: { bundle: [B('detail.cheekbone_height.neg')] } },
  cheekbone_width: { pos: { bundle: [B('detail.cheekbone_width.pos')] }, neg: { bundle: [B('detail.cheekbone_width.neg')] } },
  nose_bridge_width: { pos: { bundle: [B('detail.nose_bridge_width.pos')] }, neg: { bundle: [B('detail.nose_bridge_width.neg')] } },
  nose_length: { pos: { bundle: [B('detail.nose_length.pos')] }, neg: { bundle: [B('detail.nose_length.neg')] } },
  nose_tip: { pos: { bundle: [B('detail.nose_tip.pos')] }, neg: { bundle: [B('detail.nose_tip.neg')] } },
  nostril_flare: { pos: { bundle: [B('detail.nostril_flare.pos')] }, neg: { bundle: [B('detail.nostril_flare.neg')] } },
  jaw_width: { pos: { bundle: [B('detail.jaw_width.pos')] }, neg: { bundle: [B('detail.jaw_width.neg')] } },
  chin_length: { pos: { bundle: [B('detail.chin_length.pos')] }, neg: { bundle: [B('detail.chin_length.neg')] } },
  chin_point: { pos: { bundle: [B('detail.chin_point.pos')] }, neg: { bundle: [B('detail.chin_point.neg')] } },
  jaw_forward: { pos: { bundle: [B('detail.jaw_forward.pos')] }, neg: { bundle: [B('detail.jaw_forward.neg')] } },
  ear_size: { pos: { bundle: [B('detail.ear_size.pos')] }, neg: { bundle: [B('detail.ear_size.neg')] } },
  ear_angle: { pos: { bundle: [B('detail.ear_angle.pos')] }, neg: { bundle: [B('detail.ear_angle.neg')] } },
  mouth_width: { pos: { bundle: [B('detail.mouth_width.pos')] }, neg: { bundle: [B('detail.mouth_width.neg')] } },
  mouth_height: { pos: { bundle: [B('detail.mouth_height.pos')] }, neg: { bundle: [B('detail.mouth_height.neg')] } },
  lip_fullness: { pos: { bundle: [B('detail.lip_fullness.pos')] }, neg: { bundle: [B('detail.lip_fullness.neg')] } },
  neck_girth: { pos: { bundle: [B('detail.neck_girth.pos')] }, neg: { bundle: [B('detail.neck_girth.neg')] } },
  neck_length: { pos: { bundle: [B('detail.neck_length.pos')] }, neg: { bundle: [B('detail.neck_length.neg')] } },
  shoulder_width: {
    pos: { bundle: [B('detail.shoulder_width.pos')], synth: [{ kind: 'shift', bones: ['upperArmL'], vec: [0.02, 0, 0] }, { kind: 'shift', bones: ['upperArmR'], vec: [-0.02, 0, 0] }] },
    neg: { bundle: [B('detail.shoulder_width.neg')], synth: [{ kind: 'shift', bones: ['upperArmL'], vec: [-0.016, 0, 0] }, { kind: 'shift', bones: ['upperArmR'], vec: [0.016, 0, 0] }] }
  },
  chest_depth: { pos: { bundle: [B('detail.chest_depth.pos')] }, neg: { bundle: [B('detail.chest_depth.neg')] } },
  v_taper: { pos: { bundle: [B('detail.v_taper.pos')] } },
  waist_width: { pos: { bundle: [B('detail.waist_width.pos')] }, neg: { bundle: [B('detail.waist_width.neg')] } },
  hip_width: { pos: { bundle: [B('detail.hip_width.pos')] }, neg: { bundle: [B('detail.hip_width.neg')] } },
  belly: { pos: { bundle: [B('detail.belly.pos')] }, neg: { bundle: [B('detail.belly.neg')] } },
  glute_size: { pos: { bundle: [B('detail.glute_size.pos')] }, neg: { bundle: [B('detail.glute_size.neg')] } },
  bust_size: { pos: { bundle: [B('detail.bust_size.pos')], fields: true }, neg: { bundle: [B('detail.bust_size.neg')], fields: true } },
  bust_lift: { pos: { bundle: [B('detail.bust_lift.pos')] }, neg: { bundle: [B('detail.bust_lift.neg')] } },
  genital_masc: { pos: { bundle: [B('detail.genital_masc.pos')] } },
  genital_masc_size: { pos: { bundle: [B('detail.genital_masc_size.pos')] } },

  // ------------------------------------------------------ ethnicity (new)
  features_african: { pos: { bundle: [B('macro.ethnicity_african')] } },
  features_asian: { pos: { bundle: [B('macro.ethnicity_asian')] } },
  features_european: { pos: { bundle: [B('macro.ethnicity_european')] } },

  // -------------------------------------------------------- synthesized
  clavicle_slope: {
    pos: { synth: [{ kind: 'shift', bones: ['upperArmL', 'upperArmR'], vec: [0, -0.018, 0] }] },
    neg: { synth: [{ kind: 'shift', bones: ['upperArmL', 'upperArmR'], vec: [0, 0.014, 0] }] }
  },
  ribcage_taper: {
    pos: { synth: [{ kind: 'band', y: 'rib', width: 0.09, amount: [-0.08, -0.05] }] },
    neg: { synth: [{ kind: 'band', y: 'rib', width: 0.09, amount: [0.1, 0.06] }] }
  },
  back_curve: {
    pos: { synth: [{ kind: 'shift', bones: ['chest'], vec: [0, 0, -0.016] }, { kind: 'shift', bones: ['neck'], vec: [0, 0, -0.01] }] },
    neg: { synth: [{ kind: 'shift', bones: ['chest'], vec: [0, 0, 0.012] }] }
  },
  posture_chest_lift: {
    pos: { synth: [{ kind: 'shift', bones: ['chest'], vec: [0, 0.006, 0.014] }, { kind: 'shift', bones: ['neck', 'head'], vec: [0, 0, -0.006] }] },
    neg: { synth: [{ kind: 'shift', bones: ['chest'], vec: [0, -0.006, -0.016] }, { kind: 'shift', bones: ['neck', 'head'], vec: [0, 0, 0.014] }] }
  },
  posture_shoulder_set: {
    pos: { synth: [{ kind: 'shift', bones: ['upperArmL', 'upperArmR'], vec: [0, 0.004, -0.012] }] },
    neg: { synth: [{ kind: 'shift', bones: ['upperArmL', 'upperArmR'], vec: [0, -0.004, 0.014] }] }
  },
  waist_definition: {
    pos: { synth: [{ kind: 'band', y: 'waist', width: 0.07, amount: [-0.1, -0.05] }] },
    neg: { synth: [{ kind: 'band', y: 'waist', width: 0.09, amount: [0.1, 0.07] }] }
  },
  lower_back_arch: {
    pos: { synth: [{ kind: 'shift', bones: ['pelvis'], vec: [0, 0, 0.01] }, { kind: 'band', y: 'waist', width: 0.08, amount: [0, 0.05] }] },
    neg: { synth: [{ kind: 'shift', bones: ['pelvis'], vec: [0, 0, -0.008] }] }
  },
  posture_pelvis_tilt: {
    pos: { synth: [{ kind: 'shift', bones: ['pelvis'], vec: [0, 0, 0.012] }] },
    neg: { synth: [{ kind: 'shift', bones: ['pelvis'], vec: [0, 0, -0.012] }] }
  },
  hip_flare: {
    pos: { synth: [{ kind: 'band', y: 'hip', width: 0.08, amount: [0.09, 0.02] }] },
    neg: { synth: [{ kind: 'band', y: 'hip', width: 0.08, amount: [-0.07, -0.02] }] }
  },
  arm_length: {
    pos: { synth: [{ kind: 'length', bones: ['upperArmL', 'forearmL', 'upperArmR', 'forearmR'], amount: 0.16 }] },
    neg: { synth: [{ kind: 'length', bones: ['upperArmL', 'forearmL', 'upperArmR', 'forearmR'], amount: -0.14 }] }
  },
  upper_arm_girth: { pos: { bundle: [B('detail.upper_arm_girth.pos')], synth: [{ kind: 'girth', bones: ['upperArmL', 'upperArmR'], amount: 0.08 }] },
    neg: { bundle: [B('detail.upper_arm_girth.neg')], synth: [{ kind: 'girth', bones: ['upperArmL', 'upperArmR'], amount: -0.05 }] } },
  forearm_girth: {
    pos: { synth: [{ kind: 'girth', bones: ['forearmL', 'forearmR'], amount: 0.2 }] },
    neg: { synth: [{ kind: 'girth', bones: ['forearmL', 'forearmR'], amount: -0.15 }] }
  },
  wrist_girth: { pos: { bundle: [B('detail.wrist_girth.pos')] }, neg: { bundle: [B('detail.wrist_girth.neg')] } },
  hand_size: {
    pos: { synth: [{ kind: 'scaleAt', bone: 'handL', amount: [0.16, 0.16, 0.16] }, { kind: 'scaleAt', bone: 'handR', amount: [0.16, 0.16, 0.16] }] },
    neg: { synth: [{ kind: 'scaleAt', bone: 'handL', amount: [-0.13, -0.13, -0.13] }, { kind: 'scaleAt', bone: 'handR', amount: [-0.13, -0.13, -0.13] }] }
  },
  finger_length: {
    pos: { synth: [{ kind: 'scaleAt', bone: 'handL', amount: [0.05, 0.16, 0.05] }, { kind: 'scaleAt', bone: 'handR', amount: [0.05, 0.16, 0.05] }] },
    neg: { synth: [{ kind: 'scaleAt', bone: 'handL', amount: [-0.04, -0.13, -0.04] }, { kind: 'scaleAt', bone: 'handR', amount: [-0.04, -0.13, -0.04] }] }
  },
  finger_thickness: {
    pos: { synth: [{ kind: 'girth', bones: ['handL', 'handR'], amount: 0.14 }] },
    neg: { synth: [{ kind: 'girth', bones: ['handL', 'handR'], amount: -0.11 }] }
  },
  leg_length: {
    pos: { synth: [{ kind: 'length', bones: ['thighL', 'shinL', 'thighR', 'shinR'], amount: 0.14 }] },
    neg: { synth: [{ kind: 'length', bones: ['thighL', 'shinL', 'thighR', 'shinR'], amount: -0.13 }] }
  },
  thigh_girth: { pos: { bundle: [B('detail.thigh_girth.pos')], synth: [{ kind: 'girth', bones: ['thighL', 'thighR'], amount: 0.07 }] },
    neg: { bundle: [B('detail.thigh_girth.neg')], synth: [{ kind: 'girth', bones: ['thighL', 'thighR'], amount: -0.05 }] } },
  thigh_taper: {
    pos: { synth: [{ kind: 'girth', bones: ['thighL', 'thighR'], amount: 0.1 }, { kind: 'girth', bones: ['shinL', 'shinR'], amount: -0.08 }] },
    neg: { synth: [{ kind: 'girth', bones: ['thighL', 'thighR'], amount: -0.07 }, { kind: 'girth', bones: ['shinL', 'shinR'], amount: 0.07 }] }
  },
  knee_width: { pos: { bundle: [B('detail.knee_width.pos')] }, neg: { bundle: [B('detail.knee_width.neg')] } },
  calf_girth: { pos: { bundle: [B('detail.calf_girth.pos')] }, neg: { bundle: [B('detail.calf_girth.neg')] } },
  calf_shape: {
    pos: { synth: [{ kind: 'girth', bones: ['shinL', 'shinR'], amount: 0.12 }] },
    neg: { synth: [{ kind: 'girth', bones: ['shinL', 'shinR'], amount: -0.08 }] }
  },
  ankle_girth: { pos: { bundle: [B('detail.ankle_girth.pos')] }, neg: { bundle: [B('detail.ankle_girth.neg')] } },
  foot_length: {
    pos: { synth: [{ kind: 'scaleAt', bone: 'footL', amount: [0.03, 0.02, 0.16] }, { kind: 'scaleAt', bone: 'footR', amount: [0.03, 0.02, 0.16] }] },
    neg: { synth: [{ kind: 'scaleAt', bone: 'footL', amount: [-0.02, -0.01, -0.12] }, { kind: 'scaleAt', bone: 'footR', amount: [-0.02, -0.01, -0.12] }] }
  },
  foot_width: {
    pos: { synth: [{ kind: 'scaleAt', bone: 'footL', amount: [0.14, 0, 0.02] }, { kind: 'scaleAt', bone: 'footR', amount: [0.14, 0, 0.02] }] },
    neg: { synth: [{ kind: 'scaleAt', bone: 'footL', amount: [-0.1, 0, -0.01] }, { kind: 'scaleAt', bone: 'footR', amount: [-0.1, 0, -0.01] }] }
  },

  // ---------------------------------------------------------- fantasy
  hunch: {
    pos: {
      synth: [
        { kind: 'shift', bones: ['chest'], vec: [0, -0.02, -0.03] },
        { kind: 'shift', bones: ['neck', 'head'], vec: [0, -0.05, 0.05] }
      ]
    }
  },
  limb_ratio: {
    pos: {
      synth: [
        { kind: 'length', bones: ['upperArmL', 'forearmL', 'upperArmR', 'forearmR'], amount: 0.22 },
        { kind: 'length', bones: ['thighL', 'shinL', 'thighR', 'shinR'], amount: -0.06 }
      ]
    },
    neg: {
      synth: [
        { kind: 'length', bones: ['upperArmL', 'forearmL', 'upperArmR', 'forearmR'], amount: -0.09 },
        { kind: 'length', bones: ['thighL', 'shinL', 'thighR', 'shinR'], amount: 0.05 }
      ]
    }
  },
  tusks: { pos: { fields: true } }
};
