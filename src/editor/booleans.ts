import ManifoldWorker from '../workers/manifold.worker?worker';
import type { GeoData } from '../core/types';

interface PendingCall {
  resolve: (v: never) => void;
  reject: (e: Error) => void;
}

export interface ManifoldCheck {
  manifold: boolean;
  status: string;
  tris: number;
}

/** Client for the manifold-3d worker: booleans + watertight checks, always
 *  off the main thread. Inputs must be world-baked (mirror included). */
export class BooleanEngine {
  private worker: Worker | null = null;
  private nextId = 1;
  private pending = new Map<number, PendingCall>();

  private ensureWorker(): Worker {
    if (!this.worker) {
      this.worker = new ManifoldWorker();
      this.worker.onmessage = (e) => {
        const { id, ok, error, ...rest } = e.data;
        const call = this.pending.get(id);
        if (!call) return;
        this.pending.delete(id);
        if (ok) call.resolve(rest as never);
        else call.reject(new Error(error ?? 'worker error'));
      };
      this.worker.onerror = (e) => {
        for (const call of this.pending.values()) {
          call.reject(new Error(e.message || 'manifold worker crashed'));
        }
        this.pending.clear();
        this.worker?.terminate();
        this.worker = null;
      };
    }
    return this.worker;
  }

  private call<T>(msg: Record<string, unknown>, transfer: Transferable[]): Promise<T> {
    const id = this.nextId++;
    return new Promise<T>((resolve, reject) => {
      this.pending.set(id, { resolve: resolve as never, reject });
      this.ensureWorker().postMessage({ id, ...msg }, transfer);
    });
  }

  async boolean(op: 'union' | 'difference', a: GeoData, b: GeoData): Promise<GeoData> {
    // copy: buffers get transferred, callers keep their data
    const pa = a.positions.slice();
    const ia = a.indices.slice();
    const pb = b.positions.slice();
    const ib = b.indices.slice();
    const res = await this.call<{ positions: Float32Array; indices: Uint32Array }>(
      {
        type: 'boolean',
        op,
        a: { positions: pa, indices: ia },
        b: { positions: pb, indices: ib }
      },
      [pa.buffer, ia.buffer, pb.buffer, ib.buffer]
    );
    return { positions: res.positions, normals: null, uvs: null, indices: res.indices };
  }

  /** Manifold union of many closed parts (figures are overlapping solids). */
  async unionAll(geos: GeoData[]): Promise<GeoData> {
    const meshes = geos.map((g) => ({
      positions: g.positions.slice(),
      indices: g.indices.slice()
    }));
    const res = await this.call<{ positions: Float32Array; indices: Uint32Array }>(
      { type: 'unionAll', meshes },
      meshes.flatMap((m) => [m.positions.buffer, m.indices.buffer])
    );
    return { positions: res.positions, normals: null, uvs: null, indices: res.indices };
  }

  async check(geo: GeoData): Promise<ManifoldCheck> {
    const p = geo.positions.slice();
    const i = geo.indices.slice();
    return this.call<ManifoldCheck>(
      { type: 'check', mesh: { positions: p, indices: i } },
      [p.buffer, i.buffer]
    );
  }
}
