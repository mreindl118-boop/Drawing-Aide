import './style.css';
import { renderGallery } from './gallery/gallery';
import { updateManager } from './app/updates';
import type { Editor } from './editor/editor';

const app = document.getElementById('app')!;
let editor: Editor | null = null;

// prompt-style SW updates: checks on launch / foreground / every 30 min,
// Restart toast defers while the user is mid-gesture, saves flush first
const updates = updateManager();
updates.host = {
  isBusy: () => editor?.busy ?? false,
  flushSaves: async () => {
    if (editor) await editor.saveNow(true);
  }
};
(window as unknown as Record<string, unknown>).__sculptpadUpdates = updates;
(window as unknown as Record<string, unknown>).__sculptpadVersion = {
  version: __APP_VERSION__,
  builtAt: __BUILD_DATE__
};

async function route(): Promise<void> {
  const hash = location.hash;
  if (editor) {
    await editor.saveNow(true).catch(() => {});
    editor.dispose();
    editor = null;
  }
  const m = hash.match(/^#\/p\/([\w-]+)/);
  if (m) {
    const { Editor } = await import('./editor/editor');
    editor = await Editor.open(app, m[1]);
    exposeTestHooks();
  } else {
    await renderGallery(app);
  }
}

/** Minimal hooks for automated smoke tests (scripts/smoke.mjs). */
function exposeTestHooks(): void {
  (window as unknown as Record<string, unknown>).__sculptpad = {
    get editor() {
      return editor;
    },
    objectCount: () => editor?.doc.size ?? 0,
    addPrimitive: (kind: string) => editor?.addPrimitive(kind as never),
    undo: () => editor?.undo(),
    redo: () => editor?.redo(),
    exportSTLBytes: async () => {
      if (!editor) return 0;
      const { collectExportMeshes, exportSTL } = await import('./editor/exporter');
      const blob = exportSTL(collectExportMeshes(editor.doc), 10);
      return blob.size;
    },
    exportOBJText: async () => {
      if (!editor) return '';
      const { collectExportMeshes, exportOBJ } = await import('./editor/exporter');
      return (await collectExportMeshes(editor.doc), exportOBJ(collectExportMeshes(editor.doc)).text());
    },
    boolean: async (op: 'union' | 'difference', a: string, b: string) => {
      if (!editor) throw new Error('no editor');
      const { bakeObjectGeo } = await import('./editor/exporter');
      const geoA = bakeObjectGeo(editor.doc.get(a)!);
      const geoB = bakeObjectGeo(editor.doc.get(b)!);
      const res = await editor.booleans.boolean(op, geoA, geoB);
      return res.indices.length / 3;
    },
    // ---- anatomy engine hooks ----
    addBody: (preset?: string) => editor!.figures.addFigure(preset),
    setBodyWeights: (id: string, w: Record<string, number>) => editor!.figures.setWeights(id, w),
    setBodyPose: (id: string, pose: Record<string, [number, number, number]> | null) =>
      editor!.figures.setPose(id, pose),
    bodyMeasurements: (id: string) => editor!.figures.measurementsOf(id),
    handleModeAt: (dist: number) => {
      editor!.rig.dist = dist;
      editor!.rig.apply();
      editor!.figures.frameTick();
      return editor!.figures.handleMode();
    },
    bodyComposeProbe: (id: string, n?: number) => editor!.figures.composeProbe(id, n),
    bakeBody: (id: string) => editor!.figures.bakeFigure(id),
    applyPresetBlend: async (id: string, a: string, b: string, t: number) => {
      const { PRESET_BY_ID, blendPresets } = await import('./anatomy/presets');
      const wa = PRESET_BY_ID.get(a)?.weights ?? {};
      const wb = PRESET_BY_ID.get(b)?.weights ?? {};
      const mixed = blendPresets(wa, wb, t);
      // replace (not merge): blends define the whole recipe
      const cur = editor!.doc.get(id)?.character;
      if (!cur) return false;
      const { cloneCharacter } = await import('./anatomy/character');
      const next = cloneCharacter(cur);
      next.weights = mixed;
      await editor!.figures.commitCharacter(id, next, `Blend ${a} × ${b}`);
      return true;
    },
    // ---- pose system hooks ----
    poseLibraryCounts: async () => {
      const lib = editor!.figures.poseLibrary();
      const { PRESETS } = await import('./anatomy/presets');
      const by = (c: string) => lib.shipped.filter((p) => p.category === c).length;
      return {
        solo: by('solo'),
        duo: by('duo'),
        trio: by('trio'),
        nsfwShipped: by('nsfw'),
        bodyPresets: PRESETS.length,
        allPoseIds: lib.shipped.map((p) => p.id)
      };
    },
    applyPoseById: async (poseId: string, ids?: string[]) => {
      const { POSE_BY_ID } = await import('./anatomy/pose/library');
      const p = POSE_BY_ID.get(poseId);
      if (!p) throw new Error(`no pose ${poseId}`);
      return editor!.figures.applyPosePreset(p, ids);
    },
    poseRoleSwap: () => editor!.figures.roleSwap(),
    savePoseFromScene: (name: string, category: string) =>
      editor!.figures.saveCurrentAsPose(name, category as never),
    applyCustomPose: async (presetJson: string, ids?: string[]) => {
      const { parsePresets } = await import('./anatomy/pose/schema');
      const [p] = parsePresets(presetJson);
      return editor!.figures.applyPosePreset(p, ids);
    },
    exportPoseJson: () => editor!.figures.exportPoseLibrary(),
    glbProbe: async () => {
      const { collectExportMeshes, exportGLB } = await import('./editor/exporter');
      const figData = await (editor as unknown as {
        buildFigureGLBData(): Promise<import('./editor/exporter').FigureGLBData | null>;
      }).buildFigureGLBData();
      const meshes = collectExportMeshes(editor!.doc).filter((m) => !m.isFigure);
      const blob = await exportGLB(meshes, figData ?? undefined);
      const buf = new Uint8Array(await blob.arrayBuffer());
      const magic = String.fromCharCode(buf[0], buf[1], buf[2], buf[3]);
      const jsonLen = new DataView(buf.buffer).getUint32(12, true);
      const json = JSON.parse(new TextDecoder().decode(buf.slice(20, 20 + jsonLen)));
      const mesh = json.meshes?.find(
        (m: { primitives?: { targets?: unknown[] }[]; extras?: { targetNames?: string[] } }) =>
          m.primitives?.[0]?.targets?.length
      );
      return {
        magic,
        bytes: buf.length,
        targets: mesh?.primitives[0].targets.length ?? 0,
        hasSkin: (json.skins?.length ?? 0) > 0,
        hasNames: !!mesh?.extras?.targetNames?.length
      };
    },
    sculptOnBody: async (id: string, amp: number) => {
      // fake sculpt-layer edit: raise a bump so tests can verify the layer
      const { AnatomyEngine } = await import('./anatomy/engine');
      const topo = AnatomyEngine.shared().topology!;
      const delta = new Float32Array(topo.vertCount * 3);
      const vi = topo.landmarkVerts.bellyFront;
      delta[vi * 3 + 2] += amp;
      await editor!.figures.applySculptDelta(id, delta, 'Test sculpt');
      return true;
    },
    manifoldCheck: async (geoOwner: string) => {
      if (!editor) throw new Error('no editor');
      const { collectExportMeshes } = await import('./editor/exporter');
      const { figureExportParts, splitFigureParts } = await import('./anatomy/integration');
      const { AnatomyEngine } = await import('./anatomy/engine');
      const meshes = collectExportMeshes(editor.doc).filter((m) => m.id === geoOwner);
      if (!meshes.length) return null;
      const m = meshes[0];
      if (m.isFigure) {
        const topo = AnatomyEngine.shared().topology!;
        m.geo = await editor.booleans.unionAll(splitFigureParts(m.geo, figureExportParts(m.geo, topo)));
      }
      return editor.booleans.check(m.geo);
    }
  };
}

window.addEventListener('hashchange', () => void route());
void route();
