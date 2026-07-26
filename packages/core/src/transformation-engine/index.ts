// Realizes [[07-Transformation-Algebra]] G1-G4 and the TransformationEngine
// interface of [[16-Subsystem-Interface-Contracts]]. Per ADR-0004, this is
// the only module permitted to import ../persistent-research-state/writes.
import { uuidv7 } from '../util/uuid7';
import type { Store } from '../persistent-research-state';
import * as writes from '../persistent-research-state/writes';
import { attribute, joint } from '../provenance';
import type { DependencyTracker } from '../dependency-tracker';
import type {
  ChangeSet, ChangeSetEntry, ContentKind, DimensionId, ElementId,
  ProvenanceExpr, Result,
} from '../types';

export interface SynthesisProposal {
  readonly snapshotBoundary: string;
  readonly writes: readonly { element: ElementId; dimension: DimensionId; value: unknown; prov: ProvenanceExpr }[];
  readonly newlyExamined: readonly { element: ElementId; dimension: DimensionId }[];
}

export class TransformationEngine {
  constructor(
    private readonly store: Store,
    private readonly tracker: DependencyTracker,
    private readonly agent: string = 'researcher',
  ) {}

  capture(payload: unknown, kind: ContentKind): Result<ElementId> {
    const id = uuidv7();
    const act = attribute('capture', this.agent);
    const res = writes.commitCapture(this.store, id, kind, payload, joint([act]));
    return this.finish(res, id ? new Set<ChangeSetEntry>([id]) : new Set());
  }

  supersede(old: ElementId, payload: unknown, kind: ContentKind): Result<ElementId> {
    const newId = uuidv7();
    const relId = uuidv7();
    const act = attribute('supersede', this.agent);
    const res = writes.commitSupersede(this.store, newId, old, kind, payload, relId, joint([act]));
    if (!res.ok) return res as unknown as Result<ElementId>;
    this.tracker.notify(new Set<ChangeSetEntry>([newId, old]), newId);
    return { ok: true, value: newId };
  }

  interpret(e: ElementId, d: DimensionId, v: unknown): Result<void> {
    const act = attribute('interpret', this.agent);
    const res = writes.commitInterpret(this.store, e, d, v, joint([act]));
    if (!res.ok) return res as unknown as Result<void>;
    this.tracker.notify(new Set<ChangeSetEntry>([res.value]), e);
    return { ok: true, value: undefined };
  }

  /** Called only by Subsystem 3 (Synthesis Engine) — deferred in v0 per
   *  Reference Implementation Strategy §7, but the commit path is complete
   *  and independently testable ahead of the Synthesis Engine's own build. */
  applySynthesisBatch(batch: SynthesisProposal): Result<ChangeSet> {
    const act = attribute('synthesis_run', 'synthesis_engine');
    const touched = new Set<ChangeSetEntry>();
    for (const w of batch.writes) {
      const res = writes.commitInterpret(this.store, w.element, w.dimension, w.value, joint([act]));
      if (!res.ok) return res as unknown as Result<ChangeSet>;
      touched.add(res.value);
    }
    for (const ex of batch.newlyExamined) {
      const res = writes.commitExamined(this.store, ex.element, ex.dimension);
      if (!res.ok) return res as unknown as Result<ChangeSet>;
      touched.add(res.value);
    }
    this.tracker.notify(touched, 'synthesis-run' as ElementId);
    return { ok: true, value: touched };
  }

  private finish(res: Result<ElementId>, changed: ChangeSet): Result<ElementId> {
    if (res.ok) this.tracker.notify(changed, res.value);
    return res;
  }
}
