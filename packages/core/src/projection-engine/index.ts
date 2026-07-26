// Realizes [[10-Projection-Formalism]] D28 for the two v0 operators
// (Reference Implementation Strategy §7: "Thread View and Timeline only").
// T14 (conflict-faithfulness) is enforced structurally: every emitted
// ViewData.content entry carries an explicit `conflicted` flag rather than
// a silently-averaged aggregate.
import type { Store } from '../persistent-research-state';
import { conflictRegions, currentElements, getElement, getCoordinate } from '../persistent-research-state';
import type { DimensionId, ElementId, ProjectionOperator, QueryDefinition, ViewData } from '../types';

interface ThreadEntry { readonly element: ElementId; readonly conflicted: boolean }
interface TimelineEntry { readonly element: ElementId; readonly writtenAt: number; readonly conflicted: boolean }

const SUPPORTED: ReadonlySet<ProjectionOperator> = new Set(['thread_view', 'timeline']);

export function render(store: Store, q: QueryDefinition): ViewData {
  if (!SUPPORTED.has(q.operator)) {
    throw new Error(
      `Projection operator '${q.operator}' is deferred per Reference Implementation Strategy §7 ` +
      `(only thread_view and timeline are implemented in v0).`,
    );
  }
  const conflicted = new Set(conflictRegions(store).map(([e, d]) => `${e}\u0000${d}`));
  const elementConflicted = (e: ElementId): boolean =>
    [...conflicted].some((k) => k.startsWith(`${e}\u0000`));

  if (q.operator === 'thread_view') {
    const threadDim = (q.parameters['dimension'] ?? 'thread') as DimensionId;
    const content: ThreadEntry[] = currentElements(store)
      .filter((e) => getCoordinate(store, e, threadDim) !== undefined)
      .map((e) => ({ element: e, conflicted: elementConflicted(e) }));
    return { operator: 'thread_view', abstraction: 'finest', content, conflictFaithful: true };
  }

  // timeline
  const content: TimelineEntry[] = currentElements(store)
    .map((e) => {
      const el = getElement(store, e)!;
      const t = el.prov[0]?.[0]?.timestamp ?? 0;
      return { element: e, writtenAt: t, conflicted: elementConflicted(e) };
    })
    .sort((a, b) => a.writtenAt - b.writtenAt);
  return { operator: 'timeline', abstraction: 'finest', content, conflictFaithful: true };
}
