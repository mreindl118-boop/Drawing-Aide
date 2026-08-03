/** Analytic displacement fields: local morphs (face features, bust, glutes…)
 *  evaluated once against base positions and baked into delta arrays. */

export interface FieldOp {
  /** landmark name the field is centered on */
  anchor: string;
  /** offset from the anchor, meters */
  offset?: [number, number, number];
  /** also apply mirrored across X (anchor + dir x-flipped) */
  mirror?: boolean;
  /** gaussian radius, meters */
  r: number;
  /** anisotropic radius scale per axis (default 1,1,1) */
  stretch?: [number, number, number];
  /** peak displacement, meters */
  amp: number;
  /** fixed direction (normalized internally) — or 'out' = radially away from anchor */
  dir: [number, number, number] | 'out';
  /** falloff sharpness; higher = tighter (default 2.2) */
  k?: number;
}

export function bakeFields(
  ops: FieldOp[],
  base: Float32Array,
  landmarks: Record<string, [number, number, number]>,
  out: Float32Array
): void {
  const n = base.length / 3;
  for (const op of ops) {
    const lm = landmarks[op.anchor];
    if (!lm) continue;
    const variants: { a: [number, number, number]; d: [number, number, number] | 'out' }[] = [];
    const off = op.offset ?? [0, 0, 0];
    const a0: [number, number, number] = [lm[0] + off[0], lm[1] + off[1], lm[2] + off[2]];
    variants.push({ a: a0, d: op.dir });
    if (op.mirror && Math.abs(a0[0]) > 1e-6) {
      const dm: [number, number, number] | 'out' =
        op.dir === 'out' ? 'out' : [-op.dir[0], op.dir[1], op.dir[2]];
      variants.push({ a: [-a0[0], a0[1], a0[2]], d: dm });
    }
    const [sx, sy, sz] = op.stretch ?? [1, 1, 1];
    const k = op.k ?? 2.2;
    for (const { a, d } of variants) {
      let dn: [number, number, number] = [0, 0, 0];
      if (d !== 'out') {
        const l = Math.hypot(d[0], d[1], d[2]) || 1;
        dn = [d[0] / l, d[1] / l, d[2] / l];
      }
      for (let i = 0; i < n; i++) {
        const dx = (base[i * 3] - a[0]) / sx;
        const dy = (base[i * 3 + 1] - a[1]) / sy;
        const dz = (base[i * 3 + 2] - a[2]) / sz;
        const dist2 = (dx * dx + dy * dy + dz * dz) / (op.r * op.r);
        if (dist2 > 6) continue;
        const w = Math.exp(-dist2 * k);
        if (w < 0.004) continue;
        let vx = dn[0];
        let vy = dn[1];
        let vz = dn[2];
        if (d === 'out') {
          const ox = base[i * 3] - a[0];
          const oy = base[i * 3 + 1] - a[1];
          const oz = base[i * 3 + 2] - a[2];
          const l = Math.hypot(ox, oy, oz) || 1;
          vx = ox / l;
          vy = oy / l;
          vz = oz / l;
        }
        out[i * 3] += vx * op.amp * w;
        out[i * 3 + 1] += vy * op.amp * w;
        out[i * 3 + 2] += vz * op.amp * w;
      }
    }
  }
}
