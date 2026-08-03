import * as THREE from 'three';
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';
import type { Doc } from '../core/doc';
import type { SceneObjectData } from '../core/types';
import { toBufferGeometry, mirroredGeo, matrixFromTransform } from '../core/geo';
import type { CameraRig } from './camera';

// BVH-accelerated raycasts for all meshes (sculpt mode will lean on this hard)
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

interface ObjectView {
  group: THREE.Group;
  mesh: THREE.Mesh;
  mirror: THREE.Mesh | null;
}

function makeMatcapTexture(): THREE.Texture {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  // classic clay-grey studio matcap: base shading + soft key + rim
  let g = ctx.createRadialGradient(size * 0.38, size * 0.34, size * 0.05, size * 0.5, size * 0.5, size * 0.62);
  g.addColorStop(0, '#f4f5f7');
  g.addColorStop(0.45, '#a9adb5');
  g.addColorStop(0.85, '#4e5158');
  g.addColorStop(1, '#26282c');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  g = ctx.createRadialGradient(size * 0.72, size * 0.78, size * 0.02, size * 0.72, size * 0.78, size * 0.3);
  g.addColorStop(0, 'rgba(140,160,200,0.35)');
  g.addColorStop(1, 'rgba(140,160,200,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export class Viewport {
  renderer: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  /** Extra transient content (previews, helpers) lives here. */
  overlayGroup = new THREE.Group();

  private views = new Map<string, ObjectView>();
  private stdMats = new Map<string, THREE.MeshStandardMaterial>();
  private matcapMats = new Map<string, THREE.MeshMatcapMaterial>();
  private matcapTex = makeMatcapTexture();
  private useMatcap = false;
  private selectedId: string | null = null;
  private needsRender = true;
  private raycaster = new THREE.Raycaster();
  private disposed = false;

  constructor(
    private container: HTMLElement,
    private doc: Doc,
    private rig: CameraRig
  ) {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    container.appendChild(this.renderer.domElement);
    this.renderer.domElement.className = 'viewport-canvas';

    this.scene.background = new THREE.Color('#17181c');
    this.scene.add(this.overlayGroup);

    // studio lighting
    const hemi = new THREE.HemisphereLight('#cdd2dc', '#3a3c42', 1.1);
    const key = new THREE.DirectionalLight('#ffffff', 2.0);
    key.position.set(3, 6, 4);
    const rim = new THREE.DirectionalLight('#9db4ff', 0.7);
    rim.position.set(-4, 2.5, -3.5);
    this.scene.add(hemi, key, rim);

    const grid = new THREE.GridHelper(20, 40, 0x3c3f47, 0x24262b);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.85;
    grid.position.y = -0.001;
    this.scene.add(grid);
    const axes = new THREE.AxesHelper(0.8);
    (axes.material as THREE.Material).transparent = true;
    (axes.material as THREE.Material).opacity = 0.7;
    this.scene.add(axes);

    doc.on((e) => {
      if (e.type === 'add') this.addView(doc.get(e.id)!);
      else if (e.type === 'remove') this.removeView(e.id);
      else if (e.type === 'change') this.updateView(doc.get(e.id)!, e.what);
      else if (e.type === 'reset') this.rebuildAll();
      else if (e.type === 'settings') this.applySettings();
      this.invalidate();
    });
    rig.onChange = () => this.invalidate();

    this.resize();
    new ResizeObserver(() => this.resize()).observe(container);
    this.loop();
  }

  private resize(): void {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (w === 0 || h === 0) return;
    this.renderer.setSize(w, h, false);
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.rig.setViewport(w, h);
    this.invalidate();
  }

  invalidate(): void {
    this.needsRender = true;
  }

  /** Per-frame hooks (gizmo hold-to-snap etc.). Return true to keep rendering. */
  onFrame: ((dt: number) => boolean | void) | null = null;

  private loop(): void {
    let last = performance.now();
    const tick = (): void => {
      if (this.disposed) return;
      requestAnimationFrame(tick);
      const now = performance.now();
      const dt = now - last;
      last = now;
      if (this.onFrame?.(dt)) this.needsRender = true;
      if (this.needsRender) {
        this.needsRender = false;
        this.renderer.render(this.scene, this.rig.camera);
      }
    };
    requestAnimationFrame(tick);
  }

  // ---- materials ----

  private material(color: string): THREE.Material {
    if (this.useMatcap) {
      let m = this.matcapMats.get(color);
      if (!m) {
        m = new THREE.MeshMatcapMaterial({ matcap: this.matcapTex, color });
        this.matcapMats.set(color, m);
      }
      return m;
    }
    let m = this.stdMats.get(color);
    if (!m) {
      m = new THREE.MeshStandardMaterial({ color, roughness: 0.62, metalness: 0.05 });
      this.stdMats.set(color, m);
    }
    return m;
  }

  setMatcap(on: boolean): void {
    this.useMatcap = on;
    for (const [id, v] of this.views) {
      const obj = this.doc.get(id);
      if (!obj) continue;
      v.mesh.material = this.material(obj.color);
      if (v.mirror) v.mirror.material = v.mesh.material;
    }
    this.applySelection();
    this.invalidate();
  }

  private applySettings(): void {
    this.setMatcap(this.doc.settings.matcap);
  }

  // ---- object views ----

  private addView(obj: SceneObjectData): void {
    const group = new THREE.Group();
    const mesh = new THREE.Mesh(toBufferGeometry(obj.geo), this.material(obj.color));
    mesh.userData.objectId = obj.id;
    group.add(mesh);
    this.scene.add(group);
    const view: ObjectView = { group, mesh, mirror: null };
    this.views.set(obj.id, view);
    this.updateView(obj, 'transform');
    this.updateView(obj, 'appearance');
  }

  private removeView(id: string): void {
    const v = this.views.get(id);
    if (!v) return;
    this.scene.remove(v.group);
    this.views.delete(id);
    if (this.selectedId === id) this.selectedId = null;
  }

  private updateView(obj: SceneObjectData, what: 'transform' | 'geo' | 'appearance' | 'character'): void {
    const v = this.views.get(obj.id);
    if (!v) return;
    if (what === 'character') return; // figure runtime drives the live mesh
    if (what === 'geo') {
      v.mesh.geometry = toBufferGeometry(obj.geo);
    }
    if (what === 'transform' || what === 'geo') {
      const t = obj.transform;
      v.mesh.position.set(...t.position);
      v.mesh.quaternion.set(...t.quaternion);
      v.mesh.scale.set(...t.scale);
    }
    if (what === 'appearance') {
      v.mesh.material = this.material(obj.color);
      v.group.visible = obj.visible;
    }
    this.syncMirror(obj, v);
    this.applySelection();
  }

  /** Mirror = live world-plane reflection: mirrored geometry copy with a
   *  mirrored transform, winding pre-flipped so shading stays correct. */
  private syncMirror(obj: SceneObjectData, v: ObjectView): void {
    if (!obj.mirror) {
      if (v.mirror) {
        v.group.remove(v.mirror);
        v.mirror = null;
      }
      return;
    }
    if (!v.mirror) {
      v.mirror = new THREE.Mesh(undefined, v.mesh.material);
      v.mirror.userData.objectId = obj.id;
      v.group.add(v.mirror);
    }
    v.mirror.geometry = toBufferGeometry(mirroredGeo(obj.geo, obj.mirror));
    v.mirror.material = v.mesh.material;
    const t = obj.transform;
    const k = obj.mirror === 'x' ? 0 : obj.mirror === 'y' ? 1 : 2;
    const pos: [number, number, number] = [...t.position];
    pos[k] = -pos[k];
    v.mirror.position.set(...pos);
    // reflect orientation: q' = M q M (M = reflection); for quaternions this is
    // negating the two non-axis imaginary parts
    const q: [number, number, number, number] = [...t.quaternion];
    for (let i = 0; i < 3; i++) if (i !== k) q[i] = -q[i];
    v.mirror.quaternion.set(...q);
    v.mirror.scale.set(...t.scale);
  }

  private rebuildAll(): void {
    for (const id of [...this.views.keys()]) this.removeView(id);
    for (const obj of this.doc.list()) this.addView(obj);
    this.applySettings();
  }

  // ---- selection highlight ----

  setSelected(id: string | null): void {
    this.selectedId = id;
    this.applySelection();
    this.invalidate();
  }

  private applySelection(): void {
    for (const [id, v] of this.views) {
      const selected = id === this.selectedId;
      const apply = (mesh: THREE.Mesh | null): void => {
        if (!mesh) return;
        if (selected && mesh.userData.selMat && mesh.material === mesh.userData.selMat) {
          return;
        }
        const base = mesh.material as THREE.Material;
        if (selected) {
          const clone = base.clone() as THREE.MeshStandardMaterial | THREE.MeshMatcapMaterial;
          if ('emissive' in clone) {
            clone.emissive = new THREE.Color('#2f5eb8');
            clone.emissiveIntensity = 0.35;
          } else {
            (clone as THREE.MeshMatcapMaterial).color.offsetHSL(0.6, 0.25, 0.08);
          }
          mesh.material = clone;
          mesh.userData.selMat = clone;
        } else if (mesh.userData.selMat) {
          const obj = this.doc.get(id);
          (mesh.userData.selMat as THREE.Material).dispose();
          mesh.userData.selMat = null;
          if (obj) mesh.material = this.material(obj.color);
        }
      };
      apply(v.mesh);
      apply(v.mirror);
    }
  }

  meshFor(id: string): THREE.Mesh | null {
    return this.views.get(id)?.mesh ?? null;
  }

  // ---- picking ----

  pick(x: number, y: number): string | null {
    return this.pickDetail(x, y)?.id ?? null;
  }

  pickDetail(x: number, y: number): { id: string; vertexIndex: number } | null {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    const ndc = new THREE.Vector2((x / w) * 2 - 1, -(y / h) * 2 + 1);
    this.raycaster.setFromCamera(ndc, this.rig.camera);
    const meshes: THREE.Mesh[] = [];
    for (const v of this.views.values()) {
      if (!v.group.visible) continue;
      meshes.push(v.mesh);
      if (v.mirror) meshes.push(v.mirror);
    }
    const hits = this.raycaster.intersectObjects(meshes, false);
    if (!hits.length) return null;
    const hit = hits[0];
    let vertexIndex = 0;
    if (hit.face) {
      const g = (hit.object as THREE.Mesh).geometry;
      vertexIndex = g.index ? g.index.getX(hit.faceIndex! * 3) : hit.face.a;
    }
    return { id: hit.object.userData.objectId as string, vertexIndex };
  }

  ray(x: number, y: number): THREE.Ray {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    const ndc = new THREE.Vector2((x / w) * 2 - 1, -(y / h) * 2 + 1);
    this.raycaster.setFromCamera(ndc, this.rig.camera);
    return this.raycaster.ray.clone();
  }

  sceneBounds(): THREE.Box3 | null {
    const box = new THREE.Box3();
    for (const obj of this.doc.list()) {
      if (!obj.visible) continue;
      const g = toBufferGeometry(obj.geo);
      if (!g.boundingBox) g.computeBoundingBox();
      const b = g.boundingBox!.clone().applyMatrix4(matrixFromTransform(obj.transform));
      box.union(b);
      if (obj.mirror) {
        const k = obj.mirror === 'x' ? 0 : obj.mirror === 'y' ? 1 : 2;
        const mb = b.clone();
        const min = mb.min.toArray();
        const max = mb.max.toArray();
        const nMin = [...min] as [number, number, number];
        const nMax = [...max] as [number, number, number];
        nMin[k] = -max[k];
        nMax[k] = -min[k];
        mb.min.set(...nMin);
        mb.max.set(...nMax);
        box.union(mb);
      }
    }
    return box.isEmpty() ? null : box;
  }

  /** Capture a thumbnail right after a fresh render (WebGL buffer is valid
   *  within the same task). */
  captureThumb(size = 320): string {
    this.renderer.render(this.scene, this.rig.camera);
    const src = this.renderer.domElement;
    const c = document.createElement('canvas');
    const scale = size / Math.max(src.width, src.height);
    c.width = Math.round(src.width * scale);
    c.height = Math.round(src.height * scale);
    const ctx = c.getContext('2d')!;
    ctx.drawImage(src, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.82);
  }

  dispose(): void {
    this.disposed = true;
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
