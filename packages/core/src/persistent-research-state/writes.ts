// Internal write path. Per ADR-0004 this module is importable ONLY from
// ../transformation-engine/ — enforced by eslint.config.js at the repo root.
// This is the ONE place `commit`-equivalent writes to elements.db actually
// happen; it is Subsystem 1's write gate, invoked exclusively by Subsystem 2.
import type { Store } from './db';
import * as reads from './reads';
import type {
  ChangeSetEntry, ContentElement, ContentKind, CoordinateValue, DimensionDefinition,
  Element, ElementId, LegalityViolation, ProvenanceExpr, Result, RelationElement, DimensionId,
} from '../types';

function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}
function err<T>(error: LegalityViolation): Result<T> {
  return { ok: false, error };
}

function insertElementRow(store: Store, e: Element): void {
  store.db.prepare(
    `INSERT INTO elements (id, role, kind, relation_type, endpoints, payload, prov) VALUES (?,?,?,?,?,?,?)`,
  ).run(
    e.id, e.role,
    e.role === 'content' ? (e as ContentElement).kind : null,
    e.role === 'relation' ? (e as RelationElement).relationType : null,
    e.role === 'relation' ? JSON.stringify((e as RelationElement).endpoints) : null,
    e.role === 'content' ? JSON.stringify((e as ContentElement).payload) : null,
    JSON.stringify(e.prov),
  );
}

function logEvent(store: Store, actType: string, payload: unknown): void {
  store.db.prepare('INSERT INTO events (act_type, payload, committed_at) VALUES (?,?,?)')
    .run(actType, JSON.stringify(payload), Date.now());
}

/** D10.1/E1: reject a Capture whose minted identity already exists. */
export function commitCapture(
  store: Store, id: ElementId, kind: ContentKind, payload: unknown, prov: ProvenanceExpr,
): Result<ChangeSetEntry> {
  if (reads.elementExists(store, id)) return err({ code: 'DUPLICATE_ID', id });
  const el: ContentElement = { id, role: 'content', kind, payload, prov };
  const tx = store.db.transaction(() => {
    insertElementRow(store, el);
    logEvent(store, 'capture', el);
  });
  tx();
  return ok(id);
}

/** T-Supersede-Distinct: Capture of a reserved-type relation, plus D10.4/E3's
 *  bounded acyclicity check (walk `old`'s own chain — see reads.supersessionChainContains). */
export function commitSupersede(
  store: Store, newId: ElementId, old: ElementId, kind: ContentKind, payload: unknown,
  relId: ElementId, prov: ProvenanceExpr,
): Result<[ChangeSetEntry, ChangeSetEntry]> {
  if (!reads.elementExists(store, old)) return err({ code: 'UNKNOWN_ELEMENT', element: old });
  if (reads.elementExists(store, newId)) return err({ code: 'DUPLICATE_ID', id: newId });
  // A cycle can only be introduced by this one new edge (new -> old); check
  // whether `old`'s existing chain already (transitively) reaches `newId`.
  if (reads.supersessionChainContains(store, old, newId)) {
    return err({ code: 'SUPERSESSION_CYCLE', old, next: newId });
  }
  const content: ContentElement = { id: newId, role: 'content', kind, payload, prov };
  const rel: RelationElement = { id: relId, role: 'relation', relationType: 'supersedes', endpoints: [newId, old], prov };
  const tx = store.db.transaction(() => {
    insertElementRow(store, content);
    insertElementRow(store, rel);
    store.db.prepare('INSERT INTO supersessions (new_id, old_id) VALUES (?,?)').run(newId, old);
    logEvent(store, 'supersede', { content, rel });
  });
  tx();
  return ok([newId, relId]);
}

/** D10.3/E2: dimension must be registered; value must pass its ValueSpaceSpec.
 *  G3: set-valued enlargement — a repeated identical value is idempotent
 *  (INSERT is skipped if an identical value already present for this pair). */
export function commitInterpret(
  store: Store, element: ElementId, dimension: DimensionId, value: unknown, prov: ProvenanceExpr,
): Result<ChangeSetEntry> {
  if (!reads.elementExists(store, element)) return err({ code: 'UNKNOWN_ELEMENT', element });
  const dim = reads.getDimension(store, dimension);
  if (!dim) return err({ code: 'UNKNOWN_DIMENSION', dimension });
  if (!validateValue(dim, value)) return err({ code: 'INVALID_VALUE', dimension, value });

  const existing = reads.getCoordinate(store, element, dimension);
  const already = existing?.values.some((v) => JSON.stringify(v.value) === JSON.stringify(value));
  const tx = store.db.transaction(() => {
    if (!already) {
      const seq = existing ? existing.values.length : 0;
      store.db.prepare(
        'INSERT INTO coordinate_values (element, dimension, seq, value, prov, written_at) VALUES (?,?,?,?,?,?)',
      ).run(element, dimension, seq, JSON.stringify(value), JSON.stringify(prov), Date.now());
      logEvent(store, 'interpret', { element, dimension, value, prov });
    }
  });
  tx();
  return ok(`${element}:${dimension}` as ChangeSetEntry);
}

/** Marks an (element,dimension) pair examined-with-nothing-found (D14). */
export function commitExamined(store: Store, element: ElementId, dimension: DimensionId): Result<ChangeSetEntry> {
  if (!reads.elementExists(store, element)) return err({ code: 'UNKNOWN_ELEMENT', element });
  if (!reads.dimensionExists(store, dimension)) return err({ code: 'UNKNOWN_DIMENSION', dimension });
  store.db.prepare('INSERT OR IGNORE INTO coordinate_status (element, dimension, status) VALUES (?,?,?)')
    .run(element, dimension, 'examined');
  return ok(`${element}:${dimension}` as ChangeSetEntry);
}

// NOTE: dimension registration is deliberately NOT here. Per
// [[16-Subsystem-Interface-Contracts]] Subsystem 13, registering a dimension
// "is a configuration-registry act... rather than a legal-state-mutating
// generator" — it never touches E or I, so it is not routed through this
// gate at all. See ../configuration/registry-writes.ts.

function validateValue(dim: DimensionDefinition, value: unknown): boolean {
  const vs = dim.valueSpace;
  switch (vs.kind) {
    case 'enum': return typeof value === 'string' && (vs.values as readonly string[]).includes(value);
    case 'scalar': {
      if (typeof value !== 'number') return false;
      if (vs.min !== undefined && value < vs.min) return false;
      if (vs.max !== undefined && value > vs.max) return false;
      return true;
    }
    case 'ref': return typeof value === 'string';
    case 'freeText': return typeof value === 'string';
    default: return false;
  }
}

export type { CoordinateValue };
