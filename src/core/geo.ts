import * as THREE from 'three';
import type { GeoData, MirrorAxis, Transform } from './types';

const bufferCache = new WeakMap<GeoData, THREE.BufferGeometry>();

/** Extract immutable GeoData from a BufferGeometry. Always indexed, always
 *  with normals so downstream consumers (export, mirror, booleans) can rely
 *  on a single shape. */
export function fromBufferGeometry(g: THREE.BufferGeometry): GeoData {
  const src = g.index ? g : g;
  const pos = src.getAttribute('position') as THREE.BufferAttribute;
  if (!src.getAttribute('normal')) src.computeVertexNormals();
  const normal = src.getAttribute('normal') as THREE.BufferAttribute | undefined;
  const uv = src.getAttribute('uv') as THREE.BufferAttribute | undefined;

  let indices: Uint32Array;
  if (src.index) {
    indices = new Uint32Array(src.index.array as ArrayLike<number>);
  } else {
    indices = new Uint32Array(pos.count);
    for (let i = 0; i < pos.count; i++) indices[i] = i;
  }
  return {
    positions: new Float32Array(pos.array as ArrayLike<number>),
    normals: normal ? new Float32Array(normal.array as ArrayLike<number>) : null,
    uvs: uv ? new Float32Array(uv.array as ArrayLike<number>) : null,
    indices
  };
}

export function toBufferGeometry(geo: GeoData): THREE.BufferGeometry {
  let g = bufferCache.get(geo);
  if (g) return g;
  g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(geo.positions, 3));
  if (geo.normals) g.setAttribute('normal', new THREE.BufferAttribute(geo.normals, 3));
  if (geo.uvs) g.setAttribute('uv', new THREE.BufferAttribute(geo.uvs, 2));
  g.setIndex(new THREE.BufferAttribute(geo.indices, 1));
  if (!geo.normals) g.computeVertexNormals();
  g.computeBoundingSphere();
  bufferCache.set(geo, g);
  return g;
}

const mirrorCache = new WeakMap<GeoData, Partial<Record<MirrorAxis, GeoData>>>();

/** Mirrored copy across the given world axis plane (through origin), with
 *  winding flipped so faces stay outward. */
export function mirroredGeo(geo: GeoData, axis: MirrorAxis): GeoData {
  let byAxis = mirrorCache.get(geo);
  if (byAxis?.[axis]) return byAxis[axis]!;
  const k = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
  const positions = new Float32Array(geo.positions);
  for (let i = k; i < positions.length; i += 3) positions[i] = -positions[i];
  let normals: Float32Array | null = null;
  if (geo.normals) {
    normals = new Float32Array(geo.normals);
    for (let i = k; i < normals.length; i += 3) normals[i] = -normals[i];
  }
  const indices = new Uint32Array(geo.indices.length);
  for (let i = 0; i < geo.indices.length; i += 3) {
    indices[i] = geo.indices[i];
    indices[i + 1] = geo.indices[i + 2];
    indices[i + 2] = geo.indices[i + 1];
  }
  const out: GeoData = { positions, normals, uvs: geo.uvs, indices };
  if (!byAxis) {
    byAxis = {};
    mirrorCache.set(geo, byAxis);
  }
  byAxis[axis] = out;
  return out;
}

export function matrixFromTransform(t: Transform): THREE.Matrix4 {
  return new THREE.Matrix4().compose(
    new THREE.Vector3(...t.position),
    new THREE.Quaternion(...t.quaternion),
    new THREE.Vector3(...t.scale)
  );
}

/** Bake a matrix into the geometry (world-space copy). */
export function bakeGeo(geo: GeoData, matrix: THREE.Matrix4): GeoData {
  const positions = new Float32Array(geo.positions);
  const v = new THREE.Vector3();
  for (let i = 0; i < positions.length; i += 3) {
    v.set(positions[i], positions[i + 1], positions[i + 2]).applyMatrix4(matrix);
    positions[i] = v.x;
    positions[i + 1] = v.y;
    positions[i + 2] = v.z;
  }
  let normals: Float32Array | null = null;
  if (geo.normals) {
    const nm = new THREE.Matrix3().getNormalMatrix(matrix);
    normals = new Float32Array(geo.normals);
    for (let i = 0; i < normals.length; i += 3) {
      v.set(normals[i], normals[i + 1], normals[i + 2]).applyMatrix3(nm).normalize();
      normals[i] = v.x;
      normals[i + 1] = v.y;
      normals[i + 2] = v.z;
    }
  }
  // negative determinant (mirror baked into transform) flips winding
  let indices = geo.indices;
  if (matrix.determinant() < 0) {
    indices = new Uint32Array(geo.indices.length);
    for (let i = 0; i < geo.indices.length; i += 3) {
      indices[i] = geo.indices[i];
      indices[i + 1] = geo.indices[i + 2];
      indices[i + 2] = geo.indices[i + 1];
    }
  }
  return { positions, normals, uvs: geo.uvs, indices };
}

export function mergeGeos(list: GeoData[]): GeoData {
  let vCount = 0;
  let iCount = 0;
  for (const g of list) {
    vCount += g.positions.length / 3;
    iCount += g.indices.length;
  }
  const positions = new Float32Array(vCount * 3);
  const allNormals = list.every((g) => g.normals);
  const allUvs = list.every((g) => g.uvs);
  const normals = allNormals ? new Float32Array(vCount * 3) : null;
  const uvs = allUvs ? new Float32Array(vCount * 2) : null;
  const indices = new Uint32Array(iCount);
  let vOff = 0;
  let iOff = 0;
  for (const g of list) {
    positions.set(g.positions, vOff * 3);
    if (normals) normals.set(g.normals!, vOff * 3);
    if (uvs) uvs.set(g.uvs!, vOff * 2);
    for (let i = 0; i < g.indices.length; i++) indices[iOff + i] = g.indices[i] + vOff;
    vOff += g.positions.length / 3;
    iOff += g.indices.length;
  }
  return { positions, normals, uvs, indices };
}

export function triCount(geo: GeoData): number {
  return geo.indices.length / 3;
}

export function geoBounds(geo: GeoData): THREE.Box3 {
  const box = new THREE.Box3();
  const v = new THREE.Vector3();
  for (let i = 0; i < geo.positions.length; i += 3) {
    v.set(geo.positions[i], geo.positions[i + 1], geo.positions[i + 2]);
    box.expandByPoint(v);
  }
  return box;
}
