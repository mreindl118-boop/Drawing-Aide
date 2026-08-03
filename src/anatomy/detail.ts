/** Anatomical surface detail as analytic displacement fields.
 *
 *  BASE_DETAIL is always on — it's what makes the neutral body read as a
 *  body instead of a mannequin: a real face (sockets, nose, lips, chin,
 *  ears), clavicles, sternum, navel, spinal groove, scapulae, glute crease,
 *  kneecaps, calf heads. DEFINITION_FIELDS and SOFT_FIELDS drive the
 *  muscle-definition and soft-folds sliders and are reused (at lower
 *  amplitude) inside the muscle / body-fat macros.
 */
import type { FieldOp } from './fields';

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

const FACE_OPS: FieldOp[] = [
  // ------------------------------------------------------------------ face
  // (feature sizes match real anatomy — a nose is ~3.5 cm, not a pimple;
  //  the dense head mesh lets creases run sharp: high k = crisp transition)
  // eye sockets: recessed almond hollows…
  f('eyeL', 0.019, -0.009, [0, 0, 1], { stretch: [1.3, 0.85, 1], k: 2.8 }),
  // …with eyeball volume inside…
  f('eyeL', 0.0115, 0.008, [0, 0, 1], { k: 3.4 }),
  // …upper and lower lid ledges over the ball…
  f('eyeL', 0.012, 0.0035, [0, -0.3, 1], { offset: [0, 0.0065, 0.001], stretch: [1.25, 0.45, 1], k: 3.6 }),
  f('eyeL', 0.011, 0.0022, [0, 0.3, 1], { offset: [0, -0.006, 0.0005], stretch: [1.3, 0.4, 1], k: 3.8 }),
  // …crisp upper-lid fold line and lower-lid shadow line
  f('eyeL', 0.011, -0.0028, [0, 0, 1], { offset: [0, 0.0105, 0.001], stretch: [1.5, 0.28, 1], k: 4.2 }),
  f('eyeL', 0.01, -0.0018, [0, 0, 1], { offset: [0, -0.0095, 0.0005], stretch: [1.5, 0.3, 1], k: 4.2 }),
  // inner-corner tear duct dip
  f('eyeL', 0.006, -0.002, [0, 0, 1], { offset: [-0.013, -0.002, 0], k: 3.6 }),
  // brow bar over both sockets
  f('browL', 0.03, 0.0062, [0, 0.15, 1], { stretch: [1.5, 0.68, 1] }),
  // glabella (between brows) + nasal root dip
  fc('noseTip', 0.014, -0.0048, [0, 0, 1], { offset: [0, 0.037, 0.001], k: 2.8 }),
  // nose: full ridge, bridge, tip ball, alae
  fc('noseTip', 0.022, 0.012, [0, -0.05, 1], { stretch: [0.4, 1.1, 1] }),
  fc('noseTip', 0.011, 0.008, 'out', { k: 3.2 }),
  fc('noseTip', 0.016, 0.0085, [0, 0, 1], { offset: [0, 0.024, -0.006], stretch: [0.48, 1.5, 1] }),
  f('noseTip', 0.011, 0.0068, 'out', { offset: [0.012, -0.01, -0.005], k: 2.9 }),
  // alar crease around each wing
  f('noseTip', 0.008, -0.0028, [0.4, 0, 1], { offset: [0.016, -0.008, -0.009], k: 3.8 }),
  // nostril underside shadow
  fc('noseTip', 0.009, -0.0038, [0, 1, 0.2], { offset: [0, -0.0145, -0.004], k: 3.4 }),
  // lips: block, sharp seam, vermilion rolls, philtrum, nasolabial fold
  fc('mouth', 0.02, 0.0062, [0, 0, 1], { stretch: [1.5, 0.9, 1] }),
  fc('mouth', 0.02, -0.0058, [0, 0, 1], { stretch: [1.7, 0.2, 1], k: 4 }),
  fc('mouth', 0.016, 0.0028, [0, 0.25, 1], { offset: [0, 0.006, 0.001], stretch: [1.35, 0.42, 1], k: 3.4 }),
  fc('mouth', 0.015, 0.0032, [0, -0.2, 1], { offset: [0, -0.007, 0.001], stretch: [1.2, 0.5, 1], k: 3.2 }),
  fc('mouth', 0.007, -0.0034, [0, 0, 1], { offset: [0, 0.0145, 0.002], k: 3 }),
  f('mouth', 0.013, -0.0028, [0, 0, 1], { offset: [0.021, 0.009, -0.002], stretch: [0.55, 1.5, 1], k: 3 }),
  // under-lip shadow above the chin ball
  fc('chin', 0.013, -0.0032, [0, 0, 1], { offset: [0, 0.0255, 0.003], stretch: [1.5, 0.45, 1], k: 3.6 }),
  // chin ball
  fc('chin', 0.016, 0.005, [0, -0.2, 1], { offset: [0, 0.01, 0] }),
  // cheekbone plane + under-cheek hollow
  f('cheekL', 0.036, 0.005, [0.55, 0.15, 0.75], { offset: [0, -0.012, 0.004] }),
  f('cheekL', 0.026, -0.004, [0.3, 0, 1], { offset: [-0.004, -0.024, 0.006] }),
  // temples flatten the upper sides
  f('eyeL', 0.024, -0.004, [1, 0, 0], { offset: [0.03, 0.028, -0.03] }),
  // jawline edge
  f('jawSideL', 0.024, 0.005, [0.85, -0.25, 0.1], { offset: [0.002, 0.006, 0.008] }),
  // ears with concha dip
  f('earL', 0.02, 0.009, 'out', { stretch: [0.6, 1.2, 1] }),
  f('earL', 0.01, -0.0035, [1, 0, 0], { offset: [-0.003, 0, 0.004], k: 3 }),
  // occipital bulge (back of skull)
  fc('crown', 0.04, 0.006, [0, -0.15, -1], { offset: [0, -0.045, -0.055] })
];

const BODY_OPS: FieldOp[] = [
  // ---------------------------------------------------------------- torso
  // clavicle ridges with supraclavicular dip above
  f('neckBase', 0.032, 0.0038, [0, 0.35, 1], { offset: [0.055, -0.028, 0.045], stretch: [1.9, 0.55, 1] }),
  f('neckBase', 0.02, -0.0028, [0, 0, 1], { offset: [0.045, -0.012, 0.045], stretch: [1.7, 0.6, 1] }),
  // sternum groove between the pecs
  fc('chestC', 0.016, -0.0032, [0, 0, 1], { offset: [0, 0.012, 0], stretch: [0.42, 1.7, 1] }),
  // pec underline
  f('bustL', 0.02, -0.0028, [0, 0, 1], { offset: [0, -0.047, 0.004], stretch: [1.55, 0.5, 1] }),
  // linea alba + navel
  fc('bellyFront', 0.0125, -0.0032, [0, 0, 1], { offset: [0, 0.035, 0.004], stretch: [0.3, 2.6, 1] }),
  fc('bellyFront', 0.008, -0.005, [0, 0, 1], { offset: [0, 0.002, 0.004], k: 3.2 }),
  // gentle upper-ab plane
  f('bellyFront', 0.021, 0.0025, [0, 0, 1], { offset: [0.027, 0.062, 0.006] }),
  // spinal groove + erector ridges + scapulae
  fc('backC', 0.02, 0.0042, [0, 0, 1], { offset: [0, 0.01, 0], stretch: [0.32, 2.6, 1] }),
  f('backC', 0.024, 0.0026, [0, 0, -1], { offset: [0.023, -0.01, 0], stretch: [0.55, 2.2, 1] }),
  f('backC', 0.036, 0.0042, [0, 0, -1], { offset: [0.058, 0.055, 0], stretch: [1.1, 1.25, 1] }),
  // sacrum dimples
  f('gluteApex', 0.014, -0.0035, [0, 0, -1], { offset: [0.032, 0.075, 0.02], k: 3 }),
  // glute crease (fold under each glute)
  f('gluteApex', 0.024, -0.0045, [0, 0.35, -1], { offset: [0.05, -0.065, 0.012], stretch: [1.5, 0.45, 1], k: 3 }),
  // deltoid caps
  f('shoulderTipL', 0.042, 0.0038, 'out'),
  // trapezius slope
  f('neckBase', 0.038, 0.0028, [0, 1, -0.25], { offset: [0.042, 0.005, -0.015], stretch: [1.5, 0.8, 1] }),

  // ---------------------------------------------------------------- limbs
  // kneecaps with patellar dips beside
  f('kneeL', 0.021, 0.0042, [0, 0, 1], { offset: [0, 0.012, 0.02] }),
  f('kneeL', 0.013, -0.002, [0, 0, 1], { offset: [0.02, 0.02, 0.018], k: 3 }),
  // twin calf heads
  f('calfL', 0.028, 0.0032, [0.3, 0, -0.95], { offset: [0.014, 0.045, 0.01] }),
  f('calfL', 0.028, 0.0028, [-0.3, 0, -0.95], { offset: [-0.014, 0.045, 0.01] }),
  // elbow point + biceps hint
  f('elbowL', 0.015, 0.0032, 'out'),
  f('elbowL', 0.028, 0.0026, [0, 0.2, 1], { offset: [0, 0.09, 0.012] }),
  // wrist bone
  f('wristL', 0.009, 0.0022, 'out', { offset: [0.006, 0.008, -0.004], k: 3 }),
  // achilles + ankle bones
  f('heelL', 0.012, 0.0025, 'out', { offset: [0.012, 0.045, 0.01], k: 3 })
];

export const BASE_DETAIL: FieldOp[] = [...FACE_OPS, ...BODY_OPS];

/** driven by the muscle-definition slider (and, softer, the muscle macro) */
export const DEFINITION_FIELDS: FieldOp[] = [
  // six-pack blocks (3 mirrored rows) + deep linea alba + tight navel ring
  f('bellyFront', 0.019, 0.005, [0, 0, 1], { offset: [0.026, 0.065, 0.008] }),
  f('bellyFront', 0.019, 0.0052, [0, 0, 1], { offset: [0.026, 0.028, 0.009] }),
  f('bellyFront', 0.018, 0.0046, [0, 0, 1], { offset: [0.026, -0.008, 0.008] }),
  fc('bellyFront', 0.013, -0.005, [0, 0, 1], { offset: [0, 0.035, 0.004], stretch: [0.3, 2.8, 1] }),
  f('bellyFront', 0.017, -0.0035, [0, 0, 1], { offset: [0.052, 0.03, 0], stretch: [0.4, 2.4, 1] }),
  // pec mass + sharper underline, sternum cut
  f('bustL', 0.05, 0.006, [0, 0.1, 1], { stretch: [1.2, 0.9, 1] }),
  f('bustL', 0.02, -0.0042, [0, 0, 1], { offset: [0, -0.05, 0.004], stretch: [1.6, 0.5, 1] }),
  fc('chestC', 0.015, -0.0038, [0, 0, 1], { offset: [0, 0.012, 0], stretch: [0.4, 1.8, 1] }),
  // serratus / oblique cuts
  f('waistSideL', 0.016, 0.0032, [0.8, 0, 0.5], { offset: [-0.005, 0.055, 0.02], stretch: [0.8, 0.5, 1] }),
  f('waistSideL', 0.02, -0.0028, [0.6, 0, 0.8], { offset: [0, -0.01, 0.025], stretch: [0.5, 1.8, 1] }),
  // iliac furrow (the V)
  f('hipSideL', 0.022, -0.0045, [0, 0, 1], { offset: [-0.045, -0.01, 0.075], stretch: [0.55, 1.5, 1], k: 2.6 }),
  // quad sweep + hamstring
  f('thighSideL', 0.035, 0.0042, [0.3, 0, 1], { offset: [-0.03, -0.06, 0.06] }),
  f('thighSideL', 0.032, 0.0032, [0, 0, -1], { offset: [-0.04, -0.09, -0.09] }),
  // deltoid separation + triceps horseshoe
  f('shoulderTipL', 0.018, -0.0032, [0, 0, 1], { offset: [-0.012, -0.035, 0.03], stretch: [0.6, 1.6, 1] }),
  f('elbowL', 0.024, 0.0036, [0, 0.2, -1], { offset: [0.004, 0.085, -0.012] }),
  // forearm ridge + sharper calf heads
  f('wristL', 0.03, 0.0028, [0.4, 0, 1], { offset: [0, 0.1, 0.01], stretch: [0.7, 1.8, 1] }),
  f('calfL', 0.024, 0.0036, [0.3, 0, -1], { offset: [0.014, 0.05, 0.01] }),
  f('calfL', 0.024, 0.0032, [-0.3, 0, -1], { offset: [-0.014, 0.05, 0.01] }),
  // traps pop
  f('neckBase', 0.034, 0.0042, [0, 1, -0.2], { offset: [0.04, 0.008, -0.012] })
];

/** driven by the soft-folds slider (and, softer, the body-fat macro) */
export const SOFT_FIELDS: FieldOp[] = [
  // belly apron fold + side rolls
  fc('bellyFront', 0.03, 0.0085, [0, -0.4, 1], { offset: [0, -0.035, 0.01], stretch: [1.7, 0.7, 1] }),
  fc('bellyFront', 0.018, -0.0045, [0, 0, 1], { offset: [0, -0.055, 0.008], stretch: [2, 0.4, 1], k: 3 }),
  // love handles
  f('waistSideL', 0.032, 0.0075, [1, -0.2, -0.15], { offset: [0, -0.015, -0.02], stretch: [1, 0.75, 1.3] }),
  // back rolls
  f('backC', 0.026, 0.0045, [0, 0, -1], { offset: [0.04, -0.03, 0], stretch: [1.8, 0.5, 1] }),
  // fuller glutes with deeper crease
  fc('gluteApex', 0.06, 0.006, [0, -0.15, -1], { stretch: [1.3, 1, 1] }),
  f('gluteApex', 0.026, -0.005, [0, 0.35, -1], { offset: [0.05, -0.068, 0.012], stretch: [1.5, 0.45, 1], k: 3 }),
  // soft chin / jowls
  fc('chin', 0.02, 0.006, [0, -0.5, 0.8], { offset: [0, -0.012, -0.008] }),
  f('jawSideL', 0.018, 0.0045, [0.4, -0.6, 0.4], { offset: [-0.004, -0.012, 0.006] }),
  // upper-arm softness + inner-thigh fullness
  f('elbowL', 0.03, 0.0045, [0, -0.3, -1], { offset: [0, 0.09, -0.015] }),
  f('thighSideL', 0.035, 0.005, [-1, -0.2, 0.2], { offset: [-0.115, -0.04, 0.02] }),
  // knee softness
  f('kneeL', 0.022, 0.0035, [0, -0.2, 1], { offset: [0, 0.035, 0.015] })
];
