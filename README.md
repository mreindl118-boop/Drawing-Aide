# SculptPad

A Procreate-feeling 3D asset studio: fast, touch-first, opinionated — not a
Blender clone. Runs as an installable PWA on iPad Safari with full Apple Pencil
support, and with complete mouse + keyboard parity in desktop browsers.
Sculpt, block out, pose, and paint 3D assets, then export for 3D printing
(STL), Blender (GLB/OBJ), and Procreate 3D Paint (OBJ with UVs).

Current status: **Phase 1 — Blockout & primitives.** See [PLAN.md](PLAN.md)
for the full roadmap and per-phase checklists.

## What works today (Phase 1)

- Viewport with grid, studio lighting + matcap toggle; orbit / zoom / roll / pan
- Primitives: sphere, cube, cylinder, capsule, torus, plane
- **QuickShape-3D**: draw a stroke, hold still → it snaps to a clean
  line/circle/ellipse/rectangle/polygon/curve → make it 3D via extrude, lathe,
  inflate, or tube
- Move/rotate/scale gizmos + free-drag; **hold still during any transform to
  snap** to the grid / 15° angles
- Live mirror symmetry (X/Y/Z, per object, baked on export)
- Boolean union/subtract (manifold-3d WASM, in a worker, undoable)
- Undo/redo everywhere (2-finger tap / 3-finger tap, ⌘Z / ⇧⌘Z)
- Gallery with thumbnails; IndexedDB autosave on every change
- Export STL (binary, mm, watertight-checked), OBJ (with UVs), GLB — via the
  iPad share sheet, or download on desktop

## Gestures & keys

| Touch / Pencil | Mouse / keyboard | Action |
| --- | --- | --- |
| 1 finger / Pencil | LMB | Active tool (select · drag · draw) |
| 2-finger drag | RMB or MMB drag | Orbit |
| Pinch | Wheel | Zoom |
| 2-finger twist | — | Roll |
| 3-finger drag | Shift+wheel / Shift+drag | Pan |
| 2-finger tap | ⌘Z | Undo |
| 3-finger tap | ⇧⌘Z | Redo |
| Draw + hold still | Draw + hold still | QuickShape snap |
| Hold still mid-transform | Hold still mid-transform | Snap to grid / angles |

Keys: `W/E/R` gizmo modes · `Tab` cycle tool · `[` `]` size · `S` symmetry ·
`M` matcap · `F` frame · `⌘D` duplicate · `Delete` delete · `?` full overlay.

In Move mode, dragging empty space orbits (tap empty space to deselect).

## Deploy

```sh
npm run deploy        # build + publish to Cloudflare Pages + print the URL
```

One-time setup: `npx wrangler login` (or set `CLOUDFLARE_API_TOKEN` +
`CLOUDFLARE_ACCOUNT_ID`). The script creates the Pages project on first run
(`SCULPTPAD_PAGES_PROJECT` overrides the name). Cache policy ships in
`public/_headers`: hashed assets immutable, `sw.js`/`index.html` no-cache.

**Updates:** the service worker registers in `prompt` mode — the app never
hard-reloads mid-edit. Update checks run at launch, whenever the (suspended)
iPad PWA returns to the foreground, and every 30 minutes; a waiting version
shows a "New version ready — Restart" toast (deferred while a stroke,
transform, or export is in flight) that flushes autosave before reloading.
Current version + build date live in Settings (gear icon) with a manual
check button. The whole loop is regression-tested by `npm run smoke:update`.

## Development

```sh
npm install
npm run dev        # local dev server
npm run build      # typecheck + production build + PWA/service worker
npm run preview    # serve the build
npm run smoke      # headless end-to-end smoke test (build first)
npm run icons      # regenerate public/icons/*.png
```

### Testing on an iPad (LAN dev flow)

1. Put the iPad and your dev machine on the same network.
2. `npm run dev:lan` and open the printed `http://<your-ip>:5173` on the iPad.
3. **PWA install / service worker / Web Share need HTTPS** off-localhost:
   use `npm run dev:lan-https` (self-signed via `@vitejs/plugin-basic-ssl`;
   accept the certificate warning on the iPad), or test install against
   `npm run build && npm run preview -- --host` behind a real cert.
4. Apple Pencil pressure/tilt and multi-touch gestures are **only testable
   on-device** — desktop emulation does not deliver real `pointermove`
   pressure or multi-finger gestures.
5. Add to Home Screen from Safari's share menu to verify standalone mode,
   then airplane-mode the iPad to verify offline boot + autosave.

### Architecture notes

- `src/core/` — document model, undo history, geometry data (immutable typed
  arrays), IndexedDB store. No three.js imports except `geo.ts` conversions.
- `src/editor/` — viewport (render-on-demand rAF loop, isolated from UI),
  trackball camera rig, unified Pointer Events gesture layer, gizmo with
  hold-to-snap, QuickShape capture + fitting, boolean client, exporters,
  plain-DOM chrome.
- `src/workers/manifold.worker.ts` — manifold-3d WASM: booleans + watertight
  checks off the main thread.
- Everything heavy stays out of the render loop; meshes are BVH-indexed
  (three-mesh-bvh) ready for sculpt raycasts in Phase 2.
