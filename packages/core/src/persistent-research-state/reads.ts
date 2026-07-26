// Read-only surface of Subsystem 1, per [[16-Subsystem-Interface-Contracts]]
// (`snapshot`, `getElement`, `getCoordinate`, `getDimension`, `currentElements`,
// `conflictRegions`). Every subsystem may import this module. Only
// transformation-engine/ may additionally import ./writes (ADR-0004).
import type { Store } from './db';
import type {
  ChangeSetEntry, CoordinateEntry, CoordinateValue, DimensionDefinition, Element,
  ElementId, DimensionId, ProvenanceExpr, ResearchState,
} from '../types';

interface ElementRow {
  id: string; role: 'content' | 'relation'; kind: string | null;
  relation_type: string | null; endpoints: string | null; payload: string | null; prov: string;
}

function rowToElement(row: ElementRow): Element {
  const prov = JSON.parse(row.prov) as ProvenanceExpr;
  if (row.role === 'content') {
    return { id: row.id, role: 'content', kind: row.kind as Element extends { kind: infer K } ? K : never, payload: row.payload ? JSON.parse(row.payload) : null, prov };
  }
  return { id: row.id, role: 'relation', relationType: row.relation_type!, endpoints: JSON.parse(row.endpoints!), prov };
}

export function getElement(store: Store, id: ElementId): Element | undefined {
  const row = store.db.prepare('SELECT * FROM elements WHERE id = ?').get(id) as ElementRow | undefined;
  return row ? rowToElement(row) : undefined;
}

export function getDimension(store: Store, id: DimensionId): DimensionDefinition | undefined {
  const row = store.db.prepare('SELECT * FROM dimensions WHERE id = ?').get(id) as
    { id: string; value_space: string; registered_at: number; registered_by: string } | undefined;
  if (!row) return undefined;
  return {
    dimension: row.id,
    valueSpace: JSON.parse(row.value_space),
    registeredAt: row.registered_at,
    registeredBy: JSON.parse(row.registered_by),
  };
}

export function getCoordinate(store: Store, element: ElementId, dimension: DimensionId): CoordinateEntry | undefined {
  const valueRows = store.db
    .prepare('SELECT value, prov, written_at FROM coordinate_values WHERE element = ? AND dimension = ? ORDER BY seq')
    .all(element, dimension) as { value: string; prov: string; written_at: number }[];
  const statusRow = store.db
    .prepare('SELECT status FROM coordinate_status WHERE element = ? AND dimension = ?')
    .get(element, dimension) as { status: string } | undefined;
  if (valueRows.length === 0 && !statusRow) return undefined; // absent = never touched (D14)
  const values: CoordinateValue[] = valueRows.map((r) => ({
    value: JSON.parse(r.value), prov: JSON.parse(r.prov), writtenAt: r.written_at,
  }));
  return { element, dimension, values, status: statusRow ? 'examined' : 'unexamined' };
}

/** Current(E): elements never named as `old` (endpoints[1]) by a supersedes relation. */
export function currentElements(store: Store): ElementId[] {
  const rows = store.db
    .prepare(`SELECT id FROM elements WHERE id NOT IN (SELECT old_id FROM supersessions)`)
    .all() as { id: string }[];
  return rows.map((r) => r.id);
}

/** Conflicts(S): (element,dimension) pairs with >= 2 distinct recorded values. */
export function conflictRegions(store: Store): [ElementId, DimensionId][] {
  const rows = store.db
    .prepare(`SELECT element, dimension FROM coordinate_values GROUP BY element, dimension HAVING COUNT(DISTINCT value) >= 2`)
    .all() as { element: string; dimension: string }[];
  return rows.map((r) => [r.element, r.dimension]);
}

export function snapshot(store: Store): ResearchState {
  const elementRows = store.db.prepare('SELECT * FROM elements').all() as ElementRow[];
  const evidence = elementRows.map(rowToElement);
  const coordRows = store.db.prepare('SELECT DISTINCT element, dimension FROM coordinate_values').all() as
    { element: string; dimension: string }[];
  const statusOnlyRows = store.db.prepare('SELECT element, dimension FROM coordinate_status').all() as
    { element: string; dimension: string }[];
  const keys = new Set([...coordRows, ...statusOnlyRows].map((r) => `${r.element}\u0000${r.dimension}`));
  const interpretation = [...keys].map((k) => {
    const [element, dimension] = k.split('\u0000');
    return getCoordinate(store, element, dimension)!;
  });
  const dimRows = store.db.prepare('SELECT id FROM dimensions').all() as { id: string }[];
  const dimensions = dimRows.map((r) => getDimension(store, r.id)!);
  return { evidence, interpretation, dimensions };
}

export function elementExists(store: Store, id: ElementId): boolean {
  return store.db.prepare('SELECT 1 FROM elements WHERE id = ?').get(id) !== undefined;
}

export function dimensionExists(store: Store, id: DimensionId): boolean {
  return store.db.prepare('SELECT 1 FROM dimensions WHERE id = ?').get(id) !== undefined;
}

/** Walks the supersession chain backward from `old`, for E3's bounded acyclicity
 *  check — finite by construction (D4.1/E1: every step mints a fresh identity). */
export function supersessionChainContains(store: Store, old: ElementId, target: ElementId): boolean {
  let frontier = [old];
  const seen = new Set<string>();
  while (frontier.length > 0) {
    const next: string[] = [];
    for (const id of frontier) {
      if (id === target) return true;
      if (seen.has(id)) continue;
      seen.add(id);
      const rows = store.db.prepare('SELECT old_id FROM supersessions WHERE new_id = ?').all(id) as { old_id: string }[];
      next.push(...rows.map((r) => r.old_id));
    }
    frontier = next;
  }
  return false;
}

export type { ChangeSetEntry };
