import { defineConfig, type PluginOption } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

export default defineConfig(async () => {
  const plugins: PluginOption[] = [
    VitePWA({
      // 'prompt': never hard-reload mid-edit — the app shows a Restart toast
      registerType: 'prompt',
      includeAssets: ['icons/*.png', 'icons/*.svg'],
      manifest: {
        name: 'SculptPad',
        short_name: 'SculptPad',
        description: 'Touch-first 3D asset studio — blockout, sculpt, pose, paint, export.',
        display: 'standalone',
        orientation: 'any',
        theme_color: '#141417',
        background_color: '#141417',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,wasm,woff2,bin}'],
        // manifold WASM is a few MB; make sure it precaches for offline use
        maximumFileSizeToCacheInBytes: 24 * 1024 * 1024
      }
    })
  ];

  // Optional HTTPS for LAN iPad testing (service worker / PWA install needs a
  // secure context off-localhost): `npm run dev:lan-https`
  if (process.env.LAN_HTTPS) {
    const basicSsl = (await import('@vitejs/plugin-basic-ssl')).default;
    plugins.push(basicSsl());
  }

  return {
    plugins,
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version as string),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString())
    },
    worker: { format: 'es' as const },
    build: { target: 'es2022', sourcemap: false },
    optimizeDeps: { exclude: ['manifold-3d'] }
  };
});
