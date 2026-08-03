/** Single-file demo build: everything inlined (workers as blob bundles, WASM
 *  as data URIs, no service worker) so the app runs on a strict-CSP host with
 *  no external requests. Used by scripts/build-demo.mjs. */
import { defineConfig, type Plugin } from 'vite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

/** rewrite `?worker` imports to `?worker&inline` so worker code ships inside
 *  the main bundle and boots from a Blob */
function inlineWorkers(): Plugin {
  return {
    name: 'sculptpad-inline-workers',
    enforce: 'pre',
    async resolveId(source, importer) {
      if (source.endsWith('?worker')) {
        const r = await this.resolve(source.replace(/\?worker$/, '?worker&inline'), importer, {
          skipSelf: true
        });
        return r;
      }
      return null;
    }
  };
}

export default defineConfig({
  plugins: [inlineWorkers()],
  resolve: {
    alias: {
      'virtual:pwa-register': fileURLToPath(new URL('./src/app/pwa-stub.ts', import.meta.url))
    }
  },
  define: {
    __APP_VERSION__: JSON.stringify(`${pkg.version}-demo`),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString())
  },
  worker: { format: 'es' as const },
  build: {
    target: 'es2022',
    sourcemap: false,
    outDir: 'dist-demo',
    assetsInlineLimit: 1_000_000_000, // every asset (incl. manifold.wasm) → data URI
    chunkSizeWarningLimit: 10_000,
    rollupOptions: { output: { inlineDynamicImports: true } }
  },
  optimizeDeps: { exclude: ['manifold-3d'] }
});
