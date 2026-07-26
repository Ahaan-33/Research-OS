// Realizes [[08-Semantic-Distance-and-Meaning]] D16 (proximity), scoped to
// proximity only per Reference Implementation Strategy §7 ("defer
// clustering/topology until proximity itself is validated"). Hand-written
// agree() functions per §5 — no embedding model in v0.
import type { Store } from '../persistent-research-state';
import { getCoordinate } from '../persistent-research-state';
import type { AgreeFnRef, DimensionId, ElementId, WeightConfig } from '../types';

function agree(fn: AgreeFnRef, a: unknown, b: unknown): number {
  if (a === undefined || b === undefined) return 0; // D16: agree(∅, V) = 0
  switch (fn) {
    case 'enum-overlap':
    case 'ref-equality':
    case 'freetext-equality':
      return a === b ? 1 : 0;
    case 'scalar-decay': {
      if (typeof a !== 'number' || typeof b !== 'number') return 0;
      return Math.max(0, 1 - Math.abs(a - b));
    }
    default:
      return 0;
  }
}

/** proximity(e1,e2), per D16: weighted sum of per-dimension agreement over
 *  every dimension both elements have a coordinate for. */
export function proximity(store: Store, e1: ElementId, e2: ElementId, config: WeightConfig): number {
  let total = 0;
  let weightSum = 0;
  for (const [dim, w] of config.weights) {
    const c1 = getCoordinate(store, e1, dim as DimensionId);
    const c2 = getCoordinate(store, e2, dim as DimensionId);
    const v1 = c1?.values[0]?.value;
    const v2 = c2?.values[0]?.value;
    const fn = config.agreeFns.get(dim) ?? 'freetext-equality';
    total += w * agree(fn, v1, v2);
    weightSum += w;
  }
  return weightSum === 0 ? 0 : total / weightSum;
}
