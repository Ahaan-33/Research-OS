# Research Operating System — Internal State Model

### Phase 3 Architecture · Document 2 of 6

### Version 0.1

---

## Purpose

_[[00-Runtime-Specification]]_ names four top-level state containers — `S`, `Session`, `Cache`, `Queue` — and treats them as given. This document opens each one, asks "what is the state of the universe" in the terms the prompt demands, and settles ownership, mutation rights, and authoritative-vs-derived status for every object found. It deliberately ignores storage format and serialization, per instruction — a state object here is a _kind of fact_, not a table or a struct.

References back to: _[[00-Runtime-Specification]]_ (temporal behavior of this state), _Computational Model_, _Discovery Roadmap_ (the algebraic origin of `S`). References forward to: _[[02-System-Invariants]]_ (constraints on how this state may change).

---

## Method

For every candidate state object, three questions are asked, matching the discipline already used in _Convergence Pass_ and formalized in _Discovery Roadmap §5_:

1. **Is it authoritative or derived?** Authoritative iff it cannot be written as a deterministic function of other state; derived iff it can.
2. **Who owns the sole write path?**
3. **What does it mean for it to mutate?** (append, replace-in-place, recompute-wholesale, or session-transition.)

The illustrative list in the prompt (Research State, Semantic State, Topological State, Embedding State, Projection State, History State, View State, Selection State, Interaction State, Inference State) is used as a checklist, not a template — several of these collapse into a single object already defined by Phase 2, and this document says explicitly where and why, rather than inventing distinct machinery to honor every name on the list.

---

## The Complete State Inventory

### 1. Evidence State (`E`)

**What it is:** Every Scientific Object ever captured — content elements (observations, hypotheses, experiments, results, conclusions, literature) and relation elements (explicit researcher-asserted relationships) — plus the Supersession Index linking replaced objects to their replacements, plus the Provenance Tag on every element recording which Investigation or direct Capture produced it.

**Authoritative or derived:** Authoritative. This is one of exactly two objects in the entire system for which loss means unrecoverable knowledge loss.

**Ownership:** Sole write path is the union of two callers — the Interaction Shell's Capture Surface (single-object writes) and the Lifecycle Orchestrator's Completion Gate (structured-evidence writes, on Investigation completion only). No other component may write here, ever (_System Architecture_, Contract Table).

**Mutation rule:** Append-only, and append-only in a specific algebraic sense — it is a join-semilattice: two independently grown copies merge by union, merges are idempotent/commutative/associative, and nothing is ever removed (_Discovery Roadmap §3_). "Supersede" is not an in-place mutation; it is an append of a new element plus an append of a supersession-relation element pointing at the old one.

**Relates to the prompt's illustrative list as:** this _is_ what the prompt calls "Research State" in its evidentiary half, and also absorbs "History State" entirely — history is not a separate log bolted onto Evidence, it is a structural property of Evidence itself (the Supersession Index _is_ the history mechanism). A separate History State object would duplicate information already present here; per _Discovery Roadmap_'s minimality discipline, it is rejected as its own object (see _Rejected Alternatives_).

---

### 2. Interpretation State (`I`)

**What it is:** A single uniform assignment function over (element, dimension) pairs — one value per (Scientific Object or relation element, organisational dimension) combination. Dimensions include thread membership (one-to-many), experimental stage, publication scope, positivity, confidence, and Conflict Region membership. The Conflict Registry is not a separate state object; it is the subset of `I`'s range describing unresolved tension between coordinate assignments (_Internal Structure of Components_: "held here, not inferred on demand").

**Authoritative or derived:** Authoritative. The second and last irreplaceable object.

**Ownership:** Sole write path is the union of the Interaction Shell's Interpret Surface (single-coordinate writes, researcher-initiated) and the Synthesis Engine's Interpretation Writer (batch writes, reconciliation-initiated). No other component may write here (_System Architecture_, Contract Table).

**Mutation rule:** Fully mutable per-pair, but never overwritten-and-lost under concurrency — it behaves as a multi-value register: two concurrent writes to different pairs commute trivially; two concurrent writes to the _same_ pair are both retained (as a Conflict Region) rather than one silently discarding the other (_Discovery Roadmap §3_). A single write, considered alone, is fully reversible — there is no arrow of time inside `I` by itself; only Synthesis (a specific kind of write, run over time) introduces directionality, and only relative to a fixed snapshot of `E`.

**Relates to the prompt's list as:** this _is_ "Research State" in its interpretive half. It also absorbs what the prompt separately imagines as an "Inference State" — confidence, being a coordinate like any other, requires no separate ledger (_Internal Structure of Components_: "confidence is not a separate mechanism").

---

### 3. Relationship / Emergence State (the live graph)

**What it is:** A computed arrangement of edges among Evidence elements, derived from Interpretation coordinates, explicit relation elements in `E`, and Local Intelligence's similarity signal, combined via Dimension Weighting.

**Authoritative or derived:** Derived, unambiguously — this was the central correction of _Convergence Pass_: it was originally proposed as Substrate and demonstrably fails the loss test (nothing is lost if it's deleted; it is fully rebuildable). It is a pure functor's image: `f(E, I, similarity)` for deterministic `f`.

**Ownership:** Sole write path is its own Graph Assembly sub-component, and its "writes" are entirely to its own disposable cache — it never writes `E` or `I` in either direction (_System Architecture_, _Convergence Pass_).

**Mutation rule:** Wholesale or incremental recomputation, never edited in place, never merged, never subject to conflict resolution — because it is a pure function, two computations of the same region from the same `S` are either identical or one is stale, never divergent.

**Relates to the prompt's list as:** this is "Topological State" — and the _Discovery Roadmap_ is explicit and load-bearing on what kind of topology it actually is: **not** a graph stored as ground truth, and **not** point-set topology either. It is better understood as the output of a filtration/coarsening poset over abstraction levels (see State Object 5, Projection State, below, for where "topology" as the prompt's philosophy invokes it — "topology emerges from meaning" — actually lives). What most users will call "the graph" is this object, rendered.

---

### 4. Embedding / Organisational-Geometry State

**What it is:** The position of every Evidence element within the organisational space defined by weighted Interpretation dimensions (_Research State & Epistemic Model_: "the Research State exists as a high-dimensional semantic embedding space... it does **not** represent artificial intelligence. It represents the organisational geometry of scientific work"). This is distinct from — and must not be confused with — any machine-learning embedding a Local Intelligence similarity service might compute internally as an implementation detail.

**Authoritative or derived:** Derived. It is a direct, deterministic function of `I` (the coordinate values) and the Dimension Weighting configuration (itself a tunable, non-authoritative parameter — "a tuning surface, not a fact about the world," _Internal Structure of Components_).

**Ownership:** Computed by the same Relationship/Emergence Layer that computes the graph — this is not a separate component, it is the same computation viewed at a different resolution (coordinates vs. edges are two views of one geometry).

**Mutation rule:** Recomputed whenever `I` or the Dimension Weighting configuration changes. Never itself written directly.

**Relates to the prompt's list as:** "Embedding State." Its authoritative _inputs_ (the weighting configuration) deserve their own entry — see State Object 4a.

#### 4a. Dimension Weighting Configuration

**What it is:** The configuration describing how strongly each organisational dimension pulls elements together in the organisational geometry.

**Authoritative or derived:** This is a genuine edge case worth naming explicitly: it is **authoritative but not scientific** — it is a system-configuration fact (closer to a user preference than to a research finding), not derivable from `S`, yet its loss does not constitute _knowledge_ loss the way losing `E` or `I` would. It is best classified as authoritative configuration state, sitting outside `S` proper, analogous to how a renderer's camera settings are real state but not part of the scene graph. Losing it degrades the _view_, not the _knowledge_ — it can be reset to a sensible default without erasing anything scientific.

**Ownership:** Researcher-adjustable via the Interaction Shell or a system default; read by the Relationship/Emergence Layer.

**Mutation rule:** Direct replacement, versionable but not requiring provenance in the scientific sense (no Conflict Region is possible here — it's a rendering knob, not a belief).

---

### 5. Projection State

**What it is:** For each currently-active Projection (Dashboard, Semantic Map, Thread View, Timeline, Review Panel, or a maturity-scoped Publication view): its Query Definition (which question), its Abstraction Parameter (which resolution/zoom level), and its Render Cache (the last computed output).

**Authoritative or derived:** The Render Cache is fully derived (a pure function of Query Definition + Abstraction Parameter + the current `S`). The Query Definition and Abstraction Parameter _themselves_, however, are a genuinely separate category worth distinguishing: they are **UI configuration state, not knowledge state** — closer to Interaction State than to Research State (see State Object 8, below) — but are tracked here as the input side of Projection because they determine what the Render Cache is a function _of_.

**Ownership:** Query Definition and Abstraction Parameter are set by the researcher via the Interaction Shell (or by a saved/default Projection Registry entry); Render Cache is computed and owned entirely by the Projection Layer.

**Mutation rule:** Query Definition and Abstraction Parameter change by direct researcher action (navigation) or programmatic default; Render Cache recomputes on demand whenever its dependencies (tracked per _[[00-Runtime-Specification]]_, Dependency Updates) go dirty, or is discarded outright with zero consequence.

**Relates to the prompt's list as:** "Projection State" and "View State" are the same object under two names in the prompt's illustrative list — there is no engineering reason to separate "the view the researcher currently sees" from "the Projection producing it," since a view _is_ a rendered Projection by construction (_System Architecture_: "every named view in Phase 1... is an instance of exactly one component type: a Projection"). Collapsed here deliberately; see _Rejected Alternatives_.

The **Projection Registry** (the catalogue of currently-active Organisational Spaces) is itself a small piece of authoritative-but-non-scientific state: which Projections currently exist, so that "complexity creates new views" (_Design Invariants §24_) means addressable, persistent view instances rather than anonymous, throwaway renders. Its loss degrades convenience (the researcher must recreate views) but never loses knowledge.

---

### 6. Local Intelligence State

**What it is:** Whatever internal indices, similarity structures, or statistical models each Local Intelligence service (Indexing, Similarity, Recommendation, Metadata Suggestion) maintains to do its job efficiently — e.g., a full-text index, a nearest-neighbor structure over organisational coordinates.

**Authoritative or derived:** Derived, absolutely and by contractual design (_Local Intelligence_, _System Architecture_: "no authority whatsoever... deterministic and reproducible for identical input"). Its entire purpose is to be pure convenience — the _Convergence Pass_ loss test passes it cleanly precisely because nothing is lost if it vanishes.

**Ownership:** Each service owns and rebuilds its own internal structures; the Service Registry is the sole addressable boundary anything else calls through.

**Mutation rule:** Rebuilt or incrementally updated on a schedule independent of everything else in the system (see _[[00-Runtime-Specification]]_, Background Processes) — its staleness at any given instant is a latency property, never a correctness property, because nothing downstream treats a Local Intelligence output as a fact rather than a suggestion.

**Relates to the prompt's list as:** the "Inference State" the prompt's illustrative list gestures at, **redefined precisely**: this is not inference over scientific truth (which the architecture forbids Local Intelligence from performing), it is inference over _organisational convenience_ only — a similarity score, not a probability that a hypothesis is true.

---

### 7. Lifecycle / Session State

**What it is:** For each in-progress Investigation: its Session Frame (current stage along Intent → Exploration → Hypothesis → Engineering → Experiment → Result → Conclusion), its Engineering Sandbox contents if applicable, and the Intent Queue of not-yet-picked-up Research Intents (researcher-originated or Synthesis-originated).

**Authoritative or derived:** Neither, cleanly — this is the "pre-formal category" the _Discovery Roadmap_ identifies explicitly as sitting **outside `S` entirely** (§1, §7: "an in-progress Investigation... fails S's own invariants... it belongs to a separate, weaker category of 'pre-states'"). It is real state the runtime must track, checkpoint, and recover, but it is neither a derivable function of `S` (an Investigation's internal reasoning is not recomputable from anything) nor itself part of the canonical Research State (it has no stable identity and carries no interpretation until it crosses the Completion Gate).

**Ownership:** Sole owner is the Lifecycle Orchestrator. No other component reads its internals except the Projection Layer, which may read _that an Investigation is active and at what stage_ (ephemeral, read-only, never treated as part of `S`) purely to render "what am I currently working on" in a Dashboard.

**Mutation rule:** Stage transitions (append-like within the session, but the whole session is discarded — not merged into `E` — unless and until the Completion Gate fires); the Completion Gate itself is the one-way admission functor into `S`, producing exactly a Capture or Capture-plus-Supersede.

**Relates to the prompt's list as:** not directly named in the prompt's illustrative list, but is a required object once _Research Lifecycle_ is taken seriously — this is the runtime encoding of "results and conclusions are fundamentally different entities" enforced procedurally rather than left to researcher discipline.

---

### 8. Interaction / Session-Memory State

**What it is:** Short-lived, UI-scoped continuity: current Mode (Work vs. Review), current Selection (which element or region the researcher is focused on), scroll/pan/zoom position within a Projection, "where was I" breadcrumbs.

**Authoritative or derived:** Neither — explicitly and deliberately non-scientific. _Internal Structure of Components_ is direct about this: "Session Memory... Explicitly not part of the Research State — if it were lost, nothing scientific would be lost with it."

**Ownership:** Interaction Shell exclusively.

**Mutation rule:** Direct, unconstrained replacement — no provenance requirement, no conflict semantics, because it represents nothing scientific.

**Relates to the prompt's list as:** "Selection State" and "Interaction State" from the prompt's illustrative list. Collapsed into one object because both are the same kind of thing — ephemeral UI continuity — and separating them would create two objects with identical mutation rules and identical (lack of) consequence on loss.

---

### 9. Queue / Scheduling State

**What it is:** Pending background work — unindexed new Captures, a scheduled Synthesis trigger, dirty Cache regions awaiting recomputation.

**Authoritative or derived:** Neither in the scientific sense; this is pure runtime bookkeeping, entirely reconstructible by re-scanning `S` for what's inconsistent with current `Cache` — so it is, strictly, a derived convenience the same way `Cache` is, kept separate here only because it describes _work still to do_ rather than _a computed result_.

**Ownership:** The runtime scheduler itself (part of the Reconciliation Loop machinery in _[[00-Runtime-Specification]]_).

**Mutation rule:** Enqueue on write events; dequeue on completed recomputation. Idempotent by construction — re-deriving the queue from scratch by diffing `S` against `Cache` staleness produces the same queue.

**Relates to the prompt's list as:** not named explicitly in the prompt's list; a necessary addition once the runtime's event-driven nature (_[[00-Runtime-Specification]]_) is taken seriously.

---

## Summary Table: Authority and Ownership

|State Object|Authoritative?|Sole Writer(s)|Loss consequence|
|---|---|---|---|
|Evidence State (`E`)|**Yes**|Interaction Shell (Capture), Lifecycle Orchestrator (Completion Gate)|Unrecoverable knowledge loss|
|Interpretation State (`I`)|**Yes**|Interaction Shell (Interpret), Synthesis Engine (batch)|Unrecoverable understanding loss|
|Relationship/Emergence (graph)|No — derived|Its own Graph Assembly (writes only its own cache)|None — fully recomputable|
|Organisational-Geometry (embedding)|No — derived|Same as above|None — fully recomputable|
|Dimension Weighting Configuration|Authoritative-but-non-scientific|Researcher / system default|Degrades view only, resettable|
|Projection State (Query Def., Abstraction Param., Render Cache)|No — derived (cache); config (params)|Interaction Shell (params), Projection Layer (cache)|None — recomputable / reconfigurable|
|Projection Registry|Authoritative-but-non-scientific|Interaction Shell / Projection Layer|Convenience loss only|
|Local Intelligence indices|No — derived|Each service, independently|None — fully recomputable|
|Lifecycle/Session State|**Neither** — pre-formal, outside `S`|Lifecycle Orchestrator exclusively|Bounded, explicit, previously-justified loss of not-yet-knowledge|
|Interaction/Session-Memory State|Neither — non-scientific|Interaction Shell exclusively|None — never scientific|
|Queue/Scheduling State|Neither — runtime bookkeeping|Scheduler|None — re-derivable from `S` vs. `Cache` diff|

Exactly **two rows carry unrecoverable consequence.** Every other row, no matter how central it feels to daily use — including the graph most researchers will spend the most time looking at — is disposable by design. This table is the state-model restatement of the same finding _System Architecture_'s Contract Table already made at the component level; nothing here should surprise a reader of that document, which is itself evidence the two documents are consistent.

---

## Formal Definitions

```
S            = (E, I)
E            = provenance-connected collection of {content elements, relation elements},
               closed under supersession, join-semilattice under merge
I            : (E-element × Dimension) → Value, multi-value-register semantics under
               concurrent write, freely revisable per (element, dimension) pair

Graph(t)     = f_graph(E(t), I(t), Sim(t), W)         — derived
Geometry(t)  = f_geom(I(t), W)                         — derived
Sim(t)       = f_sim(E(t), I(t))                       — derived, service-internal params allowed
W            = Dimension Weighting Configuration       — authoritative config, non-scientific

Session(t)   = { Investigation_k(t) }, Investigation_k ∉ S until Completion Gate fires
Interaction(t) = { Mode, Selection, ViewPosition }      — ephemeral, non-scientific
Projection(t)  = { (QueryDef_j, AbstractionParam_j, RenderCache_j) }  — RenderCache derived; rest config
Queue(t)     = diff(S(t), Cache(t))                     — reconstructible bookkeeping
```

---

## Engineering Decisions

1. **History is not a separate state object.** It is fully subsumed by the Supersession Index inside `E`. A dedicated "History State" would either duplicate `E`'s own structure or become a second, competing source of truth about the past — precisely the failure mode _Knowledge Evolution_ and _Computational Principles_ Principle 2 exist to forbid.
2. **View State and Projection State are one object.** Every "view" in Phase 1's vocabulary is structurally a Projection instance; giving them separate state containers would reintroduce the very distinction _Convergence Pass_ dissolved when it absorbed the Publication Layer into the Projection Layer.
3. **Confidence and other "important" dimensions get no dedicated ledger.** They are ordinary entries in `I`'s uniform assignment function. Any implementation that special-cases confidence into its own store has silently broken the closure-operator argument that makes Synthesis's convergence behavior meaningful (_Discovery Roadmap §3, §7_).
4. **The Dimension Weighting Configuration and Projection Registry are classified as a third category — authoritative-but-non-scientific** — rather than being force-fit into either "part of `S`" or "fully derived." This category did not exist explicitly in Phase 2's prose; it is introduced here because without it, a state model would have to either wrongly claim these are recomputable from nothing (they aren't — a fresh weighting has no principled derivation from `S`) or wrongly promote them to Substrate status alongside `E` and `I` (which would violate the Convergence Pass's loss test, since losing a weighting config loses no _knowledge_, only a view).

---

## Rejected Alternatives

- **Treating "Embedding State" as an ML embedding maintained by Local Intelligence, conflated with the organisational geometry.** Rejected explicitly on the authority of _Research State & Epistemic Model_: "the embedding does **not** represent artificial intelligence." Kept as two distinct objects — Local Intelligence's internal similarity structures (State 6, fully opaque and replaceable) versus the organisational geometry (State 4, a transparent function of `I` and `W`) — because collapsing them would make the organisational geometry dependent on a specific ML implementation, violating "modular intelligence" (_Local Intelligence_, _Design Invariants §29-31_).
- **A single "Topological State" object separate from the graph.** Rejected: per _Discovery Roadmap §6_, the actual mathematical content is a filtration/coarsening poset over abstraction levels, not a distinct topological structure requiring its own state — it is a property of how Projection indexes the same graph/geometry at different resolutions, not a fourth thing to store.
- **Giving Session State any authoritative status, however partial.** Considered, given that losing in-progress reasoning is a real cost to the researcher — but rejected on the same ground _Convergence Pass_ used: this is "progress loss," not "knowledge loss," and conflating the two categories would blur the one asymmetry (Evidence vs. Interpretation) the entire architecture protects.

---

## Open Questions

1. Whether the Dimension Weighting Configuration should itself be versioned with provenance (so a researcher can ask "what did the map look like under last month's weighting") or treated as pure, unversioned live configuration. Deferred — either answer is compatible with everything above; it only affects how much of State Object 4a persists.
2. Whether the Projection Registry should be scoped per-project or global to the whole installation. Deferred to implementation; both are consistent with its authoritative-but-non-scientific classification.
3. Whether Local Intelligence internal state should ever be _shared_ across a synchronized set of devices as an optimization (to avoid redundant re-indexing) even though it is not required to synchronize. Deferred — purely a performance question, given its explicit non-authoritative status (_[[00-Runtime-Specification]]_, Synchronization Philosophy).

---

## Implementation Consequences

- Any persistence layer needs exactly two authoritative stores (`E`, `I`) and may implement everything else — graph, geometry, indices, view caches, session state — as ordinary, potentially-in-memory, potentially-lossy structures without weakening any correctness guarantee.
- A configuration layer (outside the scientific persistence path) is needed for Dimension Weighting and the Projection Registry — these deserve their own lightweight persistence, distinct in criticality from `E`/`I`, so that losing a settings file is a UX inconvenience, not an incident.
- The Lifecycle Orchestrator's Session State needs its own bounded, best-effort checkpointing mechanism, explicitly decoupled from `E`/`I`'s durability guarantees — over-engineering Session State's durability to match `E`/`I`'s would misrepresent its actual epistemic status (pre-formal, not yet knowledge) and invite the (already rejected) idea of promoting in-progress reasoning to Substrate-level authority.

---

_See also: [[00-Runtime-Specification]] for how these objects evolve over time. [[02-System-Invariants]] for constraints on their mutation. [[03-Ambiguity-Audit]] items on Dimension Weighting versioning and Session checkpoint granularity._