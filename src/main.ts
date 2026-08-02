import './style.css';
import { registerSW } from 'virtual:pwa-register';
import { renderGallery } from './gallery/gallery';
import type { Editor } from './editor/editor';

registerSW({ immediate: true });

const app = document.getElementById('app')!;
let editor: Editor | null = null;

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
    }
  };
}

window.addEventListener('hashchange', () => void route());
void route();
