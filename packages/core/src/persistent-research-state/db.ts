// Per ADR-0002 (better-sqlite3, desktop-only for v0, WAL mode) and ADR-0003
// (hand-written migrations, no ORM).
import Database from 'better-sqlite3';
import * as fs from 'node:fs';
import * as path from 'node:path';

export interface Store {
  readonly db: Database.Database;
}

// Fallback only: correct for the test suite (plain Node, unbundled — this
// file's __dirname is its real source location, and migrations already
// live next to it there). NEVER relied on once bundled — see ADR-0008.
const DEFAULT_MIGRATIONS_DIR = path.join(__dirname, 'migrations');

function migrationFiles(migrationsDir: string): string[] {
  return fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
}

function currentVersion(db: Database.Database): number {
  const row = db.prepare('SELECT MAX(version) as v FROM schema_version').get() as { v: number | null } | undefined;
  return row?.v ?? 0;
}

/** Opens (creating if absent) a ROS store at `filePath`, applying any
 *  un-applied migrations in numeric order. `filePath === ':memory:'` is
 *  supported and used throughout the test suite.
 *
 *  `nativeBindingPath`, if given, is passed through to better-sqlite3 as
 *  its `nativeBinding` option — see ADR-0007. Omit it only in contexts
 *  where better-sqlite3's own `bindings()` auto-resolution is reliable
 *  (plain Node, e.g. the test suite); a bundled Obsidian plugin must
 *  always supply it.
 *
 *  `migrationsDir`, if given, overrides where `.sql` migration files are
 *  read from. Omit it only in the test suite; a bundled Obsidian plugin
 *  must always supply it — `__dirname` inside the bundle is not a
 *  reliable stand-in for the plugin's install directory. See ADR-0008. */
export function openStore(filePath: string, nativeBindingPath?: string, migrationsDir?: string): Store {
  const db = new Database(filePath, nativeBindingPath ? { nativeBinding: nativeBindingPath } : undefined);
  db.pragma('journal_mode = WAL');
  db.exec('CREATE TABLE IF NOT EXISTS schema_version (version INTEGER NOT NULL)');
  const applied = currentVersion(db);
  const dir = migrationsDir ?? DEFAULT_MIGRATIONS_DIR;
  const files = migrationFiles(dir);
  for (const file of files) {
    const version = Number(file.split('_')[0]);
    if (version > applied) {
      const sql = fs.readFileSync(path.join(dir, file), 'utf8');
      db.exec(sql);
      db.prepare('INSERT INTO schema_version (version) VALUES (?)').run(version);
    }
  }
  return { db };
}

export function closeStore(store: Store): void {
  store.db.close();
}
