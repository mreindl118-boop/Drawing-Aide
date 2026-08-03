/** Main-thread client for the anatomy worker. One shared worker serves every
 *  figure; per-figure runtimes issue compose requests with latest-wins
 *  scheduling so slider drags never queue up behind stale frames. */
import * as THREE from 'three';
import EngineWorker from './engine.worker?worker';
import type { GeoData } from '../core/types';
import type { CharacterParams } from './character';

export interface TopologyLite {
  vertCount: number;
  indices: Uint32Array;
  uvs: Float32Array;
  regions: Uint8Array;
  side: Float32Array;
  skinIndex: Uint16Array;
  skinWeight: Float32Array;
  parts: { name: string; vStart: number; vCount: number; iStart: number; iCount: number }[];
  landmarkVerts: Record<string, number>;
  baseJoints: Float32Array;
  bones: string[];
  boneParent: number[];
}

export interface Measurements {
  heightCm: number;
  headUnits: number;
  shoulderCm: number;
  chestCm: number;
  waistCm: number;
  hipCm: number;
  inseamCm: number;
  gated: boolean;
}

export interface ComposeResult {
  positions: Float32Array;
  normals: Float32Array;
  joints: Float32Array;
  /** per-vertex skin tint (rgb multipliers): baked features × crevice shading */
  tint: Float32Array;
  measurements: Measurements;
  /** worker-side compute time for this frame, ms */
  composeMs: number;
}

let shared: AnatomyEngine | null = null;

export class AnatomyEngine {
  private worker: Worker;
  private readyPromise: Promise<TopologyLite>;
  topology: TopologyLite | null = null;
  private nextId = 1;
  private pending = new Map<number, { resolve: (r: never) => void; reject: (e: Error) => void }>();

  static shared(): AnatomyEngine {
    if (!shared) shared = new AnatomyEngine();
    return shared;
  }

  constructor() {
    this.worker = new EngineWorker();
    this.readyPromise = new Promise((resolve, reject) => {
      this.pending.set(0, { resolve: resolve as never, reject });
    });
    this.worker.onmessage = (e) => {
      const msg = e.data;
      if (msg.type === 'ready') {
        this.topology = msg as TopologyLite;
        this.pending.get(0)?.resolve(msg as never);
        this.pending.delete(0);
        return;
      }
      const call = this.pending.get(msg.id);
      if (!call) return;
      this.pending.delete(msg.id);
      if (msg.type === 'error') call.reject(new Error(msg.error));
      else call.resolve(msg as never);
    };
    this.worker.postMessage({ type: 'init' });
  }

  ready(): Promise<TopologyLite> {
    return this.readyPromise;
  }

  compose(
    c: CharacterParams,
    nsfwEnabled: boolean,
    pose: Record<string, [number, number, number]> | null
  ): Promise<ComposeResult> {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve: resolve as never, reject });
      this.worker.postMessage({
        type: 'compose',
        id,
        weights: c.weights,
        sideWeights: c.sideWeights,
        pose,
        sculptDelta: c.sculptDelta,
        nsfwEnabled
      });
    });
  }

  getDeltas(includeNsfw: boolean): Promise<{ names: string[]; arrays: Float32Array[] }> {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve: resolve as never, reject });
      this.worker.postMessage({ type: 'deltas', id, includeNsfw });
    });
  }
}

/** Per-figure live state: writes composed frames straight into the viewport
 *  mesh's BufferGeometry, latest-wins while dragging. */
export class FigureRuntime {
  engine = AnatomyEngine.shared();
  lastResult: ComposeResult | null = null;
  onComposed: ((r: ComposeResult) => void) | null = null;

  private inflight = false;
  private queued: { c: CharacterParams; nsfw: boolean; pose: Record<string, [number, number, number]> | null } | null = null;
  private targetGeometry: THREE.BufferGeometry | null = null;
  private disposed = false;

  /** Point the runtime at the geometry it should keep updated. */
  setTarget(g: THREE.BufferGeometry | null): void {
    this.targetGeometry = g;
    if (g && this.lastResult) this.writeInto(g, this.lastResult);
  }

  request(c: CharacterParams, nsfwEnabled: boolean, pose: Record<string, [number, number, number]> | null): void {
    this.queued = { c, nsfw: nsfwEnabled, pose };
    void this.pump();
  }

  /** Compose and resolve when THIS request's frame has been applied. */
  async requestAndWait(
    c: CharacterParams,
    nsfwEnabled: boolean,
    pose: Record<string, [number, number, number]> | null
  ): Promise<ComposeResult> {
    this.queued = null;
    while (this.inflight) await new Promise((r) => setTimeout(r, 4));
    this.inflight = true;
    try {
      const res = await this.engine.compose(c, nsfwEnabled, pose);
      this.apply(res);
      return res;
    } finally {
      this.inflight = false;
      void this.pump();
    }
  }

  private async pump(): Promise<void> {
    if (this.inflight || !this.queued || this.disposed) return;
    const job = this.queued;
    this.queued = null;
    this.inflight = true;
    try {
      const res = await this.engine.compose(job.c, job.nsfw, job.pose);
      if (!this.disposed) this.apply(res);
    } catch {
      // worker error: drop the frame
    } finally {
      this.inflight = false;
      if (this.queued) void this.pump();
    }
  }

  private apply(res: ComposeResult): void {
    this.lastResult = res;
    if (this.targetGeometry) this.writeInto(this.targetGeometry, res);
    this.onComposed?.(res);
  }

  private writeInto(g: THREE.BufferGeometry, res: ComposeResult): void {
    const pos = g.getAttribute('position') as THREE.BufferAttribute | undefined;
    if (!pos || pos.array.length !== res.positions.length) return;
    (pos.array as Float32Array).set(res.positions);
    pos.needsUpdate = true;
    const nrm = g.getAttribute('normal') as THREE.BufferAttribute | undefined;
    if (nrm && nrm.array.length === res.normals.length) {
      (nrm.array as Float32Array).set(res.normals);
      nrm.needsUpdate = true;
    }
    this.writeSkinTint(g, res);
    g.computeBoundingSphere();
    g.boundingBox = null;
  }

  /** Vertex-color skin tint from the worker: baked features (lips, brows,
   *  lash lines, blush) times live crevice shading. Multiplies the skin
   *  material color, so it works with any tone. */
  private writeSkinTint(g: THREE.BufferGeometry, res: ComposeResult): void {
    if (!res.tint || res.tint.length !== res.positions.length) return;
    let col = g.getAttribute('color') as THREE.BufferAttribute | undefined;
    if (!col || col.array.length !== res.positions.length) {
      col = new THREE.BufferAttribute(new Float32Array(res.positions.length).fill(1), 3);
      g.setAttribute('color', col);
    }
    (col.array as Float32Array).set(res.tint);
    col.needsUpdate = true;
  }

  /** Snapshot the current composed mesh as immutable GeoData for the doc. */
  bakeGeoData(): GeoData | null {
    const topo = this.engine.topology;
    if (!topo || !this.lastResult) return null;
    return {
      positions: this.lastResult.positions.slice(),
      normals: this.lastResult.normals.slice(),
      uvs: topo.uvs,
      indices: topo.indices
    };
  }

  dispose(): void {
    this.disposed = true;
    this.targetGeometry = null;
    this.onComposed = null;
  }
}
