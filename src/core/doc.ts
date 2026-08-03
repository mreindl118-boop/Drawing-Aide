import type {
  GeoData,
  MirrorAxis,
  SceneObjectData,
  SceneSnapshot,
  SceneSettings,
  CameraState,
  Transform
} from './types';
import { cloneTransform } from './types';

export type DocEvent =
  | { type: 'add'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'change'; id: string; what: 'transform' | 'geo' | 'appearance' | 'character' }
  | { type: 'settings' }
  | { type: 'reset' };

type Listener = (e: DocEvent) => void;

/** The scene document: flat list of objects + settings. Mutators are plain
 *  (no undo tracking) — History commands call them; UI code should go through
 *  Editor helpers that push commands. */
export class Doc {
  private objects = new Map<string, SceneObjectData>();
  private order: string[] = [];
  private listeners = new Set<Listener>();

  settings: SceneSettings = { mirrorDefault: 'x', mirrorOn: false, matcap: false };
  camera: CameraState | null = null;

  on(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(e: DocEvent): void {
    for (const fn of this.listeners) fn(e);
  }

  get(id: string): SceneObjectData | undefined {
    return this.objects.get(id);
  }

  list(): SceneObjectData[] {
    return this.order.map((id) => this.objects.get(id)!);
  }

  get size(): number {
    return this.order.length;
  }

  add(obj: SceneObjectData, index?: number): void {
    this.objects.set(obj.id, obj);
    if (index === undefined || index < 0 || index > this.order.length) {
      this.order.push(obj.id);
    } else {
      this.order.splice(index, 0, obj.id);
    }
    this.emit({ type: 'add', id: obj.id });
  }

  remove(id: string): { obj: SceneObjectData; index: number } | null {
    const obj = this.objects.get(id);
    if (!obj) return null;
    const index = this.order.indexOf(id);
    this.objects.delete(id);
    this.order.splice(index, 1);
    this.emit({ type: 'remove', id });
    return { obj, index };
  }

  setTransform(id: string, t: Transform): void {
    const obj = this.objects.get(id);
    if (!obj) return;
    obj.transform = cloneTransform(t);
    this.emit({ type: 'change', id, what: 'transform' });
  }

  setGeo(id: string, geo: GeoData): void {
    const obj = this.objects.get(id);
    if (!obj) return;
    obj.geo = geo;
    this.emit({ type: 'change', id, what: 'geo' });
  }

  setProps(
    id: string,
    props: Partial<Pick<SceneObjectData, 'color' | 'mirror' | 'visible' | 'name'>>
  ): void {
    const obj = this.objects.get(id);
    if (!obj) return;
    Object.assign(obj, props);
    this.emit({ type: 'change', id, what: 'appearance' });
  }

  setCharacter(id: string, character: SceneObjectData['character']): void {
    const obj = this.objects.get(id);
    if (!obj) return;
    obj.character = character;
    this.emit({ type: 'change', id, what: 'character' });
  }

  setSettings(patch: Partial<SceneSettings>): void {
    Object.assign(this.settings, patch);
    this.emit({ type: 'settings' });
  }

  uniqueName(base: string): string {
    const names = new Set(this.list().map((o) => o.name));
    if (!names.has(base)) return base;
    for (let i = 2; ; i++) {
      const n = `${base} ${i}`;
      if (!names.has(n)) return n;
    }
  }

  snapshot(): SceneSnapshot {
    return {
      version: 1,
      objects: this.list().map((o) => ({
        ...o,
        transform: cloneTransform(o.transform)
      })),
      camera: this.camera,
      settings: { ...this.settings }
    };
  }

  load(snap: SceneSnapshot | null): void {
    this.objects.clear();
    this.order = [];
    if (snap) {
      for (const o of snap.objects) {
        // revive typed arrays defensively (IDB returns them intact, but be safe)
        this.objects.set(o.id, o);
        this.order.push(o.id);
      }
      this.camera = snap.camera;
      this.settings = { ...snap.settings };
    } else {
      this.camera = null;
      this.settings = { mirrorDefault: 'x', mirrorOn: false, matcap: false };
    }
    this.emit({ type: 'reset' });
  }

  mirrorAxisFor(obj: SceneObjectData): MirrorAxis | null {
    return obj.mirror;
  }
}
