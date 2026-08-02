// Generates PWA icons (shaded sphere on dark rounded background) as PNGs
// with zero dependencies — minimal PNG encoder over node:zlib.
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

// ---- PNG encoding ----

const CRC_TABLE = new Int32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});

function crc32(buf) {
  let c = -1;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePNG(width, height, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0; // filter none
    rgba.copy(raw, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

// ---- drawing ----

function drawIcon(size, { pad = 0.14, bgRadius = 0.22, maskable = false } = {}) {
  const rgba = Buffer.alloc(size * size * 4);
  const bg = [20, 20, 23];
  const bgTop = [32, 33, 40];
  const r = maskable ? 0 : Math.round(size * bgRadius);
  const cx = size / 2;
  const cy = size / 2;
  const sphereR = size * (0.5 - pad - (maskable ? 0.08 : 0));
  // light direction
  const lx = -0.45, ly = -0.55, lz = 0.7;
  const ll = Math.hypot(lx, ly, lz);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      // rounded-rect background
      const dx = Math.max(r - x, x - (size - 1 - r), 0);
      const dy = Math.max(r - y, y - (size - 1 - r), 0);
      const outside = Math.hypot(dx, dy) > r;
      if (outside && !maskable) {
        rgba[i + 3] = 0;
        continue;
      }
      const t = y / size;
      let cr = bgTop[0] * (1 - t) + bg[0] * t;
      let cg = bgTop[1] * (1 - t) + bg[1] * t;
      let cb = bgTop[2] * (1 - t) + bg[2] * t;

      // sphere
      const sx = (x - cx) / sphereR;
      const sy = (y - cy) / sphereR;
      const d2 = sx * sx + sy * sy;
      if (d2 <= 1) {
        const sz = Math.sqrt(1 - d2);
        let diff = (sx * lx + sy * ly + sz * lz) / ll;
        diff = Math.max(0.06, diff);
        // blue-tinted clay
        const base = [120, 150, 220];
        cr = base[0] * diff;
        cg = base[1] * diff;
        cb = base[2] * diff;
        // specular
        const spec = Math.pow(Math.max(0, diff), 24) * 190;
        cr += spec;
        cg += spec;
        cb += spec;
        // soft edge AA
        const edge = Math.min(1, (1 - Math.sqrt(d2)) * sphereR * 0.9 + 0.5);
        cr = cr * edge + (bgTop[0] * (1 - t) + bg[0] * t) * (1 - edge);
        cg = cg * edge + (bgTop[1] * (1 - t) + bg[1] * t) * (1 - edge);
        cb = cb * edge + (bgTop[2] * (1 - t) + bg[2] * t) * (1 - edge);
      }
      rgba[i] = Math.min(255, Math.round(cr));
      rgba[i + 1] = Math.min(255, Math.round(cg));
      rgba[i + 2] = Math.min(255, Math.round(cb));
      rgba[i + 3] = 255;
    }
  }
  return encodePNG(size, size, rgba);
}

writeFileSync(join(outDir, 'icon-192.png'), drawIcon(192));
writeFileSync(join(outDir, 'icon-512.png'), drawIcon(512));
writeFileSync(join(outDir, 'icon-maskable-512.png'), drawIcon(512, { maskable: true }));
writeFileSync(join(outDir, 'apple-touch-icon.png'), drawIcon(180, { maskable: true }));
console.log('icons written to', outDir);
