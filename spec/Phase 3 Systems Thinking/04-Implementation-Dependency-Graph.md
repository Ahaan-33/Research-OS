# Research Operating System — Implementation Dependency Graph

### Phase 3 Architecture · Document 5 of 6

### Version 0.1

---

## Purpose

_[[00-Runtime-Specification]]_ through _[[03-Ambiguity-Audit]]_ establish behavior without naming implementable subsystems. This document performs that naming: it derives the subsystem list from the responsibilities already assigned in Phase 2 and the runtime/state model above — rather than starting from the prompt's illustrative list — and orders them into a dependency DAG. It also performs the assignment's Seventh Task: translating relevant external research (incremental computation, reactive programming, persistent data structures, CRDTs, spatial indexing, ECS, language servers, compiler architecture) into this project's own vocabulary, at the points where doing so genuinely strengthens a specific subsystem's design rather than as decoration.

References back to: _[[00-Runtime-Specification]]_ (the pipelines a subsystem must implement), _[[01-State-Model]]_ (the state a subsystem owns), _[[02-System-Invariants]]_ (the assertions a subsystem must uphold).

---

## Method

A subsystem is derived, not assumed, by asking: which single Phase 2 component or cross-cutting runtime concern requires its own independently versionable, independently testable body of code? This mirrors the _Convergence Pass_ discipline applied one layer down — a candidate subsystem earns a place only if merging it into a neighbor would either conflate two different authorities (violating _[[02-System-Invariants]]_) or conflate two different performance/lifecycle profiles (e.g., durable storage vs. disposable cache).

---

## The Derived Subsystem List

1. **Evidence Store** — durable, append-only persistence for `E`. Implements INV-1, INV-2, INV-3.
2. **Interpretation Store** — durable, mutable-per-coordinate persistence for `I`, with multi-value-register semantics. Implements INV-5, INV-6, INV-7.
3. **Dependency Tracker** — the incremental-computation substrate underlying all Cache invalidation; owns the (element, dimension)-grain dependency graph described in _[[00-Runtime-Specification]]_, Dependency Updates.
4. **Relationship / Emergence Engine** — computes the derived graph and organisational geometry from Evidence Store + Interpretation Store + Similarity signals, via the Dependency Tracker's incremental recomputation.
5. **Local Intelligence Services** — Indexing, Similarity, Recommendation, Metadata Suggestion, each independently swappable behind a Service Registry.
6. **Lifecycle Orchestrator** — Session Frame, Intent Queue, Engineering Sandbox, Completion Gate; owns Session/Lifecycle state (_[[01-State-Model]]_, State 7).
7. **Synthesis Engine** — Evidence Scanner, Agreement/Contradiction Reader, Interpretation Writer, Intent Generator; the sole batch writer of `I`.
8. **Interaction Shell** — Capture Surface, Interpret Surface, Mode Selector, Session Memory; the sole originator of single-object writes.
9. **Projection Layer** — Query Definition, Abstraction Parameter, Render Cache, Projection Registry; the sole read-only rendering functor.
10. **Renderer** — the actual pixel/DOM/terminal output layer consuming a Projection's rendered output. Kept distinct from the Projection Layer itself because a Projection's output (an abstract "rendered view" description) and its concrete visual realization are different concerns with different replacement cadences — a new visual style (e.g., a different metro-map skin) should not require touching Projection logic at all.
11. **Scheduling / Event Loop** — implements the Interactive Loop / Reconciliation Loop split from _[[00-Runtime-Specification]]_; owns Queue state.
12. **Synchronization Layer** — implements _[[00-Runtime-Specification]]_'s Synchronization Philosophy (join-semilattice merge for `E`, multi-value-register merge for `I`); optional at the deployment level (a single-device install needs no Synchronization Layer at all) but architecturally required if multi-device or peer sharing is ever supported.
13. **Configuration Store** — persists Dimension Weighting Configuration and the Projection Registry (_[[01-State-Model]]_, "authoritative-but-non-scientific" state), kept distinct from the Evidence/Interpretation Stores because its durability and versioning requirements are categorically weaker.
14. **Plugin / Extension Boundary** — the mechanism by which a Local Intelligence service, a Projection type, or an object/relationship/dimension type (per A8, A9 in _[[03-Ambiguity-Audit]]_) is registered without modifying core subsystems. Derived from _Local Intelligence_'s "Replaceable Components" principle and the extensibility of object/relationship/dimension types.

### What Is Deliberately Not a Separate Subsystem

- **Publication** is not a subsystem; it is a configuration of the Projection Layer (a maturity-scoped Query Definition), per _Convergence Pass_'s absorption of the Publication Layer.
- **History** is not a subsystem; it is a structural property of the Evidence Store (the Supersession Index), per _[[01-State-Model]]_'s rejection of a separate History State.
- **A "Command System"** in the sense the prompt's illustrative list suggests (a discrete command-pattern dispatcher) is not elevated to its own subsystem — it is absorbed into the Interaction Shell, since every command the researcher issues is already one of exactly two verbs (Capture, Interpret) plus Navigate and IntentSubmit (_System Architecture_, "Primary Interaction"); a separate Command System would introduce a third category of write authority not sanctioned by INV-9/INV-10.
- **An Entity-Component-System (ECS) layer** is considered and rejected as the organizing pattern for Scientific Objects — see _Rejected Alternatives_, below.

---

## The Implementation Dependency DAG

```
                    ┌─────────────────────┐
                    │  Evidence Store      │  (no dependencies — foundational)
                    └──────────┬───────────┘
                               │
        ┌──────────────────────┼───────────────────────┐
        │                      │                        │
┌───────▼────────┐   ┌─────────▼──────────┐   ┌─────────▼─────────┐
│ Interpretation  │   │ Lifecycle          │   │ Configuration      │
│ Store           │   │ Orchestrator       │   │ Store              │
│ (depends on     │   │ (writes Evidence   │   │ (independent;      │
│  Evidence Store │   │  Store only at     │   │  no scientific     │
│  for validity)  │   │  Completion Gate)  │   │  dependency)       │
└───────┬─────────┘   └─────────┬──────────┘   └────────────────────┘
        │                       │
        │                       │ (Intent Queue feeds back to)
        │                       ▼
        │             ┌───────────────────┐
        │             │ Synthesis Engine    │
        │             │ (reads Evidence +   │
        │◄────────────┤  Interpretation,    │
        │  writes      │  writes            │
        │  Interpret.  │  Interpretation)    │
        │              └─────────┬───────────┘
        │                        │ (new Intent)
        │                        └───────────────►  back to Lifecycle Orchestrator
        │
        ▼
┌───────────────────┐      ┌──────────────────────┐
│ Dependency Tracker  │◄────┤ Local Intelligence     │
│ (keys on Evidence +│     │ Services               │
│  Interpretation    │     │ (read Evidence +       │
│  identity/coords)  │     │  Interpretation)       │
└─────────┬───────────┘     └──────────┬─────────────┘
          │                            │ (similarity signal)
          ▼                            ▼
┌────────────────────────────────────────────┐
│ Relationship / Emergence Engine              │
│ (reads Evidence, Interpretation,             │
│  Local Intelligence similarity;              │
│  driven incrementally by Dependency Tracker) │
└──────────────────────┬────────────────────────┘
                        │
                        ▼
              ┌──────────────────┐
              │ Projection Layer   │◄──── reads Configuration Store (Projection Registry)
              │ (reads everything  │
              │  above, read-only) │
              └─────────┬───────────┘
                        │
                        ▼
              ┌──────────────────┐
              │ Renderer            │
              └──────────────────┘

┌────────────────────┐     ┌───────────────────────┐
│ Interaction Shell    │────►│ Evidence Store,        │  (writes, single-object)
│ (reads Local Intel., │     │ Interpretation Store,  │
│  Projection Layer,    │     │ Lifecycle Orchestrator │
│  Configuration Store) │     │ (Intent submission)    │
└──────────────────────┘     └───────────────────────┘

┌──────────────────────────┐        ┌───────────────────────────┐
│ Scheduling / Event Loop     │◄──────►│ Synchronization Layer        │
│ (cross-cutting; drives all │        │ (cross-cutting; optional at  │
│  Reconciliation-loop        │        │  single-device deployment)   │
│  subsystems above)          │        └───────────────────────────┘
└──────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Plugin / Extension Boundary                                    │
│ (cross-cutting; consumed by Local Intelligence Services,       │
│  Projection Layer, and the object/relationship/dimension        │
│  type registries inside Evidence Store / Interpretation Store)  │
└──────────────────────────────────────────────────────────────┘
```

### Reading the DAG

- **Evidence Store has zero dependencies** and can be built, tested, and validated entirely on its own — it is the correct starting point for any implementation effort, matching its role as the one truly foundational authoritative structure.
- **Interpretation Store depends only on Evidence Store** existing (an `I` coordinate must reference a real `E` element) — it does not depend on Synthesis, Local Intelligence, or anything downstream. It can be built and tested second.
- **Lifecycle Orchestrator depends only on Evidence Store** (its sole write path at the Completion Gate) — it does not depend on Interpretation Store at all (INV-12: no authority over `I`, ever), which means it can be developed in parallel with Interpretation Store rather than after it.
- **Synthesis Engine is the first subsystem that depends on both stores simultaneously** — this is a direct DAG consequence of it being "the richest morphism" (_Discovery Roadmap §2_): it cannot be built until both Evidence and Interpretation Stores exist and are stable.
- **Dependency Tracker and Local Intelligence Services can be developed in parallel with each other and with Synthesis Engine**, since neither depends on the other (per A10 in _[[03-Ambiguity-Audit]]_, their dependency is one-directional and neither is upstream of the other in a way that blocks parallel development — Local Intelligence depends only on the two Stores).
- **Relationship/Emergence Engine is the first subsystem requiring the Dependency Tracker to be functional**, and is therefore correctly late in the build order despite feeling, subjectively, like a "core" feature — this mirrors _Convergence Pass_'s own finding that the graph is the least foundational-feeling-but-most-central-seeming component.
- **Projection Layer is the last major subsystem before the Renderer**, since it depends on every read-only functor beneath it.
- **Interaction Shell can begin development early** (it only strictly requires Evidence Store and Interpretation Store to exist for Capture/Interpret to have somewhere to write) but cannot be feature-complete until Local Intelligence (for suggestions) and Projection Layer (for "render what the researcher is looking at while acting," _Computational Model_) exist — so its development is necessarily staged, not blocked outright.
- **Scheduling/Event Loop, Synchronization Layer, Configuration Store, and Plugin/Extension Boundary are cross-cutting** — none of them sit cleanly in the top-to-bottom chain, because each is a concern threaded through multiple subsystems rather than a stage in the pipeline. This is a deliberate architectural finding: forcing them into the linear DAG would misrepresent their actual role, exactly as _Convergence Pass_ warned against for Provenance and Conflict at the component level.

---

## Independently Buildable Subsystems

Per the assignment's explicit question ("which subsystem can exist independently?"):

- **Evidence Store** — fully independent; testable and deployable with zero other subsystems (a system that only supports Capture, with no Interpretation, Synthesis, or Projection, is a degenerate but internally consistent partial implementation).
- **Configuration Store** — fully independent of the scientific pipeline entirely.
- **Renderer** — independent of everything except the Projection Layer's output contract; a Renderer can be developed and tested against synthetic Projection output before the Projection Layer itself exists.
- **Local Intelligence Services** — independent of each other (a Similarity Service can ship without a Metadata Suggestion Service existing) and independent of Synthesis, Lifecycle Orchestrator, and Projection Layer, needing only the two Stores.

## Subsystems Requiring the Most Upstream Work Before They Can Begin

- **Projection Layer** (requires Evidence Store, Interpretation Store, Relationship/Emergence Engine, and — for the active-session Dashboard question — Lifecycle Orchestrator, all functioning).
- **Publication rendering** (not a separate subsystem, but the most demanding _configuration_ of Projection Layer, per its absorption finding) — requires Synthesis Engine's idempotence property (INV-23) to be meaningful at all, making it the single latest-maturing capability in the entire system.

---

## Translating External Research Into This Project's Vocabulary

Per the assignment's Seventh Task, the following translations were judged to genuinely strengthen specific subsystems above. Each entry states the external idea, and then restates it strictly in terms already defined in _[[00-Runtime-Specification]]_ / _[[01-State-Model]]_ / _[[02-System-Invariants]]_ — never imported as-is.

**Incremental computation / dependency graphs (e.g., self-adjusting computation, build-system-style dependency graphs).** Translation: the Dependency Tracker subsystem is exactly a self-adjusting computation graph, but scoped specifically to (element, dimension)-pair granularity (INV-24) rather than arbitrary computation nodes. The generic research idea ("recompute only what a change could have affected") is not imported wholesale — it is narrowed to the specific granularity the Interpretation Plane's own definition already fixes (_Discovery Roadmap §1_: `I` as a uniform function over (element, dimension) pairs), so the Dependency Tracker's node type is not "any computation" but specifically "a derived value keyed on a set of (element, dimension) pairs or element identities."

**Reactive programming / functional reactive programming (FRP).** Translation: the Interactive Loop / Reconciliation Loop split (_[[00-Runtime-Specification]]_) is a reactive system in spirit — writes propagate as events, derived values recompute in response — but explicitly rejects FRP's usual assumption of a single, continuously-updating signal graph. Because Synthesis is deliberately _not_ continuous (A3 in _[[03-Ambiguity-Audit]]_; _Design Invariants §26_), the reactive graph here has two distinct update cadences (immediate for `Cache` regions touched by single writes, batched for regions touched by Synthesis), which most FRP frameworks do not model natively. The translation is: build the Dependency Tracker using FRP's dependency-propagation _mechanism_, but do not adopt FRP's typical assumption of uniform update frequency.

**Persistent data structures (in the Okasaki sense — immutable, structure-sharing).** Translation: the Evidence Store's append-only, join-semilattice structure (INV-1) is naturally implemented as a persistent data structure — every version of `E` shares structure with its predecessor, and "the previous state" is never destroyed by an append, which is precisely what INV-1 requires and precisely what a persistent (as opposed to ephemeral, in-place-mutating) data structure guarantees for free. This is a strong implementation recommendation for the Evidence Store specifically, not a general architectural claim.

**Event sourcing.** Translation: partially applicable, and the audit is explicit about where it does _not_ apply. Event sourcing's core idea — the log of events is authoritative, and current state is a fold over that log — describes the Evidence Store's Supersession Index well (every Supersede is an event; current visible state is derivable by folding). It does **not** describe the Interpretation Store equally well, because `I`'s multi-value-register semantics (INV-6) mean the "current state" is not simply the last event in a total order — it can be _multiple_ co-existing values (a Conflict Region). The translation is therefore: event-source the Evidence Store; do not attempt to event-source the Interpretation Store using the same fold-based recovery model, since Interpretation's recovery model needs a merge operation richer than "replay in order."

**CRDTs (join-semilattices, multi-value registers).** Translation: already fully absorbed, not merely inspired by — _Discovery Roadmap §3, §6_ explicitly identifies `E` as a join-semilattice / grow-only-set CRDT and `I` as a multi-value register CRDT, and the Synchronization Layer subsystem (item 12, above) is precisely a CRDT-merge implementation. No further translation is needed here; this is the one research area the corpus already formalized correctly, and this document's contribution is only to confirm the Synchronization Layer subsystem boundary matches that formalization exactly.

**Knowledge graphs / semantic indexing.** Translation: the temptation to treat the Relationship/Emergence Engine as "a knowledge graph database" is explicitly rejected. A knowledge-graph database treats the graph as the primary, queried, sometimes-mutated data structure. Here, the graph is disposable and fully derived (INV-14, INV-15) — it should be implemented as a _view_, structurally closer to a materialized query result than to a persisted graph database's node/edge tables. Standard graph-database techniques (indexing by edge type, traversal optimization) remain useful _within_ the Relationship/Emergence Engine's implementation, but the engine itself must not be built as "the" database, on pain of silently promoting derived state to authoritative status.

**Incremental layout algorithms / spatial indexing (e.g., R-trees, quadtrees, force-directed layout stabilization).** Translation: relevant specifically to the Renderer subsystem and to Projection Layer's rendering of the organisational geometry (_[[01-State-Model]]_, State 4) as a spatial map. Since the geometry is recomputed incrementally (INV-24: bounded by local neighborhood), a spatial index that supports incremental re-insertion (e.g., an R-tree or a locality-sensitive structure) is the correct translation target — a full-rebuild spatial index (a k-d tree rebuilt from scratch on every change) would silently reintroduce the unbounded-recomputation problem INV-24 exists to forbid, even though the _scientific_ data underneath is being updated correctly.

**Constraint propagation.** Translation: judged **not** to strengthen the current architecture and is not adopted. Constraint propagation assumes a network of mutually-constraining variables converging toward a consistent assignment — but _[[02-System-Invariants]]_ INV-6/INV-19/INV-20 explicitly require that _inconsistency itself_ (a Conflict Region) be preserved and surfaced, not propagated away toward a single consistent solution. Adopting constraint-propagation techniques wholesale would risk silently "solving" a Conflict Region the architecture requires to remain visible. This is a case where the research area was considered and explicitly rejected, per the assignment's "do not import ideas blindly" instruction.

**Entity-Component-System (ECS) architecture.** Translation: considered as a candidate organizing pattern for Scientific Objects (treating "content element" as an Entity, and organisational dimensions as Components) and rejected as the primary Evidence/Interpretation Store implementation strategy. ECS is optimized for extremely high-frequency, homogeneous per-frame updates across large numbers of near-identical entities (its native habitat is a game engine's per-frame simulation loop) — a fit for the Renderer's frame-by-frame update cycle, but a poor fit for `E`/`I`, whose update frequency is bounded by researcher action (INV-24's whole point is that this is _not_ a per-frame system). ECS-style component storage (columnar, cache-friendly storage of one "component type" — i.e., one organisational dimension — across many entities) is, however, a reasonable _internal_ storage layout choice for the Interpretation Store, since `I` is already defined as a function over (element, dimension) pairs, which is structurally identical to an ECS component table. The translation is narrow: **adopt ECS-style columnar storage inside the Interpretation Store's implementation; do not adopt ECS as the system's overall entity model.**

**Incremental rendering (dirty-rectangle / retained-mode rendering, as in browser or game-engine renderers).** Translation: directly applicable to the Renderer subsystem specifically — the Renderer should track which regions of a Projection's output actually changed (per the Dependency Tracker's invalidation signal) and re-draw only those regions, rather than re-rendering an entire Dashboard or Semantic Map on every Cache update. This is a standard, well-understood technique requiring no adaptation beyond noting that "dirty region" here means "a Projection fragment whose underlying (element, dimension) pairs were invalidated," reusing the same Dependency Tracker vocabulary rather than inventing a parallel rendering-specific dirty-tracking mechanism.

**Language servers / compiler architecture (incremental parsing, incremental type-checking).** Translation: the closest existing-engineering analogue to the entire Reconciliation Loop. A language server's model — an always-running background process that incrementally re-analyzes a codebase as it changes, serving stale-but-labeled-as-stale results to an IDE while recomputation is in flight — maps almost directly onto the Synthesis Engine + Relationship/Emergence Engine's relationship to the Projection Layer. The translation to adopt: Projections should be able to indicate, in their rendered output, that they are serving a result computed against a slightly stale `S` snapshot (analogous to a language server reporting "diagnostics as of last successful analysis") rather than either blocking until fully current or silently presenting stale data as current. This is a genuine architectural refinement this translation surfaces that was not explicit in Phase 1/2 prose — flagged as an Open Question below, since it implies a small addition to the Projection State object in _[[01-State-Model]]_ (a staleness marker).

**Database internals (write-ahead logging, MVCC).** Translation: directly applicable to the Evidence Store and Interpretation Store's durability implementation (_[[00-Runtime-Specification]]_, Crash Consistency) — a write-ahead log is the standard mechanism for the "either fully happened or didn't happen" guarantee INV-1/INV-5 require, and MVCC (multi-version concurrency control) is a natural fit for `I`'s multi-value-register semantics, since MVCC already assumes multiple concurrently-valid versions of a value can coexist and be read by different readers. This is a strong, low-risk translation: implement the two Stores using conventional WAL + MVCC techniques, adapted only in that the "multiple versions" MVCC anticipates are, here, sometimes _simultaneously and permanently valid_ (a Conflict Region) rather than merely transiently valid during a snapshot's lifetime.

---

## Design Consequence: One New Object Surfaced by Research Translation

The Language Server translation above surfaces a genuine gap: _[[01-State-Model]]_'s Projection State (State 5) does not currently record whether a given Render Cache entry is fresh or stale-but-serving. This document recommends adding a **staleness marker** to Render Cache entries — not a new top-level state object, but a field on the existing one — so that a Projection can honestly report "this view reflects `S` as of version N; a newer version M is being reconciled" rather than presenting potentially-outdated information as unqualified truth. This is flagged for incorporation into a future revision of _[[01-State-Model]]_ rather than retrofitted here, to keep this document's scope to dependency structure.

---

## Rejected Alternatives

- **A single monolithic "Storage" subsystem covering Evidence, Interpretation, and Configuration together.** Rejected: their durability, mutability, and criticality profiles are categorically different (INV-1's grow-only guarantee vs. INV-6's multi-value-register semantics vs. Configuration's resettable, non-scientific status) — merging them would either over-engineer Configuration's durability or under-engineer Evidence's, per the same reasoning _[[01-State-Model]]_ used to keep Dimension Weighting a separate category from `S`.
- **Treating Local Intelligence as part of the Relationship/Emergence Engine** (since both are read-only derivations). Rejected on the same ontological grounds _Convergence Pass_ already used: one assists the write path, the other the read path — different moments in the loop, not the same responsibility.
- **A generic "Command System" subsystem.** Rejected — see "What Is Deliberately Not a Separate Subsystem," above; absorbing it into Interaction Shell avoids introducing an unsanctioned third write-authority category.
- **ECS as the primary entity model.** Rejected as the overall model (see translation above); narrowly adopted only as an internal storage-layout technique inside the Interpretation Store.
- **Constraint propagation for Conflict resolution.** Rejected outright — see translation above; would violate INV-19/INV-20.

---

## Open Questions

1. Whether the Synchronization Layer is a required subsystem for v1, or a v2 feature — the corpus is silent on multi-device support as a launch requirement, only on architectural compatibility with it. Deferred to product scoping, not architecture.
2. Whether the staleness-marker addition to Render Cache (surfaced above) should be visible to the researcher directly (a UI indicator) or purely an internal consistency mechanism. Deferred — either is compatible with the state model; this is a UX decision built on top of an architectural one.
3. Whether the Plugin/Extension Boundary should support third-party Projection types at the same trust level as built-in ones, or a restricted subset — a security/sandboxing question outside this document's scope.

---

## Implementation Consequences

- Build order should follow the DAG above: Evidence Store → (Interpretation Store ‖ Lifecycle Orchestrator ‖ Configuration Store) → Synthesis Engine, with Dependency Tracker and Local Intelligence developed in parallel starting immediately after the Stores exist.
- The Dependency Tracker is the single piece of infrastructure every performance guarantee in _[[02-System-Invariants]]_ (INV-14, INV-15, INV-24) ultimately rests on; it deserves the same engineering priority as the Stores themselves, not the treatment of a "later optimization."
- The translated research above should inform specific subsystem implementations (WAL+MVCC for the Stores, persistent data structures for Evidence, spatial indexing for the Renderer/geometry, dirty-region incremental rendering for the Renderer) without being adopted as architecture-wide paradigms (no ECS-as-entity-model, no constraint-propagation-as-conflict-resolution, no knowledge-graph-database-as-Emergence-Engine).

---

_See also: [[00-Runtime-Specification]] for the pipelines these subsystems implement. [[01-State-Model]] for the state each subsystem owns or reads. [[02-System-Invariants]] for the assertions each subsystem must satisfy. [[05-Design-Review-Stress-Test]] for adversarial pressure on this dependency structure, including where the DAG above could still hide a cycle under scale._