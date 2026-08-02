/// <reference lib="webworker" />
import Module from 'manifold-3d';
import wasmUrl from 'manifold-3d/manifold.wasm?url';

type ManifoldModule = Awaited<ReturnType<typeof Module>>;

let wasmPromise: Promise<ManifoldModule> | null = null;

function getWasm(): Promise<ManifoldModule> {
  if (!wasmPromise) {
    wasmPromise = Module({
      locateFile: () => wasmUrl
    } as never).then((m) => {
      m.setup();
      return m;
    });
  }
  return wasmPromise;
}

interface MeshPayload {
  positions: Float32Array;
  indices: Uint32Array;
}

interface BooleanRequest {
  id: number;
  type: 'boolean';
  op: 'union' | 'difference';
  a: MeshPayload;
  b: MeshPayload;
}

interface CheckRequest {
  id: number;
  type: 'check';
  mesh: MeshPayload;
}

type Request = BooleanRequest | CheckRequest;

function toManifold(wasm: ManifoldModule, payload: MeshPayload) {
  const mesh = new wasm.Mesh({
    numProp: 3,
    vertProperties: payload.positions,
    triVerts: payload.indices
  });
  mesh.merge();
  return new wasm.Manifold(mesh);
}

self.onmessage = async (e: MessageEvent<Request>) => {
  const req = e.data;
  try {
    const wasm = await getWasm();
    if (req.type === 'boolean') {
      const a = toManifold(wasm, req.a);
      const b = toManifold(wasm, req.b);
      const result =
        req.op === 'union' ? wasm.Manifold.union(a, b) : wasm.Manifold.difference(a, b);
      const status = result.status();
      if (status !== 'NoError') throw new Error(`Boolean failed: ${status}`);
      const out = result.getMesh();
      const positions = out.vertProperties.slice() as Float32Array;
      const indices = out.triVerts.slice() as Uint32Array;
      a.delete();
      b.delete();
      result.delete();
      (self as unknown as Worker).postMessage(
        { id: req.id, ok: true, positions, indices },
        [positions.buffer, indices.buffer]
      );
    } else {
      let manifoldOk = false;
      let status = 'NoError';
      try {
        const m = toManifold(wasm, req.mesh);
        status = m.status();
        manifoldOk = status === 'NoError' && !m.isEmpty();
        m.delete();
      } catch (err) {
        manifoldOk = false;
        status = err instanceof Error ? err.message : 'NotManifold';
      }
      (self as unknown as Worker).postMessage({
        id: req.id,
        ok: true,
        manifold: manifoldOk,
        status,
        tris: req.mesh.indices.length / 3
      });
    }
  } catch (err) {
    (self as unknown as Worker).postMessage({
      id: req.id,
      ok: false,
      error: err instanceof Error ? err.message : String(err)
    });
  }
};
