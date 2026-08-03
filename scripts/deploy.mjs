// One-command publish: build → Cloudflare Pages deploy → print the URL.
//
// One-time setup (either):
//   npx wrangler login                          (interactive OAuth)
//   or set CLOUDFLARE_API_TOKEN (+ CLOUDFLARE_ACCOUNT_ID) in the environment
//
// Optional: SCULPTPAD_PAGES_PROJECT to override the Pages project name.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const PROJECT = process.env.SCULPTPAD_PAGES_PROJECT || pkg.name || 'sculptpad';

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { stdio: 'pipe', encoding: 'utf8', ...opts });
  return res;
}

function fail(msg) {
  console.error(`\n✗ ${msg}`);
  process.exit(1);
}

// 1. build
console.log(`\n▸ Building v${pkg.version}…`);
const build = spawnSync('npm', ['run', 'build'], { stdio: 'inherit' });
if (build.status !== 0) fail('build failed');

// 2. auth sanity
const who = run('npx', ['wrangler', 'whoami']);
if (who.status !== 0 || /not authenticated|please run.*login/i.test(who.stdout + who.stderr)) {
  fail(
    'Cloudflare auth missing.\n' +
      '  Run once:  npx wrangler login\n' +
      '  Or set:    CLOUDFLARE_API_TOKEN (+ CLOUDFLARE_ACCOUNT_ID)\n' +
      'then re-run: npm run deploy'
  );
}

// 3. ensure the Pages project exists
const list = run('npx', ['wrangler', 'pages', 'project', 'list']);
if (list.status === 0 && !list.stdout.includes(PROJECT)) {
  console.log(`▸ Creating Pages project "${PROJECT}"…`);
  const create = run('npx', [
    'wrangler', 'pages', 'project', 'create', PROJECT,
    '--production-branch', 'main'
  ]);
  if (create.status !== 0) {
    fail(`could not create Pages project:\n${create.stdout}\n${create.stderr}`);
  }
}

// 4. deploy
console.log(`▸ Deploying dist/ to Pages project "${PROJECT}"…`);
const dep = run('npx', [
  'wrangler', 'pages', 'deploy', 'dist',
  '--project-name', PROJECT,
  '--commit-dirty=true'
]);
process.stdout.write(dep.stdout);
process.stderr.write(dep.stderr);
if (dep.status !== 0) fail('deploy failed');

const m = (dep.stdout + dep.stderr).match(/https:\/\/[\w.-]+\.pages\.dev\S*/g);
const url = m ? m[m.length - 1] : null;
const prodUrl = `https://${PROJECT}.pages.dev`;

console.log('\n══════════════════════════════════════════════════');
console.log(`  ✓ SculptPad v${pkg.version} deployed`);
console.log(`  Production : ${prodUrl}`);
if (url && !url.startsWith(prodUrl)) console.log(`  This deploy: ${url}`);
console.log('  iPad: open in Safari → Share → Add to Home Screen');
console.log('══════════════════════════════════════════════════\n');
