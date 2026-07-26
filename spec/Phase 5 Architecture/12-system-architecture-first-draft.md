# Research Operating System — System Architecture: First Draft

### Phase 5 Architecture · Document 1 of 2

### Version 0.1

---

## Purpose

Documents _[[06-Research-State-Mathematics]]_ through _[[11-Formal-Foundations-Survey]]_ established what the Research State _is_ (a category `Res` of legal states `(E,I)`, ordered by `⊑`), what may legally happen to it (four generators — Capture, Supersede, Interpret, Synthesize — and three non-authoritative functors — Project, Discover, Emergence), and what structure emerges from it (a pseudo-semimetric proximity space, an Alexandrov topology on the abstraction poset, a hypergraph of conflicts).

This document treats every one of those results as a fixed constraint, not a proposal, and asks exactly one question: **what software components are required so that an implementation is forced, by its own division of responsibility, to actually be the mathematics — not merely consistent with it, but structurally incapable of being anything else?**

This is a narrower and more mechanical exercise than _[[04-Implementation-Dependency-Graph]]_ (the Phase 3 subsystem list), which was derived from Phase 1/2 prose before the formal model existed. This document supersedes that one in one specific respect — every subsystem below is justified by naming the exact theorem, invariant, or definition it exists to implement, rather than by an informal reading of Phase 1/2 responsibilities. Where the two documents' subsystem lists agree (and they mostly do — the mathematics confirmed what the prose already implied), that agreement is itself evidence the earlier document was sound. Where they differ, this document's justification is the more authoritative one, since it is traceable to a proof.

References back to: _[[06-Research-State-Mathematics]]_ through _[[11-Formal-Foundations-Survey]]_ (every claim below cites its formal source). References forward to: none — this document is a first draft explicitly intended for critique, not a terminus.

---

## Method

For each subsystem, this document answers, in order: **why it exists** (which formal object or theorem requires a component with this exact boundary), **what it implements** (the specific definitions/theorems), **what data it owns**, **what it may and may not modify**, and **how it communicates with its neighbors** (as an interface — a description of what crosses the boundary, in which direction, not a method signature).

The test applied throughout: _if this subsystem did not exist as a separate component — if its responsibility were folded into a neighbor — would some proven distinction from the mathematics become impossible to state or enforce?_ If yes, the subsystem is required. If no, it is a convenience, and is named as such rather than elevated.

---

## Subsystem 1 — Persistent Research State

**Why it exists.** `Legal` (_[[06-Research-State-Mathematics]]_, D10) is the single category of objects the entire formal model is _about_. Every other subsystem in this document either mutates it (through exactly four legal operations), reads it, or derives something disposable from it. There must therefore be exactly one component whose sole responsibility is to _be_ `S = (E,I)` — to hold the actual, current, authoritative pair — distinct from every subsystem that acts on or reads it.

**What it implements.** `E` as a join-semilattice (T1), `I` as a set-valued, multi-value-register function (D6, T2), the legality predicate `Legal` (D10) as a standing invariant every stored state must satisfy, and the examination-status extension (D14) distinguishing "unexamined" from "examined, no conflict found."

**What it owns.** The canonical, current value of `E` and `I` — nothing else. Not the graph, not indices, not rendered views, not in-progress Investigations (Subsystem 11, below, owns those separately, since they are explicitly outside `Legal` per _[[06-Research-State-Mathematics]]_'s classification).

**What it may and may not modify.** This subsystem does not modify itself. It exposes exactly the surface needed for the Transformation Engine (Subsystem 2) to apply the four generators, and a read surface for every other subsystem. It performs no computation beyond enforcing D10's legality predicate on every accepted write — it is not permitted to run Synthesize, compute proximity, or render anything; those are other subsystems' jobs specifically so that this one's responsibility stays exactly "be the authoritative pair, correctly."

**Interfaces.**

- _Inbound (write):_ accepts only fully-formed legal transitions from the Transformation Engine — never a partial write, never a write from any other subsystem.
- _Outbound (read):_ exposes `E`, `I` (or scoped slices of them) to the Transformation Engine (for computing preconditions), the Semantic Computation Layer, the Local Intelligence Subsystem, the Projection Engine, and the Provenance Subsystem — all as read-only queries.
- _No subsystem downstream of this one is ever a source of a write back into it_, except the Transformation Engine itself and the Lifecycle Orchestrator's Completion Gate (Subsystem 11) — this is the direct architectural expression of T-Functor (_[[07-Transformation-Algebra]]_): every other subsystem's read access is provably incapable of becoming a write path, because its output type is never `Legal`.

---

## Subsystem 2 — Transformation Engine

**Why it exists.** The four generators of `Res` (_[[07-Transformation-Algebra]]_, G1–G4) are the _only_ legal morphisms in the category. There must be exactly one subsystem responsible for constructing and applying them, so that "transformations are the only legal mutations" is an architectural fact (one gate everything passes through) rather than a convention several different code paths are each separately trusted to honor.

**What it implements.** Capture (G1), Supersede (G2, shown to be Capture of a reserved relation type — T-Supersede-Distinct), Interpret (G3), and the invocation boundary for Synthesize (G4) — the Transformation Engine is responsible for accepting a Synthesis run's output and committing it, though the computation of _what_ to write is delegated to Subsystem 3 (Synthesis is split for a reason explained there). This subsystem also enforces every generator's stated preconditions and postconditions (the tables in _[[07-Transformation-Algebra]]_) before ever touching Subsystem 1.

**What it owns.** No persistent data of its own. It is a pure mediating process: payload in, legal transition applied to Subsystem 1 out. (This is a deliberate, minimal ownership — a Transformation Engine that accumulated its own state would immediately raise the question of which state is authoritative, Subsystem 1's or its own; the answer must always be Subsystem 1's alone.)

**What it may and may not modify.** May construct and apply Capture, Supersede, and Interpret directly. May _apply_ (but not independently originate the content of) a Synthesize transition — the distinction matters and is elaborated under Subsystem 3. May not skip D10's legality check for any reason, including performance pressure — a rejected, not silently repaired, illegal transition is the required behavior (this is the architectural reading of _[[06-Research-State-Mathematics]]_'s D10 as a standing invariant, not a best-effort one).

**Interfaces.**

- _Inbound:_ receives transition requests from the Interaction layer (a researcher's Capture/Interpret action) and from the Synthesis Engine (Subsystem 3, a computed Interpretation Writer batch).
- _Outbound:_ the sole writer to Subsystem 1.
- _Notifies:_ the Dependency/Invalidation Tracker (Subsystem 9) of exactly which `(element, dimension)` pairs or element identities changed, immediately after each committed transition — this is the only notification this subsystem sends, and it is the seed of every downstream invalidation.

---

## Subsystem 3 — Synthesis Engine

**Why it exists.** Synthesize (G4) is architecturally distinguished from the other three generators by three properties none of the others have: it is the only generator invoked in a batch (over accumulated evidence, not a single payload), the only one whose output requires a nontrivial _computation_ (an Evidence Scanner and an Interpretation Writer reasoning over patterns, not a direct researcher-supplied value), and the only one whose repeated application raises an open mathematical question (idempotence / Scott-continuity, _[[11-Formal-Foundations-Survey]]_, F8). A subsystem boundary is required here specifically so that _this_ computation — and only this one — can be independently tested for the reproducibility property the invariants demand ("synthesis is reproducible").

**What it implements.** The closure-operator candidate structure (T-Closure, conditional; _[[07-Transformation-Algebra]]_), the Evidence Scanner / Agreement-Contradiction Reader / Interpretation Writer division already named in _Computational Model_ and now given formal targets: extensivity relative to `⊑_sem` (resolved via the examination-status order, _[[08-Semantic-Distance-and-Meaning]]_), monotonicity under `⊑` (unconditional), and — as an explicit conformance obligation, not an assumption — idempotence relative to a fixed `E` snapshot, to be empirically or formally verified per concrete implementation.

**What it owns.** Nothing persistent. It reads a frozen snapshot of `E` and the current `I` from Subsystem 1, and its _entire output_ is a proposed Interpretation Writer batch, which it hands to the Transformation Engine (Subsystem 2) to actually commit — Synthesis Engine never writes Subsystem 1 directly. This split exists precisely so that reproducibility can be tested by re-running the Synthesis Engine against the same frozen snapshot in isolation, without needing to touch live authoritative state at all.

**What it may and may not modify.** May not touch `E`. May propose, but not itself commit, `I` writes. May read the Semantic Computation Layer's proximity output (Subsystem 4) and the Local Intelligence Subsystem's similarity output (Subsystem 6) as advisory inputs to its own reasoning (_Computational Model_'s "Synthesis may optionally read Local Intelligence's Similarity Service... Local Intelligence never asserts agreement or contradiction on its own authority" — this subsystem is the one place that distinction (reading a _score_ versus making a _judgment_) is operationally enforced: it consumes scores, and its own output is the only thing in the entire architecture licensed to assert a judged conflict-relevant coordinate).

**Interfaces.**

- _Inbound:_ a triggering signal (from Subsystem 10, Event Processing) carrying a frozen `E` snapshot boundary; read access to `I`, the proximity structure (Subsystem 4), and similarity scores (Subsystem 6).
- _Outbound:_ a proposed Interpretation Writer batch, submitted to the Transformation Engine (Subsystem 2) for legality-checked commitment; a set of new Research Intents submitted to the Lifecycle Orchestrator (Subsystem 11).

---

## Subsystem 4 — Semantic Computation Layer

**Why it exists. This is the formal home of "derived views are disposable" for organisational structure specifically.** _[[08-Semantic-Distance-and-Meaning]]_'s proximity function (D16) and _[[09-Topology-of-Research]]_'s cluster/boundary/bridge/Alexandrov-topology structures (D21–D24, T8–T9) are all, by proof, pure functions of `(E, I, WeightConfig)` — nothing here is authoritative, and a subsystem boundary is required precisely so that "fully recomputable, safe to delete" is a property of an entire component, not an implicit property engineers must remember about scattered code.

**What it implements.** Proximity (D16) and its honestly-assessed pseudo-semimetric status (T4) — meaning this subsystem must not silently assume metric properties (e.g., must not use triangle-inequality-based pruning without an explicit, separately-justified restriction on `agree` functions); the proximity graph `G_θ` and clusters (D21); boundaries and bridges (T9); the Alexandrov topology on the abstraction poset `(Abs, ≼)` (T8), including the minimal-neighbourhood structure (D24); and, optionally, the Formal Concept Analysis concept lattice (_[[11-Formal-Foundations-Survey]]_, "Adopted-Narrow") as one legitimate way to instantiate an abstraction level's grouping rule.

**What it owns.** Nothing authoritative — only its own disposable cache of computed structure (the graph, the geometry). This cache may persist for performance but is never trusted across a restart without re-derivation being the safe default (consistent with _[[00-Runtime-Specification]]_'s Caching Philosophy, itself now justified formally by T-Functor: this subsystem's output type is never `Legal`, so it cannot, by shape, become a second source of truth).

**What it may and may not modify.** Read-only against Subsystem 1 and the Dimension Weighting Configuration (Subsystem 13). Writes only to its own cache. Must never write `E` or `I`.

**Interfaces.**

- _Inbound:_ reads `E`, `I` (Subsystem 1), Dimension Weighting Configuration (Subsystem 13), invalidation signals scoped to specific `(element, dimension)` pairs (Subsystem 9).
- _Outbound:_ serves proximity scores, cluster membership, bridge/boundary flags, and abstraction-level structure to the Local Intelligence Subsystem (as one input among several — see Subsystem 6's non-cyclic constraint below), the Synthesis Engine (Subsystem 3, advisory only), and the Projection Engine (Subsystem 7).
- **Constraint (Ambiguity Audit A10, reaffirmed):** this subsystem's output may be _read by_ Local Intelligence's Emergence-adjacent reasoning is explicitly _not_ permitted in the reverse direction — Local Intelligence must never be a required input this layer depends on receiving back after this layer has already produced output for that same computation, preserving the acyclic read-graph already established.

---

## Subsystem 5 — Indexing Subsystem

**Why it exists.** _[[11-Formal-Foundations-Survey]]_ and _[[05-Design-Review-Stress-Test]]_'s Section 9 (formalized as INV-30) require that neither the Semantic Computation Layer nor Local Intelligence perform an `O(n)`-per-query brute-force scan against the full element set for every proximity or similarity computation — a sub-linear candidate-narrowing structure is required. This is a distinct responsibility from _computing_ proximity (Subsystem 4) or _deciding what to suggest_ (Subsystem 6): it is purely the structural machinery (spatial/locality-sensitive indices, full-text indices) that makes those computations tractable at scale, and is kept separate specifically so it can be swapped (a different indexing strategy) without touching either the semantic definitions (Subsystem 4) or the suggestion logic (Subsystem 6) that consume it.

**What it implements.** No formal object of its own — it is purely an implementation-tractability layer serving the _proven_ locality requirement (INV-24, INV-30) without which those bounds could not be honestly claimed to hold at scale. This is a case, explicit in the method above, of a subsystem justified by a _performance_ invariant rather than a _semantic_ one — the distinction is worth stating plainly: Subsystems 1–4 exist because the mathematics defines objects they must faithfully hold or compute; Subsystem 5 exists because the mathematics' _stated complexity bounds_ would otherwise be unimplementable honestly.

**What it owns.** Its own derived index structures over text (for Local Intelligence's search) and over coordinate vectors (for Semantic Computation Layer's proximity/clustering). Fully disposable, fully rebuildable from Subsystem 1 alone.

**What it may and may not modify.** Read-only against Subsystem 1. Writes only its own index structures. Never consulted as an authority on organisational or scientific meaning — it answers "what's nearby, structurally," never "what does this mean."

**Interfaces.**

- _Inbound:_ reads `E`, `I` (Subsystem 1); invalidation signals (Subsystem 9).
- _Outbound:_ serves candidate sets to Subsystem 4 (Semantic Computation Layer) and Subsystem 6 (Local Intelligence).

---

## Subsystem 6 — Local Intelligence Subsystem

**Why it exists.** The functor `Discover` (_[[07-Transformation-Algebra]]_, G6) is proven, generically (T-Functor), to have no write authority — but this proof only holds if the subsystem's actual output type is never `Legal`. A dedicated subsystem boundary, with an output type structurally restricted to `Suggestions` (never a coordinate value directly committed anywhere), is what makes "local intelligence is advisory, never authoritative" an architectural fact rather than a policy a well-behaved implementation happens to follow.

**What it implements.** Determinism (INV-21), the label-restriction from Ambiguity Audit A11 (continuous scores only, never relationship-category assertions like "contradicts"), and the explicit "no cloud AI assumed" invariant — this subsystem's internal method (whether a local statistical model, a local embedding model, or a purely symbolic heuristic) is unconstrained by the mathematics, _provided_ its output remains within the `Suggestions` category and is reproducible for identical input (INV-21). _Local Intelligence_'s "machine learning is optional infrastructure, not a foundational dependency" (Ambiguity Audit A7) is implemented here as a literal substitutability requirement: this subsystem's internal computation method must be replaceable without any other subsystem's contract changing.

**What it owns.** Its own internal models/heuristics/parameters. Nothing authoritative.

**What it may and may not modify.** Read-only against Subsystem 1, Subsystem 4 (proximity, one-directionally, per A10), and Subsystem 5. Writes nothing anywhere except its own internal state. Its output is consumed only as a suggestion — it is architecturally impossible (by output type) for it to be mistaken for a committed fact, and the Interaction layer is responsible for requiring explicit researcher (or Synthesis Engine, per its own advisory-consumption rule) acceptance before anything resembling its output becomes an actual Interpret write.

**Interfaces.**

- _Inbound:_ reads `E`, `I` (Subsystem 1), proximity/cluster data (Subsystem 4), index structures (Subsystem 5).
- _Outbound:_ serves suggestions (metadata candidates, similarity rankings, recommended next actions) to the Interaction layer and, advisorially, to the Synthesis Engine (Subsystem 3).

---

## Subsystem 7 — Projection Engine

**Why it exists.** The functor `Project` (G5) and its full formalization (_[[10-Projection-Formalism]]_, D28–D30, T11–T14) require a subsystem whose entire responsibility is computing `View_P`-typed output from `(S, q, a)` — distinct from the Semantic Computation Layer (which computes structure _about_ `S`, consumed by many things) and distinct from the Visualization Layer (which turns already-computed view content into something perceivable). This split exists because naturality (T11) and conflict-faithfulness (T14) are properties of the _computation from `S` to a view's data_, not properties of pixels — they must be provable against this subsystem's output alone, before any rendering choice is made.

**What it implements.** Every named Projection operator (Semantic Map, Timeline, Thread View, Tree, Dashboard, Publication View) as instances of one functor family (D28); naturality across abstraction levels (T11, proven in full); the required conflict-faithfulness property on any legal abstraction level's aggregation rule (T14) — this subsystem is where that requirement is actually checked and enforced, since it is the only place an aggregation rule is ever invoked.

**What it owns.** A disposable Render Cache (query definition + abstraction parameter + `S`-version → view data), and the Projection Registry (which named/saved views currently exist) — the latter classified, per _[[01-State-Model]]_, as authoritative-but-non-scientific configuration, not part of `Legal`.

**What it may and may not modify.** Strictly read-only against `Legal` (Subsystem 1), the Semantic Computation Layer (Subsystem 4), Local Intelligence (Subsystem 6, for suggestion overlays), and the Lifecycle Orchestrator (Subsystem 11, read-only, for "what am I currently working on" Dashboard content). Writes only its own Render Cache and Projection Registry. **Never writes `Legal` under any circumstance** — this is the second, independent architectural enforcement of T-Functor, alongside Subsystem 6's.

**Interfaces.**

- _Inbound:_ a Query Definition and Abstraction Parameter from the Interaction layer; read access to Subsystems 1, 4, 6, 11; invalidation signals scoped to the specific `(element, dimension)` pairs or cluster regions a given view depends on (Subsystem 9).
- _Outbound:_ view data (not pixels) to the Visualization Layer (Subsystem 8) exclusively.

---

## Subsystem 8 — Visualization Layer

**Why it exists.** "No visualization stores information" requires a subsystem whose type signature has _no persistent storage capability at all_ — not merely a subsystem instructed not to use one. Separating this from the Projection Engine (Subsystem 7) means the concrete rendering technology (whatever draws pixels, lays out a timeline, or renders a graph) can change completely — a new visual style, a new rendering technology — without touching any of the proven properties (naturality, conflict-faithfulness) that belong entirely to Subsystem 7.

**What it implements.** No formal object — this subsystem exists to satisfy an invariant (no visualization stores information) by construction: it holds view data only transiently, for the duration of a single render, and owns nothing that survives past that render.

**What it owns.** Nothing. This is the one subsystem in the entire architecture with zero owned state of any kind, deliberately.

**What it may and may not modify.** Reads Subsystem 7's output only. Writes nothing anywhere. May report researcher interactions (clicks, selections, pan/zoom) back toward the Interaction layer, but never toward `Legal` directly, and never by storing them itself — a selection is momentary input, routed onward, not retained here.

**Interfaces.**

- _Inbound:_ view data from Subsystem 7.
- _Outbound:_ rendered output to the researcher; raw interaction events (not yet classified as Capture/Interpret/Navigate) to the Interaction layer.

---

## Subsystem 9 — Dependency / Invalidation Tracker

**Why it exists.** Locality (_[[06-Research-State-Mathematics]]_, "Locality") and the corrected bound from _[[05-Design-Review-Stress-Test]]_ (Section 2b, INV-24's tightened form) require that a change to one `(element, dimension)` pair invalidate _exactly_ the derived structures that actually depended on it — no more, no less. This cannot be a property individual subsystems each separately guess at; it requires one subsystem tracking, precisely, which cached structure in Subsystems 4, 5, and 7 was computed from which inputs.

**What it implements.** The locality theorem's operational form: dependency edges from every cached/derived artifact to the specific `(element,dimension)` pairs or element identities it was computed from, and a propagation rule that marks exactly the dependent set dirty on each committed transition (Subsystem 2's notification).

**What it owns.** The dependency graph itself (a bookkeeping structure, not a scientific one) and the dirty/clean status of every registered derived artifact.

**What it may and may not modify.** Writes only its own bookkeeping. Never touches `Legal`, never touches any subsystem's actual cached content (it marks staleness; it does not recompute — recomputation is each dependent subsystem's own responsibility, triggered by observing its own dirty flag).

**Interfaces.**

- _Inbound:_ change notifications from the Transformation Engine (Subsystem 2); registration calls from Subsystems 4, 5, 7 declaring what each cached artifact depends on.
- _Outbound:_ dirty signals to Subsystems 4, 5, 6, 7.

---

## Subsystem 10 — Event Processing

**Why it exists.** The Interactive/Reconciliation cadence split (already established informally in _[[00-Runtime-Specification]]_) now has a precise formal correlate: `Review` (_[[07-Transformation-Algebra]]_, G8) is a predicate over morphism _paths_, not a morphism itself — something must be responsible for recognizing which path a sequence of actions belongs to, scheduling Synthesis triggers, and sequencing Capture/Interpret acknowledgment ahead of any batch recomputation. This is a coordination responsibility distinct from every subsystem that actually computes something.

**What it implements.** The path-predicate definition of Review (G8); the scheduling policy for Synthesis triggers (elapsed interval, explicit invocation, or the accumulation ceiling recommended in _[[05-Design-Review-Stress-Test]]_, Section 2 to bound unbounded deferral).

**What it owns.** Scheduling state only (what's pending, what's due) — fully reconstructible from comparing Subsystem 1 against the Dependency Tracker's dirty-state, per _[[01-State-Model]]_'s original classification of Queue state.

**What it may and may not modify.** Writes nothing scientific. Issues triggers to the Synthesis Engine (Subsystem 3) and routes classified researcher actions (Capture/Interpret/Navigate/IntentSubmit) from the Interaction layer to the Transformation Engine or Projection Engine as appropriate.

**Interfaces.**

- _Inbound:_ raw classified actions from the Interaction layer; dirty-state signals from Subsystem 9.
- _Outbound:_ transition requests to Subsystem 2; trigger signals to Subsystem 3; render requests to Subsystem 7.

---

## Subsystem 11 — Lifecycle Orchestrator

**Why it exists.** _[[06-Research-State-Mathematics]]_ classifies an in-progress Investigation as explicitly **outside** `Legal` — a "pre-formal category." A subsystem is required to hold this pre-formal state precisely so that its looseness (no provenance requirements, no legality predicate, freely revisable) never leaks into Subsystem 1, and so that the one legal crossing point — completion — is a single, identifiable admission functor rather than something any code path could attempt.

**What it implements.** The Completion Gate — the sole non-generator admission path into `Legal`, producing exactly a Capture (and possibly a Supersede) via the Transformation Engine, never directly.

**What it owns.** Session Frames (stage, sandbox contents, accumulated pre-formal reasoning) for every in-progress Investigation. None of this is part of `S`.

**What it may and may not modify.** May submit exactly one kind of request to the Transformation Engine: a Completion Gate transition. May not write `Legal` directly under any other circumstance.

**Interfaces.**

- _Inbound:_ researcher actions advancing an Investigation's stage.
- _Outbound:_ a Completion Gate request to Subsystem 2, on explicit completion only; read-only "active session" state exposed to the Projection Engine (Subsystem 7) for Dashboard rendering.

---

## Subsystem 12 — Provenance Subsystem

**Why it exists.** Provenance (`prov`, _[[06-Research-State-Mathematics]]_, D7) is attached to _every_ element and _every_ coordinate write — it is not a bolt-on audit log, it is part of what makes a state `Legal` at all (D10 condition 2). Rather than trusting every writer to remember to stamp provenance correctly, this is treated as a distinct, cross-cutting responsibility: no write reaches Subsystem 1 without passing through provenance attribution first.

**What it implements.** D7's attribution requirement; the still-open provenance-semiring hypothesis (_Discovery Roadmap_, unresolved; _[[02-System-Invariants]]_, INV-18) — this subsystem is where a future resolution of that hypothesis (joint-necessity vs. alternation composition of provenance) would actually be implemented, once proven.

**What it owns.** No separate store — provenance is carried _as part of_ each element/coordinate in Subsystem 1, not in a parallel structure; this subsystem is best understood as a cross-cutting attribution service the Transformation Engine and Synthesis Engine call through, not a component with its own persistent boundary.

**What it may and may not modify.** Attaches provenance at write time; never revises it afterward (INV-3, INV-17 restated as a hard rule here).

**Interfaces.**

- _Inbound:_ the originating act (researcher action, Investigation completion, Synthesis run) requiring attribution.
- _Outbound:_ an attribution record, consumed by the Transformation Engine as a mandatory field of any legal transition.

---

## Subsystem 13 — Configuration Boundary

**Why it exists.** Dimension Weighting Configuration and the Projection Registry are, per _[[01-State-Model]]_, authoritative-but-non-scientific — real state whose loss degrades a view, never knowledge. Keeping this in its own boundary, distinct from Subsystem 1, is what lets its durability and versioning requirements be legitimately weaker without that weakness ever touching `Legal`'s own guarantees.

**What it implements.** No formal object from the mathematics documents directly — this is the recognized "third category" _[[01-State-Model]]_ introduced for exactly this kind of state, now given its own architectural home.

**What it owns.** Dimension Weighting parameters and default Projection definitions.

**What it may and may not modify.** Adjustable by the researcher via the Interaction layer; read by Subsystem 4 (proximity weighting) and Subsystem 7 (default views). Never written by any other subsystem automatically.

**Interfaces.**

- _Inbound:_ researcher configuration changes.
- _Outbound:_ current weighting parameters to Subsystem 4; registered view definitions to Subsystem 7.

---

## Information Flow, End to End

```
Researcher action
    │
    ▼
Interaction layer (classifies: Capture | Interpret | Navigate | IntentSubmit)
    │
    ├── Capture/Interpret ──► Event Processing (10) ──► Transformation Engine (2) ──► Persistent Research State (1)
    │                                                         │                              │
    │                                                         ▼                              ▼
    │                                              Provenance Subsystem (12)      Dependency Tracker (9) ──► dirty signals
    │                                                                                        │
    ├── IntentSubmit ──► Lifecycle Orchestrator (11) ─(Completion Gate only)─► Transformation Engine (2)
    │
    └── Navigate ──► Event Processing (10) ──► Projection Engine (7)
                                                     │            ▲
                                                     │            │ reads
                                                     ▼            │
                                          Visualization Layer (8)  ├── Persistent Research State (1)
                                                                    ├── Semantic Computation Layer (4) ◄── Indexing (5) ◄── Persistent Research State (1)
                                                                    ├── Local Intelligence (6) ◄── Semantic Computation Layer (4), Indexing (5)
                                                                    └── Lifecycle Orchestrator (11, read-only)

Event Processing (10) ──(scheduled/threshold trigger)──► Synthesis Engine (3)
                                                               │  reads: Persistent Research State (1), Semantic Computation Layer (4, advisory), Local Intelligence (6, advisory)
                                                               ▼
                                                    Transformation Engine (2) ──► Persistent Research State (1)

Configuration Boundary (13) ──► Semantic Computation Layer (4), Projection Engine (7)
```

---

## How Every Named Invariant Maps to a Subsystem Boundary

|Invariant (as stated in the prompt)|Enforced by|
|---|---|
|Research state is the single source of truth|Subsystem 1's exclusive ownership of `Legal`; every other subsystem's output type is provably not `Legal` (T-Functor)|
|Derived views are disposable|Subsystems 4, 5, 7 own only caches, never authoritative data|
|Projections never modify research state|Subsystem 7's read-only access to Subsystem 1, structurally (T-Functor)|
|Transformations are the only legal mutations|Subsystem 2 is the sole writer to Subsystem 1|
|Provenance is preserved|Subsystem 12, invoked on every write, never revised afterward|
|Synthesis is reproducible|Subsystem 3's isolation (reads a frozen snapshot, proposes rather than commits) makes reproducibility independently testable|
|No visualization stores information|Subsystem 8 owns zero persistent state, by design|
|Local intelligence is advisory, never authoritative|Subsystem 6's output type (`Suggestions`, never `Legal`), and its exclusion from any write path|
|Cloud AI is never assumed|Subsystem 6's internal method is unconstrained and substitutable; no subsystem's _contract_ requires a network dependency|

---

## Relationship to Previous Documents

This document narrows and formalizes _[[04-Implementation-Dependency-Graph]]_'s earlier, prose-derived subsystem list into one justified by proof rather than by informal reading. Where the two disagree in emphasis — this document separates Storage/Indexing/Semantic Computation more sharply, and gives Provenance and Configuration explicit subsystem status rather than treating them as purely cross-cutting spine concerns — the difference is traceable directly to having D7, D16–D24, and the State Model's "third category" finding available as formal targets, which _[[04-Implementation-Dependency-Graph]]_ did not yet have.

---

## Open Questions

1. Whether Subsystem 5 (Indexing) should be one component serving both Subsystem 4 and Subsystem 6, or two independently swappable ones (a text index and a coordinate index) — this document treats it as one subsystem with two index types for economy of presentation; nothing above depends on that choice.
2. Whether Subsystem 3 (Synthesis Engine) and Subsystem 2 (Transformation Engine) should be one process with an internal boundary, or two separately deployable components — the mathematics requires only that Synthesis _propose_ and the Transformation Engine _commit_; it does not require process-level separation, only responsibility-level separation.
3. Whether Provenance (Subsystem 12) deserves its own persistent structure after all, once the semiring hypothesis is resolved — deferred pending that resolution, consistent with _[[02-System-Invariants]]_'s own treatment of INV-18 as conditional.

---

_This document is offered as a first draft, per its stated objective — coherent enough to critique, not intended as final. Critique and refinement are expected to follow the same pattern as the mathematics before it: challenge each boundary, ask whether folding two subsystems together would make some proven property unstatable, and revise only where the answer is yes._