// Per ADR-0006: esbuild bundles @ros/obsidian-plugin into a single main.js,
// with the Obsidian/Electron host APIs left external (provided at runtime).
import esbuild from 'esbuild';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = path.dirname(fileURLToPath(import.meta.url));

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
