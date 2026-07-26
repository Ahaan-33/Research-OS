// Encodes [[14-Provenance-Structure]] Theorem P1: PosBool(Acts) is a
// commutative, idempotent semiring (bounded distributive lattice).
import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { alternative, joint, mergeProvenance } from '../src/provenance';
import type { AtomicActRef } from '../src/types';

function act(id: string): AtomicActRef {
  return { id, actType: 'interpret', agent: 'test', timestamp: 0 };
}

const actArb = fc.constantFrom('a', 'b', 'c', 'd').map(act);
const exprArb = fc.array(fc.array(actArb, { maxLength: 3 }), { maxLength: 3 });

function setOfSets(expr: readonly (readonly AtomicActRef[])[]): string {
  return expr.map((s) => s.map((a) => a.id).sort().join('&')).sort().join('|');
}

describe('P1: PosBool(Acts) is an idempotent commutative semiring', () => {
  it('⊕ (alternative/merge) is idempotent', () => {
    fc.assert(fc.property(exprArb, (e) => {
      expect(setOfSets(mergeProvenance(e, e))).toBe(setOfSets(mergeProvenance(e, [])));
    }));
  });

  it('⊕ is commutative', () => {
    fc.assert(fc.property(exprArb, exprArb, (a, b) => {
      expect(setOfSets(mergeProvenance(a, b))).toBe(setOfSets(mergeProvenance(b, a)));
    }));
  });

  it('⊕ is associative', () => {
    fc.assert(fc.property(exprArb, exprArb, exprArb, (a, b, c) => {
      expect(setOfSets(mergeProvenance(mergeProvenance(a, b), c)))
        .toBe(setOfSets(mergeProvenance(a, mergeProvenance(b, c))));
    }));
  });

  it('absorption: a joint set that is a superset of another is absorbed', () => {
    const small = joint([act('a')]);
    const big = joint([act('a'), act('b')]);
    const merged = alternative(small, big);
    expect(merged.length).toBe(1); // `big` (superset of `small`) is absorbed
    expect(merged[0].map((x) => x.id).sort()).toEqual(['a']);
  });

  it('two distinct singleton acts remain distinct alternatives (no information lost)', () => {
    const merged = alternative(joint([act('a')]), joint([act('b')]));
    expect(merged.length).toBe(2);
  });
});
