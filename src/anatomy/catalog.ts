/** The morph catalog: every slider in the system, macro → region → micro,
 *  plus fantasy-race morphs and the gated anatomy module.
 *
 *  Each morph direction is authored as a generator param patch (whole-body
 *  proportion change, baked by re-generating and diffing) and/or a set of
 *  displacement fields (local features). Bipolar sliders (0.5 = anthropometric
 *  average) get separate pos/neg specs; unipolar sliders (0 = neutral) only pos.
 */
import type { GenParams, ParamPatch } from './params';
import { scaleHeights } from './params';
import type { FieldOp } from './fields';
import { DEFINITION_FIELDS, SOFT_FIELDS } from './detail';
import { EXPRESSIONS } from './expressions';

/** reuse a field set at reduced amplitude (macros borrow the detail layers) */
const scaled = (fields: FieldOp[], s: number): FieldOp[] =>
  fields.map((op) => ({ ...op, amp: op.amp * s }));

export type SliderGroup =
  | 'macro'
  | 'head'
  | 'expression'
  | 'neck'
  | 'torso'
  | 'waist'
  | 'arms'
  | 'hands'
  | 'legs'
  | 'feet'
  | 'race'
  | 'nsfw';

export interface MorphSpec {
  params?: (P: GenParams) => ParamPatch;
  fields?: FieldOp[];
}

export interface MorphDef {
  id: string;
  label: string;
  group: SliderGroup;
  /** bipolar: 0.5-centered (average); unipolar: 0 = off */
  bipolar: boolean;
  pos: MorphSpec;
  neg?: MorphSpec;
  nsfw?: boolean;
}

const f = (
  anchor: string,
  r: number,
  amp: number,
  dir: FieldOp['dir'],
  extra: Partial<FieldOp> = {}
): FieldOp => ({ anchor, r, amp, dir, mirror: true, ...extra });

const fc = (
  anchor: string,
  r: number,
  amp: number,
  dir: FieldOp['dir'],
  extra: Partial<FieldOp> = {}
): FieldOp => ({ anchor, r, amp, dir, mirror: false, ...extra });

export const MORPHS: MorphDef[] = [
  // ================================================================ MACROS
  {
    id: 'height',
    label: 'Height',
    group: 'macro',
    bipolar: true,
    pos: { params: (P) => ({ ...scaleHeights(P, 1.1), upperArmLen: P.upperArmLen * 1.08, forearmLen: P.forearmLen * 1.08, footLen: P.footLen * 1.05 }) },
    neg: { params: (P) => ({ ...scaleHeights(P, 0.905), upperArmLen: P.upperArmLen * 0.93, forearmLen: P.forearmLen * 0.93, footLen: P.footLen * 0.96 }) }
  },
  {
    id: 'build',
    label: 'Build (slim ↔ heavy)',
    group: 'macro',
    bipolar: true,
    pos: {
      params: (P) => ({
        waistW: P.waistW * 1.32, waistDf: P.waistDf * 1.45, waistDb: P.waistDb * 1.2,
        hipW: P.hipW * 1.18, hipDf: P.hipDf * 1.3, hipDb: P.hipDb * 1.15,
        pelvisW: P.pelvisW * 1.15, pelvisDf: P.pelvisDf * 1.35, pelvisDb: P.pelvisDb * 1.12,
        ribW: P.ribW * 1.18, ribDf: P.ribDf * 1.28, chestW: P.chestW * 1.12, chestDf: P.chestDf * 1.15,
        thighR: P.thighR * 1.22, thighDf: P.thighDf * 1.25, thighDb: P.thighDb * 1.22,
        upperArmR: P.upperArmR * 1.28, forearmR: P.forearmR * 1.18, calfR: P.calfR * 1.15,
        neckR: P.neckR * 1.14, jawW: P.jawW * 1.1, jawDf: P.jawDf * 1.08, waistN: P.waistN - 0.15
      }),
      fields: [fc('bellyFront', 0.09, 0.02, [0, -0.2, 1])]
    },
    neg: {
      params: (P) => ({
        waistW: P.waistW * 0.82, waistDf: P.waistDf * 0.82, waistDb: P.waistDb * 0.88,
        hipW: P.hipW * 0.9, hipDf: P.hipDf * 0.88, ribW: P.ribW * 0.9, ribDf: P.ribDf * 0.88,
        chestW: P.chestW * 0.93, chestDf: P.chestDf * 0.92, pelvisW: P.pelvisW * 0.92,
        thighR: P.thighR * 0.85, thighDf: P.thighDf * 0.85, thighDb: P.thighDb * 0.87,
        upperArmR: P.upperArmR * 0.84, forearmR: P.forearmR * 0.88, calfR: P.calfR * 0.88,
        neckR: P.neckR * 0.92, jawW: P.jawW * 0.95
      })
    }
  },
  {
    id: 'muscle',
    label: 'Muscle mass',
    group: 'macro',
    bipolar: true,
    pos: {
      params: (P) => ({
        shoulderHalf: P.shoulderHalf * 1.1, upperChestW: P.upperChestW * 1.12, upperChestDf: P.upperChestDf * 1.1,
        chestW: P.chestW * 1.08, chestDf: P.chestDf * 1.14, chestDb: P.chestDb * 1.05,
        upperArmR: P.upperArmR * 1.32, forearmR: P.forearmR * 1.22, wristR: P.wristR * 1.05,
        thighR: P.thighR * 1.18, thighDf: P.thighDf * 1.15, calfR: P.calfR * 1.2, calfBack: P.calfBack * 1.5,
        waistW: P.waistW * 0.98, ribW: P.ribW * 1.06, neckR: P.neckR * 1.15,
        torsoN: P.torsoN + 0.35, limbN: P.limbN + 0.15
      }),
      fields: [f('bustL', 0.06, 0.008, [0, 0, 1]), ...scaled(DEFINITION_FIELDS, 0.45)]
    },
    neg: {
      params: (P) => ({
        upperArmR: P.upperArmR * 0.86, forearmR: P.forearmR * 0.9, thighR: P.thighR * 0.92,
        calfR: P.calfR * 0.88, calfBack: P.calfBack * 0.5, shoulderHalf: P.shoulderHalf * 0.96,
        chestDf: P.chestDf * 0.94, neckR: P.neckR * 0.94, torsoN: P.torsoN - 0.15
      })
    }
  },
  {
    id: 'body_fat',
    label: 'Body fat',
    group: 'macro',
    bipolar: true,
    pos: {
      params: (P) => ({
        waistDf: P.waistDf * 1.5, waistW: P.waistW * 1.22, waistDb: P.waistDb * 1.15,
        pelvisDf: P.pelvisDf * 1.4, pelvisDb: P.pelvisDb * 1.18, hipW: P.hipW * 1.15,
        thighR: P.thighR * 1.15, thighDb: P.thighDb * 1.2, upperArmR: P.upperArmR * 1.15,
        jawW: P.jawW * 1.12, jawDf: P.jawDf * 1.15, chinDrop: P.chinDrop * 0.5,
        waistN: P.waistN - 0.3, torsoN: P.torsoN - 0.25, calfR: P.calfR * 1.08
      }),
      fields: [
        fc('bellyFront', 0.1, 0.03, [0, -0.25, 1]),
        f('cheekL', 0.045, 0.008, [1, -0.3, 0.4]),
        ...scaled(SOFT_FIELDS, 0.5)
      ]
    },
    neg: {
      params: (P) => ({
        waistDf: P.waistDf * 0.85, waistW: P.waistW * 0.9, pelvisDf: P.pelvisDf * 0.9,
        thighR: P.thighR * 0.95, upperArmR: P.upperArmR * 0.94, jawW: P.jawW * 0.96,
        torsoN: P.torsoN + 0.2, waistN: P.waistN + 0.2
      }),
      fields: [f('cheekL', 0.05, -0.006, [1, 0, 0.3])]
    }
  },
  {
    id: 'age',
    label: 'Age (young ↔ elderly)',
    group: 'macro',
    bipolar: true,
    pos: {
      params: (P) => ({
        ...scaleHeights(P, 0.975),
        upperChestZ: P.upperChestZ - 0.028, neckZ: P.neckZ - 0.035, headZ: P.headZ + 0.012,
        shoulderHalf: P.shoulderHalf * 0.94, chestDf: P.chestDf * 0.93, upperArmR: P.upperArmR * 0.9,
        forearmR: P.forearmR * 0.9, thighR: P.thighR * 0.93, calfR: P.calfR * 0.9,
        waistDf: P.waistDf * 1.18, gluteRound: P.gluteRound * 0.88
      }),
      fields: [
        fc('bellyFront', 0.08, 0.014, [0, -0.3, 1]),
        // jowls, soft chin, sunken cheeks, deepened sockets
        f('jawSideL', 0.02, 0.006, [0.4, -0.7, 0.4], { offset: [-0.004, -0.014, 0.006] }),
        fc('chin', 0.02, 0.005, [0, -0.5, 0.7], { offset: [0, -0.012, -0.006] }),
        f('cheekL', 0.026, -0.005, [0.6, 0, 0.6], { offset: [-0.002, -0.018, 0.004] }),
        f('eyeL', 0.018, -0.0028, [0, 0, 1], { stretch: [1.3, 1, 1] }),
        ...scaled(SOFT_FIELDS, 0.22)
      ]
    },
    neg: {
      params: (P) => ({ torsoN: P.torsoN + 0.1, upperChestZ: P.upperChestZ + 0.006 })
    }
  },
  {
    id: 'frame',
    label: 'Frame (masc ↔ fem)',
    group: 'macro',
    bipolar: true,
    pos: {
      // fem
      params: (P) => ({
        shoulderHalf: P.shoulderHalf * 0.92, upperChestW: P.upperChestW * 0.93,
        waistW: P.waistW * 0.88, waistN: P.waistN - 0.25,
        hipW: P.hipW * 1.14, hipDb: P.hipDb * 1.1, pelvisW: P.pelvisW * 1.12,
        pelvisDb: P.pelvisDb * 1.12, gluteRound: P.gluteRound * 1.15,
        thighR: P.thighR * 1.06, thighDb: P.thighDb * 1.08,
        jawW: P.jawW * 0.9, jawDf: P.jawDf * 0.95, neckR: P.neckR * 0.88,
        upperArmR: P.upperArmR * 0.9, forearmR: P.forearmR * 0.92, wristR: P.wristR * 0.92,
        chinDrop: P.chinDrop * 0.8
      }),
      fields: [f('bustL', 0.07, 0.028, [0, -0.15, 1])]
    },
    neg: {
      // masc
      params: (P) => ({
        shoulderHalf: P.shoulderHalf * 1.09, upperChestW: P.upperChestW * 1.08,
        upperChestDf: P.upperChestDf * 1.06, chestW: P.chestW * 1.05, chestDf: P.chestDf * 1.06,
        waistW: P.waistW * 1.06, waistN: P.waistN + 0.25, hipW: P.hipW * 0.94,
        pelvisW: P.pelvisW * 0.95, jawW: P.jawW * 1.12, jawDf: P.jawDf * 1.06,
        neckR: P.neckR * 1.12, chinDrop: P.chinDrop * 1.4,
        upperArmR: P.upperArmR * 1.08, wristR: P.wristR * 1.06
      }),
      fields: [f('browL', 0.035, 0.006, [0, 0, 1])]
    }
  },
  {
    id: 'waist_hip_ratio',
    label: 'Waist-hip ratio',
    group: 'macro',
    bipolar: true,
    pos: {
      params: (P) => ({ waistW: P.waistW * 0.84, waistDf: P.waistDf * 0.9, hipW: P.hipW * 1.12, pelvisW: P.pelvisW * 1.1, waistN: P.waistN - 0.3 })
    },
    neg: {
      params: (P) => ({ waistW: P.waistW * 1.14, hipW: P.hipW * 0.93, pelvisW: P.pelvisW * 0.94, waistN: P.waistN + 0.3 })
    }
  },
  {
    id: 'glamour',
    label: 'Glamour',
    group: 'macro',
    bipolar: false,
    pos: {
      // coordinated idealized shift — silhouette, never one ballooned part
      params: (P) => ({
        waistW: P.waistW * 0.86, waistDf: P.waistDf * 0.92, waistN: P.waistN - 0.35,
        hipW: P.hipW * 1.1, hipDb: P.hipDb * 1.08, pelvisW: P.pelvisW * 1.08,
        pelvisDb: P.pelvisDb * 1.14, gluteRound: P.gluteRound * 1.18,
        upperChestZ: P.upperChestZ + 0.012, waistZ: P.waistZ - 0.006, pelvisZ: P.pelvisZ + 0.008,
        thighR: P.thighR * 1.05, thighDb: P.thighDb * 1.06, calfR: P.calfR * 1.03,
        shoulderHalf: P.shoulderHalf * 1.01
      }),
      fields: [
        f('bustL', 0.075, 0.03, [0, 0.1, 1]),
        fc('gluteApex', 0.09, 0.02, [0, 0.12, -1])
      ]
    }
  },
  {
    id: 'head_units',
    label: 'Head units (chibi ↔ heroic)',
    group: 'macro',
    bipolar: true,
    pos: {
      // heroic 8+: smaller head, longer legs, broader shoulders
      params: (P) => ({
        headW: P.headW * 0.93, headDf: P.headDf * 0.93, headDb: P.headDb * 0.93, jawW: P.jawW * 0.93,
        crownY: P.crownY - (P.crownY - P.headBaseY) * 0.1,
        hipY: P.hipY * 1.045, kneeY: P.kneeY * 1.05, waistY: P.waistY * 1.03, navelY: P.navelY * 1.03,
        chestY: P.chestY * 1.02, upperChestY: P.upperChestY * 1.02, shoulderY: P.shoulderY * 1.018,
        neckBaseY: P.neckBaseY * 1.015, headBaseY: P.headBaseY * 1.012, shoulderHalf: P.shoulderHalf * 1.05
      })
    },
    neg: {
      // chibi 2.5–4: big head, short round body
      params: (P) => ({
        headW: P.headW * 1.75, headDf: P.headDf * 1.7, headDb: P.headDb * 1.75, jawW: P.jawW * 1.6,
        jawDf: P.jawDf * 1.5, neckR: P.neckR * 1.2, chinDrop: P.chinDrop * 0.4,
        crownY: P.headBaseY * 0.62 + 0.34,
        headBaseY: P.headBaseY * 0.62, neckBaseY: P.neckBaseY * 0.6, shoulderY: P.shoulderY * 0.585,
        upperChestY: P.upperChestY * 0.58, chestY: P.chestY * 0.575, waistY: P.waistY * 0.56,
        navelY: P.navelY * 0.56, hipY: P.hipY * 0.55, kneeY: P.kneeY * 0.55, ankleY: P.ankleY * 0.8,
        upperArmLen: P.upperArmLen * 0.55, forearmLen: P.forearmLen * 0.55,
        upperArmR: P.upperArmR * 1.15, thighR: P.thighR * 1.1, waistW: P.waistW * 1.12,
        waistDf: P.waistDf * 1.15, footLen: P.footLen * 0.7, palmLen: P.palmLen * 0.7,
        fingerLen: P.fingerLen * 0.65, shoulderHalf: P.shoulderHalf * 0.82, torsoN: P.torsoN - 0.3
      })
    }
  },

  // ============================================================ HEAD / FACE
  { id: 'cranium_width', label: 'Cranium width', group: 'head', bipolar: true,
    pos: { params: (P) => ({ headW: P.headW * 1.14 }) },
    neg: { params: (P) => ({ headW: P.headW * 0.88 }) } },
  { id: 'forehead_height', label: 'Forehead height', group: 'head', bipolar: true,
    pos: { params: (P) => ({ crownY: P.crownY + 0.012 }), fields: [fc('foreheadC', 0.05, 0.008, [0, 1, 0.2])] },
    neg: { params: (P) => ({ crownY: P.crownY - 0.012 }) } },
  { id: 'brow_depth', label: 'Brow depth', group: 'head', bipolar: true,
    pos: { fields: [f('browL', 0.032, 0.009, [0, 0, 1])] },
    neg: { fields: [f('browL', 0.032, -0.007, [0, 0, 1])] } },
  { id: 'eye_size', label: 'Eye size', group: 'head', bipolar: true,
    pos: { fields: [f('eyeL', 0.02, 0.007, 'out')] },
    neg: { fields: [f('eyeL', 0.02, -0.005, 'out')] } },
  { id: 'eye_spacing', label: 'Eye spacing', group: 'head', bipolar: true,
    pos: { fields: [f('eyeL', 0.022, 0.006, [1, 0, 0])] },
    neg: { fields: [f('eyeL', 0.022, -0.006, [1, 0, 0])] } },
  { id: 'eye_tilt', label: 'Eye tilt', group: 'head', bipolar: true,
    pos: { fields: [f('eyeL', 0.018, 0.005, [0, 1, 0], { offset: [0.012, 0, 0] }), f('eyeL', 0.018, -0.004, [0, 1, 0], { offset: [-0.012, 0, 0] })] },
    neg: { fields: [f('eyeL', 0.018, -0.005, [0, 1, 0], { offset: [0.012, 0, 0] }), f('eyeL', 0.018, 0.004, [0, 1, 0], { offset: [-0.012, 0, 0] })] } },
  { id: 'cheekbone_height', label: 'Cheekbone height', group: 'head', bipolar: true,
    pos: { fields: [f('cheekL', 0.04, 0.007, [0.6, 0.7, 0.35])] },
    neg: { fields: [f('cheekL', 0.04, 0.006, [0.3, -0.8, 0.2])] } },
  { id: 'cheekbone_width', label: 'Cheekbone width', group: 'head', bipolar: true,
    pos: { fields: [f('cheekL', 0.045, 0.009, [1, 0, 0.1])] },
    neg: { fields: [f('cheekL', 0.045, -0.008, [1, 0, 0.1])] } },
  { id: 'nose_bridge_width', label: 'Nose bridge width', group: 'head', bipolar: true,
    pos: { fields: [f('noseTip', 0.016, 0.004, [1, 0, 0], { offset: [0.008, 0.02, -0.01] })] },
    neg: { fields: [f('noseTip', 0.016, -0.003, [1, 0, 0], { offset: [0.008, 0.02, -0.01] })] } },
  { id: 'nose_length', label: 'Nose length', group: 'head', bipolar: true,
    pos: { fields: [fc('noseTip', 0.024, 0.01, [0, -0.35, 1])] },
    neg: { fields: [fc('noseTip', 0.024, -0.008, [0, -0.2, 1])] } },
  { id: 'nose_tip', label: 'Nose tip (up ↔ down)', group: 'head', bipolar: true,
    pos: { fields: [fc('noseTip', 0.016, 0.006, [0, 1, 0.25])] },
    neg: { fields: [fc('noseTip', 0.016, -0.006, [0, 1, -0.1])] } },
  { id: 'jaw_width', label: 'Jaw width', group: 'head', bipolar: true,
    pos: { params: (P) => ({ jawW: P.jawW * 1.18 }) },
    neg: { params: (P) => ({ jawW: P.jawW * 0.84 }) } },
  { id: 'chin_length', label: 'Chin length', group: 'head', bipolar: true,
    pos: { params: (P) => ({ chinDrop: P.chinDrop + 0.014 }) },
    neg: { params: (P) => ({ chinDrop: Math.max(0.002, P.chinDrop - 0.01) }) } },
  { id: 'chin_point', label: 'Chin point', group: 'head', bipolar: true,
    pos: { fields: [fc('chin', 0.02, 0.008, [0, -0.2, 1])] },
    neg: { fields: [fc('chin', 0.026, -0.006, [0, 0, 1])] } },
  { id: 'ear_size', label: 'Ear size', group: 'head', bipolar: true,
    pos: { fields: [f('earL', 0.025, 0.009, 'out')] },
    neg: { fields: [f('earL', 0.025, -0.006, 'out')] } },
  { id: 'ear_angle', label: 'Ear angle', group: 'head', bipolar: true,
    pos: { fields: [f('earL', 0.024, 0.007, [1, 0.1, -0.2])] },
    neg: { fields: [f('earL', 0.024, -0.005, [1, 0, 0])] } },
  { id: 'mouth_width', label: 'Mouth width', group: 'head', bipolar: true,
    pos: { fields: [f('mouth', 0.02, 0.005, [1, 0, 0], { offset: [0.014, 0, -0.004] })] },
    neg: { fields: [f('mouth', 0.02, -0.005, [1, 0, 0], { offset: [0.014, 0, -0.004] })] } },
  { id: 'lip_fullness', label: 'Lip fullness', group: 'head', bipolar: true,
    pos: { fields: [fc('mouth', 0.017, 0.006, [0, 0, 1])] },
    neg: { fields: [fc('mouth', 0.017, -0.004, [0, 0, 1])] } },
  { id: 'eye_depth', label: 'Eye depth', group: 'head', bipolar: true,
    pos: { fields: [f('eyeL', 0.018, -0.004, [0, 0, 1], { stretch: [1.3, 0.9, 1] })] },
    neg: { fields: [f('eyeL', 0.018, 0.0035, [0, 0, 1], { stretch: [1.3, 0.9, 1] })] } },
  { id: 'nostril_flare', label: 'Nostril flare', group: 'head', bipolar: true,
    pos: { fields: [f('noseTip', 0.01, 0.005, 'out', { offset: [0.012, -0.01, -0.005], k: 2.8 })] },
    neg: { fields: [f('noseTip', 0.01, -0.0035, 'out', { offset: [0.012, -0.01, -0.005], k: 2.8 })] } },
  { id: 'mouth_height', label: 'Mouth height', group: 'head', bipolar: true,
    pos: { fields: [fc('mouth', 0.02, 0.006, [0, 1, 0], { stretch: [1.4, 1, 1] })] },
    neg: { fields: [fc('mouth', 0.02, -0.006, [0, 1, 0], { stretch: [1.4, 1, 1] })] } },
  { id: 'jaw_forward', label: 'Jaw forward (under ↔ over)', group: 'head', bipolar: true,
    pos: { fields: [fc('chin', 0.03, 0.008, [0, 0, 1], { stretch: [1.3, 1, 1] }), fc('mouth', 0.014, 0.004, [0, 0, 1], { offset: [0, -0.006, 0] })] },
    neg: { fields: [fc('chin', 0.03, -0.007, [0, 0, 1], { stretch: [1.3, 1, 1] })] } },

  // ============================================== EXPRESSIONS (rig-ready)
  ...EXPRESSIONS.map((e): MorphDef => ({
    id: e.id,
    label: e.label,
    group: 'expression',
    bipolar: e.bipolar,
    pos: { fields: e.pos },
    ...(e.neg ? { neg: { fields: e.neg } } : {})
  })),

  // ================================================================== NECK
  { id: 'neck_girth', label: 'Neck girth', group: 'neck', bipolar: true,
    pos: { params: (P) => ({ neckR: P.neckR * 1.22 }) },
    neg: { params: (P) => ({ neckR: P.neckR * 0.82 }) } },
  { id: 'neck_length', label: 'Neck length', group: 'neck', bipolar: true,
    pos: { params: (P) => ({ headBaseY: P.headBaseY + 0.02, crownY: P.crownY + 0.02 }) },
    neg: { params: (P) => ({ headBaseY: P.headBaseY - 0.018, crownY: P.crownY - 0.018 }) } },

  // ============================================================ TORSO/CHEST
  { id: 'shoulder_width', label: 'Shoulder width', group: 'torso', bipolar: true,
    pos: { params: (P) => ({ shoulderHalf: P.shoulderHalf * 1.13, upperChestW: P.upperChestW * 1.08 }) },
    neg: { params: (P) => ({ shoulderHalf: P.shoulderHalf * 0.88, upperChestW: P.upperChestW * 0.94 }) } },
  { id: 'clavicle_slope', label: 'Clavicle slope', group: 'torso', bipolar: true,
    pos: { params: (P) => ({ shoulderY: P.shoulderY - 0.018 }) },
    neg: { params: (P) => ({ shoulderY: P.shoulderY + 0.014 }) } },
  { id: 'chest_depth', label: 'Chest depth', group: 'torso', bipolar: true,
    pos: { params: (P) => ({ chestDf: P.chestDf * 1.18, chestDb: P.chestDb * 1.1, ribDf: P.ribDf * 1.12 }) },
    neg: { params: (P) => ({ chestDf: P.chestDf * 0.88, chestDb: P.chestDb * 0.93, ribDf: P.ribDf * 0.92 }) } },
  { id: 'bust_size', label: 'Bust / pec size', group: 'torso', bipolar: true,
    pos: { fields: [f('bustL', 0.08, 0.05, [0, -0.12, 1], { stretch: [1.15, 1, 1] })] },
    neg: { fields: [f('bustL', 0.07, -0.02, [0, 0, 1])] } },
  { id: 'bust_lift', label: 'Bust lift', group: 'torso', bipolar: true,
    pos: { fields: [f('bustL', 0.05, 0.016, [0, 1, 0.35], { offset: [0, 0.01, 0.01] }), f('bustL', 0.05, -0.01, [0, 0, 1], { offset: [0, -0.045, 0] })] },
    neg: { fields: [f('bustL', 0.05, -0.014, [0, 1, -0.2], { offset: [0, -0.01, 0.01] })] } },
  { id: 'ribcage_taper', label: 'Ribcage taper', group: 'torso', bipolar: true,
    pos: { params: (P) => ({ ribW: P.ribW * 0.9, ribDf: P.ribDf * 0.95 }) },
    neg: { params: (P) => ({ ribW: P.ribW * 1.12, ribDf: P.ribDf * 1.06 }) } },
  { id: 'back_curve', label: 'Back curve', group: 'torso', bipolar: true,
    pos: { params: (P) => ({ upperChestZ: P.upperChestZ - 0.018, chestDb: P.chestDb * 1.08 }) },
    neg: { params: (P) => ({ upperChestZ: P.upperChestZ + 0.012 }) } },
  { id: 'posture_chest_lift', label: 'Posture: chest lift', group: 'torso', bipolar: true,
    pos: { params: (P) => ({ upperChestZ: P.upperChestZ + 0.016, chestZ: P.chestZ + 0.008, neckZ: P.neckZ - 0.004 }) },
    neg: { params: (P) => ({ upperChestZ: P.upperChestZ - 0.02, chestZ: P.chestZ - 0.01, neckZ: P.neckZ - 0.015 }) } },
  { id: 'posture_shoulder_set', label: 'Posture: shoulder set', group: 'torso', bipolar: true,
    pos: { params: (P) => ({ upperChestDb: P.upperChestDb * 0.94, upperChestZ: P.upperChestZ + 0.008 }) },
    neg: { params: (P) => ({ upperChestZ: P.upperChestZ - 0.016, upperChestDf: P.upperChestDf * 0.95 }) } },
  { id: 'v_taper', label: 'V-taper (shoulder → waist)', group: 'torso', bipolar: false,
    pos: { params: (P) => ({ shoulderHalf: P.shoulderHalf * 1.12, upperChestW: P.upperChestW * 1.1, chestW: P.chestW * 1.06, waistW: P.waistW * 0.88, waistN: P.waistN + 0.1 }) } },

  // ============================================================ WAIST/HIPS
  { id: 'waist_width', label: 'Waist width', group: 'waist', bipolar: true,
    pos: { params: (P) => ({ waistW: P.waistW * 1.2, waistDf: P.waistDf * 1.1 }) },
    neg: { params: (P) => ({ waistW: P.waistW * 0.8, waistDf: P.waistDf * 0.94 }) } },
  { id: 'waist_definition', label: 'Waist definition', group: 'waist', bipolar: true,
    pos: { params: (P) => ({ waistN: P.waistN - 0.5, waistW: P.waistW * 0.95 }) },
    neg: { params: (P) => ({ waistN: P.waistN + 0.6 }) } },
  { id: 'belly', label: 'Belly', group: 'waist', bipolar: true,
    pos: { fields: [fc('bellyFront', 0.095, 0.042, [0, -0.25, 1])] },
    neg: { fields: [fc('bellyFront', 0.08, -0.015, [0, 0, 1])] } },
  { id: 'hip_width', label: 'Hip width', group: 'waist', bipolar: true,
    pos: { params: (P) => ({ hipW: P.hipW * 1.16, pelvisW: P.pelvisW * 1.14, legSpread: P.legSpread * 1.06 }) },
    neg: { params: (P) => ({ hipW: P.hipW * 0.88, pelvisW: P.pelvisW * 0.9 }) } },
  { id: 'hip_curve', label: 'Hip curve', group: 'waist', bipolar: true,
    pos: { fields: [f('hipSideL', 0.075, 0.02, [1, 0, 0]), f('thighSideL', 0.06, 0.01, [1, 0.3, 0])] },
    neg: { fields: [f('hipSideL', 0.075, -0.014, [1, 0, 0])] } },
  { id: 'glute_size', label: 'Glute size', group: 'waist', bipolar: true,
    pos: { fields: [fc('gluteApex', 0.1, 0.05, [0, -0.05, -1], { stretch: [1.25, 1, 1] })] },
    neg: { fields: [fc('gluteApex', 0.09, -0.022, [0, 0, -1], { stretch: [1.2, 1, 1] })] } },
  { id: 'glute_shape', label: 'Glute shape (athletic ↔ round)', group: 'waist', bipolar: true,
    pos: { fields: [fc('gluteApex', 0.07, 0.02, [0, -0.5, -1], { offset: [0, -0.02, 0] }), fc('gluteApex', 0.06, 0.008, [0, 1, -0.2], { offset: [0, 0.03, 0] })] },
    neg: { fields: [fc('gluteApex', 0.08, 0.014, [0, 0.8, -0.5], { offset: [0, 0.02, 0] }), fc('gluteApex', 0.06, -0.01, [0, 0, -1], { offset: [0, -0.03, 0] })] } },
  { id: 'thigh_hip_transition', label: 'Thigh–hip transition', group: 'waist', bipolar: true,
    pos: { fields: [f('thighSideL', 0.07, 0.014, [1, 0, 0], { offset: [0, 0.05, 0] })] },
    neg: { fields: [f('thighSideL', 0.06, -0.012, [1, 0, 0], { offset: [0, 0.05, 0] })] } },
  { id: 'lower_back_arch', label: 'Lower-back arch', group: 'waist', bipolar: true,
    pos: { params: (P) => ({ waistZ: P.waistZ - 0.014, pelvisZ: P.pelvisZ + 0.012, gluteRound: P.gluteRound * 1.08 }) },
    neg: { params: (P) => ({ waistZ: P.waistZ + 0.01, pelvisZ: P.pelvisZ - 0.008 }) } },
  { id: 'posture_pelvis_tilt', label: 'Posture: pelvis tilt', group: 'waist', bipolar: true,
    pos: { params: (P) => ({ pelvisZ: P.pelvisZ + 0.014, waistZ: P.waistZ - 0.006 }) },
    neg: { params: (P) => ({ pelvisZ: P.pelvisZ - 0.014, waistZ: P.waistZ + 0.004 }) } },
  { id: 'hip_flare', label: 'Hip flare (waist → hip)', group: 'waist', bipolar: false,
    pos: { params: (P) => ({ hipW: P.hipW * 1.12, pelvisW: P.pelvisW * 1.1, waistW: P.waistW * 0.92, waistN: P.waistN - 0.2 }), fields: [f('hipSideL', 0.07, 0.012, [1, 0, 0])] } },

  // ================================================================== ARMS
  { id: 'arm_length', label: 'Arm length', group: 'arms', bipolar: true,
    pos: { params: (P) => ({ upperArmLen: P.upperArmLen * 1.1, forearmLen: P.forearmLen * 1.1 }) },
    neg: { params: (P) => ({ upperArmLen: P.upperArmLen * 0.88, forearmLen: P.forearmLen * 0.88 }) } },
  { id: 'upper_arm_girth', label: 'Upper-arm girth', group: 'arms', bipolar: true,
    pos: { params: (P) => ({ upperArmR: P.upperArmR * 1.3 }) },
    neg: { params: (P) => ({ upperArmR: P.upperArmR * 0.8 }) } },
  { id: 'forearm_girth', label: 'Forearm girth', group: 'arms', bipolar: true,
    pos: { params: (P) => ({ forearmR: P.forearmR * 1.28 }) },
    neg: { params: (P) => ({ forearmR: P.forearmR * 0.82 }) } },
  { id: 'wrist_girth', label: 'Wrist girth', group: 'arms', bipolar: true,
    pos: { params: (P) => ({ wristR: P.wristR * 1.25 }) },
    neg: { params: (P) => ({ wristR: P.wristR * 0.8 }) } },

  // ================================================================= HANDS
  { id: 'hand_size', label: 'Hand size', group: 'hands', bipolar: true,
    pos: { params: (P) => ({ palmLen: P.palmLen * 1.15, palmW: P.palmW * 1.15, fingerLen: P.fingerLen * 1.15, fingerR: P.fingerR * 1.12 }) },
    neg: { params: (P) => ({ palmLen: P.palmLen * 0.87, palmW: P.palmW * 0.87, fingerLen: P.fingerLen * 0.87, fingerR: P.fingerR * 0.9 }) } },
  { id: 'finger_length', label: 'Finger length', group: 'hands', bipolar: true,
    pos: { params: (P) => ({ fingerLen: P.fingerLen * 1.22 }) },
    neg: { params: (P) => ({ fingerLen: P.fingerLen * 0.8 }) } },
  { id: 'finger_thickness', label: 'Finger thickness', group: 'hands', bipolar: true,
    pos: { params: (P) => ({ fingerR: P.fingerR * 1.3 }) },
    neg: { params: (P) => ({ fingerR: P.fingerR * 0.78 }) } },

  // ================================================================== LEGS
  { id: 'leg_length', label: 'Leg length', group: 'legs', bipolar: true,
    pos: { params: (P) => ({ hipY: P.hipY + 0.045, kneeY: P.kneeY + 0.03, waistY: P.waistY + 0.045, navelY: P.navelY + 0.045, chestY: P.chestY + 0.045, upperChestY: P.upperChestY + 0.045, shoulderY: P.shoulderY + 0.045, neckBaseY: P.neckBaseY + 0.045, headBaseY: P.headBaseY + 0.045, crownY: P.crownY + 0.045 }) },
    neg: { params: (P) => ({ hipY: P.hipY - 0.04, kneeY: P.kneeY - 0.026, waistY: P.waistY - 0.04, navelY: P.navelY - 0.04, chestY: P.chestY - 0.04, upperChestY: P.upperChestY - 0.04, shoulderY: P.shoulderY - 0.04, neckBaseY: P.neckBaseY - 0.04, headBaseY: P.headBaseY - 0.04, crownY: P.crownY - 0.04 }) } },
  { id: 'thigh_girth', label: 'Thigh girth', group: 'legs', bipolar: true,
    pos: { params: (P) => ({ thighR: P.thighR * 1.22, thighDf: P.thighDf * 1.2, thighDb: P.thighDb * 1.22 }) },
    neg: { params: (P) => ({ thighR: P.thighR * 0.82, thighDf: P.thighDf * 0.85, thighDb: P.thighDb * 0.84 }) } },
  { id: 'thigh_taper', label: 'Thigh taper', group: 'legs', bipolar: true,
    pos: { params: (P) => ({ kneeR: P.kneeR * 0.88, thighR: P.thighR * 1.06 }) },
    neg: { params: (P) => ({ kneeR: P.kneeR * 1.1 }) } },
  { id: 'knee_width', label: 'Knee width', group: 'legs', bipolar: true,
    pos: { params: (P) => ({ kneeR: P.kneeR * 1.18 }) },
    neg: { params: (P) => ({ kneeR: P.kneeR * 0.85 }) } },
  { id: 'calf_girth', label: 'Calf girth', group: 'legs', bipolar: true,
    pos: { params: (P) => ({ calfR: P.calfR * 1.25, calfBack: P.calfBack * 1.3 }) },
    neg: { params: (P) => ({ calfR: P.calfR * 0.8, calfBack: P.calfBack * 0.6 }) } },
  { id: 'calf_shape', label: 'Calf shape', group: 'legs', bipolar: true,
    pos: { params: (P) => ({ calfBack: P.calfBack * 1.8 }) },
    neg: { params: (P) => ({ calfBack: P.calfBack * 0.3 }) } },
  { id: 'ankle_girth', label: 'Ankle girth', group: 'legs', bipolar: true,
    pos: { params: (P) => ({ ankleR: P.ankleR * 1.25 }) },
    neg: { params: (P) => ({ ankleR: P.ankleR * 0.78 }) } },

  // ================================================================== FEET
  { id: 'foot_length', label: 'Foot length', group: 'feet', bipolar: true,
    pos: { params: (P) => ({ footLen: P.footLen * 1.15 }) },
    neg: { params: (P) => ({ footLen: P.footLen * 0.86 }) } },
  { id: 'foot_width', label: 'Foot width', group: 'feet', bipolar: true,
    pos: { params: (P) => ({ footW: P.footW * 1.2 }) },
    neg: { params: (P) => ({ footW: P.footW * 0.82 }) } },

  // ==================================================== SURFACE DETAIL
  { id: 'muscle_definition', label: 'Muscle definition', group: 'macro', bipolar: false,
    pos: { fields: DEFINITION_FIELDS } },
  { id: 'soft_folds', label: 'Soft folds', group: 'macro', bipolar: false,
    pos: { fields: SOFT_FIELDS } },
  { id: 'traps', label: 'Trapezius', group: 'torso', bipolar: true,
    pos: { fields: [
      f('neckBase', 0.042, 0.009, [0, 1, -0.25], { offset: [0.045, 0.008, -0.014], stretch: [1.4, 0.85, 1] }),
      f('neckBase', 0.03, 0.005, [0.3, 0.6, -0.4], { offset: [0.07, -0.01, -0.01] })
    ] },
    neg: { fields: [f('neckBase', 0.04, -0.005, [0, 1, -0.25], { offset: [0.045, 0.005, -0.014] })] } },

  // ============================================================ RACE MORPHS
  { id: 'ear_length', label: 'Ear length (elf)', group: 'race', bipolar: false,
    pos: { fields: [f('earL', 0.03, 0.022, [0.5, 0.75, -0.35], { offset: [0.008, 0.012, -0.008], stretch: [1, 1.4, 1] })] } },
  { id: 'ear_point', label: 'Ear point', group: 'race', bipolar: false,
    pos: { fields: [f('earL', 0.014, 0.012, [0.4, 1, -0.3], { offset: [0.006, 0.02, -0.01] })] } },
  { id: 'brow_ridge', label: 'Brow ridge (orc)', group: 'race', bipolar: false,
    pos: { fields: [f('browL', 0.04, 0.012, [0, 0.15, 1]), fc('foreheadC', 0.05, -0.008, [0, 0, 1], { offset: [0, 0.02, 0] })] } },
  { id: 'tusks', label: 'Jaw / tusks', group: 'race', bipolar: false,
    pos: { params: (P) => ({ jawW: P.jawW * 1.18, jawDf: P.jawDf * 1.15 }), fields: [f('mouth', 0.018, 0.012, [0.25, 0.6, 0.8], { offset: [0.018, -0.008, 0] })] } },
  { id: 'hunch', label: 'Hunch', group: 'race', bipolar: false,
    pos: { params: (P) => ({ upperChestZ: P.upperChestZ - 0.045, neckZ: P.neckZ - 0.06, headZ: P.headZ - 0.03, chestDb: P.chestDb * 1.2, headBaseY: P.headBaseY - 0.02, crownY: P.crownY - 0.025 }) } },
  { id: 'limb_ratio', label: 'Limb ratio (long arms)', group: 'race', bipolar: false,
    pos: { params: (P) => ({ upperArmLen: P.upperArmLen * 1.22, forearmLen: P.forearmLen * 1.25, palmLen: P.palmLen * 1.15, fingerLen: P.fingerLen * 1.2 }) } },

  // ===================================================== NSFW (module-gated)
  { id: 'genital_masc', label: 'Masc anatomy', group: 'nsfw', bipolar: false, nsfw: true,
    pos: { params: (P) => ({ groinOut: P.groinOut + 0.055, groinScale: P.groinScale * 1.25 }) } },
  { id: 'genital_masc_size', label: 'Masc anatomy size', group: 'nsfw', bipolar: false, nsfw: true,
    pos: { params: (P) => ({ groinScale: P.groinScale * 1.6, groinOut: P.groinOut + 0.02 }) } },
  { id: 'genital_fem', label: 'Fem anatomy', group: 'nsfw', bipolar: false, nsfw: true,
    pos: { fields: [fc('groinC', 0.035, 0.012, [0, -0.3, 1]), fc('groinC', 0.014, -0.006, [0, 0, 1], { offset: [0, -0.01, 0.01] })] } },
  { id: 'pubic_mound', label: 'Pubic mound', group: 'nsfw', bipolar: false, nsfw: true,
    pos: { fields: [fc('groinC', 0.045, 0.01, [0, 0.2, 1], { offset: [0, 0.04, -0.01] })] } },
  { id: 'nipples', label: 'Nipple / areola', group: 'nsfw', bipolar: false, nsfw: true,
    pos: { fields: [f('bustL', 0.013, 0.006, [0, 0, 1], { offset: [0, 0, 0.012], k: 3 }), f('bustL', 0.024, 0.003, [0, 0, 1], { offset: [0, 0, 0.01] })] } }
];

export const MORPH_BY_ID = new Map(MORPHS.map((m) => [m.id, m]));

/** UI group presentation order + labels. */
export const GROUPS: { id: SliderGroup; label: string }[] = [
  { id: 'macro', label: 'Macro' },
  { id: 'head', label: 'Head & face' },
  { id: 'expression', label: 'Expression' },
  { id: 'neck', label: 'Neck' },
  { id: 'torso', label: 'Shoulders & chest' },
  { id: 'waist', label: 'Waist, hips & glutes' },
  { id: 'arms', label: 'Arms' },
  { id: 'hands', label: 'Hands' },
  { id: 'legs', label: 'Legs' },
  { id: 'feet', label: 'Feet' },
  { id: 'race', label: 'Fantasy' },
  { id: 'nsfw', label: 'Anatomy (adult)' }
];

/** Viewport region id → slider group to open on tap. */
export const REGION_TO_GROUP: Record<number, SliderGroup> = {
  0: 'head',
  1: 'neck',
  2: 'torso',
  3: 'torso',
  4: 'waist',
  5: 'arms',
  6: 'hands',
  7: 'legs',
  8: 'feet',
  9: 'nsfw'
};
