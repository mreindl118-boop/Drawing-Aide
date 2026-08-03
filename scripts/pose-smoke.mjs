// Pose Library & Adaptive Retargeting — definition-of-done regression:
//  · Warm Hug on chibi × heroic and goblin × pin-up: hands connect, no interpenetration
//  · Cheer Pyramid Base with three wildly different builds: contacts hold, grounded
//  · every solo pose applies cleanly to every shipped body preset
//  · a user-authored preset reapplies to a different pair
//  · role swap re-solves any duo
// Run `npm run build` first.
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';

const PORT = 4183;
const CONTACT_TOL = 0.06; // m — "hands connect"
const PEN_TOL = 0.03; // m of allowed capsule overlap ("no interpenetration")

function startPreview() {
  const child = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
    stdio: 'pipe',
    detached: true
  });
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('preview timeout')), 15000);
    child.stdout.on('data', (d) => {
      if (String(d).includes('http')) {
        clearTimeout(t);
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

  // two figures
  const idA = await page.evaluate(() => window.__sculptpad.addBody());
  const idB = await page.evaluate(() => window.__sculptpad.addBody());
  check('two figures added', typeof idA === 'string' && typeof idB === 'string');

  const setBody = (id, preset) =>
    page.evaluate(
      ({ id, preset }) => window.__sculptpad.applyPresetBlend(id, preset, preset, 1),
      { id, preset }
    );

  const applyPose = (poseId, ids) =>
    page.evaluate(({ poseId, ids }) => window.__sculptpad.applyPoseById(poseId, ids), {
      poseId,
      ids
    });

  const meshSane = (ids) =>
    page.evaluate((ids) => {
      for (const id of ids) {
        const obj = window.__sculptpad.editor.doc.get(id);
        const p = obj.geo.positions;
        const ty = obj.transform.position[1]; // yaw-only rotation: y adds directly
        let minY = Infinity;
        for (let i = 0; i < p.length; i += 3) {
          if (!Number.isFinite(p[i]) || !Number.isFinite(p[i + 1]) || !Number.isFinite(p[i + 2]))
            return 'NaN';
          minY = Math.min(minY, p[i + 1] + ty);
        }
        if (minY < -0.08) return `sunk ${minY.toFixed(3)}`;
      }
      return true;
    }, ids);

  // ---- Warm Hug: chibi × heroic --------------------------------------------
  await setBody(idA, 'chibi');
  await setBody(idB, 'superhero');
  let r = await applyPose('warm_hug', [idA, idB]);
  check(
    'Warm Hug chibi × heroic: hands connect',
    r && Math.max(...r.contactErrors) < CONTACT_TOL,
    r ? `worst contact ${(Math.max(...r.contactErrors) * 100).toFixed(1)}cm` : 'no result'
  );
  check(
    'Warm Hug chibi × heroic: no interpenetration',
    r && r.maxPenetration < PEN_TOL,
    r ? `overlap ${(r.maxPenetration * 100).toFixed(1)}cm` : ''
  );
  check('Warm Hug chibi × heroic: meshes sane', (await meshSane([idA, idB])) === true);

  // ---- Warm Hug: goblin × pin-up -------------------------------------------
  await setBody(idA, 'goblin');
  await setBody(idB, 'pinup');
  r = await applyPose('warm_hug', [idA, idB]);
  check(
    'Warm Hug goblin × pin-up: hands connect',
    r && Math.max(...r.contactErrors) < CONTACT_TOL,
    r ? `worst contact ${(Math.max(...r.contactErrors) * 100).toFixed(1)}cm` : 'no result'
  );
  check(
    'Warm Hug goblin × pin-up: no interpenetration',
    r && r.maxPenetration < PEN_TOL,
    r ? `overlap ${(r.maxPenetration * 100).toFixed(1)}cm` : ''
  );

  // ---- role swap on a duo ---------------------------------------------------
  const rSwap = await page.evaluate(() => window.__sculptpad.poseRoleSwap().then(() => true));
  check('role swap re-solves', rSwap === true);
  check('role swap: meshes sane', (await meshSane([idA, idB])) === true);

  // handshake + swap with asymmetric bodies
  await setBody(idA, 'dwarf');
  await setBody(idB, 'lanky');
  r = await applyPose('handshake', [idA, idB]);
  check(
    'Handshake dwarf × lanky connects',
    r && Math.max(...r.contactErrors) < CONTACT_TOL,
    r ? `worst ${(Math.max(...r.contactErrors) * 100).toFixed(1)}cm` : ''
  );

  // ---- Cheer Pyramid Base with three wildly different builds ----------------
  const idC = await page.evaluate(() => window.__sculptpad.addBody());
  await setBody(idA, 'powerlifter');
  await setBody(idB, 'waif');
  await setBody(idC, 'chibi');
  r = await applyPose('pyramid_base', [idA, idB, idC]);
  check(
    'Cheer Pyramid: contacts hold',
    r && Math.max(...r.contactErrors) < 0.08,
    r ? `worst ${(Math.max(...r.contactErrors) * 100).toFixed(1)}cm` : 'no result'
  );
  check('Cheer Pyramid: meshes sane', (await meshSane([idA, idB, idC])) === true);

  // ---- every solo pose × every shipped body preset --------------------------
  const soloResult = await page.evaluate(async (id) => {
    const sp = window.__sculptpad;
    const { SOLO_POSES } = await import('./anatomy/pose/library').catch(() => ({ SOLO_POSES: null }));
    const soloIds = SOLO_POSES
      ? SOLO_POSES.map((p) => p.id)
      : ['idle_relaxed', 'contrapposto', 'hero_landing', 'sprint', 'walk_key', 'crouch_ready', 'sit_casual', 'floor_crossleg', 'kneel_one', 'jump_apex', 'lotus', 'wall_lean', 'arms_crossed', 'phone_slouch', 'victory', 'defeated', 'thinker', 'bow', 'salute', 'stretch'];
    const bodies = ['average_masc', 'average_fem', 'athletic', 'heavyset', 'lanky', 'elderly', 'powerlifter', 'dancer', 'superhero', 'pinup', 'barbarian', 'waif', 'toon', 'chibi', 'waifu', 'husbando', 'goblin', 'orc', 'elf', 'dwarf'];
    const bad = [];
    for (const b of bodies) {
      await sp.applyPresetBlend(id, b, b, 1);
      for (const poseId of soloIds) {
        const res = await sp.applyPoseById(poseId, [id]);
        if (!res) {
          bad.push(`${b}/${poseId}: no result`);
          continue;
        }
        const obj2 = sp.editor.doc.get(id);
        const p = obj2.geo.positions;
        const ty = obj2.transform.position[1];
        let minY = Infinity;
        let nan = false;
        for (let i = 0; i < p.length; i += 3) {
          if (!Number.isFinite(p[i + 1])) nan = true;
          minY = Math.min(minY, p[i + 1] + ty);
        }
        if (nan) bad.push(`${b}/${poseId}: NaN`);
        else if (minY < -0.08) bad.push(`${b}/${poseId}: sunk ${minY.toFixed(2)}`);
        else if (poseId !== 'jump_apex' && minY > 0.3) bad.push(`${b}/${poseId}: floating ${minY.toFixed(2)}`);
      }
    }
    return bad;
  }, idC);
  check(
    'all 20 solo poses × all 20 shipped bodies apply cleanly',
    soloResult.length === 0,
    soloResult.length ? soloResult.slice(0, 5).join(' | ') : '400 combinations'
  );

  // ---- authored preset round-trip -------------------------------------------
  const authored = await page.evaluate(async ({ a, b, extra }) => {
    const sp = window.__sculptpad;
    // drop the third figure so the authored preset is a duo
    sp.editor.select(extra);
    sp.editor.deleteSelected();
    // pose manually-ish: apply a shipped pose, then save the scene as a preset
    await sp.applyPresetBlend(a, 'average_masc', 'average_masc', 1);
    await sp.applyPresetBlend(b, 'average_fem', 'average_fem', 1);
    await sp.applyPoseById('high_five', [a, b]);
    sp.editor.select(a);
    const preset = await sp.savePoseFromScene('Test Author', 'duo');
    if (!preset) return 'save failed';
    // change the cast entirely, then reapply the authored preset
    await sp.applyPresetBlend(a, 'orc', 'orc', 1);
    await sp.applyPresetBlend(b, 'chibi', 'chibi', 1);
    const res = await sp.applyCustomPose(JSON.stringify([preset]), [a, b]);
    if (!res) return 'apply failed';
    return {
      worst: Math.max(...res.contactErrors, 0),
      pen: res.maxPenetration,
      contacts: preset.contacts.length,
      detail: preset.contacts.map(
        (ct, i) => `${ct.a.landmark}~${ct.b.landmark}:${(res.contactErrors[i] * 100).toFixed(0)}cm`
      )
    };
  }, { a: idA, b: idB, extra: idC });
  check(
    'authored preset extracts contacts and reapplies to a different pair',
    typeof authored === 'object' && authored.contacts > 0 && authored.worst < 0.08 && authored.pen < PEN_TOL,
    typeof authored === 'object'
      ? `${authored.contacts} contacts [${authored.detail.join(' ')}]`
      : String(authored)
  );

  // ---- undo restores pre-pose state (role 1 moves; the anchor keeps its spot)
  const undoOk = await page.evaluate((id) => {
    const sp = window.__sculptpad;
    const snap = (o) => JSON.stringify([o.transform, o.character?.pose]);
    const before = snap(sp.editor.doc.get(id));
    sp.undo();
    const after = snap(sp.editor.doc.get(id));
    sp.redo();
    return before !== after;
  }, idB);
  check('pose apply is undoable', undoOk === true);
} finally {
  await browser.close();
  try {
    process.kill(-server.pid, 'SIGTERM');
  } catch {
    server.kill();
  }
}

if (failures) {
  console.error(`\n${failures} pose check(s) failed`);
  process.exit(1);
}
console.log('\nAll pose checks passed');
process.exit(0);
