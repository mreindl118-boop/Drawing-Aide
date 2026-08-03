// Visual iteration harness: captures preset views from the DEV server (edit
// source → re-run → fresh screenshots, no rebuild). Usage:
//   node scripts/viz.mjs <outDir> <view> <preset> [preset…]
// view: front | side | face | back
import { chromium } from 'playwright-core';

const [, , outDir, view, ...presets] = process.argv;
const PORT = process.env.VIZ_PORT ? +process.env.VIZ_PORT : 5195;

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 460, height: 780 } });
page.on('pageerror', (e) => console.error('page error:', e.message));
await page.goto(`http://localhost:${PORT}/`);
await page.waitForSelector('.gallery-root', { timeout: 20000 });
await page.click('.new-card');
await page.waitForSelector('.viewport-canvas', { timeout: 20000 });
const id = await page.evaluate(() => window.__sculptpad.addBody());
// VIZ_MATCAP=0 → shaded skin material (realism checks); default clay matcap (form checks)
await page.evaluate((matcap) => {
  const sp = window.__sculptpad;
  sp.editor.doc.setSettings({ matcap });
  sp.editor.figures.closePanel();
  sp.editor.select(null);
  document.querySelector('.tool-tray').style.display = 'none';
  document.querySelector('.edge-slider').style.display = 'none';
}, process.env.VIZ_MATCAP !== '0');

for (const preset of presets) {
  await page.evaluate(
    async ({ id, preset, view }) => {
      const sp = window.__sculptpad;
      if (sp.applyPresetFull) await sp.applyPresetFull(id, preset);
      else await sp.applyPresetBlend(id, preset, preset, 1);
      sp.editor.select(null);
      sp.editor.figures.closePanel();
      const rig = sp.editor.rig;
      const m = sp.bodyMeasurements(id);
      const h = (m ? m.heightCm : 170) / 100;
      const yaws = { front: 0.12, side: Math.PI / 2, back: Math.PI - 0.12, face: 0.35 };
      const yaw = yaws[view] ?? 0;
      if (view === 'face') {
        rig.target.set(0, h * 0.92, 0);
        rig.dist = h * 0.30;
      } else {
        rig.target.set(0, h * 0.5, 0);
        rig.dist = h * 1.5;
      }
      const pitch = view === 'face' ? -0.06 : -0.06;
      const cy = Math.cos(yaw / 2), sy = Math.sin(yaw / 2);
      const cpi = Math.cos(pitch / 2), spi = Math.sin(pitch / 2);
      // q = yaw * pitch
      rig.quat.set(spi * cy, sy * cpi, -sy * spi, cy * cpi);
      rig.quat.normalize();
      rig.apply();
    },
    { id, preset, view }
  );
  await page.waitForTimeout(350);
  await page.screenshot({ path: `${outDir}/${view}-${preset}.png` });
  console.log(`${view}-${preset}.png`);
}
await browser.close();
process.exit(0);
