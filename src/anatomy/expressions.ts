/** Expression system: facial expression sliders as displacement-field morphs
 *  on the shared face landmarks. Because they're ordinary morphs they compose
 *  with every identity slider, support per-side unlink (wink, smirk), ship in
 *  GLB as named blendshapes, and save with the character. */
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

export interface ExpressionDef {
  id: string;
  label: string;
  bipolar: boolean;
  pos: FieldOp[];
  neg?: FieldOp[];
}

export const EXPRESSIONS: ExpressionDef[] = [
  {
    id: 'exp_smile',
    label: 'Smile ↔ frown',
    bipolar: true,
    pos: [
      // corners up-back, cheeks raise, lower lids push up a touch
      f('mouth', 0.014, 0.009, [0.35, 1, -0.5], { offset: [0.022, 0.002, -0.004] }),
      f('cheekL', 0.024, 0.005, [0.2, 0.8, 0.4], { offset: [-0.006, -0.01, 0.004] }),
      f('eyeL', 0.014, 0.0022, [0, 1, 0], { offset: [0.004, -0.012, 0] }),
      fc('mouth', 0.016, 0.0025, [0, 0, 1], { offset: [0, -0.004, 0] })
    ],
    neg: [
      // corners down, chin crease, brow shade
      f('mouth', 0.013, 0.008, [0.15, -1, -0.2], { offset: [0.02, 0, -0.002] }),
      fc('chin', 0.014, 0.0035, [0, 1, 0.3], { offset: [0, 0.02, 0.002] }),
      f('browL', 0.02, 0.0025, [0, -1, 0.1], { offset: [-0.008, 0, 0] })
    ]
  },
  {
    id: 'exp_jaw_open',
    label: 'Jaw open',
    bipolar: false,
    pos: [
      fc('chin', 0.032, 0.02, [0, -1, -0.1], { stretch: [1.2, 1.1, 1] }),
      fc('mouth', 0.018, 0.008, [0, -1, 0], { offset: [0, -0.008, 0] }),
      fc('mouth', 0.02, -0.006, [0, 0, 1], { stretch: [1.4, 0.4, 1], k: 2.8 }),
      f('jawSideL', 0.022, 0.008, [0, -1, 0], { offset: [0, -0.006, 0.004] })
    ]
  },
  {
    id: 'exp_pucker',
    label: 'Pucker / kiss',
    bipolar: false,
    pos: [
      fc('mouth', 0.016, 0.011, [0, 0, 1], { stretch: [0.9, 1, 1] }),
      f('mouth', 0.012, 0.006, [-1, 0, 0.1], { offset: [0.02, 0, -0.004] }),
      fc('mouth', 0.008, 0.004, [0, 0, 1], { offset: [0, -0.007, 0.002], k: 2.6 })
    ]
  },
  {
    id: 'exp_brow_raise',
    label: 'Brow raise ↔ lower',
    bipolar: true,
    pos: [
      f('browL', 0.022, 0.008, [0, 1, 0.1], { stretch: [1.5, 0.8, 1] }),
      fc('foreheadC', 0.03, 0.003, [0, 0, 1], { offset: [0, -0.01, 0], stretch: [1.6, 0.7, 1] }),
      f('eyeL', 0.014, 0.0025, [0, 1, 0.2], { offset: [0, 0.008, 0] })
    ],
    neg: [
      f('browL', 0.022, 0.007, [0, -1, 0.15], { stretch: [1.4, 0.8, 1] }),
      f('eyeL', 0.015, -0.0025, [0, 0, 1], { offset: [0, 0.006, 0] })
    ]
  },
  {
    id: 'exp_brow_furrow',
    label: 'Brow furrow',
    bipolar: false,
    pos: [
      // inner brows pull down and in, glabella knots
      f('browL', 0.016, 0.008, [-0.6, -1, 0.2], { offset: [-0.012, -0.002, 0.002] }),
      fc('noseTip', 0.011, 0.005, [0, 0, 1], { offset: [0, 0.038, 0], k: 2.6 }),
      fc('noseTip', 0.007, -0.003, [0, 0, 1], { offset: [0.004, 0.036, 0.002], k: 3.2 }),
      fc('noseTip', 0.007, -0.003, [0, 0, 1], { offset: [-0.004, 0.036, 0.002], k: 3.2 })
    ]
  },
  {
    id: 'exp_eyes_close',
    label: 'Eyes close',
    bipolar: false,
    pos: [
      // lids drop over the eyeball: flatten the ball, add a lid ledge
      f('eyeL', 0.012, -0.0055, [0, 0, 1], { k: 2.6 }),
      f('eyeL', 0.013, 0.0035, [0, -1, 0.25], { offset: [0, 0.007, 0.002] }),
      f('eyeL', 0.012, 0.0022, [0, 0, 1], { offset: [0, -0.002, 0], stretch: [1.3, 0.5, 1] })
    ]
  },
  {
    id: 'exp_eyes_wide',
    label: 'Eyes wide',
    bipolar: false,
    pos: [
      f('eyeL', 0.011, 0.0045, [0, 0, 1], { k: 2.8 }),
      f('eyeL', 0.014, -0.003, [0, 1, 0.3], { offset: [0, 0.009, 0] }),
      f('browL', 0.018, 0.0045, [0, 1, 0.1] )
    ]
  },
  {
    id: 'exp_squint',
    label: 'Squint',
    bipolar: false,
    pos: [
      f('eyeL', 0.013, 0.0045, [0, 1, 0.2], { offset: [0.002, -0.011, 0] }),
      f('eyeL', 0.012, -0.0035, [0, 0, 1], { k: 2.8 }),
      f('cheekL', 0.02, 0.003, [0.1, 0.9, 0.3], { offset: [-0.004, -0.006, 0.004] })
    ]
  },
  {
    id: 'exp_sneer',
    label: 'Sneer',
    bipolar: false,
    pos: [
      f('mouth', 0.013, 0.007, [0.1, 1, 0.1], { offset: [0.012, 0.008, 0] }),
      f('noseTip', 0.011, 0.0045, [0.1, 1, -0.2], { offset: [0.008, -0.006, -0.004] }),
      f('noseTip', 0.008, -0.0025, [0, 0, 1], { offset: [0.011, 0.008, -0.002], k: 3 })
    ]
  },
  {
    id: 'exp_cheek_puff',
    label: 'Cheek puff',
    bipolar: false,
    pos: [
      f('cheekL', 0.026, 0.011, 'out', { offset: [-0.004, -0.02, 0.006] }),
      fc('mouth', 0.014, 0.004, [0, 0, 1], { offset: [0, -0.002, 0] })
    ]
  },
  {
    id: 'exp_pout',
    label: 'Pout',
    bipolar: false,
    pos: [
      fc('mouth', 0.011, 0.008, [0, -0.3, 1], { offset: [0, -0.007, 0.002] }),
      fc('chin', 0.013, 0.004, [0, 1, 0.2], { offset: [0, 0.018, 0.002] }),
      f('mouth', 0.01, 0.003, [0, -1, 0], { offset: [0.016, -0.002, -0.002] })
    ]
  }
];

/** One-tap expression bundles (chips in the Expression group). */
export const EXPRESSION_PRESETS: { id: string; label: string; weights: Record<string, number> }[] = [
  { id: 'xp_neutral', label: 'Neutral', weights: {} },
  { id: 'xp_happy', label: 'Happy', weights: { exp_smile: 0.8, exp_squint: 0.25, exp_brow_raise: 0.2 } },
  { id: 'xp_grin', label: 'Big grin', weights: { exp_smile: 1, exp_jaw_open: 0.35, exp_squint: 0.35, exp_brow_raise: 0.3 } },
  { id: 'xp_angry', label: 'Angry', weights: { exp_brow_furrow: 0.9, exp_smile: -0.55, exp_sneer: 0.35, exp_squint: 0.45 } },
  { id: 'xp_sad', label: 'Sad', weights: { exp_smile: -0.7, exp_brow_raise: 0.35, exp_eyes_close: 0.25, exp_pout: 0.3 } },
  { id: 'xp_surprised', label: 'Surprised', weights: { exp_brow_raise: 0.95, exp_eyes_wide: 0.85, exp_jaw_open: 0.55 } },
  { id: 'xp_smug', label: 'Smug', weights: { exp_smile: 0.45, exp_squint: 0.35, exp_brow_raise: -0.25 } },
  { id: 'xp_sleepy', label: 'Sleepy', weights: { exp_eyes_close: 0.75, exp_jaw_open: 0.12, exp_brow_raise: -0.15 } },
  { id: 'xp_kiss', label: 'Kiss', weights: { exp_pucker: 0.9, exp_eyes_close: 0.35 } },
  { id: 'xp_determined', label: 'Determined', weights: { exp_brow_furrow: 0.55, exp_squint: 0.5, exp_smile: -0.2, exp_sneer: 0.15 } }
];
