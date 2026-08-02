/** QuickShape stroke fitting: turn a rough hand-drawn polyline (in 2D plane
 *  coordinates) into a clean shape. Tried in order of strictness:
 *  line → circle → ellipse → rectangle → polygon → smoothed curve. */

export interface Pt {
  x: number;
  y: number;
}

export type FitKind =
  | 'line'
  | 'circle'
  | 'ellipse'
  | 'rectangle'
  | 'polygon'
  | 'curve';

export interface FitResult {
  kind: FitKind;
  closed: boolean;
  /** Clean outline points (open: polyline; closed: ring without repeat). */
  points: Pt[];
}

function dist(a: Pt, b: Pt): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function pathLength(pts: Pt[]): number {
  let l = 0;
  for (let i = 1; i < pts.length; i++) l += dist(pts[i - 1], pts[i]);
  return l;
}

function bboxDiag(pts: Pt[]): number {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const p of pts) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  return Math.hypot(maxX - minX, maxY - minY);
}

export function resample(pts: Pt[], n: number): Pt[] {
  if (pts.length < 2) return pts.slice();
  const total = pathLength(pts);
  if (total === 0) return [pts[0]];
  const step = total / (n - 1);
  const out: Pt[] = [pts[0]];
  let acc = 0;
  let prev = pts[0];
  for (let i = 1; i < pts.length; i++) {
    let cur = pts[i];
    let d = dist(prev, cur);
    while (acc + d >= step && out.length < n - 1) {
      const t = (step - acc) / d;
      const nx = prev.x + (cur.x - prev.x) * t;
      const ny = prev.y + (cur.y - prev.y) * t;
      out.push({ x: nx, y: ny });
      prev = { x: nx, y: ny };
      d = dist(prev, cur);
      acc = 0;
    }
    acc += d;
    prev = cur;
  }
  out.push(pts[pts.length - 1]);
  return out;
}

/** Ramer–Douglas–Peucker simplification. */
export function rdp(pts: Pt[], eps: number): Pt[] {
  if (pts.length < 3) return pts.slice();
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack: [number, number][] = [[0, pts.length - 1]];
  while (stack.length) {
    const [s, e] = stack.pop()!;
    const a = pts[s];
    const b = pts[e];
    const abx = b.x - a.x;
    const aby = b.y - a.y;
    const ab2 = abx * abx + aby * aby;
    let maxD = 0;
    let maxI = -1;
    for (let i = s + 1; i < e; i++) {
      const p = pts[i];
      let d: number;
      if (ab2 === 0) d = dist(p, a);
      else {
        const t = Math.max(0, Math.min(1, ((p.x - a.x) * abx + (p.y - a.y) * aby) / ab2));
        d = Math.hypot(p.x - (a.x + t * abx), p.y - (a.y + t * aby));
      }
      if (d > maxD) {
        maxD = d;
        maxI = i;
      }
    }
    if (maxD > eps && maxI > 0) {
      keep[maxI] = 1;
      stack.push([s, maxI], [maxI, e]);
    }
  }
  return pts.filter((_, i) => keep[i] === 1);
}

function isClosed(pts: Pt[]): boolean {
  const d = bboxDiag(pts);
  return d > 0 && dist(pts[0], pts[pts.length - 1]) < Math.max(0.12 * d, 0.02);
}

/** Kåsa least-squares circle fit → null if residual too high. */
function fitCircle(pts: Pt[], tolFrac: number): FitResult | null {
  const n = pts.length;
  let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0, sxz = 0, syz = 0, sz = 0;
  for (const p of pts) {
    const z = p.x * p.x + p.y * p.y;
    sx += p.x; sy += p.y; sxx += p.x * p.x; syy += p.y * p.y;
    sxy += p.x * p.y; sxz += p.x * z; syz += p.y * z; sz += z;
  }
  const a11 = 2 * (sxx - (sx * sx) / n);
  const a12 = 2 * (sxy - (sx * sy) / n);
  const a22 = 2 * (syy - (sy * sy) / n);
  const b1 = sxz - (sx * sz) / n;
  const b2 = syz - (sy * sz) / n;
  const det = a11 * a22 - a12 * a12;
  if (Math.abs(det) < 1e-12) return null;
  const cx = (b1 * a22 - b2 * a12) / det;
  const cy = (a11 * b2 - a12 * b1) / det;
  const r = Math.sqrt(Math.max(0, (sz - 2 * (cx * sx + cy * sy)) / n + cx * cx + cy * cy));
  if (r <= 0) return null;
  let rms = 0;
  for (const p of pts) {
    const e = Math.hypot(p.x - cx, p.y - cy) - r;
    rms += e * e;
  }
  rms = Math.sqrt(rms / n);
  if (rms > r * tolFrac) return null;
  const out: Pt[] = [];
  const segs = 64;
  for (let i = 0; i < segs; i++) {
    const a = (i / segs) * Math.PI * 2;
    out.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }
  return { kind: 'circle', closed: true, points: out };
}

/** PCA ellipse: center + covariance axes, validated against the samples. */
function fitEllipse(pts: Pt[], tolFrac: number): FitResult | null {
  const n = pts.length;
  let cx = 0, cy = 0;
  for (const p of pts) { cx += p.x; cy += p.y; }
  cx /= n; cy /= n;
  let sxx = 0, syy = 0, sxy = 0;
  for (const p of pts) {
    const dx = p.x - cx, dy = p.y - cy;
    sxx += dx * dx; syy += dy * dy; sxy += dx * dy;
  }
  sxx /= n; syy /= n; sxy /= n;
  const tr = sxx + syy;
  const dd = Math.sqrt(Math.max(0, (sxx - syy) * (sxx - syy) + 4 * sxy * sxy));
  const l1 = (tr + dd) / 2;
  const l2 = (tr - dd) / 2;
  if (l2 <= 0) return null;
  const theta = 0.5 * Math.atan2(2 * sxy, sxx - syy);
  // uniform ring samples have E[cos²] = 1/2 → semi-axes = √(2λ)
  const a = Math.sqrt(2 * l1);
  const b = Math.sqrt(2 * l2);
  if (b / a > 0.92) return null; // that's a circle's job
  const cosT = Math.cos(theta), sinT = Math.sin(theta);
  let rms = 0;
  for (const p of pts) {
    const dx = p.x - cx, dy = p.y - cy;
    const u = dx * cosT + dy * sinT;
    const v = -dx * sinT + dy * cosT;
    const e = Math.sqrt((u * u) / (a * a) + (v * v) / (b * b)) - 1;
    rms += e * e;
  }
  rms = Math.sqrt(rms / n);
  if (rms > tolFrac) return null;
  const out: Pt[] = [];
  const segs = 64;
  for (let i = 0; i < segs; i++) {
    const t = (i / segs) * Math.PI * 2;
    const u = a * Math.cos(t);
    const v = b * Math.sin(t);
    out.push({ x: cx + u * cosT - v * sinT, y: cy + u * sinT + v * cosT });
  }
  return { kind: 'ellipse', closed: true, points: out };
}

/** Corner-based rectangle / polygon fit from RDP corners. */
function fitPoly(pts: Pt[], diag: number): FitResult | null {
  const ring = pts.slice();
  const corners = rdp([...ring, ring[0]], diag * 0.035);
  corners.pop(); // remove duplicated first point
  if (corners.length < 3 || corners.length > 8) return null;

  // validate: every sample lies near the polygon outline
  const outline = [...corners, corners[0]];
  let worst = 0;
  for (const p of pts) {
    let best = Infinity;
    for (let i = 1; i < outline.length; i++) {
      const a = outline[i - 1];
      const b = outline[i];
      const abx = b.x - a.x, aby = b.y - a.y;
      const ab2 = abx * abx + aby * aby || 1e-12;
      const t = Math.max(0, Math.min(1, ((p.x - a.x) * abx + (p.y - a.y) * aby) / ab2));
      best = Math.min(best, Math.hypot(p.x - (a.x + t * abx), p.y - (a.y + t * aby)));
    }
    worst = Math.max(worst, best);
  }
  if (worst > diag * 0.05) return null;

  if (corners.length === 4) {
    // right-ish angles → snap to an oriented rectangle
    const angles: number[] = [];
    for (let i = 0; i < 4; i++) {
      const p0 = corners[(i + 3) % 4];
      const p1 = corners[i];
      const p2 = corners[(i + 1) % 4];
      const a1 = Math.atan2(p0.y - p1.y, p0.x - p1.x);
      const a2 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      let d = Math.abs(a1 - a2);
      if (d > Math.PI) d = 2 * Math.PI - d;
      angles.push((d * 180) / Math.PI);
    }
    if (angles.every((a) => a > 65 && a < 115)) {
      const angle = Math.atan2(
        corners[1].y - corners[0].y,
        corners[1].x - corners[0].x
      );
      const cosA = Math.cos(-angle), sinA = Math.sin(-angle);
      let minU = Infinity, minV = Infinity, maxU = -Infinity, maxV = -Infinity;
      for (const p of pts) {
        const u = p.x * cosA - p.y * sinA;
        const v = p.x * sinA + p.y * cosA;
        minU = Math.min(minU, u); maxU = Math.max(maxU, u);
        minV = Math.min(minV, v); maxV = Math.max(maxV, v);
      }
      const cosB = Math.cos(angle), sinB = Math.sin(angle);
      const mk = (u: number, v: number): Pt => ({
        x: u * cosB - v * sinB,
        y: u * sinB + v * cosB
      });
      return {
        kind: 'rectangle',
        closed: true,
        points: [mk(minU, minV), mk(maxU, minV), mk(maxU, maxV), mk(minU, maxV)]
      };
    }
  }
  return { kind: 'polygon', closed: true, points: corners };
}

/** Catmull-Rom smoothing through simplified control points. */
function smoothCurve(pts: Pt[], closed: boolean, diag: number): FitResult {
  const ctrl = rdp(pts, diag * 0.012);
  const out: Pt[] = [];
  const P = (i: number): Pt => {
    if (closed) return ctrl[((i % ctrl.length) + ctrl.length) % ctrl.length];
    return ctrl[Math.max(0, Math.min(ctrl.length - 1, i))];
  };
  const segs = closed ? ctrl.length : ctrl.length - 1;
  const perSeg = 8;
  for (let i = 0; i < segs; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    for (let j = 0; j < perSeg; j++) {
      const t = j / perSeg;
      const t2 = t * t, t3 = t2 * t;
      out.push({
        x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
      });
    }
  }
  if (!closed) out.push(ctrl[ctrl.length - 1]);
  return { kind: 'curve', closed, points: out };
}

/** Main entry: fit a raw stroke.
 *  `snap=true` (hold-to-snap) tries the strict geometric fits;
 *  `snap=false` just cleans/smooths the freehand stroke. */
export function fitStroke(raw: Pt[], snap: boolean): FitResult | null {
  if (raw.length < 2) return null;
  const diag = bboxDiag(raw);
  if (diag < 1e-6) return null;
  const pts = resample(raw, 96);
  const closed = isClosed(pts);

  if (snap) {
    if (!closed) {
      // straight line?
      const a = pts[0];
      const b = pts[pts.length - 1];
      const chord = dist(a, b);
      if (chord > diag * 0.5) {
        let worst = 0;
        const abx = b.x - a.x, aby = b.y - a.y;
        const ab2 = abx * abx + aby * aby;
        for (const p of pts) {
          const t = Math.max(0, Math.min(1, ((p.x - a.x) * abx + (p.y - a.y) * aby) / ab2));
          worst = Math.max(worst, Math.hypot(p.x - (a.x + t * abx), p.y - (a.y + t * aby)));
        }
        if (worst < diag * 0.04) {
          return { kind: 'line', closed: false, points: [a, b] };
        }
      }
      return smoothCurve(pts, false, diag);
    }
    const ring = pts.slice(0, -1);
    return (
      fitCircle(ring, 0.09) ??
      fitEllipse(ring, 0.09) ??
      fitPoly(ring, diag) ??
      smoothCurve(ring, true, diag)
    );
  }
  return smoothCurve(closed ? pts.slice(0, -1) : pts, closed, diag);
}
