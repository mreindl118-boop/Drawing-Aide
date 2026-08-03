import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import type { Doc } from '../core/doc';
import type { GeoData, SceneObjectData } from '../core/types';
import { bakeGeo, matrixFromTransform, mergeGeos, toBufferGeometry } from '../core/geo';

export interface ExportMesh {
  id: string;
  name: string;
  color: string;
  geo: GeoData; // world-baked, mirror included
  isFigure?: boolean;
}

/** Bake one object (plus its live mirror) into world space. */
export function bakeObjectGeo(obj: SceneObjectData): GeoData {
  const m = matrixFromTransform(obj.transform);
  const parts: GeoData[] = [bakeGeo(obj.geo, m)];
  if (obj.mirror) parts.push(mirrorWorld(obj, m));
  return parts.length > 1 ? mergeGeos(parts) : parts[0];
}

/** Bake every visible object into world space. */
export function collectExportMeshes(doc: Doc): ExportMesh[] {
  const out: ExportMesh[] = [];
  for (const obj of doc.list()) {
    if (!obj.visible) continue;
    out.push({
      id: obj.id,
      name: obj.name,
      color: obj.color,
      geo: bakeObjectGeo(obj),
      isFigure: !!obj.character
    });
  }
  return out;
}

function mirrorWorld(obj: SceneObjectData, objMatrix: THREE.Matrix4): GeoData {
  // world reflection M · objMatrix applied to the original local geometry;
  // bakeGeo handles the winding flip via the negative determinant
  const k = obj.mirror === 'x' ? 0 : obj.mirror === 'y' ? 1 : 2;
  const refl = new THREE.Matrix4().identity();
  const e = refl.elements;
  e[k * 4 + k] = -1;
  const m = new THREE.Matrix4().multiplyMatrices(refl, objMatrix);
  return bakeGeo(obj.geo, m);
}

// ---------------------------------------------------------------- STL (binary)

/** Binary STL, Z-up (slicer convention), scaled units→mm. */
export function exportSTL(meshes: ExportMesh[], mmPerUnit: number): Blob {
  const geo = mergeGeos(meshes.map((m) => m.geo));
  const triCount = geo.indices.length / 3;
  const buf = new ArrayBuffer(84 + triCount * 50);
  const dv = new DataView(buf);
  const header = 'SculptPad binary STL (mm)';
  for (let i = 0; i < header.length && i < 80; i++) dv.setUint8(i, header.charCodeAt(i));
  dv.setUint32(80, triCount, true);
  const p = geo.positions;
  let off = 84;
  // three.js Y-up → STL Z-up: (x, y, z) → (x, -z, y)
  const vx = (i: number): number => p[i * 3] * mmPerUnit;
  const vy = (i: number): number => -p[i * 3 + 2] * mmPerUnit;
  const vz = (i: number): number => p[i * 3 + 1] * mmPerUnit;
  for (let t = 0; t < triCount; t++) {
    const a = geo.indices[t * 3];
    const b = geo.indices[t * 3 + 1];
    const c = geo.indices[t * 3 + 2];
    const ux = vx(b) - vx(a), uy = vy(b) - vy(a), uz = vz(b) - vz(a);
    const wx = vx(c) - vx(a), wy = vy(c) - vy(a), wz = vz(c) - vz(a);
    let nx = uy * wz - uz * wy;
    let ny = uz * wx - ux * wz;
    let nz = ux * wy - uy * wx;
    const len = Math.hypot(nx, ny, nz) || 1;
    nx /= len; ny /= len; nz /= len;
    dv.setFloat32(off, nx, true);
    dv.setFloat32(off + 4, ny, true);
    dv.setFloat32(off + 8, nz, true);
    let vo = off + 12;
    for (const idx of [a, b, c]) {
      dv.setFloat32(vo, vx(idx), true);
      dv.setFloat32(vo + 4, vy(idx), true);
      dv.setFloat32(vo + 8, vz(idx), true);
      vo += 12;
    }
    dv.setUint16(off + 48, 0, true);
    off += 50;
  }
  return new Blob([buf], { type: 'model/stl' });
}

// ---------------------------------------------------------------------- OBJ

/** OBJ with normals and UVs when present (UVs are what Procreate needs). */
export function exportOBJ(meshes: ExportMesh[]): Blob {
  const lines: string[] = ['# SculptPad OBJ export'];
  let vOff = 1;
  let vtOff = 1;
  let vnOff = 1;
  for (const mesh of meshes) {
    const g = mesh.geo;
    lines.push(`o ${mesh.name.replace(/\s+/g, '_')}`);
    const p = g.positions;
    for (let i = 0; i < p.length; i += 3) {
      lines.push(`v ${fmt(p[i])} ${fmt(p[i + 1])} ${fmt(p[i + 2])}`);
    }
    const hasUv = !!g.uvs;
    if (hasUv) {
      const uv = g.uvs!;
      for (let i = 0; i < uv.length; i += 2) {
        lines.push(`vt ${fmt(uv[i])} ${fmt(uv[i + 1])}`);
      }
    }
    const hasN = !!g.normals;
    if (hasN) {
      const n = g.normals!;
      for (let i = 0; i < n.length; i += 3) {
        lines.push(`vn ${fmt(n[i])} ${fmt(n[i + 1])} ${fmt(n[i + 2])}`);
      }
    }
    const idx = g.indices;
    for (let i = 0; i < idx.length; i += 3) {
      const f = [idx[i], idx[i + 1], idx[i + 2]].map((k) => {
        const v = k + vOff;
        if (hasUv && hasN) return `${v}/${k + vtOff}/${k + vnOff}`;
        if (hasUv) return `${v}/${k + vtOff}`;
        if (hasN) return `${v}//${k + vnOff}`;
        return `${v}`;
      });
      lines.push(`f ${f[0]} ${f[1]} ${f[2]}`);
    }
    const vCount = p.length / 3;
    vOff += vCount;
    if (hasUv) vtOff += vCount;
    if (hasN) vnOff += vCount;
  }
  return new Blob([lines.join('\n')], { type: 'model/obj' });
}

function fmt(n: number): string {
  return Number.isInteger(n) ? n.toString() : n.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
}

// ---------------------------------------------------------------------- GLB

/** Figure data for GLB blendshape export: shared morph library + per-figure
 *  instance (influences reproduce the current slider state in Blender). */
export interface FigureGLBData {
  shared: {
    vertCount: number;
    indices: Uint32Array;
    uvs: Float32Array;
    skinIndex: Uint16Array; // 2 bones per vertex
    skinWeight: Float32Array;
    baseJoints: Float32Array;
    bones: string[];
    boneParent: number[];
    basePositions: Float32Array;
    targetNames: string[];
    targetDeltas: Float32Array[];
  };
  instances: {
    name: string;
    color: string;
    influences: number[]; // aligned with targetNames
    matrix: THREE.Matrix4;
  }[];
}

function buildFigureNodes(data: FigureGLBData): THREE.Object3D[] {
  const s = data.shared;
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(s.basePositions.slice(), 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(s.uvs, 2));
  geometry.setIndex(new THREE.BufferAttribute(s.indices, 1));
  geometry.computeVertexNormals();
  // expand 2-bone skinning to the 4-component attributes glTF expects
  const n = s.vertCount;
  const skinIndex = new Uint16Array(n * 4);
  const skinWeight = new Float32Array(n * 4);
  for (let v = 0; v < n; v++) {
    skinIndex[v * 4] = s.skinIndex[v * 2];
    skinIndex[v * 4 + 1] = s.skinIndex[v * 2 + 1];
    skinWeight[v * 4] = s.skinWeight[v * 2];
    skinWeight[v * 4 + 1] = s.skinWeight[v * 2 + 1];
  }
  geometry.setAttribute('skinIndex', new THREE.BufferAttribute(skinIndex, 4));
  geometry.setAttribute('skinWeight', new THREE.BufferAttribute(skinWeight, 4));
  geometry.morphTargetsRelative = true;
  geometry.morphAttributes.position = s.targetDeltas.map(
    (d) => new THREE.BufferAttribute(d, 3)
  );

  const nodes: THREE.Object3D[] = [];
  for (const inst of data.instances) {
    const bones: THREE.Bone[] = s.bones.map((name) => {
      const b = new THREE.Bone();
      b.name = name;
      return b;
    });
    for (let i = 0; i < bones.length; i++) {
      const p = s.boneParent[i];
      const jx = s.baseJoints[i * 3];
      const jy = s.baseJoints[i * 3 + 1];
      const jz = s.baseJoints[i * 3 + 2];
      if (p < 0) {
        bones[i].position.set(jx, jy, jz);
      } else {
        bones[p].add(bones[i]);
        bones[i].position.set(
          jx - s.baseJoints[p * 3],
          jy - s.baseJoints[p * 3 + 1],
          jz - s.baseJoints[p * 3 + 2]
        );
      }
    }
    const mesh = new THREE.SkinnedMesh(
      geometry,
      new THREE.MeshStandardMaterial({ color: inst.color, roughness: 0.7, metalness: 0 })
    );
    mesh.name = inst.name;
    mesh.add(bones[0]);
    mesh.updateMatrixWorld(true);
    mesh.bind(new THREE.Skeleton(bones));
    mesh.morphTargetInfluences = [...inst.influences];
    mesh.morphTargetDictionary = Object.fromEntries(s.targetNames.map((t, i) => [t, i]));
    mesh.userData.targetNames = s.targetNames;
    inst.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
    nodes.push(mesh);
  }
  return nodes;
}

export function exportGLB(meshes: ExportMesh[], figures?: FigureGLBData): Promise<Blob> {
  const scene = new THREE.Scene();
  for (const m of meshes) {
    const mesh = new THREE.Mesh(
      toBufferGeometry(m.geo),
      new THREE.MeshStandardMaterial({ color: m.color, roughness: 0.7, metalness: 0 })
    );
    mesh.name = m.name;
    scene.add(mesh);
  }
  if (figures) {
    for (const node of buildFigureNodes(figures)) scene.add(node);
  }
  scene.updateMatrixWorld(true);
  return new Promise((resolve, reject) => {
    new GLTFExporter().parse(
      scene,
      (result) => resolve(new Blob([result as ArrayBuffer], { type: 'model/gltf-binary' })),
      (err) => reject(err),
      { binary: true }
    );
  });
}

// ------------------------------------------------------------------ delivery

/** iPad: straight to the share sheet (Files / Procreate). Desktop: download. */
export async function deliverFile(filename: string, blob: Blob): Promise<'shared' | 'downloaded'> {
  const file = new File([blob], filename, { type: blob.type });
  const nav = navigator as Navigator & {
    canShare?: (d: { files: File[] }) => boolean;
    share?: (d: { files: File[] }) => Promise<void>;
  };
  if (nav.canShare?.({ files: [file] })) {
    try {
      await nav.share!({ files: [file] });
      return 'shared';
    } catch (err) {
      if ((err as Error).name === 'AbortError') return 'shared'; // user closed sheet
      // fall through to download
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return 'downloaded';
}
