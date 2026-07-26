// Encodes [[10-Projection-Formalism]] T14 and the v0 operator scope fixed
// by Reference Implementation Strategy §7.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { openStore, closeStore, type Store } from '../src/persistent-research-state';
import { TransformationEngine } from '../src/transformation-engine';
import { DependencyTracker } from '../src/dependency-tracker';
import { registerDimension } from '../src/configuration';
import { attribute, joint } from '../src/provenance';
import { render } from '../src/projection-engine';

let store: Store;
let engine: TransformationEngine;

beforeEach(() => {
  store = openStore(':memory:');
  engine = new TransformationEngine(store, new DependencyTracker());
  registerDimension(store, {
    dimension: 'thread', valueSpace: { kind: 'freeText' },
    registeredAt: Date.now(), registeredBy: joint([attribute('capture', 'test')]),
  });
});
afterEach(() => closeStore(store));

describe('Projection Engine (v0: thread_view, timeline only)', () => {
  it('renders thread_view with conflictFaithful = true', () => {
    const cap = engine.capture({}, 'observation');
    if (cap.ok) engine.interpret(cap.value, 'thread', 'alpha');
    const view = render(store, { operator: 'thread_view', parameters: {} });
    expect(view.conflictFaithful).toBe(true);
  });

  it('renders timeline with conflictFaithful = true', () => {
    engine.capture({}, 'observation');
    const view = render(store, { operator: 'timeline', parameters: {} });
    expect(view.conflictFaithful).toBe(true);
  });

  it('rejects deferred operators explicitly rather than rendering something unfaithful', () => {
    expect(() => render(store, { operator: 'semantic_map', parameters: {} })).toThrow();
  });
});
