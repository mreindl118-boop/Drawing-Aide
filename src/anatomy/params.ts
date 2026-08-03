/** Generator parameters for the procedural base body.
 *
 *  The whole morph system hangs off one invariant: `generateBody(params)`
 *  always emits the SAME topology (vertex count & order) for any params, so
 *  every proportion morph can be baked as
 *      delta = generate(base + patch) − generate(base)
 *  on the shared topology. BASE_PARAMS is the anthropometric average adult
 *  (~171.5 cm, mixed-frame): the 50% mark of every slider resolves to it.
 *
 *  Units: meters. Y up, feet at y=0, +Z is the character's front,
 *  +X is the character's anatomical left.
 */

export interface GenParams {
  // ---- vertical landmarks (heights, m) ----
  ankleY: number;
  kneeY: number;
  hipY: number; // hip socket / crotch region
  waistY: number;
  navelY: number;
  chestY: number; // nipple line
  upperChestY: number;
  shoulderY: number; // acromion height
  neckBaseY: number;
  headBaseY: number; // chin level
  crownY: number;

  // ---- torso half-widths / depths (m) ----
  pelvisW: number;
  pelvisDf: number; // front depth (belly side)
  pelvisDb: number; // back depth (glute side)
  hipW: number;
  hipDf: number;
  hipDb: number;
  waistW: number;
  waistDf: number;
  waistDb: number;
  ribW: number;
  ribDf: number;
  ribDb: number;
  chestW: number;
  chestDf: number;
  chestDb: number;
  upperChestW: number;
  upperChestDf: number;
  upperChestDb: number;
  shoulderHalf: number; // deltoid outer half-span
  torsoN: number; // superellipse exponent (2 ellipse … 4 boxy)
  waistN: number;

  // ---- spine curve (z offsets of stations; posture) ----
  pelvisZ: number;
  waistZ: number;
  chestZ: number;
  upperChestZ: number;
  neckZ: number;
  headZ: number;

  // ---- neck / head ----
  neckR: number;
  headW: number; // half-width
  headDf: number;
  headDb: number;
  jawW: number; // half-width at jaw station
  jawDf: number;
  chinDrop: number; // how far chin extends below headBaseY
  craniumN: number;

  // ---- arms ----
  armAbduct: number; // radians away from body (A-pose)
  upperArmLen: number;
  forearmLen: number;
  upperArmR: number;
  elbowR: number;
  forearmR: number;
  wristR: number;

  // ---- hands ----
  palmLen: number;
  palmW: number;
  palmT: number; // thickness
  fingerLen: number;
  fingerR: number;

  // ---- legs ----
  legSpread: number; // hip-socket x offset
  thighR: number;
  thighDf: number;
  thighDb: number;
  kneeR: number;
  calfR: number;
  calfBack: number; // calf back-depth bonus
  ankleR: number;
  limbN: number;

  // ---- feet ----
  footLen: number;
  footW: number;
  footH: number;

  // ---- shape exponents / misc ----
  gluteRound: number; // extra back-depth bulge factor at pelvis/hip
  bellyRound: number;

  // ---- nsfw groin patch (hidden inside body at neutral) ----
  groinScale: number;
  groinOut: number; // outward (z) offset; negative keeps it buried
}

export const BASE_PARAMS: GenParams = {
  ankleY: 0.07,
  kneeY: 0.47,
  hipY: 0.84,
  waistY: 1.05,
  navelY: 1.0,
  chestY: 1.26,
  upperChestY: 1.34,
  shoulderY: 1.42,
  neckBaseY: 1.45,
  headBaseY: 1.505,
  crownY: 1.715,

  pelvisW: 0.165,
  pelvisDf: 0.095,
  pelvisDb: 0.115,
  hipW: 0.168,
  hipDf: 0.1,
  hipDb: 0.112,
  waistW: 0.136,
  waistDf: 0.095,
  waistDb: 0.088,
  ribW: 0.15,
  ribDf: 0.1,
  ribDb: 0.095,
  chestW: 0.155,
  chestDf: 0.105,
  chestDb: 0.098,
  upperChestW: 0.16,
  upperChestDf: 0.1,
  upperChestDb: 0.098,
  shoulderHalf: 0.215,
  torsoN: 2.25,
  waistN: 2.1,

  pelvisZ: 0.0,
  waistZ: 0.008,
  chestZ: 0.0,
  upperChestZ: -0.008,
  neckZ: -0.005,
  headZ: 0.005,

  neckR: 0.056,
  headW: 0.078,
  headDf: 0.094,
  headDb: 0.092,
  jawW: 0.062,
  jawDf: 0.085,
  chinDrop: 0.012,
  craniumN: 1.98,

  armAbduct: 0.3,
  upperArmLen: 0.31,
  forearmLen: 0.27,
  upperArmR: 0.047,
  elbowR: 0.04,
  forearmR: 0.042,
  wristR: 0.028,

  palmLen: 0.1,
  palmW: 0.045,
  palmT: 0.018,
  fingerLen: 0.088,
  fingerR: 0.009,

  legSpread: 0.084,
  thighR: 0.086,
  thighDf: 0.088,
  thighDb: 0.095,
  kneeR: 0.059,
  calfR: 0.062,
  calfBack: 0.02,
  ankleR: 0.04,
  limbN: 2.0,

  footLen: 0.25,
  footW: 0.05,
  footH: 0.062,

  gluteRound: 1.0,
  bellyRound: 1.0,

  groinScale: 1.0,
  groinOut: 0.0
};

export type ParamPatch = Partial<GenParams>;

export function patched(base: GenParams, patch: ParamPatch): GenParams {
  return { ...base, ...patch };
}

/** Scale-all helper used by height/headUnits morphs: multiplies every vertical
 *  landmark by `k` keeping feet on the floor. */
export function scaleHeights(p: GenParams, k: number): ParamPatch {
  return {
    ankleY: p.ankleY * k,
    kneeY: p.kneeY * k,
    hipY: p.hipY * k,
    waistY: p.waistY * k,
    navelY: p.navelY * k,
    chestY: p.chestY * k,
    upperChestY: p.upperChestY * k,
    shoulderY: p.shoulderY * k,
    neckBaseY: p.neckBaseY * k,
    headBaseY: p.headBaseY * k,
    crownY: p.crownY * k
  };
}
