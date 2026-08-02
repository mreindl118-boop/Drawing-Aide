// Headless smoke test: boots the built app, creates a project, adds
// primitives, exercises undo/redo, booleans (manifold worker), exports, and
// autosave persistence. Run `npm run build` first.
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';

const PORT = 4173;

function startPreview() {
  const child = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
    stdio: 'pipe',
    detached: true
  });
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('preview server timeout')), 15000);
    child.stdout.on('data', (d) => {
      if (String(d).includes('http')) {
        clearTimeout(timer);
        resolve(child);
      }
    });
    child.on('exit', (code) => reject(new Error(`preview exited ${code}`)));
  });
}

let failures = 0;
function check(name, cond) {
  if (cond) console.log(`  ✓ ${name}`);
  else {
    failures++;
    console.error(`  ✗ ${name}`);
  }
}

const server = await startPreview();
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
try {
  const page = await browser.newPage({ viewport: { width: 1180, height: 820 } });
  page.on('pageerror', (e) => {
    failures++;
    console.error('  ✗ page error:', e.message);
  });
  await page.goto(`http://localhost:${PORT}/`);
  await page.waitForSelector('.gallery-root', { timeout: 10000 });
  check('gallery renders', true);

  await page.click('.new-card');
  await page.waitForSelector('.viewport-canvas', { timeout: 10000 });
  check('editor opens with viewport canvas', true);

  const sp = () => page.evaluate((expr) => {
    // eslint-disable-next-line no-eval
    return eval(expr);
  });

  await page.evaluate(() => window.__sculptpad.addPrimitive('sphere'));
  await page.evaluate(() => window.__sculptpad.addPrimitive('cube'));
  check('add primitives', (await page.evaluate(() => window.__sculptpad.objectCount())) === 2);

  await page.evaluate(() => window.__sculptpad.undo());
  check('undo', (await page.evaluate(() => window.__sculptpad.objectCount())) === 1);
  await page.evaluate(() => window.__sculptpad.redo());
  check('redo', (await page.evaluate(() => window.__sculptpad.objectCount())) === 2);

  // booleans through the manifold worker: the sphere is inscribed in the
  // cube, so cube−sphere must carve spherical cavities (many tris) while
  // union collapses to (roughly) the cube.
  const boolTris = await page.evaluate(async () => {
    const s = window.__sculptpad;
    const [sphere, cube] = s.editor.doc.list();
    return {
      diff: await s.boolean('difference', cube.id, sphere.id),
      union: await s.boolean('union', cube.id, sphere.id)
    };
  });
  check(`manifold subtract produces mesh (${boolTris.diff} tris)`, boolTris.diff > 100);
  check(`manifold union produces mesh (${boolTris.union} tris)`, boolTris.union >= 12);

  const stlBytes = await page.evaluate(() => window.__sculptpad.exportSTLBytes());
  check(`STL export (${stlBytes} bytes)`, stlBytes > 84 && (stlBytes - 84) % 50 === 0);

  const obj = await page.evaluate(() => window.__sculptpad.exportOBJText());
  check('OBJ export has UVs', obj.includes('\nvt ') && obj.includes('\nf '));

  // autosave → reload → project persists with objects
  await page.waitForTimeout(1500);
  await page.goto(`http://localhost:${PORT}/#/`);
  await page.waitForSelector('.project-card:not(.new-card)', { timeout: 10000 });
  check('project appears in gallery after autosave', true);
  await page.click('.project-card:not(.new-card)');
  await page.waitForSelector('.viewport-canvas', { timeout: 10000 });
  await page.waitForFunction(() => window.__sculptpad?.objectCount() === 2, null, { timeout: 5000 });
  check('scene restored from IndexedDB', true);

  void sp;
} finally {
  await browser.close();
  try {
    process.kill(-server.pid, 'SIGTERM'); // whole process group (npx + vite)
  } catch {
    server.kill();
  }
}

if (failures) {
  console.error(`\n${failures} smoke check(s) failed`);
  process.exit(1);
}
console.log('\nAll smoke checks passed');
process.exit(0);
