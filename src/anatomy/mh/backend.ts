/** MakeHuman (CC0) figure backend: loads the converted bundle (body mesh,
 *  skeleton, skinning, landmarks, morph deltas) produced by
 *  scripts/build-mh-bundle.mjs. Worker-safe — no DOM, no three. */
import meta from './bundle.json';

export interface SparseDelta {
  idx: Uint32Array;
  /** dequantized world-space offsets, 3 per index */
  dxyz: Float32Array;
  /** 17×3 joint offsets */
  joints: Float32Array;
}

export interface MHData {
  vertCount: number;
  bodyCount: number;
  basePos: Float32Array;
  indices: Uint32Array;
  uvs: Float32Array;
  regions: Uint8Array;
  side: Float32Array;
  skinIndex: Uint16Array;
  skinWeight: Float32Array;
  baseJoints: Float32Array;
  bones: string[];
  boneParent: number[];
  /** derived cap verts: ring vertex lists (cap i lives at bodyCount+i) */
  caps: number[][];
  parts: { name: string; vStart: number; vCount: number; iStart: number; iCount: number }[];
  /** synthetic eyeball spheres rigidly following their morphing anchor verts */
  eyes: { anchorStart: number; anchorCount: number; sphereStart: number; sphereCount: number }[];
  landmarkVerts: Record<string, number>;
  /** morph deltas by section name, e.g. macro.frame_pos, detail.belly.pos */
  deltas: Map<string, SparseDelta>;
}

interface SectionMeta {
  offset: number;
  length: number;
  type: string;
  scale?: number;
  joints?: number[];
}

const M = meta as unknown as {
  sections: Record<string, SectionMeta>;
  vertCount: number;
  bodyCount: number;
  bones: string[];
  boneParent: number[];
  caps: number[][];
  parts: { name: string; vStart: number; vCount: number; iStart: number; iCount: number }[];
  eyes: { anchorStart: number; anchorCount: number; sphereStart: number; sphereCount: number }[];
  landmarks: Record<string, number>;
  morphs: Record<string, true | { pos: boolean; neg: boolean }>;
};

function section(buf: ArrayBuffer, name: string): Float32Array | Uint32Array | Uint16Array | Uint8Array | Int16Array {
  const s = M.sections[name];
  if (!s) throw new Error(`bundle missing section ${name}`);
  switch (s.type) {
    case 'Float32Array': return new Float32Array(buf, s.offset, s.length);
    case 'Uint32Array': return new Uint32Array(buf, s.offset, s.length);
    case 'Uint16Array': return new Uint16Array(buf, s.offset, s.length);
    case 'Int16Array': return new Int16Array(buf, s.offset, s.length);
    default: return new Uint8Array(buf, s.offset, s.length);
  }
}

export async function loadMH(): Promise<MHData> {
  const url = new URL('./bundle.bin', import.meta.url);
  const buf = await (await fetch(url)).arrayBuffer();
  const deltas = new Map<string, SparseDelta>();
  for (const name of Object.keys(M.sections)) {
    if (!name.endsWith('.q')) continue;
    const base = name.slice(0, -2);
    const s = M.sections[name];
    const q = section(buf, name) as Int16Array;
    const idx = section(buf, `${base}.idx`) as Uint32Array;
    const dxyz = new Float32Array(q.length);
    const scale = s.scale ?? 1;
    for (let i = 0; i < q.length; i++) dxyz[i] = q[i] * scale;
    deltas.set(base, {
      idx: new Uint32Array(idx), // copy out of the big buffer
      dxyz,
      joints: new Float32Array(s.joints ?? new Array(M.bones.length * 3).fill(0))
    });
  }
  return {
    vertCount: M.vertCount,
    bodyCount: M.bodyCount,
    basePos: new Float32Array(section(buf, 'basePos') as Float32Array),
    indices: new Uint32Array(section(buf, 'indices') as Uint32Array),
    uvs: new Float32Array(section(buf, 'uvs') as Float32Array),
    regions: new Uint8Array(section(buf, 'regions') as Uint8Array),
    side: new Float32Array(section(buf, 'side') as Float32Array),
    skinIndex: new Uint16Array(section(buf, 'skinIndex') as Uint16Array),
    skinWeight: new Float32Array(section(buf, 'skinWeight') as Float32Array),
    baseJoints: new Float32Array(section(buf, 'baseJoints') as Float32Array),
    bones: M.bones,
    boneParent: M.boneParent,
    caps: M.caps,
    parts: M.parts,
    eyes: M.eyes,
    landmarkVerts: M.landmarks,
    deltas
  };
}
