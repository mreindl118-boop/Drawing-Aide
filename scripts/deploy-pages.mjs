// Build for GitHub Pages and force-push the result to the gh-pages branch.
//   node scripts/deploy-pages.mjs   (or: npm run deploy:pages)
// The public URL is https://<owner>.github.io/<repo>/
import { execSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const sh = (cmd, opts = {}) => execSync(cmd, { stdio: 'inherit', ...opts });
const out = (cmd) => execSync(cmd, { encoding: 'utf8' }).trim();

const remote = out('git remote get-url origin');
const repoName = remote.replace(/\.git$/, '').split('/').pop();
const base = `/${repoName}/`;

console.log(`building with base ${base} …`);
sh(`npx vite build --base=${base}`);

const dir = mkdtempSync(join(tmpdir(), 'ghp-'));
cpSync('dist', dir, { recursive: true });
writeFileSync(join(dir, '.nojekyll'), '');
sh('git init -b gh-pages -q', { cwd: dir });
sh('git add -A', { cwd: dir });
sh('git -c user.email=deploy@sculptpad -c user.name="SculptPad deploy" commit -q -m "Deploy to GitHub Pages"', { cwd: dir });
sh(`git push -f ${remote} gh-pages`, { cwd: dir });

const owner = remote.replace(/\.git$/, '').split('/').slice(-2)[0];
console.log(`\npushed. Live in ~1–2 min at: https://${owner}.github.io/${repoName}/`);
