// Auto-update flow verification: serve v A, install its service worker, then
// rebuild a bumped version behind the same server and confirm: update check →
// Restart toast → tap → new version running with the saved project intact.
// Run `npm run build` first (the script rebuilds twice itself).
import { chromium } from 'playwright-core';
import { spawn, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const PORT = 4181;
const pkgPath = new URL('../package.json', import.meta.url);
const origPkg = readFileSync(pkgPath, 'utf8');
const origVersion = JSON.parse(origPkg).version;

let failures = 0;
function check(name, cond, detail = '') {
  if (cond) console.log(`  ✓ ${name}${detail ? ` (${detail})` : ''}`);
  else {
    failures++;
    console.error(`  ✗ ${name}${detail ? ` (${detail})` : ''}`);
  }
}

function build() {
  const res = spawnSync('npm', ['run', 'build'], { stdio: 'pipe', encoding: 'utf8' });
  if (res.status !== 0) throw new Error('build failed:\n' + res.stdout + res.stderr);
}

function setVersion(v) {
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  pkg.version = v;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

console.log(`▸ building v${origVersion} (A)…`);
build();

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
  stdio: 'pipe',
  detached: true
});
await new Promise((res, rej) => {
  server.stdout.on('data', (d) => String(d).includes('http') && res());
  server.on('exit', () => rej(new Error('preview died')));
});

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
try {
  const page = await browser.newPage();
  await page.goto(`http://localhost:${PORT}/`);
  await page.waitForSelector('.gallery-root');

  const vA = await page.evaluate(() => window.__sculptpadVersion.version);
  check(`version A running`, vA === origVersion, vA);

  // create a project so we can prove work survives the update restart
  await page.click('.new-card');
  await page.waitForSelector('.viewport-canvas');
  await page.evaluate(() => window.__sculptpad.addPrimitive('torus'));
  await page.waitForTimeout(1300); // autosave debounce

  // wait for the service worker to be installed + controlling
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.waitForSelector('.viewport-canvas');
  const controlled = await page.evaluate(() => !!navigator.serviceWorker.controller);
  check('service worker controls the page', controlled);

  // ---- publish version B behind the same server
  const bumped = origVersion.replace(/(\d+)$/, (m) => String(Number(m) + 1));
  console.log(`▸ building v${bumped} (B) behind the running server…`);
  setVersion(bumped);
  build();

  // foreground-style check (what an iPad does when the PWA resumes)
  await page.evaluate(() => window.__sculptpadUpdates.check(false));
  await page.waitForSelector('.update-toast', { timeout: 20000 });
  check('update toast appeared after check', true);

  const toastText = await page.textContent('.update-toast');
  check('toast offers Restart', /Restart/.test(toastText ?? ''));

  await Promise.all([
    page.waitForNavigation({ timeout: 20000 }),
    page.click('.update-toast .toast-action')
  ]);
  await page.waitForSelector('.viewport-canvas, .gallery-root', { timeout: 15000 });
  const vB = await page.evaluate(() => window.__sculptpadVersion.version);
  check('new version running after Restart', vB === bumped, `${vA} → ${vB}`);

  // the open project survived
  const objCount = await page.evaluate(() => window.__sculptpad?.objectCount() ?? -1);
  check('open project intact after update', objCount === 1, `${objCount} object(s)`);
} finally {
  await browser.close();
  try {
    process.kill(-server.pid, 'SIGTERM');
  } catch {
    server.kill();
  }
  console.log(`▸ restoring v${origVersion} and rebuilding…`);
  writeFileSync(pkgPath, origPkg);
  build();
}

if (failures) {
  console.error(`\n${failures} update-flow check(s) failed`);
  process.exit(1);
}
console.log('\nAll update-flow checks passed');
process.exit(0);
