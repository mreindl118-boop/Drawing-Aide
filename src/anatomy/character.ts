/** Character parameter model — the non-destructive source of truth saved with
 *  the project. A character is: slider weights (+ optional per-side splits),
 *  a sculpt delta layer, and a preview pose. */

export interface CharacterParams {
  version: 1;
  /** slider id → weight −1…+1 (0 = average/neutral) */
  weights: Record<string, number>;
  /** sliders unlinked into independent halves: id → {l, r} (overrides weights) */
  sideWeights: Record<string, { l: number; r: number }>;
  /** sculpt-layer vertex deltas on the shared topology (3 × vertCount) — kept
   *  separate from morphs so sliders stay live after sculpting */
  sculptDelta: Float32Array | null;
  /** preview pose: bone name → euler XYZ radians */
  pose: Record<string, [number, number, number]> | null;
}

export function defaultCharacter(weights: Record<string, number> = {}): CharacterParams {
  return {
    version: 1,
    weights: { ...weights },
    sideWeights: {},
    sculptDelta: null,
    pose: null
  };
}

export function cloneCharacter(c: CharacterParams): CharacterParams {
  return {
    version: 1,
    weights: { ...c.weights },
    sideWeights: Object.fromEntries(
      Object.entries(c.sideWeights).map(([k, v]) => [k, { ...v }])
    ),
    sculptDelta: c.sculptDelta ? new Float32Array(c.sculptDelta) : null,
    pose: c.pose ? Object.fromEntries(Object.entries(c.pose).map(([k, v]) => [k, [...v] as [number, number, number]])) : null
  };
}

/** Preview poses used to verify deformation at any proportions. */
export const TEST_POSES: { id: string; label: string; pose: Record<string, [number, number, number]> }[] = [
  { id: 'rest', label: 'Rest', pose: {} },
  {
    id: 'arms_up',
    label: 'Arms up',
    pose: {
      upperArmL: [0, 0, 1.9],
      upperArmR: [0, 0, -1.9],
      forearmL: [0, 0, 0.25],
      forearmR: [0, 0, -0.25]
    }
  },
  {
    id: 'reach',
    label: 'Reach forward',
    pose: {
      upperArmL: [-1.3, 0, 0.5],
      upperArmR: [-1.3, 0, -0.5],
      forearmL: [-0.35, 0, 0],
      forearmR: [-0.35, 0, 0],
      chest: [-0.12, 0, 0],
      head: [0.18, 0, 0]
    }
  },
  {
    id: 'squat',
    label: 'Squat',
    pose: {
      thighL: [-1.15, 0, 0.12],
      thighR: [-1.15, 0, -0.12],
      shinL: [1.55, 0, 0],
      shinR: [1.55, 0, 0],
      footL: [-0.4, 0, 0],
      footR: [-0.4, 0, 0],
      spine: [0.25, 0, 0],
      upperArmL: [-0.9, 0, 0.3],
      upperArmR: [-0.9, 0, -0.3]
    }
  },
  {
    id: 'contrapposto',
    label: 'Contrapposto',
    pose: {
      pelvis: [0, 0, 0.09],
      spine: [0, 0.12, -0.1],
      chest: [0, 0.08, -0.05],
      head: [0, -0.15, 0.04],
      thighL: [0, 0, -0.06],
      thighR: [-0.15, 0, -0.1],
      shinR: [0.3, 0, 0],
      upperArmL: [0, 0, 0.15],
      upperArmR: [-0.25, 0, -0.2]
    }
  }
];
