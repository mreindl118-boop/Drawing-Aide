// Builds the fully self-contained single-file demo:
//   dist-demo/artifact.html   — body-content only (for hosts that wrap it)
//   dist-demo/standalone.html — complete document (for local testing)
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;

const res = spawnSync('npx', ['vite', 'build', '-c', 'vite.demo.config.ts'], {
  stdio: 'inherit',
  cwd: root
});
if (res.status !== 0) process.exit(1);

const dist = join(root, 'dist-demo');
const assets = join(dist, 'assets');
const files = readdirSync(assets);
const jsFile = files.find((f) => f.endsWith('.js'));
const cssFile = files.find((f) => f.endsWith('.css'));
if (!jsFile) throw new Error('no js bundle found');

const js = readFileSync(join(assets, jsFile), 'utf8');
const css = cssFile ? readFileSync(join(assets, cssFile), 'utf8') : '';

const body = `<title>SculptPad</title>
<style>${css}</style>
<div id="app"></div>
<script type="module">${js.replace(/<\/script>/gi, '<\\/script>')}</script>
`;

writeFileSync(join(dist, 'artifact.html'), body);
writeFileSync(
  join(dist, 'standalone.html'),
  `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
</head><body>${body}</body></html>`
);

const mb = (n) => (n / 1e6).toFixed(2) + ' MB';
console.log(`\nartifact.html   ${mb(readFileSync(join(dist, 'artifact.html')).length)}`);
console.log(`standalone.html ${mb(readFileSync(join(dist, 'standalone.html')).length)}`);
