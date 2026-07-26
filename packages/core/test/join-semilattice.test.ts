// Encodes [[06-Research-State-Mathematics]] Theorem T1: (E, ⊔) is a
// join-semilattice — commutative, idempotent, associative — per ADR-0005.
import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import type { Element } from '../src/types';

/** Pure ⊔ on EvidenceSet, keyed by identity (D4) — set union. Not used at
 *  runtime in v0 (no multi-writer sync yet), but T1 is a claim about the
 *  mathematical object regardless of storage engine. */
function merge(a: readonly Element[], b: readonly Element[]): Element[] {
  const byId = new Map<string, Element>();
  for (const e of [...a, ...b]) byId.set(e.id, e);
  return [...byId.values()].sort((x, y) => x.id.localeCompare(y.id));
}

const elementArb = fc.record({
  id: fc.uuid(),
  role: fc.constant('content' as const),
  kind: fc.constant('observation' as const),
  payload: fc.string(),
  prov: fc.constant([]),
});

const evidenceSetArb = fc.array(elementArb, { maxLength: 8 });

describe('T1: (E, ⊔) is a join-semilattice', () => {
  it('is idempotent: merge(A,A) = A', () => {
    fc.assert(fc.property(evidenceSetArb, (a) => {
      expect(merge(a, a)).toEqual(merge(a, []));
    }));
  });

  it('is commutative: merge(A,B) = merge(B,A)', () => {
    fc.assert(fc.property(evidenceSetArb, evidenceSetArb, (a, b) => {
      expect(merge(a, b)).toEqual(merge(b, a));
    }));
  });

  it('is associative: merge(merge(A,B),C) = merge(A,merge(B,C))', () => {
    fc.assert(fc.property(evidenceSetArb, evidenceSetArb, evidenceSetArb, (a, b, c) => {
      expect(merge(merge(a, b), c)).toEqual(merge(a, merge(b, c)));
    }));
  });
});
