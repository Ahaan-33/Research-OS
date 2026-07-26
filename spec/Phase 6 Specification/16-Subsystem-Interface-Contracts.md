# Research Operating System — Subsystem Interface Contracts

### Phase 6 Implementation · Document 3 of N

### Version 0.1

---

## Purpose

_[[12-System-Architecture-First-Draft]]_ fixed thirteen subsystem boundaries and described their interfaces in prose ("what crosses the boundary, in which direction"). _[[13-Runtime-Architecture]]_ fixed the order in which those crossings happen. _[[15-Canonical-Data-Model]]_ fixed the shape of everything Subsystem 1 durably holds. None of these fixed the actual **operation signatures** — the callable surface each subsystem exposes to its neighbors. This document supplies exactly that: one signature block per subsystem, typed against _[[15-Canonical-Data-Model]]_'s schema, with nothing added that Document 12 did not already assign to that subsystem's responsibility.

This document also closes the two structural Open Questions _[[12-System-Architecture-First-Draft]]_ left explicitly unresolved (Indexing's one-vs-two-component shape; Synthesis/Transformation's process topology), because defining an actual callable interface is exactly the point at which those questions stop being deferrable — a signature either has one entry point or two; there is no third, vaguer option once the exercise is "write the interface down."

References back to: _[[12-System-Architecture-First-Draft]]_ (the thirteen boundaries), _[[13-Runtime-Architecture]]_ (the call order these signatures are invoked in), _[[15-Canonical-Data-Model]]_ (the types these signatures pass), _[[14-Provenance-Structure]]_ (`ProvenanceExpr`, used throughout). References forward to: none — this is, like Document 12, offered for critique, and is the last document before a concrete implementation language must be chosen.

---

## Conventions

Signatures use _[[15-Canonical-Data-Model]]_'s notation, extended with `->` for a synchronous return and `~>` for an operation that only ever notifies (fire-and-forget, no return value consulted by the caller). Every operation that can be rejected returns a tagged result, `Ok<T> | Rejected(reason)`, rather than throwing — rejection is data, not an exceptional control path, because D10's legality check is a **normal, expected outcome** of a write attempt (an illegal transition is refused, not crashed on), consistent with _[[13-Runtime-Architecture]]_'s Failure Recovery table treating a rejected commit as ordinary behavior, not a fault.

No subsystem below is given a method that _[[12-System-Architecture-First-Draft]]_ did not already authorize for it. Where this document introduces a type not in _[[15-Canonical-Data-Model]]_, it is a **transient** type — never durably stored by the subsystem that produces it — and is marked as such.

---

## Shared Supporting Types

These are used by more than one subsystem below and are defined once here rather than repeated:

```
type ChangeSet = Set<ElementId | (ElementId, DimensionId)>
    // Δ, per [[13-Runtime-Architecture]] §4 — the exact grain Locality (06) requires:
    // element identity, or (element,dimension) pair — nothing coarser is ever emitted.

record DirtySignal {
    scope: ChangeSet,
    causedBy: ElementId,   // the Transformation Engine commit (itself an Element/act reference) that produced this Δ
}

type AbstractionParameter = Abs   // an abstraction level, [[08-Semantic-Distance-and-Meaning]] D18, [[09-Topology-of-Research]] D22/D23

record QueryDefinition {
    operator: "semantic_map" | "timeline" | "thread_view" | "tree" | "dashboard" | "publication_view",
    // [[10-Projection-Formalism]]'s six named instances of Project (D28); an implementation
    // may register additional operators (D28 is a functor family, not a closed enum) —
    // this list is the six the mathematics has already worked examples for.
    parameters: Map<string, string>,   // operator-specific (e.g. thread_view needs a DimensionId naming which thread dimension)
}

type ViewData = record {
    operator: string,
    abstraction: AbstractionParameter,
    content: OperatorSpecificViewContent,   // shape fixed per D28 instance; opaque at this contract's level,
                                             // meaningful to the Visualization Layer's renderer for that operator
    conflictFaithful: boolean,              // T14 — every entry MUST be true; false is a construction error, never emitted
}   // transient — never persisted by Subsystem 1; may be cached by Subsystem 7 only

record Suggestion {
    kind: "metadata_candidate" | "similarity_ranking" | "next_action",
    target: ElementId | (ElementId, DimensionId),
    candidateValue: V_d?,      // present only for metadata_candidate
    score: number,             // ∈ [0,1], continuous — per Ambiguity Audit A11, never a relationship-category label
    explanation: string?,      // human-readable, optional
}   // transient — Subsystem 6's output type; structurally never `Legal` (see Subsystem 6, below)

record ProximityGraphSlice {
    threshold: number,          // θ, [[09-Topology-of-Research]] D21
    edges: Set<(ElementId, ElementId, number)>,   // (e, e', proximity(e,e'))
    clusters: Map<ElementId, ClusterId>,          // D21 connected components
    boundaries: Set<ElementId>,                    // D-Boundary
    bridges: Set<(ElementId, ElementId)>,          // D-Bridge, [[09-Topology-of-Research]] T9
}   // transient — Subsystem 4's cache content; never persisted as authoritative

record WeightConfig {
    weights: Map<DimensionId, number>,   // w(d) ≥ 0, [[08-Semantic-Distance-and-Meaning]] D16
    agreeFns: Map<DimensionId, AgreeFnRef>,  // reference to a registered agree() implementation per dimension
}
```

---

## Subsystem 1 — Persistent Research State

Per _[[12-System-Architecture-First-Draft]]_: exactly one writer path (the Transformation Engine), read access to everyone.

```
interface PersistentResearchState {
    // Write surface — callable ONLY by Subsystem 2. No other subsystem's module
    // is compiled against this method at all (INV-9/INV-10/INV-11, structurally).
    commit(next: ResearchState) -> Ok<ChangeSet> | Rejected(LegalityViolation)

    // Read surface — callable by any subsystem; always returns a consistent snapshot
    // (never a torn read, per [[13-Runtime-Architecture]] §9's atomicity guarantee).
    snapshot() -> ResearchState
    getElement(id: ElementId) -> Element?
    getCoordinate(e: ElementId, d: DimensionId) -> CoordinateEntry?
    getDimension(d: DimensionId) -> DimensionDefinition?
    currentElements() -> Set<ElementId>          // Current(E), D8's derived predicate, index-backed per [[15-Canonical-Data-Model]]
    conflictRegions() -> Set<(ElementId, DimensionId)>   // Conflicts(S), index-backed per [[15-Canonical-Data-Model]]
}
```

`commit` is the single method through which D10's legality predicate (`isLegal`, _[[15-Canonical-Data-Model]]_) is checked and, on success, applied atomically. `LegalityViolation` names which of D10.1–D10.4 failed — returned, not thrown, per the Conventions above, since Subsystem 2 is expected to inspect and report it (e.g., surfacing E1's collision case or E3's cycle case back to the researcher meaningfully, rather than a generic failure).

---

## Subsystem 2 — Transformation Engine

The sole caller of Subsystem 1's `commit`. Exposes exactly the four generators plus the Completion Gate's single entry point (the latter is Subsystem 11's, not Subsystem 2's own — Subsystem 2 only receives it as a request shape, see Subsystem 11).

```
interface TransformationEngine {
    capture(payload: ContentPayload, kind: ContentKind) -> Ok<ElementId> | Rejected(reason)
    supersede(old: ElementId, payload: ContentPayload, kind: ContentKind) -> Ok<ElementId> | Rejected(reason)
    interpret(e: ElementId, d: DimensionId, v: V_d) -> Ok<()> | Rejected(reason)
    applySynthesisBatch(batch: SynthesisProposal) -> Ok<ChangeSet> | Rejected(reason)   // called only by Subsystem 3
}

record SynthesisProposal {
    snapshotBoundary: SnapshotToken,       // identifies the frozen E this batch was computed against
    writes: CoordinateValue[]  indexed by (ElementId, DimensionId),
    newlyExamined: (ElementId, DimensionId)[],   // D14 examined/empty entries, per the Synthesis Engine's "checked, found nothing" case
}   // transient — Subsystem 3's sole output type; never itself persisted
```

Each of `capture`/`supersede`/`interpret` performs, internally, exactly the four-step sequence _[[13-Runtime-Architecture]]_ §1 already fixed: request attribution from Subsystem 12, mint identity/enlarge coordinate as appropriate, construct the candidate `ResearchState`, call `PersistentResearchState.commit`. `applySynthesisBatch` performs the same sequence for a whole batch as one atomic commit (_[[13-Runtime-Architecture]]_ §2). On any `Ok`, this subsystem additionally calls Subsystem 9's `notify` (below) with the returned `ChangeSet` — this is the seed of invalidation, exactly as _[[12-System-Architecture-First-Draft]]_ names it.

**Note on `supersede`'s return type.** It returns one `ElementId` (the new element) even though, per T-Supersede-Distinct (_[[07-Transformation-Algebra]]_), the underlying `commit` call adds two elements (the new content element and the reserved-type relation element). The relation element's identity is retrievable via `getElement`/graph traversal if needed, but is not returned directly — callers reason about supersession in terms of "what replaced what," not "what two elements did this operation mint," matching how every other document in the vault discusses Supersede.

---

## Subsystem 3 — Synthesis Engine

```
interface SynthesisEngine {
    run(boundary: SnapshotToken) -> SynthesisProposal
}
```

One method. `run` reads `PersistentResearchState.snapshot()` (frozen at `boundary`), reads `SemanticComputationLayer` and `LocalIntelligence` advisorially (both below), and returns a `SynthesisProposal` — it never calls `TransformationEngine` itself; `[[13-Runtime-Architecture]]` §2 already fixed that the caller of `run` (Event Processing, Subsystem 10) is responsible for handing the returned proposal onward to `TransformationEngine.applySynthesisBatch`. This single-method, purely-functional-from-a-snapshot shape is precisely what makes reproducibility (INV-23's conformance obligation) independently testable: `run(boundary)` called twice against the same `boundary` on an otherwise-untouched store is the literal idempotence test _[[07-Transformation-Algebra]]_'s Open Question 1 requires, expressible directly against this one method with no other subsystem involved.

### Resolving Open Question 2 of _[[12-System-Architecture-First-Draft]]_

The question was whether Subsystem 2 and Subsystem 3 should be one deployable process or two. **This document does not resolve deployment topology, and states plainly why it should not be resolved here:** `SynthesisEngine.run` and `TransformationEngine.applySynthesisBatch` are two distinct methods on two distinct interfaces regardless of whether they are compiled into one binary or deployed as two services — the type boundary (a `SynthesisProposal` is not a `ResearchState`, and `run` has no path to calling `commit` directly) is what T-Functor and the Subsystem 3 "propose, don't commit" split actually require, and that boundary is fully expressed at the interface level shown above independent of process topology. Forcing a process-level answer here would be exactly the kind of unforced, non-mathematically-required decision this vault's method (_[[12-System-Architecture-First-Draft]]_, Method) explicitly warns against making prematurely. **This remains a deployment decision, correctly deferred to whoever configures a specific running instance**, and this document's contribution is only to confirm that the interface contract is identical either way — which is the concrete sense in which the question was already, correctly, answered as "it doesn't matter" rather than left vague.

---

## Subsystem 4 — Semantic Computation Layer

```
interface SemanticComputationLayer {
    proximityGraph(theta: number, abstraction: AbstractionParameter) -> ProximityGraphSlice
    proximity(e1: ElementId, e2: ElementId) -> number             // D16, direct pairwise value, no threshold
    clusterOf(e: ElementId, theta: number) -> ClusterId
    minimalNeighbourhood(a: AbstractionParameter) -> Set<AbstractionParameter>   // D24, ↓a in (Abs, τ_Alexandrov)

    onDirty(signal: DirtySignal) ~> ()    // called by Subsystem 9 only
}
```

Every read method computes against `PersistentResearchState.snapshot()` and `ConfigurationBoundary.weightConfig()` (Subsystem 13, below) and may serve from its own cache when not marked dirty for the relevant scope, per _[[13-Runtime-Architecture]]_ §5's rebuild policy (lazy full-graph, eager narrow-scope per INV-30). `onDirty` only ever marks cache entries stale; it triggers no recomputation itself (recomputation happens lazily, on the next read call above) — this is the literal implementation of _[[13-Runtime-Architecture]]_'s "Subsystem observes its own dirty flag... rebuild on next read" policy for this subsystem specifically.

**Acyclicity, structurally enforced (Ambiguity Audit A10, restated as an interface fact).** This interface has no method accepting `Suggestions` or any type originating from Subsystem 6 as an input parameter — the one-directional read constraint _[[12-System-Architecture-First-Draft]]_ names is not a runtime check here, it is the simple absence of a parameter type, the same enforcement pattern _[[15-Canonical-Data-Model]]_ used for D10.1/D10.2.

---

## Subsystem 5 — Indexing Subsystem

### Resolving Open Question 1 of _[[12-System-Architecture-First-Draft]]_

The question was whether Indexing should be one component or two independently swappable ones. Writing the actual interface makes the answer concrete: **two interface contracts, one subsystem boundary.** `TextIndex` and `CoordinateIndex` share nothing in their method signatures or data shapes (one returns element identities ranked by lexical/textual match, the other returns element identities ranked by coordinate-vector locality) — nothing in _[[12-System-Architecture-First-Draft]]_'s justification for Subsystem 5 ("purely the structural machinery... that makes those computations tractable") requires the two to share an implementation, and Subsystem 4 depends only on `CoordinateIndex` while Subsystem 6 depends only on `TextIndex` (per Subsystem 12's original interface description: "text index... for Local Intelligence's search," "coordinate index... for Semantic Computation Layer's proximity/clustering"). Separating the contracts costs nothing and directly delivers the "swappable without touching the other" property Open Question 1 was asking whether to bother securing. **The subsystem boundary (one component, in the sense of "one place these live and one place invalidation is routed to") is retained**, since nothing requires two separately deployed services either — this mirrors Subsystem 3's resolution above exactly: the interface-level separation is the thing that was actually load-bearing, not a deployment-level one.

```
interface TextIndex {
    search(query: string, limit: number) -> Set<(ElementId, number)>   // (id, relevance score)
    onDirty(signal: DirtySignal) ~> ()
}

interface CoordinateIndex {
    nearestCandidates(e: ElementId, k: number) -> Set<ElementId>   // candidate set, NOT ranked by proximity itself —
                                                                     // per [[08-Semantic-Distance-and-Meaning]] T4, no metric
                                                                     // exists generically, so this index narrows candidates
                                                                     // (locality-sensitive, per-dimension) for Subsystem 4
                                                                     // to then score exactly via proximity() — this
                                                                     // interface never claims to rank by true proximity itself.
    onDirty(signal: DirtySignal) ~> ()
}
```

The `nearestCandidates` contract is written the way it is — returning an unranked candidate set rather than a ranked one — specifically because _[[08-Semantic-Distance-and-Meaning]]_ T4 proved no metric exists generically over `E`; an index promising a ranked "nearest" result would silently assume triangle-inequality-based pruning validity, which that theorem already forbids assuming. This is a direct, traceable consequence of a Phase 4 theorem shaping a Phase 6 signature, exactly the kind of forcing this document exists to make explicit.

---

## Subsystem 6 — Local Intelligence Subsystem

```
interface LocalIntelligence {
    suggestMetadata(e: ElementId) -> Suggestion[]
    similarityRanking(e: ElementId, limit: number) -> Suggestion[]
    recommendNextActions() -> Suggestion[]
}
```

Every method returns `Suggestion[]` (defined above) — never `CoordinateValue`, never anything typed as part of `ResearchState`. This is the literal, compiler-checkable form of INV-13 ("no write authority anywhere") and G6's proof (T-Functor): there is no method on this interface whose return type could be passed to `TransformationEngine.interpret` without an explicit researcher (or Synthesis Engine, per its own advisory-consumption rule) act constructing a fresh `Interpret` call from a `Suggestion`'s `candidateValue` field — the acceptance step is a distinct, separate call the Interaction layer makes, never something this interface performs on its own.

---

## Subsystem 7 — Projection Engine

```
interface ProjectionEngine {
    render(q: QueryDefinition, a: AbstractionParameter) -> ViewData
    invalidate(signal: DirtySignal) ~> ()   // called by Subsystem 9
}
```

`render` implements _[[13-Runtime-Architecture]]_ §3's cache-check/recompute branch internally (Render Cache hit/miss is not exposed to the caller — Visualization Layer never needs to know which branch executed, per Subsystem 7's own "strictly read-only... writes only its own Render Cache" boundary). Every `ViewData.content` value returned MUST satisfy T14 (`conflictFaithful = true`) by construction — an aggregation rule that cannot produce a conflict-faithful result for a requested `(q,a)` is a configuration error in the registered `QueryDefinition`, not a legal `render` outcome, and is rejected before rendering begins rather than rendered with `conflictFaithful = false` (that field exists in the type for defensive completeness — _[[15-Canonical-Data-Model]]_'s own posture of naming a structural fact explicitly rather than assuming it — but a legally operating Projection Engine never actually emits `false`).

---

## Subsystem 8 — Visualization Layer

```
interface VisualizationLayer {
    render(view: ViewData) ~> ()                    // draws; owns nothing afterward
    onInteraction(event: RawInteractionEvent) ~> ()  // forwarded to Subsystem 10, unclassified
}

record RawInteractionEvent {
    kind: "text_entry" | "coordinate_edit" | "click" | "pan" | "zoom" | "intent_submit",
    payload: Map<string, string>,   // opaque at this layer; Event Processing (10) is the first
                                     // subsystem authorized to classify this into Capture/Interpret/Navigate/IntentSubmit
}   // transient, never stored — Subsystem 8 owns zero persistent state, per [[12-System-Architecture-First-Draft]]
```

This is the only subsystem in this document with no method returning anything to its caller and no method accepting a persisted type as a parameter — both `render`'s and `onInteraction`'s signatures are fire-and-forget in both directions, the direct interface-level expression of "zero owned state of any kind, deliberately."

---

## Subsystem 9 — Dependency / Invalidation Tracker

```
interface DependencyTracker {
    register(artifactId: string, dependsOn: ChangeSet) ~> ()   // called by Subsystems 4, 5, 7 when they materialize a cache entry
    notify(delta: ChangeSet, causedBy: ElementId) ~> ()          // called by Subsystem 2 after every commit
}
```

`notify` is the only inbound trigger; internally, it intersects `delta` against every registered artifact's `dependsOn` set and calls `onDirty`/`invalidate` (the matching method on Subsystems 4, 5, 6-internal, 7) for every artifact whose set intersects — this is the literal implementation of _[[13-Runtime-Architecture]]_ §4's propagation rule. `register` and `notify` are this subsystem's entire surface; there is deliberately no `query` method returning "what's currently dirty" to any subsystem other than the owning cache itself calling its own `onDirty`/`invalidate` — nothing outside Subsystems 4/5/7 ever needs to ask the Tracker anything, per its "bookkeeping structure, not a scientific one" characterization in Document 12.

---

## Subsystem 10 — Event Processing

```
interface EventProcessing {
    dispatch(event: RawInteractionEvent) ~> ()   // classifies, then routes to (2) or (7) immediately — no queuing
    tick() ~> ()                                  // scheduling poll; checks elapsed-interval/accumulation-ceiling
                                                    // policy and, if due, calls SynthesisEngine.run then
                                                    // TransformationEngine.applySynthesisBatch with the result
    reviewStatus(path: MorphismPathRef) -> boolean   // G8's predicate, evaluated for researcher-orientation display only
}
```

`dispatch` performs the classification step _[[13-Runtime-Architecture]]_ §1 describes ("Event Processing (10) classifies the action as Capture...") and calls exactly one of `TransformationEngine.{capture,supersede,interpret}` or `ProjectionEngine.render`, per the classified kind — an `intent_submit`-kind event is instead routed to `LifecycleOrchestrator` (below), never to `TransformationEngine` directly, per INV-9's write-authority restriction. `tick`'s scheduling policy parameters (interval default, ceiling) remain the tuning question _[[13-Runtime-Architecture]]_ Open Question 1 already flagged and are not fixed by this document — `tick`'s signature is stable regardless of what those parameter values eventually are, which is the sense in which this interface can be written now without that open question blocking it.

---

## Subsystem 11 — Lifecycle Orchestrator

```
interface LifecycleOrchestrator {
    startInvestigation() -> SessionId
    advanceStage(session: SessionId, event: RawInteractionEvent) -> Ok<()> | Rejected(reason)
    completeInvestigation(session: SessionId) -> Ok<{ evidence: ElementId, documentation: ElementId }> | Rejected(reason)
    activeSessionView(session: SessionId?) -> SessionFrame?   // read-only, for Subsystem 7's Dashboard content
    checkpoint(session: SessionId) ~> ()                       // called on Subsystem 10's shutdown path, [[13-Runtime-Architecture]] §11
}

record SessionFrame {
    session: SessionId,
    stage: string,
    sandbox: Map<string, string>,   // pre-formal, unstructured — explicitly NOT typed against ResearchState (INV-12)
}   // never part of Legal; storage durability requirements are strictly weaker than Subsystem 1's, per Document 12
```

`completeInvestigation` is the Completion Gate — the **only** method, anywhere across all thirteen interfaces in this document, that results in a call to `TransformationEngine.capture`/`supersede` from outside the Interaction/Event-Processing path, and it does so by constructing exactly a Capture (and, if the Investigation's content includes a supersession, a Supersede) request, never by calling `PersistentResearchState.commit` directly — INV-9's "exactly two components may write `E`" is satisfied because this method is itself implemented in terms of `TransformationEngine`'s own generator methods, not as a third independent path into Subsystem 1. Its return shape — `{ evidence, documentation }`, two identifiers, never more or fewer — is the direct interface-level statement of INV-27.

---

## Subsystem 12 — Provenance Subsystem

```
interface ProvenanceService {
    attribute(act: AtomicActDescriptor) -> AtomicActRef
    compose(refs: AtomicActRef[], mode: "joint" | "alternative") -> ProvenanceExpr
}

record AtomicActDescriptor {
    actType: "capture" | "supersede" | "interpret" | "synthesis_run" | "investigation_completion",
    agent: string,           // researcher identifier or "synthesis_engine"
    timestamp: Timestamp,
}   // transient input; AtomicActRef (the token itself, per [[14-Provenance-Structure]]'s Acts) is what persists
```

`attribute` mints one fresh `AtomicActRef` per call — called once per Capture/Supersede/Interpret, and once per whole Synthesis run (never once per coordinate inside a batch, per _[[14-Provenance-Structure]]_'s Open Question 1 resolution treating a run as one atomic act). `compose` builds a `ProvenanceExpr` per _[[14-Provenance-Structure]]_'s `PosBool(Acts)` construction — `mode: "joint"` applies `⊗` across `refs`, `mode: "alternative"` applies `⊕`; `TransformationEngine` and `SynthesisEngine` are this method's only callers, and its output is a required, non-optional argument to `PersistentResearchState.commit`'s constructed `ResearchState` (there is no `commit` overload omitting it — the structural enforcement of D10.2 that _[[15-Canonical-Data-Model]]_ already described).

---

## Subsystem 13 — Configuration Boundary

```
interface ConfigurationBoundary {
    weightConfig() -> WeightConfig
    setWeightConfig(w: WeightConfig) ~> ()
    registeredProjections() -> QueryDefinition[]
    registerProjection(q: QueryDefinition) ~> ()
    registerDimension(def: DimensionDefinition) -> Ok<()> | Rejected(reason)   // Ambiguity Audit A8's registration act
}
```

`registerDimension` is included here, not on `TransformationEngine`, because dimension registration is a configuration-registry act on `DimensionRegistry` (the "third category," per _[[15-Canonical-Data-Model]]_'s note on why it is co-located with but not part of `S`) rather than a legal-state-mutating generator — it can be `Rejected` (e.g., a duplicate `DimensionId`) using the same result shape as every write above, but it is not routed through `TransformationEngine.commit` at all, since it never touches `E` or `I`. This placement is itself a small, previously-implicit design decision this document makes explicit: `DimensionRegistry` lives operationally beside `ResearchState` (co-durable, per Document 15) but its write path is Subsystem 13's, not Subsystem 2's — consistent with Document 12's original framing of Configuration as adjustable "by the researcher via the Interaction layer," which registering a new dimension clearly is, structurally, an act of configuring the space `S` is interpreted within rather than an act of interpreting within it.

---

## Cross-Subsystem Type Consistency Check

Every non-transient type referenced above (`ResearchState`, `Element`, `CoordinateEntry`, `CoordinateValue`, `DimensionDefinition`, `ProvenanceExpr`) is exactly the type _[[15-Canonical-Data-Model]]_ defines — no signature in this document introduces a competing or looser version of any of them. Every transient type (`SynthesisProposal`, `ViewData`, `Suggestion`, `ProximityGraphSlice`, `SessionFrame`, `RawInteractionEvent`) is explicitly marked never-persisted at its definition site, so that a future implementer auditing storage code against this document can mechanically check: does anything write a transient type to durable storage? If yes, that is a defect against this specification, not a judgment call.

---

## Relationship to Previous Documents

This document supplies the operation-level contract _[[12-System-Architecture-First-Draft]]_ described only in prose, closes both of that document's Open Questions (Indexing's shape; Synthesis/Transformation's process topology — the latter closed by demonstrating the question was already answered at the correct level, the interface, and does not require a deployment-level answer), and types every signature against _[[15-Canonical-Data-Model]]_ and _[[14-Provenance-Structure]]_ without introducing any object those documents did not already define, except purely transient, explicitly-marked wire types local to a single subsystem boundary crossing.

---

## Open Questions

1. Whether `AgreeFnRef` (inside `WeightConfig`) should be a registry key into a fixed, closed set of built-in agreement functions, or an arbitrary pluggable computation — _[[08-Semantic-Distance-and-Meaning]]_ leaves `agree`'s exact shape to configuration deliberately, so this is a genuine implementation-surface decision this document does not force, consistent with that document's own posture.
2. Whether `QueryDefinition.parameters` (a flat string map) is sufficient for every one of the six named Projection operators' actual parameter needs (e.g., Tree's choice of root-selection rule) or whether operator-specific parameter records are eventually needed — left as a schema-evolution question, not a blocking one, since `Map<string,string>` is a strict superset of what any of the six worked examples in _[[10-Projection-Formalism]]_ currently require.
3. The exact set of `LegalityViolation` / `Rejected(reason)` variants (one per D10 condition, per E1–E3 in _[[15-Canonical-Data-Model]]_) is implied but not exhaustively enumerated here — a short, closed enum, left to a future errata pass rather than this document, since nothing above depends on its exact member names.

---

_See also: [[12-System-Architecture-First-Draft]] for the subsystem boundaries these signatures belong to. [[13-Runtime-Architecture]] for the call sequences these methods are invoked in. [[15-Canonical-Data-Model]] for every persisted type referenced. [[14-Provenance-Structure]] for `ProvenanceExpr` and the `attribute`/`compose` operations of Subsystem 12._