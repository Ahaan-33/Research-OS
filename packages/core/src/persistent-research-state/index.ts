// Public surface of Subsystem 1 within the package. Deliberately does NOT
// re-export ./writes — that module is reachable only from
// ../transformation-engine/, enforced by eslint.config.js (ADR-0004).
export { openStore, closeStore } from './db';
export type { Store } from './db';
export {
  getElement, getDimension, getCoordinate, currentElements, conflictRegions,
  snapshot, elementExists, dimensionExists, supersessionChainContains,
} from './reads';
