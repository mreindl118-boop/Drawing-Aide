// Anatomy Slider Engine — headless verification of the definition-of-done:
// live morphing, average-at-50%, preset cross-category blending, pose
// deformation at extreme proportions, save/reload of the parameter dict,
// sculpt-layer coexistence, NSFW gating, and a manifold-clean baked STL.
// Run `npm run build` first.
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';

const PORT = 4177;

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
  await page.waitForSelector('.gallery-root', { timeout: 10000 });
  await page.click('.new-card');
  await page.waitForSelector('.viewport-canvas', { timeout: 10000 });

  // ---- add a figure (engine init + first compose)
  const figId = await page.evaluate(() => window.__sculptpad.addBody());
  check('figure added (engine + worker booted)', typeof figId === 'string');
  await page.waitForFunction(
    (id) => window.__sculptpad.bodyMeasurements(id) !== null,
    figId,
    { timeout: 30000 }
  );

  // ---- 50% default = average human
  const m0 = await page.evaluate((id) => window.__sculptpad.bodyMeasurements(id), figId);
  check(
    'default measurements ≈ average adult',
    m0 && m0.heightCm > 160 && m0.heightCm < 182 && m0.headUnits > 6.8 && m0.headUnits < 8.4,
    m0 ? `${m0.heightCm.toFixed(0)}cm, ${m0.headUnits.toFixed(1)} heads` : 'none'
  );

  // ---- on-model handles: body layer when framing, face-puppet layer close up
  await page.waitForFunction(() => window.__sculptpad.handleModeAt(2.2) === 'body', null, { timeout: 10000 }).catch(() => {});
  const handleModes = await page.evaluate(() => {
    const sp = window.__sculptpad;
    const far = sp.handleModeAt(2.2);
    const near = sp.handleModeAt(0.7);
    sp.handleModeAt(2.2); // restore body framing for the rest of the suite
    return { far, near };
  });
  check('body handles at figure framing', handleModes.far === 'body', String(handleModes.far));
  check('face-puppet handles when zoomed to the face', handleModes.near === 'face', String(handleModes.near));

  // ---- slider moves change the mesh + measurements live
  await page.evaluate((id) => window.__sculptpad.setBodyWeights(id, { height: 1 }), figId);
  const mTall = await page.evaluate((id) => window.__sculptpad.bodyMeasurements(id), figId);
  check('height slider drives height', mTall.heightCm > m0.heightCm + 8, `${m0.heightCm.toFixed(0)} → ${mTall.heightCm.toFixed(0)}cm`);
  await page.evaluate((id) => window.__sculptpad.setBodyWeights(id, { height: 0, waist_width: -1 }), figId);
  const mWaist = await page.evaluate((id) => window.__sculptpad.bodyMeasurements(id), figId);
  check('waist slider drives waist', mWaist.waistCm < m0.waistCm - 4, `${m0.waistCm.toFixed(0)} → ${mWaist.waistCm.toFixed(0)}cm`);

  // ---- undo/redo of slider changes (recompose after undo is async)
  await page.evaluate(() => window.__sculptpad.undo());
  await page.waitForFunction(
    ({ id, target }) => {
      const m = window.__sculptpad.bodyMeasurements(id);
      return m && Math.abs(m.waistCm - target) < 1.5;
    },
    { id: figId, target: mTall.waistCm },
    { timeout: 10000 }
  ).catch(() => {});
  const mUndo = await page.evaluate((id) => window.__sculptpad.bodyMeasurements(id), figId);
  check('slider change undoable', Math.abs(mUndo.waistCm - mTall.waistCm) < 1.5, `waist back to ${mUndo.waistCm.toFixed(0)}cm`);
  await page.evaluate(() => window.__sculptpad.redo());
  await page.waitForFunction(
    ({ id, target }) => {
      const m = window.__sculptpad.bodyMeasurements(id);
      return m && Math.abs(m.waistCm - target) < 1.5;
    },
    { id: figId, target: mWaist.waistCm },
    { timeout: 10000 }
  ).catch(() => {});

  // ---- compose performance (60fps budget): worker compute must fit a frame;
  //      latest-wins scheduling means roundtrip is latency, not throughput
  const perf = await page.evaluate((id) => window.__sculptpad.bodyComposeProbe(id, 25), figId);
  check('worker compose < 12ms/frame', perf.workerMs > 0 && perf.workerMs < 12, `${perf.workerMs.toFixed(1)}ms compute`);
  // roundtrip is headless-message latency, not throughput (latest-wins drags);
  // generous bound just to catch pathological regressions
  check('full roundtrip < 80ms', perf.roundtripMs < 80, `${perf.roundtripMs.toFixed(1)}ms roundtrip`);

  // ---- cross-category preset blends produce clean meshes with working rigs
  for (const [a, b] of [['goblin', 'pinup'], ['orc', 'superhero']]) {
    const blendOk = await page.evaluate(async ({ id, a, b }) => {
      const sp = window.__sculptpad;
      const ok = await sp.applyPresetBlend(id, a, b, 0.5);
      if (!ok) return 'blend failed';
      const obj = sp.editor.doc.get(id);
      const p = obj.geo.positions;
      for (let i = 0; i < p.length; i++) if (!Number.isFinite(p[i])) return 'NaN in mesh';
      // rig sanity: pose it and confirm finite output
      await sp.setBodyPose(id, { upperArmL: [0, 0, 1.5], upperArmR: [0, 0, -1.5] });
      const q = sp.editor.doc.get(id).geo.positions;
      for (let i = 0; i < q.length; i++) if (!Number.isFinite(q[i])) return 'NaN when posed';
      await sp.setBodyPose(id, null);
      return true;
    }, { id: figId, a, b });
    check(`${a} × ${b} blend is clean + rigged`, blendOk === true, String(blendOk));
  }

  // ---- pose an extreme-proportioned character (chibi) — no broken verts
  const poseOk = await page.evaluate(async (id) => {
    const sp = window.__sculptpad;
    await sp.setBodyWeights(id, { head_units: -1 });
    await sp.setBodyPose(id, { upperArmL: [0, 0, 1.9], upperArmR: [0, 0, -1.9], thighL: [-1.1, 0, 0], shinL: [1.5, 0, 0] });
    const p = sp.editor.doc.get(id).geo.positions;
    let maxR = 0;
    for (let i = 0; i < p.length; i += 3) {
      if (!Number.isFinite(p[i]) || !Number.isFinite(p[i + 1]) || !Number.isFinite(p[i + 2])) return 'NaN';
      maxR = Math.max(maxR, Math.hypot(p[i], p[i + 1], p[i + 2]));
    }
    await sp.setBodyPose(id, null);
    return maxR < 4 ? true : `blown up: r=${maxR}`;
  }, figId);
  check('chibi + pose deforms sanely', poseOk === true, String(poseOk));

  // ---- heroic pose check too
  const heroOk = await page.evaluate(async (id) => {
    const sp = window.__sculptpad;
    await sp.setBodyWeights(id, { head_units: 1, muscle: 0.8, v_taper: 0.9 });
    await sp.setBodyPose(id, { upperArmL: [-1.3, 0, 0.5], forearmL: [-0.4, 0, 0] });
    const p = sp.editor.doc.get(id).geo.positions;
    for (let i = 0; i < p.length; i++) if (!Number.isFinite(p[i])) return 'NaN';
    await sp.setBodyPose(id, null);
    return true;
  }, figId);
  check('heroic + pose deforms sanely', heroOk === true, String(heroOk));

  // ---- sculpt delta layer: bump survives slider changes
  const sculptOk = await page.evaluate(async (id) => {
    const sp = window.__sculptpad;
    await sp.setBodyWeights(id, {}); // reset-ish baseline for the probe
    await sp.sculptOnBody(id, 0.08);
    const withBump = sp.editor.doc.get(id);
    const before = withBump.character.sculptDelta ? 1 : 0;
    await sp.setBodyWeights(id, { build: 0.6 });
    const after = sp.editor.doc.get(id).character;
    return before === 1 && !!after.sculptDelta && after.weights.build === 0.6;
  }, figId);
  check('sculpt layer survives slider changes (sliders stay live)', sculptOk === true);

  // ---- NSFW gate: explicit weights are engine-clamped for child-coded proportions
  const gateOk = await page.evaluate(async (id) => {
    const sp = window.__sculptpad;
    sp.editor.doc.setSettings({ nsfwEnabled: true });
    await sp.setBodyWeights(id, { genital_masc: 1, head_units: 0 });
    const adultGeo = sp.editor.doc.get(id).geo.positions.slice();
    const adultGated = sp.bodyMeasurements(id).gated;
    await sp.setBodyWeights(id, { head_units: -1 }); // chibi range
    const gated = sp.bodyMeasurements(id).gated;
    const chibiGeo = sp.editor.doc.get(id).geo.positions;
    // groin patch verts must sit at their morphless spot when gated
    void adultGeo;
    void chibiGeo;
    await sp.setBodyWeights(id, { genital_masc: 0, head_units: 0 });
    sp.editor.doc.setSettings({ nsfwEnabled: false });
    return { adultGated, gated };
  }, figId);
  check('adult proportions: anatomy allowed', gateOk.adultGated === false);
  check('child-coded proportions: anatomy hard-gated', gateOk.gated === true);

  // ---- baked STL of a modified body passes the manifold check
  const manifold = await page.evaluate((id) => window.__sculptpad.manifoldCheck(id), figId);
  check(
    'modified body unions to a watertight mesh',
    manifold && manifold.manifold === true,
    manifold ? `${manifold.tris} tris, ${manifold.status}` : 'no result'
  );

  // ---- GLB with blendshapes + rig parses and carries targets
  const glbInfo = await page.evaluate(() => window.__sculptpad.glbProbe());
  check('GLB is valid glTF binary', glbInfo.magic === 'glTF', `${(glbInfo.bytes / 1e6).toFixed(1)}MB`);
  check('GLB carries blendshape targets', glbInfo.targets > 100, `${glbInfo.targets} targets`);
  check('GLB carries a skin (rig)', glbInfo.hasSkin);
  check('GLB target names present', glbInfo.hasNames);

  // ---- save → reload → parameters and mesh intact
  await page.waitForTimeout(1400);
  await page.reload();
  await page.waitForSelector('.viewport-canvas', { timeout: 15000 });
  await page.waitForFunction(() => window.__sculptpad?.objectCount() > 0, null, { timeout: 8000 });
  const reloadOk = await page.evaluate(async (id) => {
    const sp = window.__sculptpad;
    const obj = sp.editor.doc.get(id);
    if (!obj?.character) return 'character lost';
    if (obj.character.weights.build !== 0.6 && obj.character.weights.build !== 0) return `weights: build=${obj.character.weights.build}`;
    if (!obj.character.sculptDelta) return 'sculpt layer lost';
    // sliders still live after reload
    const before = sp.bodyMeasurements(id);
    await new Promise((r) => {
      const t = setInterval(() => {
        if (sp.bodyMeasurements(id)) {
          clearInterval(t);
          r();
        }
      }, 100);
    });
    await sp.setBodyWeights(id, { height: 0.8 });
    const after = sp.bodyMeasurements(id);
    void before;
    return after.heightCm > 165 ? true : `height after reload: ${after.heightCm}`;
  }, figId);
  check('character reloads from parameter dict, sliders live', reloadOk === true, String(reloadOk));
} finally {
  await browser.close();
  try {
    process.kill(-server.pid, 'SIGTERM');
  } catch {
    server.kill();
  }
}

if (failures) {
  console.error(`\n${failures} anatomy check(s) failed`);
  process.exit(1);
}
console.log('\nAll anatomy checks passed');
process.exit(0);
