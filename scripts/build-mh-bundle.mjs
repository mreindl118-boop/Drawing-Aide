// Build the MakeHuman (CC0) figure bundle: body mesh + skeleton + skinning +
// landmarks + morph deltas, converted from the makehumancommunity/makehuman
// data files into a compact binary the anatomy worker loads at init.
//
//   node scripts/build-mh-bundle.mjs <path-to-mh-repo>/makehuman/data
//
// All MakeHuman assets used here (base.obj, targets, rig) are CC0 1.0 —
// see the headers in the source files. Output:
//   src/anatomy/mh/bundle.bin   packed binary sections
//   src/anatomy/mh/bundle.json  metadata + section directory
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const dataDir = process.argv[2];
if (!dataDir || !existsSync(join(dataDir, '3dobjs/base.obj'))) {
  console.error('usage: node scripts/build-mh-bundle.mjs <mh-repo>/makehuman/data');
  process.exit(1);
}

const SCALE = 0.1; // MakeHuman decimeters → meters

// ------------------------------------------------------------------ OBJ parse
const objText = readFileSync(join(dataDir, '3dobjs/base.obj'), 'utf8');
const rawVerts = [];
const rawUVs = [];
const groups = new Map(); // name → face list [[vi,ti]...]
let currentGroup = 'default';
for (const line of objText.split('\n')) {
  if (line.startsWith('v ')) {
    const [, x, y, z] = line.split(/\s+/);
    rawVerts.push([+x * SCALE, +y * SCALE, +z * SCALE]);
  } else if (line.startsWith('vt ')) {
    const [, u, v] = line.split(/\s+/);
    rawUVs.push([+u, +v]);
  } else if (line.startsWith('g ')) {
    currentGroup = line.slice(2).trim();
  } else if (line.startsWith('f ')) {
    const corners = line.slice(2).trim().split(/\s+/).map((c) => {
      const [vi, ti] = c.split('/');
      return [(+vi) - 1, ti ? (+ti) - 1 : -1];
    });
    let list = groups.get(currentGroup);
    if (!list) groups.set(currentGroup, (list = []));
    list.push(corners);
  }
}
console.log(`obj: ${rawVerts.length} verts, groups: ${groups.size}`);

// mesh parts we keep: the body plus the fitted eyeball helpers (morph
// targets track their verts, so eyes follow every face slider)
// vertex layout: [eye helper anchors (no faces)] [body] [caps] [eye spheres].
// Helper-eye verts are morph-target-covered and drive the dense synthetic
// eyeball spheres at runtime (rigid follow); body goes last among the raw
// parts so its derived cap verts stay contiguous with its range.
const KEEP_PARTS = [
  ['helper-l-eye', 'anchorEyeL', false],
  ['helper-r-eye', 'anchorEyeR', false],
  ['body', 'body', true]
];
const partIds = []; // [{name, ids:[rawVertIds], faces|null}]
const remap = new Map();
let cursor = 0;
for (const [group, name, renderFaces] of KEEP_PARTS) {
  const faces = groups.get(group);
  const vset = new Set();
  for (const f of faces) for (const [vi] of f) vset.add(vi);
  const ids = [...vset].sort((a, b) => a - b);
  for (const id of ids) remap.set(id, cursor++);
  partIds.push({ name, ids, faces: renderFaces ? faces : null });
}
const bodyCount = cursor; // anchors + body (all morph-target-covered)
console.log(`kept verts: ${bodyCount} (${partIds.map((p) => `${p.name}:${p.ids.length}`).join(', ')})`);

// orientation: left side must be +x (our convention). MH puts l-shoulder at…
const jointCenter = (name) => {
  const faces = groups.get(name);
  if (!faces) return null;
  const vs = new Set();
  for (const f of faces) for (const [vi] of f) vs.add(vi);
  const c = [0, 0, 0];
  for (const vi of vs) for (let k = 0; k < 3; k++) c[k] += rawVerts[vi][k];
  for (let k = 0; k < 3; k++) c[k] /= vs.size;
  return { center: c, verts: [...vs] };
};
const lShoulderProbe = jointCenter('joint-l-shoulder');
const FLIPX = lShoulderProbe.center[0] < 0;
console.log(`l-shoulder x=${lShoulderProbe.center[0].toFixed(3)} → flipX=${FLIPX}`);
if (FLIPX) for (const v of rawVerts) v[0] = -v[0];

// positions/uv for kept verts (uv: first-seen per vertex)
const basePosRaw = new Float32Array(bodyCount * 3);
for (const p of partIds) {
  for (const raw of p.ids) {
    const i = remap.get(raw);
    const [x, y, z] = rawVerts[raw];
    basePosRaw[i * 3] = x;
    basePosRaw[i * 3 + 1] = y;
    basePosRaw[i * 3 + 2] = z;
  }
}
const uvSeenSize = bodyCount;
const uvsBody = new Float32Array(uvSeenSize * 2);
const uvSeen = new Uint8Array(uvSeenSize);
const tris = [];
const partRanges = [];
for (const p of partIds) {
  if (!p.faces) continue; // anchor-only parts render nothing
  const iStart = tris.length;
  for (const f of p.faces) {
    const ids = f.map(([vi, ti]) => {
      const b = remap.get(vi);
      if (!uvSeen[b] && ti >= 0) {
        uvSeen[b] = 1;
        uvsBody[b * 2] = rawUVs[ti][0];
        uvsBody[b * 2 + 1] = rawUVs[ti][1];
      }
      return b;
    });
    // fan-triangulate; flip winding if we mirrored x
    for (let k = 1; k + 1 < ids.length; k++) {
      if (FLIPX) tris.push(ids[0], ids[k + 1], ids[k]);
      else tris.push(ids[0], ids[k], ids[k + 1]);
    }
  }
  partRanges.push({
    name: p.name,
    vStart: remap.get(p.ids[0]),
    vCount: p.ids.length,
    iStart,
    iCount: tris.length - iStart
  });
}
console.log(`tris: ${tris.length / 3}`);

// ------------------------------------------------------- boundary loops → caps
// edges used once = boundary. Cap each loop with a centroid fan so the mesh
// is watertight; cap verts are DERIVED (ring average) — the worker recomputes
// them after morphs, so they follow eye sockets etc. automatically.
const edgeUse = new Map();
for (let t = 0; t < tris.length; t += 3) {
  for (let e = 0; e < 3; e++) {
    const a = tris[t + e];
    const b = tris[t + ((e + 1) % 3)];
    const key = a < b ? a * 1e6 + b : b * 1e6 + a;
    edgeUse.set(key, (edgeUse.get(key) ?? 0) + 1);
  }
}
const boundaryNext = new Map();
for (let t = 0; t < tris.length; t += 3) {
  for (let e = 0; e < 3; e++) {
    const a = tris[t + e];
    const b = tris[t + ((e + 1) % 3)];
    const key = a < b ? a * 1e6 + b : b * 1e6 + a;
    if (edgeUse.get(key) === 1) boundaryNext.set(a, b); // directed as wound
  }
}
const caps = []; // { ring: number[] }
const seen = new Set();
for (const start of boundaryNext.keys()) {
  if (seen.has(start)) continue;
  const ring = [start];
  seen.add(start);
  let cur = boundaryNext.get(start);
  while (cur !== undefined && cur !== start && !seen.has(cur)) {
    ring.push(cur);
    seen.add(cur);
    cur = boundaryNext.get(cur);
  }
  if (cur === start && ring.length >= 3) caps.push({ ring });
}
console.log(`boundary loops: ${caps.length} (sizes: ${caps.map((c) => c.ring.length).join(', ')})`);
// cap fan triangles reference cap verts appended after body verts
const capBase = bodyCount;
// each cap's fan tris attach to the part its ring lives in, so STL
// part-splitting keeps every part closed
const partOf = (v) => partRanges.findIndex((p) => v >= p.vStart && v < p.vStart + p.vCount);
const capsByPart = partRanges.map(() => []);
caps.forEach((cap, ci) => capsByPart[partOf(cap.ring[0])].push(ci));
const finalIndices = [];
for (let pi = 0; pi < partRanges.length; pi++) {
  const p = partRanges[pi];
  const newStart = finalIndices.length;
  for (let k = p.iStart; k < p.iStart + p.iCount; k++) finalIndices.push(tris[k]);
  for (const ci of capsByPart[pi]) {
    const cv = capBase + ci;
    const r = caps[ci].ring;
    for (let k = 0; k < r.length; k++) {
      // boundary is wound like the surface; fan keeps outward orientation
      finalIndices.push(cv, r[(k + 1) % r.length], r[k]);
    }
  }
  p.iStart = newStart;
  p.iCount = finalIndices.length - newStart;
}

// ------------------------------------------------- synthetic eyeball spheres
// dense spheres (the 72-vert helper is too coarse to paint an iris on) that
// rigidly follow their anchor helper verts at runtime
const SEG = 18, RINGS = 13;
const SPHERE_VERTS = SEG * (RINGS - 1) + 2;
const sphereBase = bodyCount + caps.length;
let vertCount = sphereBase + 2 * SPHERE_VERTS;
const eyesMeta = [];
['anchorEyeL', 'anchorEyeR'].forEach((anchorName, ei) => {
  const anchor = partIds.find((p) => p.name === anchorName);
  const vStart = sphereBase + ei * SPHERE_VERTS;
  const iStart = finalIndices.length;
  // sphere topology: pole, rings, pole (positions filled after grounding)
  const ringVert = (r, s) => (r === 0 ? vStart : r === RINGS ? vStart + SPHERE_VERTS - 1 : vStart + 1 + (r - 1) * SEG + (s % SEG));
  for (let s = 0; s < SEG; s++) finalIndices.push(ringVert(0, 0), ringVert(1, s), ringVert(1, s + 1));
  for (let r = 1; r < RINGS - 1; r++) {
    for (let s = 0; s < SEG; s++) {
      const a = ringVert(r, s), b = ringVert(r, s + 1), c = ringVert(r + 1, s), d = ringVert(r + 1, s + 1);
      finalIndices.push(a, c, b, b, c, d);
    }
  }
  for (let s = 0; s < SEG; s++) finalIndices.push(ringVert(RINGS, 0), ringVert(RINGS - 1, s + 1), ringVert(RINGS - 1, s));
  partRanges.push({ name: ei === 0 ? 'eyeL' : 'eyeR', vStart, vCount: SPHERE_VERTS, iStart, iCount: finalIndices.length - iStart });
  eyesMeta.push({
    anchorStart: remap.get(anchor.ids[0]),
    anchorCount: anchor.ids.length,
    sphereStart: vStart,
    sphereCount: SPHERE_VERTS
  });
});

// ------------------------------------------------------------------ skeleton
const OUR_BONES = ['pelvis', 'spine', 'chest', 'neck', 'head',
  'upperArmL', 'forearmL', 'handL', 'upperArmR', 'forearmR', 'handR',
  'thighL', 'shinL', 'footL', 'thighR', 'shinR', 'footR'];
const mhSide = (s) => (FLIPX ? (s === 'l' ? 'r' : 'l') : s);
const J = (name) => jointCenter(name);
// spine cubes ordered by height
const spines = ['joint-spine-1', 'joint-spine-2', 'joint-spine-3', 'joint-spine-4']
  .map((n) => ({ n, j: J(n) })).filter((s) => s.j).sort((a, b) => a.j.center[1] - b.j.center[1]);
const JOINT_SOURCE = {
  pelvis: 'joint-pelvis',
  spine: spines[1]?.n ?? 'joint-spine-2',
  chest: spines[spines.length - 1]?.n ?? 'joint-spine-4',
  neck: 'joint-neck',
  head: 'joint-head',
  upperArmL: `joint-${mhSide('l')}-shoulder`, forearmL: `joint-${mhSide('l')}-elbow`, handL: `joint-${mhSide('l')}-hand`,
  upperArmR: `joint-${mhSide('r')}-shoulder`, forearmR: `joint-${mhSide('r')}-elbow`, handR: `joint-${mhSide('r')}-hand`,
  thighL: `joint-${mhSide('l')}-upper-leg`, shinL: `joint-${mhSide('l')}-knee`, footL: `joint-${mhSide('l')}-ankle`,
  thighR: `joint-${mhSide('r')}-upper-leg`, shinR: `joint-${mhSide('r')}-knee`, footR: `joint-${mhSide('r')}-ankle`
};
const jointInfo = OUR_BONES.map((b) => {
  const src = J(JOINT_SOURCE[b]);
  if (!src) throw new Error(`missing joint cube for ${b}: ${JOINT_SOURCE[b]}`);
  return src;
});
const baseJoints = new Float32Array(OUR_BONES.length * 3);
jointInfo.forEach((ji, i) => baseJoints.set(ji.center, i * 3));
console.log('joints ok:', OUR_BONES.map((b, i) => `${b}@${baseJoints[i * 3 + 1].toFixed(2)}`).slice(0, 6).join(' '));

// ------------------------------------------------------------------ skinning
// collapse the 139-weighted-bone default rig to our 17 bones:每 mh bone maps
// to the nearest our-joint (with overrides), weights accumulate, top-2 kept.
const skel = JSON.parse(readFileSync(join(dataDir, 'rigs/default.mhskel'), 'utf8'));
const mhw = JSON.parse(readFileSync(join(dataDir, 'rigs/default_weights.mhw'), 'utf8'));
const jointVertsOf = (jointName) => skel.joints[jointName] ?? null;
const bonePos = new Map(); // mh bone → head position
for (const [name, b] of Object.entries(skel.bones)) {
  const verts = jointVertsOf(b.head);
  if (!verts?.length) continue;
  const c = [0, 0, 0];
  for (const vi of verts) {
    const v = rawVerts[vi];
    c[0] += v[0]; c[1] += v[1]; c[2] += v[2];
  }
  bonePos.set(name, c.map((x) => x / verts.length));
}
const OVERRIDES = [
  [/^clavicle/, (side) => (side === 'L' ? 'chest' : 'chest')],
  [/^breast/, () => 'chest'],
  [/^eye\.|^head|^jaw|^tongue|^orbicularis|^levator|^risorius|^oculi|^special/, () => 'head'],
  [/^toe/, (side) => `foot${side}`],
  [/^(finger|thumb|wrist|metacarpal)/, (side) => `hand${side}`]
];
// bonePos comes from rawVerts, which are already meter-scaled and x-flipped —
// map each MH bone to the nearest our-joint, same-side only, with overrides
const mhToOur = new Map();
for (const [name] of Object.entries(skel.bones)) {
  const p = bonePos.get(name);
  const side = /\.L$/.test(name) ? (FLIPX ? 'R' : 'L') : /\.R$/.test(name) ? (FLIPX ? 'L' : 'R') : 'C';
  let mapped = null;
  for (const [re, fn] of OVERRIDES) {
    if (re.test(name)) { mapped = fn(side); break; }
  }
  if (!mapped && p) {
    let best = 0, bestD = Infinity;
    for (let i = 0; i < OUR_BONES.length; i++) {
      const ourX = baseJoints[i * 3];
      if (p[0] > 0.03 && ourX < -0.03) continue;
      if (p[0] < -0.03 && ourX > 0.03) continue;
      const d = (p[0] - ourX) ** 2 + (p[1] - baseJoints[i * 3 + 1]) ** 2 + (p[2] - baseJoints[i * 3 + 2]) ** 2;
      if (d < bestD) { bestD = d; best = i; }
    }
    mapped = OUR_BONES[best];
  }
  if (mapped) mhToOur.set(name, mapped);
}
const accum = Array.from({ length: bodyCount }, () => new Map());
for (const [mhBone, rows] of Object.entries(mhw.weights)) {
  const our = mhToOur.get(mhBone);
  if (!our) continue;
  const oi = OUR_BONES.indexOf(our);
  for (const [vi, w] of rows) {
    const b = remap.get(vi);
    if (b === undefined) continue;
    const m = accum[b];
    m.set(oi, (m.get(oi) ?? 0) + w);
  }
}
const skinIndex = new Uint16Array(vertCount * 2);
const skinWeight = new Float32Array(vertCount * 2);
let unweighted = 0;
for (let v = 0; v < bodyCount; v++) {
  const entries = [...accum[v].entries()].sort((a, b) => b[1] - a[1]);
  if (!entries.length) {
    unweighted++;
    // nearest joint fallback
    let best = 0, bestD = Infinity;
    for (let i = 0; i < OUR_BONES.length; i++) {
      const d = (basePosRaw[v * 3] - baseJoints[i * 3]) ** 2 + (basePosRaw[v * 3 + 1] - baseJoints[i * 3 + 1]) ** 2 + (basePosRaw[v * 3 + 2] - baseJoints[i * 3 + 2]) ** 2;
      if (d < bestD) { bestD = d; best = i; }
    }
    skinIndex[v * 2] = best;
    skinWeight[v * 2] = 1;
    continue;
  }
  const [b0, b1] = [entries[0], entries[1] ?? entries[0]];
  const sum = b0[1] + (entries[1] ? b1[1] : 0) || 1;
  skinIndex[v * 2] = b0[0];
  skinIndex[v * 2 + 1] = b1[0];
  skinWeight[v * 2] = entries[1] ? b0[1] / sum : 1;
  skinWeight[v * 2 + 1] = entries[1] ? b1[1] / sum : 0;
}
console.log(`skinning: ${unweighted} unweighted verts (fallback applied)`);

// cap verts skin like their ring average (copy first ring vert's bones)
caps.forEach((cap, ci) => {
  const v = capBase + ci;
  const src = cap.ring[0];
  skinIndex[v * 2] = skinIndex[src * 2];
  skinIndex[v * 2 + 1] = skinIndex[src * 2 + 1];
  skinWeight[v * 2] = skinWeight[src * 2];
  skinWeight[v * 2 + 1] = skinWeight[src * 2 + 1];
});
// eyeball sphere verts skin like their anchors (head bone)
for (const eye of eyesMeta) {
  const src = eye.anchorStart;
  for (let k = 0; k < eye.sphereCount; k++) {
    const v = eye.sphereStart + k;
    skinIndex[v * 2] = skinIndex[src * 2];
    skinIndex[v * 2 + 1] = skinIndex[src * 2 + 1];
    skinWeight[v * 2] = skinWeight[src * 2];
    skinWeight[v * 2 + 1] = skinWeight[src * 2 + 1];
  }
}

// ------------------------------------------------------------------- targets
function loadTarget(relPath) {
  const txt = readFileSync(join(dataDir, 'targets', relPath), 'utf8');
  const idx = [];
  const dxyz = [];
  for (const line of txt.split('\n')) {
    if (!line || line[0] === '#') continue;
    const parts = line.trim().split(/\s+/);
    if (parts.length < 4) continue;
    const vi = +parts[0];
    idx.push(vi);
    const sx = FLIPX ? -1 : 1;
    dxyz.push(+parts[1] * SCALE * sx, +parts[2] * SCALE, +parts[3] * SCALE);
  }
  return { idx, dxyz };
}
/** dense body-space delta (+ joint deltas via joint-cube helper verts) */
function denseDelta() {
  return { d: new Float32Array(bodyCount * 3), j: new Float32Array(OUR_BONES.length * 3) };
}
const jointVertToBone = new Map(); // raw vert id → [boneIdx, 1/cubeVertCount]
jointInfo.forEach((ji, bi) => {
  for (const vi of ji.verts) jointVertToBone.set(vi, [bi, 1 / ji.verts.length]);
});
function addTarget(acc, relPath, scale = 1) {
  const t = loadTarget(relPath);
  for (let k = 0; k < t.idx.length; k++) {
    const raw = t.idx[k];
    const b = remap.get(raw);
    if (b !== undefined) {
      acc.d[b * 3] += t.dxyz[k * 3] * scale;
      acc.d[b * 3 + 1] += t.dxyz[k * 3 + 1] * scale;
      acc.d[b * 3 + 2] += t.dxyz[k * 3 + 2] * scale;
    } else {
      const jb = jointVertToBone.get(raw);
      if (jb) {
        acc.j[jb[0] * 3] += t.dxyz[k * 3] * scale * jb[1];
        acc.j[jb[0] * 3 + 1] += t.dxyz[k * 3 + 1] * scale * jb[1];
        acc.j[jb[0] * 3 + 2] += t.dxyz[k * 3 + 2] * scale * jb[1];
      }
    }
  }
  return acc;
}

// --- neutral base: 50/50 gender at young/average, ethnicity = ⅓ each
const neutral = denseDelta();
for (const g of ['female', 'male']) {
  addTarget(neutral, `macrodetails/universal-${g}-young-averagemuscle-averageweight.target`, 0.5);
  for (const e of ['african', 'asian', 'caucasian']) {
    addTarget(neutral, `macrodetails/${e}-${g}-young.target`, 0.5 / 3);
  }
}
const basePos = new Float32Array(vertCount * 3);
for (let i = 0; i < bodyCount * 3; i++) basePos[i] = basePosRaw[i] + neutral.d[i];
for (let i = 0; i < baseJoints.length; i++) baseJoints[i] += neutral.j[i];
// ground the figure: heels at y=0
let minY = Infinity;
for (let v = 0; v < bodyCount; v++) minY = Math.min(minY, basePos[v * 3 + 1]);
for (let v = 0; v < bodyCount; v++) basePos[v * 3 + 1] -= minY;
for (let i = 1; i < baseJoints.length; i += 3) baseJoints[i] -= minY;
console.log(`grounded (minY was ${minY.toFixed(3)})`);

// seat the eyeball spheres from their (neutral, grounded) anchor helpers
for (const eye of eyesMeta) {
  let cx = 0, cy = 0, cz = 0;
  for (let k = 0; k < eye.anchorCount; k++) {
    const v = eye.anchorStart + k;
    cx += basePos[v * 3];
    cy += basePos[v * 3 + 1];
    cz += basePos[v * 3 + 2];
  }
  cx /= eye.anchorCount;
  cy /= eye.anchorCount;
  cz /= eye.anchorCount;
  let R = 0;
  for (let k = 0; k < eye.anchorCount; k++) {
    const v = eye.anchorStart + k;
    R += Math.hypot(basePos[v * 3] - cx, basePos[v * 3 + 1] - cy, basePos[v * 3 + 2] - cz);
  }
  R = (R / eye.anchorCount) * 0.96;
  // pole (+z, forward), rings, pole (−z)
  let vi = eye.sphereStart;
  basePos[vi * 3] = cx;
  basePos[vi * 3 + 1] = cy;
  basePos[vi * 3 + 2] = cz + R;
  vi++;
  for (let r = 1; r < RINGS; r++) {
    const phi = (Math.PI * r) / RINGS;
    for (let s = 0; s < SEG; s++) {
      const th = (2 * Math.PI * s) / SEG;
      basePos[vi * 3] = cx + R * Math.sin(phi) * Math.cos(th);
      basePos[vi * 3 + 1] = cy + R * Math.sin(phi) * Math.sin(th);
      basePos[vi * 3 + 2] = cz + R * Math.cos(phi);
      vi++;
    }
  }
  basePos[vi * 3] = cx;
  basePos[vi * 3 + 1] = cy;
  basePos[vi * 3 + 2] = cz - R;
}

/** directional macro delta = target combo − neutral combo */
function macroDir(build) {
  const acc = denseDelta();
  build(acc);
  for (let i = 0; i < acc.d.length; i++) acc.d[i] -= neutral.d[i];
  for (let i = 0; i < acc.j.length; i++) acc.j[i] -= neutral.j[i];
  return acc;
}
const eth = (acc, g, w) => {
  for (const e of ['african', 'asian', 'caucasian']) addTarget(acc, `macrodetails/${e}-${g}-young.target`, w / 3);
};
const MACRO_DIRS = {
  frame_pos: macroDir((a) => { addTarget(a, 'macrodetails/universal-female-young-averagemuscle-averageweight.target', 1); eth(a, 'female', 1); }),
  frame_neg: macroDir((a) => { addTarget(a, 'macrodetails/universal-male-young-averagemuscle-averageweight.target', 1); eth(a, 'male', 1); }),
  age_pos: macroDir((a) => {
    for (const g of ['female', 'male']) {
      addTarget(a, `macrodetails/universal-${g}-old-averagemuscle-averageweight.target`, 0.5);
      for (const e of ['african', 'asian', 'caucasian']) addTarget(a, `macrodetails/${e}-${g}-old.target`, 0.5 / 3);
    }
  }),
  muscle_pos: macroDir((a) => { for (const g of ['female', 'male']) { addTarget(a, `macrodetails/universal-${g}-young-maxmuscle-averageweight.target`, 0.5); eth(a, g, 0.5); } }),
  muscle_neg: macroDir((a) => { for (const g of ['female', 'male']) { addTarget(a, `macrodetails/universal-${g}-young-minmuscle-averageweight.target`, 0.5); eth(a, g, 0.5); } }),
  weight_pos: macroDir((a) => { for (const g of ['female', 'male']) { addTarget(a, `macrodetails/universal-${g}-young-averagemuscle-maxweight.target`, 0.5); eth(a, g, 0.5); } }),
  weight_neg: macroDir((a) => { for (const g of ['female', 'male']) { addTarget(a, `macrodetails/universal-${g}-young-averagemuscle-minweight.target`, 0.5); eth(a, g, 0.5); } }),
  // height targets are additive on top of the macro combo
  height_pos: (() => { const a = denseDelta(); for (const g of ['female', 'male']) addTarget(a, `macrodetails/height/${g}-young-averagemuscle-averageweight-maxheight.target`, 0.5); return a; })(),
  height_neg: (() => { const a = denseDelta(); for (const g of ['female', 'male']) addTarget(a, `macrodetails/height/${g}-young-averagemuscle-averageweight-minheight.target`, 0.5); return a; })(),
  ethnicity_african: macroDir((a) => { for (const g of ['female', 'male']) { addTarget(a, `macrodetails/universal-${g}-young-averagemuscle-averageweight.target`, 0.5); addTarget(a, `macrodetails/african-${g}-young.target`, 0.5); } }),
  ethnicity_asian: macroDir((a) => { for (const g of ['female', 'male']) { addTarget(a, `macrodetails/universal-${g}-young-averagemuscle-averageweight.target`, 0.5); addTarget(a, `macrodetails/asian-${g}-young.target`, 0.5); } }),
  ethnicity_european: macroDir((a) => { for (const g of ['female', 'male']) { addTarget(a, `macrodetails/universal-${g}-young-averagemuscle-averageweight.target`, 0.5); addTarget(a, `macrodetails/caucasian-${g}-young.target`, 0.5); } })
};

// --- detail targets: slider id → target files (l/r merged into symmetric)
const lr = (tpl) => [tpl.replace('{s}', mhSide('l')), tpl.replace('{s}', mhSide('r'))];
const DETAIL_MAP = {
  cranium_width: { pos: ['head/head-scale-horiz-incr.target'], neg: ['head/head-scale-horiz-decr.target'] },
  forehead_height: { pos: ['forehead/forehead-scale-vert-incr.target'], neg: ['forehead/forehead-scale-vert-decr.target'] },
  brow_depth: { pos: ['forehead/forehead-trans-forward.target'], neg: ['forehead/forehead-trans-backward.target'] },
  eye_size: { pos: lr('eyes/{s}-eye-scale-incr.target'), neg: lr('eyes/{s}-eye-scale-decr.target') },
  eye_spacing: { pos: lr('eyes/{s}-eye-trans-out.target'), neg: lr('eyes/{s}-eye-trans-in.target') },
  eye_tilt: { pos: lr('eyes/{s}-eye-corner1-up.target'), neg: lr('eyes/{s}-eye-corner1-down.target') },
  eye_depth: { pos: lr('eyes/{s}-eye-push2-out.target'), neg: lr('eyes/{s}-eye-push2-in.target') },
  cheekbone_height: { pos: lr('cheek/{s}-cheek-bones-incr.target'), neg: lr('cheek/{s}-cheek-bones-decr.target') },
  cheekbone_width: { pos: lr('cheek/{s}-cheek-volume-incr.target'), neg: lr('cheek/{s}-cheek-volume-decr.target') },
  nose_bridge_width: { pos: ['nose/nose-width2-incr.target'], neg: ['nose/nose-width2-decr.target'] },
  nose_length: { pos: ['nose/nose-scale-vert-incr.target'], neg: ['nose/nose-scale-vert-decr.target'] },
  nose_tip: { pos: ['nose/nose-point-up.target'], neg: ['nose/nose-point-down.target'] },
  nostril_flare: { pos: ['nose/nose-nostrils-width-incr.target'], neg: ['nose/nose-nostrils-width-decr.target'] },
  jaw_width: { pos: ['chin/chin-width-incr.target'], neg: ['chin/chin-width-decr.target'] },
  chin_length: { pos: ['chin/chin-height-incr.target'], neg: ['chin/chin-height-decr.target'] },
  chin_point: { pos: ['chin/chin-prominent-incr.target'], neg: ['chin/chin-prominent-decr.target'] },
  jaw_forward: { pos: ['chin/chin-prognathism-incr.target'], neg: ['chin/chin-prognathism-decr.target'] },
  ear_size: { pos: lr('ears/{s}-ear-scale-incr.target'), neg: lr('ears/{s}-ear-scale-decr.target') },
  ear_angle: { pos: lr('ears/{s}-ear-rot-backward.target'), neg: lr('ears/{s}-ear-rot-forward.target') },
  mouth_width: { pos: ['mouth/mouth-scale-horiz-incr.target'], neg: ['mouth/mouth-scale-horiz-decr.target'] },
  mouth_height: { pos: ['mouth/mouth-trans-up.target'], neg: ['mouth/mouth-trans-down.target'] },
  lip_fullness: {
    pos: ['mouth/mouth-lowerlip-volume-incr.target', 'mouth/mouth-upperlip-volume-incr.target'],
    neg: ['mouth/mouth-lowerlip-volume-decr.target', 'mouth/mouth-upperlip-volume-decr.target']
  },
  neck_girth: {
    pos: ['neck/neck-scale-horiz-incr.target', 'neck/neck-scale-depth-incr.target'],
    neg: ['neck/neck-scale-horiz-decr.target', 'neck/neck-scale-depth-decr.target']
  },
  neck_length: { pos: ['neck/neck-scale-vert-incr.target'], neg: ['neck/neck-scale-vert-decr.target'] },
  v_taper: { pos: ['torso/torso-vshape-incr.target'] },
  chest_depth: { pos: ['torso/torso-scale-depth-incr.target'], neg: ['torso/torso-scale-depth-decr.target'] },
  shoulder_width: { pos: ['torso/torso-scale-horiz-incr.target'], neg: ['torso/torso-scale-horiz-decr.target'] },
  waist_width: { pos: ['measure/measure-waist-circ-incr.target'], neg: ['measure/measure-waist-circ-decr.target'] },
  upper_arm_girth: { pos: ['measure/measure-upperarm-circ-incr.target'], neg: ['measure/measure-upperarm-circ-decr.target'] },
  wrist_girth: { pos: ['measure/measure-wrist-circ-incr.target'], neg: ['measure/measure-wrist-circ-decr.target'] },
  thigh_girth: { pos: ['measure/measure-thigh-circ-incr.target'], neg: ['measure/measure-thigh-circ-decr.target'] },
  calf_girth: { pos: ['measure/measure-calf-circ-incr.target'], neg: ['measure/measure-calf-circ-decr.target'] },
  ankle_girth: { pos: ['measure/measure-ankle-circ-incr.target'], neg: ['measure/measure-ankle-circ-decr.target'] },
  knee_width: { pos: ['measure/measure-knee-circ-incr.target'], neg: ['measure/measure-knee-circ-decr.target'] },
  neck_girth2: { pos: ['measure/measure-neck-circ-incr.target'], neg: ['measure/measure-neck-circ-decr.target'] },
  hip_width: { pos: ['hip/hip-scale-horiz-incr.target'], neg: ['hip/hip-scale-horiz-decr.target'] },
  belly: { pos: ['stomach/stomach-pregnant-incr.target'], neg: ['stomach/stomach-tone-incr.target'] },
  glute_size: { pos: ['buttocks/buttocks-volume-incr.target'], neg: ['buttocks/buttocks-volume-decr.target'] },
  bust_size: {
    // cup-size delta = maxcup combo − averagecup combo (grid targets are absolute)
    pos: [
      ['breast/female-young-averagemuscle-averageweight-maxcup-averagefirmness.target', 1],
      ['breast/female-young-averagemuscle-averageweight-averagecup-minfirmness.target', -0.5],
      ['breast/female-young-averagemuscle-averageweight-averagecup-maxfirmness.target', -0.5]
    ],
    neg: [
      ['breast/female-young-averagemuscle-averageweight-mincup-averagefirmness.target', 1],
      ['breast/female-young-averagemuscle-averageweight-averagecup-minfirmness.target', -0.5],
      ['breast/female-young-averagemuscle-averageweight-averagecup-maxfirmness.target', -0.5]
    ]
  },
  bust_lift: {
    pos: ['breast/breast-point-incr.target', 'breast/breast-trans-up.target'],
    neg: ['breast/breast-point-decr.target', 'breast/breast-trans-down.target']
  },
  // NSFW module (CC0 targets; gated identically to before)
  genital_masc: { pos: ['genitals/penis-length-incr.target'] },
  genital_masc_size: { pos: ['genitals/penis-circ-incr.target', 'genitals/penis-testicles-incr.target'] }
};
const detailBaked = {};
const missingTargets = [];
for (const [slider, dirs] of Object.entries(DETAIL_MAP)) {
  const entry = {};
  for (const dir of ['pos', 'neg']) {
    if (!dirs[dir]) continue;
    const acc = denseDelta();
    let any = false;
    for (const spec of dirs[dir]) {
      const [f, scale] = Array.isArray(spec) ? spec : [spec, 1];
      if (!existsSync(join(dataDir, 'targets', f))) {
        missingTargets.push(`${slider}.${dir}: ${f}`);
        continue;
      }
      addTarget(acc, f, scale);
      any = true;
    }
    if (any) entry[dir] = acc;
  }
  if (entry.pos) detailBaked[slider] = entry;
}
if (missingTargets.length) console.log('MISSING targets:\n  ' + missingTargets.join('\n  '));

// ------------------------------------------------------------------ landmarks
// heuristics on the neutral grounded base; verified visually downstream
const P = (v) => [basePos[v * 3], basePos[v * 3 + 1], basePos[v * 3 + 2]];
const jointY = (b) => baseJoints[OUR_BONES.indexOf(b) * 3 + 1];
const jointOf = (b) => {
  const i = OUR_BONES.indexOf(b) * 3;
  return [baseJoints[i], baseJoints[i + 1], baseJoints[i + 2]];
};
const domBone = new Uint8Array(bodyCount);
for (let v = 0; v < bodyCount; v++) domBone[v] = skinIndex[v * 2];
const vertsOf = (...bones) => {
  const set = bones.map((b) => OUR_BONES.indexOf(b));
  const out = [];
  for (let v = 0; v < bodyCount; v++) if (set.includes(domBone[v])) out.push(v);
  return out;
};
const argbest = (list, score) => {
  let best = -1, bestS = -Infinity;
  for (const v of list) {
    const s = score(P(v), v);
    if (s > bestS) { bestS = s; best = v; }
  }
  return best;
};
const nearest = (list, p) => argbest(list, (q) => -((q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2 + (q[2] - p[2]) ** 2));
const headVs = vertsOf('head');
const chestVs = vertsOf('chest');
const spineVs = vertsOf('spine');
const pelvisVs = vertsOf('pelvis');
const neckVs = vertsOf('neck');

const LM = {};
LM.crown = argbest(headVs, (p) => p[1]);
LM.noseTip = argbest(headVs, (p) => p[2] - Math.abs(p[0]) * 2);
const noseP = P(LM.noseTip);
LM.chin = argbest(headVs, (p) => (Math.abs(p[0]) < 0.012 ? p[2] * 1.2 - (p[1] - (noseP[1] - 0.075)) ** 2 * 400 - (p[1] > noseP[1] - 0.03 ? 9 : 0) : -9));
const chinP = P(LM.chin);
LM.mouth = argbest(headVs, (p) => (Math.abs(p[0]) < 0.008 && p[1] > chinP[1] + 0.015 && p[1] < noseP[1] - 0.012 ? p[2] : -9));
const mouthP = P(LM.mouth);
LM.mouthCornerL = argbest(headVs, (p) => (p[0] > 0.015 && p[0] < 0.035 && Math.abs(p[1] - mouthP[1]) < 0.01 ? p[2] : -9));
// eye sockets from cap rings (the two smallish loops nearest nose height)
const eyeLoops = caps
  .map((c, i) => {
    const ctr = c.ring.reduce((a, v) => { const p = P(v); return [a[0] + p[0], a[1] + p[1], a[2] + p[2]]; }, [0, 0, 0]).map((x) => x / c.ring.length);
    return { i, ctr, n: c.ring.length };
  })
  .filter((l) => l.ctr[1] > noseP[1] && l.ctr[1] < noseP[1] + 0.09 && l.ctr[2] > 0)
  .sort((a, b) => b.ctr[0] - a.ctr[0]);
if (eyeLoops.length >= 2) {
  LM.eyeL = nearest(headVs, eyeLoops[0].ctr);
  LM.eyeR = nearest(headVs, eyeLoops[eyeLoops.length - 1].ctr);
} else {
  LM.eyeL = argbest(headVs, (p) => (p[0] > 0.02 && p[1] > noseP[1] + 0.02 && p[1] < noseP[1] + 0.06 ? p[2] : -9));
}
const eyeP = P(LM.eyeL);
LM.browL = nearest(headVs, [eyeP[0], eyeP[1] + 0.022, eyeP[2] + 0.008]);
LM.cheekL = nearest(headVs, [eyeP[0] + 0.02, eyeP[1] - 0.045, eyeP[2] - 0.02]);
LM.foreheadC = argbest(headVs, (p) => (Math.abs(p[0]) < 0.008 && p[1] > eyeP[1] + 0.035 && p[1] < eyeP[1] + 0.09 ? p[2] : -9));
LM.earL = argbest(headVs, (p) => p[0]);
const earP = P(LM.earL);
LM.jawSideL = nearest(headVs, [earP[0] * 0.85, chinP[1] + 0.02, chinP[2] - 0.055]);
LM.neckBase = argbest([...neckVs, ...chestVs], (p) => (Math.abs(p[0]) < 0.01 ? -Math.abs(p[1] - (jointY('neck') - 0.02)) * 6 + p[2] : -9));
LM.bustL = argbest(chestVs, (p) => (p[0] > 0.03 ? p[2] - Math.abs(p[0] - 0.09) : -9));
const bustP = P(LM.bustL);
LM.chestC = argbest(chestVs, (p) => (Math.abs(p[0]) < 0.008 && Math.abs(p[1] - bustP[1]) < 0.03 ? p[2] : -9));
LM.backC = argbest(chestVs, (p) => (Math.abs(p[0]) < 0.008 && Math.abs(p[1] - bustP[1] - 0.03) < 0.03 ? -p[2] : -9));
// waist = narrowest slice between pelvis and chest
const sliceW = (y, verts) => {
  let mx = 0;
  for (const v of verts) {
    const p = P(v);
    if (Math.abs(p[1] - y) < 0.01) mx = Math.max(mx, Math.abs(p[0]));
  }
  return mx || 9;
};
const torsoVs = [...spineVs, ...pelvisVs, ...chestVs];
let waistY = 0, waistW = 9;
for (let y = jointY('pelvis') + 0.02; y < jointY('chest') + 0.02; y += 0.01) {
  const w = sliceW(y, torsoVs);
  if (w < waistW) { waistW = w; waistY = y; }
}
LM.waistSideL = argbest(torsoVs, (p) => (Math.abs(p[1] - waistY) < 0.012 ? p[0] : -9));
let hipY = 0, hipW = 0;
for (let y = jointY('thighL') - 0.05; y < jointY('pelvis') + 0.08; y += 0.01) {
  const w = sliceW(y, [...pelvisVs, ...vertsOf('thighL', 'thighR')]);
  if (w !== 9 && w > hipW) { hipW = w; hipY = y; }
}
LM.hipSideL = argbest([...pelvisVs, ...vertsOf('thighL')], (p) => (Math.abs(p[1] - hipY) < 0.012 ? p[0] : -9));
LM.gluteApex = argbest(pelvisVs, (p) => (Math.abs(p[0]) < 0.06 ? -p[2] : -9));
LM.bellyFront = argbest([...spineVs, ...pelvisVs], (p) => (Math.abs(p[0]) < 0.008 && Math.abs(p[1] - (jointY('pelvis') + 0.09)) < 0.03 ? p[2] : -9));
LM.groinC = argbest(pelvisVs, (p) => (Math.abs(p[0]) < 0.012 && p[2] > -0.03 && p[2] < 0.08 ? -p[1] : -9));
LM.shoulderTipL = argbest([...chestVs, ...vertsOf('upperArmL')], (p) => (p[1] > jointY('upperArmL') - 0.03 ? p[0] + p[1] * 0.3 : -9));
// limbs (left; right mirrored below)
const armLVs = vertsOf('upperArmL', 'forearmL');
const handLVs = vertsOf('handL');
LM.elbowL = nearest([...armLVs], [...jointOf('forearmL')]);
LM.wristL = nearest([...armLVs, ...handLVs], [...jointOf('handL')]);
const shoulderP = jointOf('upperArmL');
LM.handTipL = argbest(handLVs, (p) => (p[0] - shoulderP[0]) ** 2 + (p[1] - shoulderP[1]) ** 2);
LM.palmL = nearest(handLVs, [
  (P(LM.wristL)[0] + P(LM.handTipL)[0]) / 2, (P(LM.wristL)[1] + P(LM.handTipL)[1]) / 2, (P(LM.wristL)[2] + P(LM.handTipL)[2]) / 2 + 0.01
]);
const legLVs = vertsOf('thighL', 'shinL');
LM.kneeL = argbest(legLVs, (p) => -Math.abs(p[1] - jointY('shinL')) * 4 + p[2]);
LM.thighSideL = argbest(vertsOf('thighL'), (p) => (Math.abs(p[1] - (jointY('thighL') - 0.05)) < 0.03 ? p[0] : -9));
LM.calfL = argbest(vertsOf('shinL'), (p) => (Math.abs(p[1] - (jointY('shinL') - 0.13)) < 0.03 ? -p[2] : -9));
const footLVs = vertsOf('footL');
LM.heelL = argbest(footLVs, (p) => -p[2] - p[1]);
LM.toeL = argbest(footLVs, (p) => p[2]);

// mirror L → R via symmetric nearest vertex
const mirrorOf = (v) => {
  const p = P(v);
  return nearest([...Array(bodyCount).keys()], [-p[0], p[1], p[2]]);
};
for (const name of Object.keys(LM)) {
  if (name.endsWith('L')) {
    const rName = name.slice(0, -1) + 'R';
    if (!(rName in LM)) LM[rName] = mirrorOf(LM[name]);
  }
}
console.log('landmarks:', Object.keys(LM).length);
for (const [k, v] of Object.entries(LM)) {
  if (v < 0) console.log(`  !! landmark ${k} not found`);
}

// -------------------------------------------------------------------- regions
const REGION_OF_BONE = {
  pelvis: 4, spine: 4, chest: 3, neck: 1, head: 0,
  upperArmL: 5, forearmL: 5, handL: 6, upperArmR: 5, forearmR: 5, handR: 6,
  thighL: 7, shinL: 7, footL: 8, thighR: 7, shinR: 7, footR: 8
};
const regions = new Uint8Array(vertCount);
for (let v = 0; v < bodyCount; v++) regions[v] = REGION_OF_BONE[OUR_BONES[domBone[v]]];
// shoulders band + groin refinement
for (const v of chestVs) if (basePos[v * 3 + 1] > jointY('upperArmL') - 0.02) regions[v] = 2;
const groinP = P(LM.groinC);
for (const v of pelvisVs) {
  const p = P(v);
  if (Math.abs(p[0]) < 0.06 && Math.abs(p[1] - groinP[1]) < 0.07 && p[2] > -0.01) regions[v] = 9;
}
caps.forEach((c, ci) => { regions[capBase + ci] = regions[c.ring[0]]; });
for (const eye of eyesMeta) {
  for (let k = 0; k < eye.sphereCount; k++) regions[eye.sphereStart + k] = 0;
}

// ---------------------------------------------------------------------- side
const side = new Float32Array(vertCount);
for (let v = 0; v < vertCount; v++) {
  side[v] = Math.tanh(basePos[v * 3] / 0.02);
}

// ------------------------------------------------------------------- pack bin
// deltas quantized to int16 with per-delta scale
const sections = [];
let offset = 0;
const meta = { sections: {} };
function pushSection(name, typed) {
  const bytes = new Uint8Array(typed.buffer, typed.byteOffset, typed.byteLength);
  sections.push(bytes);
  meta.sections[name] = { offset, length: typed.length, type: typed.constructor.name };
  offset += bytes.byteLength;
  // 4-byte align
  const pad = (4 - (offset % 4)) % 4;
  if (pad) {
    sections.push(new Uint8Array(pad));
    offset += pad;
  }
}
function quantize(f32) {
  let max = 1e-9;
  for (let i = 0; i < f32.length; i++) max = Math.max(max, Math.abs(f32[i]));
  const q = new Int16Array(f32.length);
  for (let i = 0; i < f32.length; i++) q[i] = Math.round((f32[i] / max) * 32767);
  return { q, scale: max / 32767 };
}
/** sparse-pack a dense delta (skip near-zero verts) */
function packDelta(name, acc) {
  const idx = [];
  for (let v = 0; v < bodyCount; v++) {
    const m = Math.abs(acc.d[v * 3]) + Math.abs(acc.d[v * 3 + 1]) + Math.abs(acc.d[v * 3 + 2]);
    if (m > 1e-6) idx.push(v);
  }
  const dv = new Float32Array(idx.length * 3);
  idx.forEach((v, k) => {
    dv[k * 3] = acc.d[v * 3];
    dv[k * 3 + 1] = acc.d[v * 3 + 1];
    dv[k * 3 + 2] = acc.d[v * 3 + 2];
  });
  const { q, scale } = quantize(dv);
  pushSection(`${name}.idx`, new Uint32Array(idx));
  pushSection(`${name}.q`, q);
  meta.sections[`${name}.q`].scale = scale;
  meta.sections[`${name}.q`].joints = Array.from(acc.j);
}

// caps extend the body part's vertex range (they sit right after its verts)
const bodyRange = partRanges.find((p) => p.name === 'body');
if (caps.some((c) => partRanges[partOf(c.ring[0])]?.name !== 'body')) {
  throw new Error('boundary loop found outside the body part — cap layout invalid');
}
bodyRange.vCount += caps.length;

pushSection('basePos', basePos);
pushSection('indices', new Uint32Array(finalIndices));
pushSection('uvs', (() => { const u = new Float32Array(vertCount * 2); u.set(uvsBody); return u; })());
pushSection('regions', regions);
pushSection('side', side);
pushSection('skinIndex', skinIndex);
pushSection('skinWeight', skinWeight);
pushSection('baseJoints', baseJoints);

const morphIndex = {};
for (const [name, acc] of Object.entries(MACRO_DIRS)) {
  packDelta(`macro.${name}`, acc);
  morphIndex[`macro.${name}`] = true;
}
for (const [slider, dirs] of Object.entries(detailBaked)) {
  if (dirs.pos) packDelta(`detail.${slider}.pos`, dirs.pos);
  if (dirs.neg) packDelta(`detail.${slider}.neg`, dirs.neg);
  morphIndex[`detail.${slider}`] = { pos: !!dirs.pos, neg: !!dirs.neg };
}

meta.vertCount = vertCount;
meta.bodyCount = bodyCount;
meta.parts = partRanges;
meta.eyes = eyesMeta;
meta.bones = OUR_BONES;
meta.boneParent = [-1, 0, 1, 2, 3, 2, 5, 6, 2, 8, 9, 0, 11, 12, 0, 14, 15];
meta.caps = caps.map((c) => c.ring);
meta.landmarks = LM;
meta.morphs = morphIndex;
meta.license = 'Mesh/targets/rig data: MakeHuman (makehumancommunity), CC0 1.0';

mkdirSync('src/anatomy/mh', { recursive: true });
const bin = new Uint8Array(offset);
let o = 0;
for (const s of sections) {
  bin.set(s, o);
  o += s.byteLength;
}
writeFileSync('src/anatomy/mh/bundle.bin', bin);
writeFileSync('src/anatomy/mh/bundle.json', JSON.stringify(meta));
console.log(`bundle: ${(bin.byteLength / 1e6).toFixed(2)}MB bin + ${(JSON.stringify(meta).length / 1e3).toFixed(0)}KB json, ${Object.keys(morphIndex).length} morph sources`);
