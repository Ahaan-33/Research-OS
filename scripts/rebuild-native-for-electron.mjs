// Per ADR-0009: the workspace has two runtimes that both load
// better-sqlite3's native addon — plain Node (Vitest, via pnpm's normal
// hoisted install) and Electron (the packaged Obsidian plugin) — and they
// require binaries built for different ABIs (NODE_MODULE_VERSION). pnpm
// deduplicates `better-sqlite3` to a single physical package instance
// shared by every workspace member; rebuilding that shared instance for
// Electron (as `@electron/rebuild` does, in place) silently breaks the
// Node/Vitest runtime, and vice versa.
//
// This script builds the Electron-targeted binary in a directory that is
// deliberately NOT a pnpm workspace member and NOT installed by pnpm at
// all (`packages/obsidian-plugin/native/electron-better-sqlite3`), so its
// better-sqlite3 install is a physically separate file on disk from the
// one pnpm hoists for @ros/core and Vitest. The root/workspace copy is
// never touched by this script and stays on Node's ABI.
//
// Run this once whenever better-sqlite3's version or Electron's version
// changes (`pnpm run build:native:electron`). `esbuild.config.mjs` then
// copies the result next to `main.js` — see ADR-0007 part 2, ADR-0009.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const nativeDir = path.join(repoRoot, 'packages/obsidian-plugin/native/electron-better-sqlite3');

const rootPkg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));
const electronVersion = rootPkg.devDependencies.electron.replace(/^[^0-9]*/, '');

const corePkg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'packages/core/package.json'), 'utf8'));
const nativePkg = JSON.parse(fs.readFileSync(path.join(nativeDir, 'package.json'), 'utf8'));

// Guard against the two better-sqlite3 pins silently drifting apart —
// the Electron build and the Node build must be built from the same
// source version, only for different ABIs.
const workspaceRange = corePkg.dependencies['better-sqlite3'];
const isolatedVersion = nativePkg.dependencies['better-sqlite3'];
if (!workspaceRange.replace('^', '').startsWith(isolatedVersion.split('.').slice(0, 2).join('.'))) {
  console.error(
    `[rebuild-native-for-electron] version drift: packages/core depends on ` +
    `better-sqlite3@${workspaceRange}, but ${path.relative(repoRoot, nativeDir)}/package.json ` +
    `pins ${isolatedVersion}. Update the isolated package.json to match before rebuilding.`
  );
  process.exit(1);
}

console.log(`[rebuild-native-for-electron] installing better-sqlite3@${isolatedVersion} in isolation (npm, not pnpm) ...`);
execFileSync('npm', ['install', '--no-audit', '--no-fund'], { cwd: nativeDir, stdio: 'inherit' });

console.log(`[rebuild-native-for-electron] rebuilding against Electron ${electronVersion} ...`);
const { rebuild } = await import('@electron/rebuild');
await rebuild({
  buildPath: nativeDir,
  electronVersion,
  force: true,
  onlyModules: ['better-sqlite3'],
});

const builtAddon = path.join(nativeDir, 'node_modules/better-sqlite3/build/Release/better_sqlite3.node');
if (!fs.existsSync(builtAddon)) {
  console.error(`[rebuild-native-for-electron] expected addon not found at ${builtAddon}`);
  process.exit(1);
}

// Sanity check: this build must NOT match the current Node process's own
// ABI, or something has gone wrong upstream (e.g. @electron/rebuild
// silently no-opped) and we'd be shipping the wrong binary without any
// error surfacing until Obsidian tries to load it.
const nodeAbi = process.versions.modules;
console.log(
  `[rebuild-native-for-electron] built ${builtAddon}\n` +
  `[rebuild-native-for-electron] current Node ABI (for reference, should differ): ${nodeAbi}`
);
console.log('[rebuild-native-for-electron] done. The workspace-hoisted better-sqlite3 used by `pnpm test` was not touched.');
