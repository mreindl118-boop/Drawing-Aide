# SculptPad — Build Plan

Touch-first 3D asset studio for iPad Safari (installable PWA) with full desktop
mouse/keyboard parity. Procreate-feeling, not a Blender clone. Built in strict
phase order; **a phase is done only when it has been verified on a real iPad in
Safari** (gestures + Pencil) **and its exports open in a real target app**
(slicer / Blender / Procreate).

Legend: `[x]` implemented · `[ ]` open · **(iPad)** = must be verified on-device.

---

## Phase 1 — Blockout & primitives (MVP)

### Foundation
- [x] Vite + TypeScript + Three.js (WebGL2) scaffold
- [x] Installable PWA (`vite-plugin-pwa`, offline precache incl. WASM, icons, manifest)
- [x] rAF render loop isolated from UI, render-on-demand (no work when idle)
- [x] Unified Pointer Events input layer (`touch-action: none`; one path for Pencil/touch/mouse)
- [x] Undo/redo history (command stack, everything undoable) + top-bar buttons
- [x] IndexedDB autosave (`idb`), debounced on every doc change + pagehide
- [x] Project gallery home screen: thumbnails, new/rename/duplicate/delete
- [x] Dark, minimal chrome: slim top bar, left tool tray, left-edge size slider, toasts, non-blocking side panels

### Viewport
- [x] Grid + axes, studio lighting, matcap toggle
- [x] Orbit / zoom (dolly) / pan / roll camera rig (trackball-style, framed reset)
- [x] Touch: 2-finger drag = orbit · pinch = zoom · 2-finger twist = roll · 3-finger drag = pan
- [x] 2-finger tap = undo · 3-finger tap = redo
- [x] Mouse: LMB tool · right-drag / MMB = orbit · shift+drag or shift+wheel = pan · wheel = zoom
- [x] Keyboard: Cmd/Ctrl+Z, Shift+Cmd+Z, `[` `]` size, `S` symmetry, `Tab` tool switch, `W/E/R` gizmo modes, `F` frame, `?` shortcut overlay
- [x] Apple Pencil pressure/tilt plumbed through input layer (used lightly in Phase 1; drives brushes in Phase 2)
- [x] Palm rejection: touches ignored while Pencil is down

### Modeling
- [x] Add primitives: sphere, cube, cylinder, capsule, torus, plane
- [x] QuickShape-3D: draw stroke → hold still → snaps to line / circle / ellipse / rectangle / polygon / smooth curve
- [x] QuickShape-3D make-3D: extrude / lathe / inflate (+ tube for open strokes), live param preview
- [x] Move/rotate/scale gizmos; free-drag move on touch
- [x] Hold-to-snap during transforms (grid positions, 15° angles, scale steps)
- [x] Live mirror symmetry: X default, Y/Z toggle, per-object, rendered live, baked on export
- [x] Boolean union/subtract via `manifold-3d` WASM in a Web Worker (non-blocking, progress toast, undoable)

### Export
- [x] STL: binary, mm scale dialog, manifold/watertight check (manifold worker), triangle count report
- [x] OBJ: positions/normals + UVs when present (primitives & extrudes carry UVs)
- [x] GLB: `GLTFExporter`, binary, Y-up
- [x] iPad delivery: Web Share API → share sheet (Files/Procreate); download fallback on desktop
- [ ] STL auto voxel-remesh fallback when non-manifold (needs the Phase 2 remesh pipeline; Phase 1 warns and exports as-is)

### Deploy & auto-update
- [x] `npm run deploy` = build → Cloudflare Pages publish → URL printed (wrangler; one-time `wrangler login`)
- [x] Cache headers via `public/_headers`: hashed assets immutable, `sw.js`/`index.html`/manifest no-cache
- [x] Manifest complete: standalone, theme/background colors, 192/512 + maskable 192/512 icons; iOS 180px apple-touch-icon + status-bar meta
- [x] SW `registerType: 'prompt'` — no hard reload mid-edit
- [x] Update checks: launch, `visibilitychange` → foreground (iOS suspend path), every 30 min
- [x] Non-blocking "Restart" toast, suppressed while stroke/transform/export in flight; autosave flushed before reload (verified end-to-end by `npm run smoke:update`)
- [x] Settings panel: version + build date (build-time injected), manual update check; version also in gallery footer
- [ ] **(needs account)** run `wrangler login` once, then `npm run deploy` — verify the printed URL serves the app
- [ ] **(iPad)** Add to Home Screen from the deployed URL → fullscreen standalone, safe areas respected
- [ ] **(iPad)** bump version, redeploy, foreground the installed app → toast within seconds → Restart keeps the open project

### Verification (blocks Phase 2)
- [ ] **(iPad)** Install as PWA from Safari; relaunch offline; autosave survives
- [ ] **(iPad)** All gestures verified: orbit/pinch/twist/pan, 2/3-finger tap undo/redo, palm rejection
- [ ] **(iPad)** Apple Pencil: pressure values arrive in strokes; QuickShape hold-to-snap feels right
- [ ] **(iPad)** 60fps orbit with ~10 objects incl. booleans
- [ ] STL opens in a real slicer at correct mm size; OBJ imports into Procreate 3D Paint; GLB opens in Blender Y-up correct
- [ ] Desktop parity pass: every gesture has a working mouse/keyboard equivalent

---

## Phase 2 — Sculpt mode

- [ ] Voxel remesh pipeline: SDF + marching cubes in a worker, resolution slider (Nomad-style)
- [ ] `three-mesh-bvh` for all sculpt raycasts; **refit** (not rebuild) during strokes
- [ ] Brushes: clay, inflate/deflate, smooth, crease, flatten, grab/move, pinch
- [ ] Pencil pressure = strength; tilt shaping where sensible; size via left slider / `[` `]`
- [ ] Left-edge strength slider goes live (Procreate-style)
- [ ] Symmetry: mirror + radial (count slider)
- [ ] Mask brush with invert/clear
- [ ] Wire STL non-manifold auto-remesh fallback (carried from Phase 1)
- [ ] Sculpt undo that scales (partial-buffer snapshots, not whole-mesh copies)
- [ ] **(iPad)** 60fps sculpting at ~1M tris; strokes feel Procreate-immediate; verify on-device pressure

## Phase 3 — Poly-lite editing

- [ ] Tap/lasso face select
- [ ] Extrude, inset, edge bevel, simple loop cut, subdivide
- [ ] Mirror modifier
- [ ] Deliberately "lite": speed over completeness — no full edit-mode topology zoo
- [ ] **(iPad)** selection hit targets are finger-sized; verify lasso with Pencil

## Phase 4 — Bodies, proportions & posing

### Anatomy Slider Engine (pulled forward by request — done)
- [x] Procedural shared-topology base body (superellipse lofts through anatomical
      stations → C1-continuous silhouettes); realistic + toon as morph recipes
- [x] Morph system: 70+ sliders baked as vertex deltas (generator param diffs +
      analytic displacement fields), composed additively in a Web Worker
      (~0.4 ms/frame), never touching three.js's built-in morph-target limit
- [x] Macro sliders: height, build, muscle, body fat, age, frame (masc↔fem),
      waist-hip ratio, glamour (coordinated silhouette shift), head units
      (2.5 chibi ↔ 8+ heroic)
- [x] Micro sliders per region: face (18), neck, torso/chest (11), waist/hips/
      glutes (12), arms, hands, legs, feet + fantasy race morphs (elf ears,
      brow ridge, tusks, hunch, limb ratio)
- [x] Silhouette controls: V-taper, hip flare, waist definition, glute shape,
      thigh–hip transition, posture set
- [x] Anthropometric grounding: 50% = average adult (170 cm, 7.7 heads,
      chest 84 / waist 73 / hip 90); live cm measurements from the mesh
- [x] Preset library: 19 presets (realistic / heroic / anime / fantasy),
      cross-category blending with one interpolation slider, save custom
- [x] Slider ergonomics: center detent, double-tap reset, hold-to-snap to canon
      values, slow-drag fine precision, search/filter, randomize with per-group
      locks + natural-asymmetry jitter
- [x] Tap-a-region opens its slider group; on-model drag handles (shoulders,
      waist, hips, chin, bust, glutes, …) mapped to the same sliders
- [x] Global symmetry with per-slider L/R unlink
- [x] Non-destructive: character = parameter dict saved with the project;
      sculpt-delta layer rides on top so sliders stay live after sculpting;
      bake-to-static warns before freezing sliders
- [x] Skeleton derives from mesh landmarks, recomputes with every morph;
      pose-check presets (arms up, reach, squat, contrapposto) via worker CPU
      skinning — verified clean at chibi and heroic extremes
- [x] NSFW anatomy module: per-project toggle, off by default, engine-level
      hard gate — explicit morphs auto-disable for child-coded proportions
      (< 5.5 head-units or < 125 cm measured), verified by test
- [x] Export: STL/OBJ bake via manifold union of body parts (watertight,
      verified); GLB optionally ships all sliders as named blendshapes + rig
- [x] Headless verification suite (`npm run smoke:anatomy`, 19 checks)
- [x] Realism pass: corrected mesh winding (was inside-out since Phase 1),
      monotone loft interpolation, domed caps, buried neck/shoulder/hip
      junctions, skull-shaped head, ~2× resolution, always-on anatomical
      surface detail (face features, clavicles, abs, scapulae, creases),
      muscle-definition / soft-folds / trapezius sliders, distinct face +
      surface recipes on all 20 presets
- [x] Expression system: 11 expression sliders (smile, jaw, pucker, brows,
      eyes, squint, sneer, cheek puff, pout) + identity micros, one-tap
      expression bundles, per-side unlink (winks), GLB blendshape export
- [ ] Ongoing: face fidelity iteration (features still clay-soft; next lever
      is region-adaptive mesh density in the face patch)
- [ ] **(iPad)** slider drag at 60fps on-device; handles finger-sized; Pencil fine-drag

### Pose Library & Adaptive Retargeting (done)
- [x] Semantic pose presets: normalized local rotations + landmark contact
      constraints (with priority + reach fallbacks) + gaze + ground contacts +
      body-dimension-anchored role frames — never raw world positions
- [x] Retargeting solve: role-frame placement from real dimensions → two-bone
      IK scaled to actual limb lengths (reach-clamped meet points, spine-lean
      assist for size gaps) → posed-torso capsule collision (girth-derived
      radii) → iterative ground settle with a nothing-below-floor clamp
- [x] 50 shipped SFW poses: 20 solo · 20 duo · 10 trio+ — doubling as the
      solver regression corpus
- [x] Pose mirroring, blend-any-two (one slider), role swap, rest reset —
      all undoable, all through the same solver
- [x] Authoring: pose figures → "Save scene as pose" auto-extracts contacts
      (chain-deduped), role frames, grounds, participant count; JSON
      import/export for sharing libraries
- [x] NSFW pose category: gated behind the module toggle, ships EMPTY, filled
      only by user-authored presets; identical retargeting treatment; imports
      of adult-categorized presets require the module enabled
- [x] Regression (`npm run smoke:pose`): Warm Hug chibi×heroic 0.9 cm contacts
      / zero interpenetration; goblin×pin-up exact; Cheer Pyramid with
      powerlifter+waif+chibi holds contacts grounded; 400 solo-pose × body
      combinations clean; authored round-trip; role swap; undo
- [ ] IK handles for direct manipulation posing (drag a hand → arm solves,
      per-limb pinning UI) — solver primitives exist, interactive layer next
- [ ] **(iPad)** pose apply latency + gesture feel on-device
- [ ] "Bake for print": voxel-remesh of posed figure (needs Phase 2 pipeline)

## Phase 5 — Color & paint

- [ ] Vertex-color painting: pressure = opacity, palette, fill-by-island
- [ ] Auto-UV via `xatlas` WASM in a worker
- [ ] Basic single-layer texture painting
- [ ] Procreate handoff: OBJ with UVs (+ optional blank texture PNG) → finish in Procreate 3D Paint
- [ ] **(iPad)** paint round-trip verified in Procreate

## Phase 6 — Animate-lite

- [ ] Keyframe poses on a simple timeline, easing presets, playback
- [ ] GLB export with skeleton + animation, Blender-verified
- [ ] **(iPad)** timeline scrubbing with touch verified

---

## Standing rules (all phases)

- Everything undoable, always. Autosave constantly.
- Heavy ops (remesh, booleans, unwrap) in Workers/WASM with non-blocking progress UI.
- No per-frame allocations in hot paths; cap live meshes ~1–2M tris on iPad; decimation slider on export.
- No blocking modals mid-flow; side panels and toasts only. Hold-to-snap everywhere.
- Small commits per feature; never a giant rewrite.
- Dev flow for iPad testing documented in README (`npm run dev:lan`, HTTPS variant for PWA testing). Pencil pressure is only testable on-device.
