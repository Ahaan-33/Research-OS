// Per ADR-0002 (better-sqlite3, desktop-only for v0, WAL mode) and ADR-0003
// (hand-written migrations, no ORM).
import Database from 'better-sqlite3';
import * as fs from 'node:fs';
import * as path from 'node:path';

export interface Store {
  readonly db: Database.Database;
}

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

function migrationFiles(): string[] {
  return fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort();
}

function currentVersion(db: Database.Database): number {
  const row = db.prepare('SELECT MAX(version) as v FROM schema_version').get() as { v: number | null } | undefined;
  return row?.v ?? 0;
}

/** Opens (creating if absent) a ROS store at `filePath`, applying any
 *  un-applied migrations in numeric order. `filePath === ':memory:'` is
 *  supported and used throughout the test suite. */
export function openStore(filePath: string): Store {
  const db = new Database(filePath);
  db.pragma('journal_mode = WAL');
  db.exec('CREATE TABLE IF NOT EXISTS schema_version (version INTEGER NOT NULL)');
  const applied = currentVersion(db);
  const files = migrationFiles();
  for (const file of files) {
    const version = Number(file.split('_')[0]);
    if (version > applied) {
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
      db.exec(sql);
      db.prepare('INSERT INTO schema_version (version) VALUES (?)').run(version);
    }
  }
  return { db };
}

export function closeStore(store: Store): void {
  store.db.close();
}
