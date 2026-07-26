// Subsystem 13's own write path. Per [[16-Subsystem-Interface-Contracts]]:
// dimension registration "is not routed through TransformationEngine.commit
// at all, since it never touches E or I." Not subject to ADR-0004's boundary
// (that boundary is specifically about E/I's write gate).
import type { Store } from '../persistent-research-state';
import { dimensionExists } from '../persistent-research-state';
import type { DimensionDefinition, DimensionId, Result } from '../types';

export function registerDimensionRow(store: Store, def: DimensionDefinition): Result<DimensionId> {
  if (dimensionExists(store, def.dimension)) {
    return { ok: false, error: { code: 'DUPLICATE_DIMENSION', dimension: def.dimension } };
  }
  store.db.prepare('INSERT INTO dimensions (id, value_space, registered_at, registered_by) VALUES (?,?,?,?)')
    .run(def.dimension, JSON.stringify(def.valueSpace), def.registeredAt, JSON.stringify(def.registeredBy));
  return { ok: true, value: def.dimension };
}
