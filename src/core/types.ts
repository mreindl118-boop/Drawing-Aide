/** Immutable geometry payload. Replaced wholesale on edit so history entries
 *  can hold cheap references. Typed arrays survive structured clone → IDB. */
export interface GeoData {
  positions: Float32Array;
  normals: Float32Array | null;
  uvs: Float32Array | null;
  indices: Uint32Array;
}

export type MirrorAxis = 'x' | 'y' | 'z';

export interface Transform {
  position: [number, number, number];
  quaternion: [number, number, number, number];
  scale: [number, number, number];
}

export interface SceneObjectData {
  id: string;
  name: string;
  geo: GeoData;
  transform: Transform;
  color: string;
  mirror: MirrorAxis | null;
  visible: boolean;
}

export interface CameraState {
  target: [number, number, number];
  quat: [number, number, number, number];
  dist: number;
}

export interface SceneSettings {
  mirrorDefault: MirrorAxis | null;
  mirrorOn: boolean;
  matcap: boolean;
}

export interface SceneSnapshot {
  version: 1;
  objects: SceneObjectData[];
  camera: CameraState | null;
  settings: SceneSettings;
}

export interface ProjectMeta {
  id: string;
  name: string;
  created: number;
  modified: number;
  thumb: string | null;
}

export function identityTransform(): Transform {
  return { position: [0, 0, 0], quaternion: [0, 0, 0, 1], scale: [1, 1, 1] };
}

export function cloneTransform(t: Transform): Transform {
  return {
    position: [...t.position],
    quaternion: [...t.quaternion],
    scale: [...t.scale]
  };
}

export function newId(): string {
  return crypto.randomUUID();
}
