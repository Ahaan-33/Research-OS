// Encodes [[06-Research-State-Mathematics]] Theorem T2: (I, ⊔) is a
// conflict-preserving multi-value-register merge — idempotent, commutative,
// associative, and never silently drops a conflicting value.
import { describe, expect, it } from 'vitest';
import fc from 'fast-check';

type Slot = ReadonlySet<string>; // I(e,d) as a set of stringified values

function mergeSlot(a: Slot, b: Slot): Slot {
  return new Set([...a, ...b]);
}

const slotArb = fc.array(fc.string({ minLength: 1, maxLength: 3 }), { maxLength: 5 }).map((xs) => new Set(xs));

describe('T2: (I, ⊔) is a multi-value-register merge', () => {
  it('is idempotent', () => {
    fc.assert(fc.property(slotArb, (a) => {
      expect(mergeSlot(a, a)).toEqual(a);
    }));
  });

  it('is commutative', () => {
    fc.assert(fc.property(slotArb, slotArb, (a, b) => {
      expect(mergeSlot(a, b)).toEqual(mergeSlot(b, a));
    }));
  });

  it('is associative', () => {
    fc.assert(fc.property(slotArb, slotArb, slotArb, (a, b, c) => {
      expect(mergeSlot(mergeSlot(a, b), c)).toEqual(mergeSlot(a, mergeSlot(b, c)));
    }));
  });

  it('never drops a conflicting value: two distinct singletons merge to a size-2 set', () => {
    fc.assert(fc.property(
      fc.tuple(fc.string({ minLength: 1 }), fc.string({ minLength: 1 })).filter(([x, y]) => x !== y),
      ([v1, v2]) => {
        const merged = mergeSlot(new Set([v1]), new Set([v2]));
        expect(merged.size).toBe(2);
        expect(merged.has(v1)).toBe(true);
        expect(merged.has(v2)).toBe(true);
      },
    ));
  });
});
