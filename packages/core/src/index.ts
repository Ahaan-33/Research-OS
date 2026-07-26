// Public surface of @ros/core. Everything importable from '@ros/core' by
// @ros/obsidian-plugin or any future consumer. Deliberately does NOT export
// anything from persistent-research-state/writes — see ADR-0004.
export * from './types';

export { openStore, closeStore } from './persistent-research-state';
export type { Store } from './persistent-research-state';
export {
  getElement, getDimension, getCoordinate, currentElements, conflictRegions, snapshot,
} from './persistent-research-state';

export { TransformationEngine } from './transformation-engine';
export type { SynthesisProposal } from './transformation-engine';

export { DependencyTracker } from './dependency-tracker';

export { registerDimension, getDimension as getDimensionConfig, defaultWeightConfig } from './configuration';

export { proximity } from './semantic-computation';

export { render as renderProjection } from './projection-engine';

export { attribute, compose, joint, alternative, mergeProvenance } from './provenance';
