// Touch-gesture regression suite: drives the PointerGestures layer with
// synthetic PointerEvents on the stage element and asserts on the camera rig.
// Covers the two-finger contract: pinch zooms WITHOUT tumbling or tilting,
// drag orbits (grab-the-world, opposite of mouse), deliberate twist rolls.
// Run `npm run build` first.
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';

const PORT = 4179;

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
function check(name, cond, detail = '') {
  if (cond) console.log(`  ✓ ${name}${detail ? ` (${detail})` : ''}`);
  else {
    failures++;
    console.error(`  ✗ ${name}${detail ? ` (${detail})` : ''}`);
  }
}

const server = await startPreview();
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
try {
  const page = await browser.newPage({ viewport: { width: 1194, height: 834 } });
  page.on('pageerror', (e) => {
    failures++;
    console.error('  ✗ page error:', e.message);
  });
  await page.goto(`http://localhost:${PORT}/`);
  // synthetic pointers have no active id — make capture calls no-ops so
  // components that capture (gizmo, sliders) don't throw during the test
  await page.evaluate(() => {
    const sp = Element.prototype.setPointerCapture;
    Element.prototype.setPointerCapture = function (id) { try { sp.call(this, id); } catch { /* synthetic */ } };
    const rp = Element.prototype.releasePointerCapture;
    Element.prototype.releasePointerCapture = function (id) { try { rp.call(this, id); } catch { /* synthetic */ } };
  });
  await page.waitForSelector('.gallery-root', { timeout: 10000 });
  await page.click('.new-card');
  await page.waitForSelector('.viewport-canvas', { timeout: 10000 });

  // helper: run a two-finger sequence and report the rig delta.
  // Each step is [ax, ay, bx, by]; events are dispatched on .stage.
  await page.evaluate(() => {
    window.__gesture = (steps) => {
      const el = document.querySelector('.viewport-canvas');
      const rig = window.__sculptpad.editor.rig;
      const before = {
        dist: rig.dist,
        quat: [rig.quat.x, rig.quat.y, rig.quat.z, rig.quat.w]
      };
      const fire = (type, id, x, y) =>
        el.dispatchEvent(
          new PointerEvent(type, {
            pointerId: id,
            pointerType: 'touch',
            clientX: x,
            clientY: y,
            bubbles: true,
            isPrimary: id === 100
          })
        );
      const [a0, b0] = [steps[0], steps[0]];
      fire('pointerdown', 100, a0[0], a0[1]);
      fire('pointerdown', 101, b0[2], b0[3]);
      for (const [ax, ay, bx, by] of steps.slice(1)) {
        fire('pointermove', 100, ax, ay);
        fire('pointermove', 101, bx, by);
      }
      const last = steps[steps.length - 1];
      fire('pointerup', 100, last[0], last[1]);
      fire('pointerup', 101, last[2], last[3]);
      const q = rig.quat;
      // angle between before/after orientations
      const dot = Math.min(1, Math.abs(before.quat[0] * q.x + before.quat[1] * q.y + before.quat[2] * q.z + before.quat[3] * q.w));
      return {
        distBefore: before.dist,
        distAfter: rig.dist,
        rotDeg: (2 * Math.acos(dot) * 180) / Math.PI
      };
    };
  });

  const steps = (n, fn) => Array.from({ length: n + 1 }, (_, i) => fn(i / n));

  // ---- pure pinch OUT (spread): zoom in, camera must not tumble or tilt.
  // slight asymmetric drift + angle jitter mimics a real human pinch.
  const pinch = await page.evaluate(
    (s) => window.__gesture(s),
    steps(24, (t) => [500 - 40 - 160 * t, 400 + 8 * t, 500 + 40 + 130 * t, 402 - 6 * t])
  );
  check('pinch out zooms in', pinch.distAfter < pinch.distBefore * 0.75, `${pinch.distBefore.toFixed(2)} → ${pinch.distAfter.toFixed(2)}`);
  check('pinch does not tumble/tilt the camera', pinch.rotDeg < 4, `${pinch.rotDeg.toFixed(1)}° drift`);

  // ---- pinch IN (together): zoom out
  const pinchIn = await page.evaluate(
    (s) => window.__gesture(s),
    steps(24, (t) => [500 - 200 + 150 * t, 400, 500 + 200 - 150 * t, 400])
  );
  check('pinch in zooms out', pinchIn.distAfter > pinchIn.distBefore * 1.3, `${pinchIn.distBefore.toFixed(2)} → ${pinchIn.distAfter.toFixed(2)}`);

  // ---- two-finger parallel drag: orbits, keeps zoom
  const drag = await page.evaluate(
    (s) => window.__gesture(s),
    steps(24, (t) => [400 + 220 * t, 380, 520 + 220 * t, 420])
  );
  check('two-finger drag orbits', drag.rotDeg > 10, `${drag.rotDeg.toFixed(1)}°`);
  check('drag keeps zoom stable', Math.abs(drag.distAfter / drag.distBefore - 1) < 0.06, `${drag.distBefore.toFixed(2)} → ${drag.distAfter.toFixed(2)}`);

  // ---- small twist (< latch): must NOT roll — this was the horizon-tilt bug
  const jitter = await page.evaluate((s) => window.__gesture(s), steps(20, (t) => {
    const ang = 0.12 * t; // ~7° total — below the 12° latch
    const r = 120;
    return [500 - r * Math.cos(ang), 400 - r * Math.sin(ang), 500 + r * Math.cos(ang), 400 + r * Math.sin(ang)];
  }));
  check('small twist stays level (no accidental roll)', jitter.rotDeg < 2.5, `${jitter.rotDeg.toFixed(1)}°`);

  // ---- deliberate twist (~40°): rolls
  const twist = await page.evaluate((s) => window.__gesture(s), steps(30, (t) => {
    const ang = 0.7 * t;
    const r = 120;
    return [500 - r * Math.cos(ang), 400 - r * Math.sin(ang), 500 + r * Math.cos(ang), 400 + r * Math.sin(ang)];
  }));
  check('deliberate twist rolls the camera', twist.rotDeg > 15, `${twist.rotDeg.toFixed(1)}°`);

  // ---- grab-the-world: touch drag and mouse drag must orbit OPPOSITE ways
  const yawSign = await page.evaluate(() => {
    const el = document.querySelector('.viewport-canvas');
    const rig = window.__sculptpad.editor.rig;
    const yawOf = () => {
      const q = rig.quat;
      return Math.atan2(2 * (q.w * q.y + q.x * q.z), 1 - 2 * (q.y * q.y + q.z * q.z));
    };
    const fire = (type, id, ptype, x, y, buttons = 0) =>
      el.dispatchEvent(new PointerEvent(type, { pointerId: id, pointerType: ptype, clientX: x, clientY: y, buttons, bubbles: true }));
    const y0 = yawOf();
    fire('pointerdown', 200, 'touch', 400, 400);
    fire('pointerdown', 201, 'touch', 520, 400);
    for (let i = 1; i <= 20; i++) {
      fire('pointermove', 200, 'touch', 400 + i * 8, 400);
      fire('pointermove', 201, 'touch', 520 + i * 8, 400);
    }
    fire('pointerup', 200, 'touch', 560, 400);
    fire('pointerup', 201, 'touch', 680, 400);
    const touchDelta = yawOf() - y0;
    const y1 = yawOf();
    fire('pointerdown', 300, 'mouse', 500, 400, 2);
    for (let i = 1; i <= 20; i++) fire('pointermove', 300, 'mouse', 500 + i * 8, 400, 2);
    fire('pointerup', 300, 'mouse', 660, 400, 0);
    const mouseDelta = yawOf() - y1;
    return { touchDelta, mouseDelta };
  });
  check(
    'touch orbit is grab-the-world (opposite of mouse)',
    yawSign.touchDelta * yawSign.mouseDelta < 0 && Math.abs(yawSign.touchDelta) > 0.02,
    `touch ${yawSign.touchDelta.toFixed(3)} vs mouse ${yawSign.mouseDelta.toFixed(3)}`
  );
} finally {
  await browser.close();
  try {
    process.kill(-server.pid, 'SIGTERM');
  } catch {
    server.kill();
  }
}

if (failures) {
  console.error(`\n${failures} gesture check(s) failed`);
  process.exit(1);
}
console.log('\nAll gesture checks passed');
process.exit(0);
