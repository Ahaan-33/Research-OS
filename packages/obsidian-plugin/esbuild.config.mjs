// Per ADR-0006: esbuild bundles @ros/obsidian-plugin into a single main.js,
// with the Obsidian/Electron host APIs left external (provided at runtime).
// Per ADR-0007: the compiled better-sqlite3 native binary is copied next to
// main.js and loaded via an explicit path at runtime — see db.ts/main.ts.
import esbuild from 'esbuild';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const dir = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

await esbuild.build({
  entryPoints: [path.join(dir, 'src/main.ts')],
  bundle: true,
  outfile: path.join(dir, 'main.js'),
  platform: 'node',
  format: 'cjs',
  target: 'es2022',
  external: ['obsidian', 'electron'],
  sourcemap: true,
});

// ADR-0007: ship the platform's compiled addon alongside main.js. v0 is
// desktop, single-platform (ADR-0002); packaging for multiple platforms is
// future work, not solved here.
const addonPkgRoot = path.dirname(require.resolve('better-sqlite3/package.json'));
const addonSrc = path.join(addonPkgRoot, 'build', 'Release', 'better_sqlite3.node');
const addonDest = path.join(dir, 'better_sqlite3.node');
fs.copyFileSync(addonSrc, addonDest);
console.log(`[ADR-0007] copied native addon: ${addonSrc} -> ${addonDest}`);

// ADR-0007 (extended): migrations are .sql files tsc never emits into dist/,
// and once bundled, __dirname inside main.js resolves to the plugin's own
// installed directory (esbuild does not preserve each original module's
// __dirname when collapsing everything into one file) — so db.ts's
// path.join(__dirname, 'migrations') only resolves correctly if the SQL
// files are physically shipped next to main.js. Same root cause as the
// native addon: a runtime path assumption that only holds pre-bundling.
const migrationsSrc = path.join(dir, '../core/src/persistent-research-state/migrations');
const migrationsDest = path.join(dir, 'migrations');
fs.mkdirSync(migrationsDest, { recursive: true });
for (const f of fs.readdirSync(migrationsSrc)) {
  fs.copyFileSync(path.join(migrationsSrc, f), path.join(migrationsDest, f));
}
console.log(`[ADR-0007] copied migrations: ${migrationsSrc} -> ${migrationsDest}`);
