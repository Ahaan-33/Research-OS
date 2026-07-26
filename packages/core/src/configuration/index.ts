// Realizes Subsystem 13 for v0 scope: dimension registry only (Ambiguity
// Audit A8's registration act); weighting/projection registry use hardcoded
// defaults per Reference Implementation Strategy §7.
import type { Store } from '../persistent-research-state';
import * as writes from './registry-writes';
import { getDimension as readDimension } from '../persistent-research-state';
import type { DimensionDefinition, DimensionId, Result, WeightConfig } from '../types';

export function registerDimension(store: Store, def: DimensionDefinition): Result<DimensionId> {
  return writes.registerDimensionRow(store, def);
}

export function getDimension(store: Store, id: DimensionId): DimensionDefinition | undefined {
  return readDimension(store, id);
}

/** Hardcoded default per Doc17 §7 ("weighting/projection registry can start
 *  with hardcoded defaults"). Real registry deferred. */
export function defaultWeightConfig(): WeightConfig {
  return {
    weights: new Map(),
    agreeFns: new Map(),
  };
}
