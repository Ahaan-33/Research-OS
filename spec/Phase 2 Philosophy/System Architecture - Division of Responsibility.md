# System Architecture — Division of Responsibility

### Synthesis of Phase 1 Design

### Version 0.1

---

# How to Read This Document

The Phase 1 documents establish _what the system believes_ (First Principles, the epistemic model) and _how it should feel to use_ (Experience Constraints, Interaction Specification). Between those two lies a gap: a structure that turns forty-odd principles into a small number of components with unambiguous jurisdiction.

This document is that structure. It does not introduce new philosophy. Every boundary drawn here is a direct consequence of a rule already established in Phase 1 — the citations exist so that no boundary is arbitrary.

It also introduces no implementation. There are no data structures, no algorithms, no storage formats. There are only **components**, the **single responsibility each is trusted with**, and the **contracts** that keep them from encroaching on one another.

---

# The Governing Cut: Three Planes

Every component in the system belongs to exactly one of three planes. This is the architecture's central decision — almost every invariant in Phase 1 is really an instruction about which plane something belongs to.

```
┌─────────────────────────────────────────────────────────┐
│  SURFACE                                                 │
│  What the researcher touches. Ephemeral. Disposable.     │
│  Owns nothing. Answers "what does this mean to look at?" │
└─────────────────────────────────────────────────────────┘
                          ▲  reads
                          │  (never writes directly)
┌─────────────────────────────────────────────────────────┐
│  PROCESS                                                 │
│  The machinery that turns activity into understanding.   │
│  Owns no facts. Answers "how does the state change?"     │
└─────────────────────────────────────────────────────────┘
                          ▲  writes, under strict contract
                          │
┌─────────────────────────────────────────────────────────┐
│  SUBSTRATE                                               │
│  The Research State itself. Persistent. Canonical.       │
│  Answers "what is currently known and believed?"         │
└─────────────────────────────────────────────────────────┘
```

**Substrate** is the only plane permitted to persist scientific truth. **Process** is the only plane permitted to change it, and only in the specific, narrow ways described below. **Surface** is not permitted to do either — it may only _ask questions of_ the Substrate and _hand new material to_ Process.

This cut is what makes the rest of the system safe to build without knowing anything about how it's implemented: as long as a component respects its plane's contract, it can be replaced, rewritten, or reordered without threatening the Research State. This is precisely the guarantee that [[Local Intelligence]] and [[Design Invariants]] demand of every computational module.

---

# Substrate — The Research State

The Substrate is not one blob; it is three components with a strict internal write order. Nothing above this plane may skip a step.

## 1. Evidence Plane

**Responsibility:** hold every Scientific Object ever captured, permanently, unedited.

- Append-only. An object, once written, is never altered — only superseded by a newer object that supersedes it explicitly ([[Research Information Model]], [[Knowledge Evolution]]).
- Holds facts, not opinions about facts: observations, hypotheses, protocols, results, conclusions, literature, negative results. Everything Phase 1 calls a Note Block lives here.
- Has no concept of importance, priority, or confidence. Those belong to the layer above.
- Never deleted, never reorganised. This is the plane that makes "evidence is permanent" ([[Design Invariants]] §6) an architectural fact rather than a promise.

## 2. Interpretation Plane

**Responsibility:** hold the current, best-guess _meaning_ assigned to each object in the Evidence Plane.

- This is metadata, but treated exactly as [[Research State & Epistemic Model]] insists: as _measurement_, not tagging. Confidence, experimental stage, thread membership, publication target, positivity — each is a coordinate, not a label.
- Fully mutable. This is the _only_ plane in the entire system where "understanding changed" is expressed. Everything downstream of it (relationships, views, dashboards) is a consequence of what lives here.
- Owns Conflict Regions as first-class citizens: a conflict is not an error state to be resolved and discarded, it is a persistent object in this plane that other components (Synthesis, Dashboard) are obliged to surface, not hide ([[Design Invariants]] §8).
- Never touches the Evidence Plane's content — it only ever attaches interpretation _alongside_ an object, so that reinterpretation never risks the historical record.

## 3. Relationship / Emergence Engine

**Responsibility:** compute the live graph — the semantic geometry that connects objects to one another — from the two planes below it.

- The graph is **derived, not authored.** It is recomputed from Interpretation Plane coordinates, explicit structural links, and similarity signals; it is never itself the place where a fact is stored ([[Relationship Ontology]], [[Design Invariants]] §16).
- Because it is derived, it can be cached, rebuilt, or thrown away and reconstructed without any loss — a critical property, since it means the "semantic map" the researcher navigates is disposable in a way the two planes beneath it are not.
- This is where "organisation is multi-dimensional" (§17) becomes real: the graph is the composite of many independent organisational dimensions, weighted and combined, rather than a single hierarchy.

**Together, these three components _are_ the Research State.** Everything else in the system is either something that feeds them (Process) or something that reads them (Surface).

---

# Process — The Machinery of Change

Process components are trusted with changing the Substrate, but each is boxed into a narrow mandate. None of them may act as a shortcut around another.

## 4. Lifecycle Orchestrator (Investigations)

**Responsibility:** hold the temporary, in-progress work of a single line of inquiry before it becomes evidence.

- Manages the sequence Intent → Exploration → Hypothesis → Engineering → Experiment → Result → Conclusion described in [[Research Lifecycle]]. This is a _session_, not a permanent record.
- Investigations are sandboxed and independent of one another and of the Research State while in progress — this is what allows a researcher to have several half-finished lines of inquiry without any of them prematurely altering "what is currently believed."
- On completion, an Investigation produces exactly two outputs, and only two: **human documentation** (the narrative, unmodified) and **structured evidence** (the extractable facts). Both are handed to the Evidence Plane. The Orchestrator itself retains nothing and asserts nothing about meaning.
- This component is the architectural answer to "results and conclusions are fundamentally different entities" — it enforces that separation procedurally rather than trusting the researcher to remember it.

## 5. Synthesis Engine

**Responsibility:** the _only_ component permitted to write to the Interpretation Plane at scale.

- Reads accumulated Evidence, looks for agreement, contradiction, confidence shift, and gaps, and produces changes to interpretation: strengthened or weakened confidence, new or merged threads, new or resolved Conflict Regions ([[Scientific Synthesis]]).
- Runs periodically rather than continuously — synthesis is a deliberate act of review, not a background daemon silently rewriting meaning while the researcher works ([[Experience & Interaction Specification]], Review Mode).
- Every run produces a second output beyond the updated state: **new Research Intent** — the unresolved questions, contradictions, and gaps that synthesis itself surfaces, which become the seeds for the next cycle through the Lifecycle Orchestrator. This is what makes the system a loop rather than a pipeline.
- Never touches the Evidence Plane. Synthesis reinterprets; it does not rewrite history.

## 6. Local Intelligence Services

**Responsibility:** reduce interaction cost. Nothing more.

- A **set of independent, swappable services** — indexing, similarity, retrieval, ranking, metadata suggestion, autocomplete — each consuming the Substrate read-only and returning _suggestions_, never commits ([[Local Intelligence]]).
- Structurally prevented from writing anywhere. A suggestion becomes real only when it passes through the Surface and the researcher accepts it via Capture or Interpret. This is the mechanism, not just the policy, behind "suggestions remain suggestions" (§31).
- Deterministic and inspectable by contract: for a given input, a given service must return the same output. This is what allows any one of these services to be replaced without retraining the researcher's trust in the system.
- Runs entirely on the local machine, with no dependency the other components need to know about. Because Process only ever sees "a similarity score" or "a candidate thread," it is indifferent to whether that came from a keyword index or a local embedding model — the swap is invisible above this layer.

---

# Surface — What the Researcher Touches

Surface components own nothing. Every one of them is a lens on the Substrate, and every one of them is cheap to create, change, or discard, because discarding a lens can never discard knowledge ([[Organisational Spaces]]).

## 7. Interaction Shell

**Responsibility:** the two — and only two — verbs available to the researcher.

- **Capture:** hand a new thought to the Evidence Plane (via the Inbox, the point where an unclassified thought enters the system before it is placed anywhere). Capture is always available and is never blocked by a classification requirement.
- **Interpret:** hand a metadata change to the Interpretation Plane. This is the _only_ other thing a researcher directly does. Everything else — relationships forming, the graph reorganising, dashboards updating — is a consequence, not a direct action.
- The Shell also governs the two **modes** the researcher operates in — Work Mode (capture and navigation dominate) and Review Mode (synthesis and interpretation dominate) — which are postures over the same two verbs, not separate subsystems.

## 8. Projection Layer (Organisational Spaces)

**Responsibility:** render a purpose-built view of the Substrate for a specific question, at a specific abstraction level.

- Every named view in Phase 1 — Dashboard, Semantic Map, Thread View, Timeline, Review Panel — is an instance of exactly one component type: a **Projection**. A Projection takes a question ("what needs my attention," "what does this disease mechanism look like," "what is unresolved") and a slice of the Substrate, and renders it.
- Projections carry **abstraction level** as a parameter, not a separate mechanism: zooming in or out is the same Projection re-rendering at a different resolution, which is why moving through scale never "changes context" the way opening a different file would ([[Abstraction and Scale]]).
- Projections are stateless with respect to knowledge. They may cache for performance, but they hold no fact that isn't recoverable from the Substrate. This is what makes it safe for the system to spin up entirely new Projections as a project grows in complexity, rather than letting existing views become cluttered — "complexity creates new views," not new storage ([[Design Invariants]] §24).

## 9. Publication Layer

**Responsibility:** a terminal, special-cased Projection representing the mature, defensible endpoint of a project or thread.

- Structurally identical to any other Projection — it reads the Substrate and renders it — but it is scoped to a level of synthesis maturity (sufficient confidence, sufficiently resolved conflict, sufficient supporting evidence) rather than to a navigational question.
- Because it is a Projection and not an independent document, a publication cannot drift out of sync with the underlying Research State the way a manually maintained manuscript can. Its "completion" is a property of the Substrate reaching a state, not an act of separately assembling one.

---

# The Cross-Cutting Spine: Provenance and Conflict

Two properties are not owned by any single component — they are threaded through all nine, and the architecture only works if every component respects them identically.

**Provenance.** Every object in the Evidence Plane, every coordinate in the Interpretation Plane, every edge the Relationship Engine draws, and every claim a Projection renders must be traceable back to the Investigation and evidence that produced it. No component is permitted to introduce an unattributed fact or an unattributed relationship — this is the mechanism behind "every conclusion is traceable" ([[Design Invariants]] §35).

**Conflict.** A contradiction is not routed to an error handler. It is written into the Interpretation Plane as a Conflict Region, surfaced by the Synthesis Engine as a candidate for new Research Intent, and displayed prominently by the Dashboard Projection rather than filtered out. Every layer that touches a Conflict Region must preserve its visibility rather than resolve it silently.

---

# The Contract Table

The entire architecture can be summarised as a small number of rules governing who may do what. Nothing above this table is optional.

|Component|May write to|May only read|Persistent?|
|---|---|---|---|
|Evidence Plane|itself (append only)|—|Yes, permanent|
|Interpretation Plane|itself|Evidence Plane|Yes, mutable|
|Relationship Engine|its own cache|Evidence + Interpretation Planes|No — fully derivable|
|Lifecycle Orchestrator|Evidence Plane (on completion only)|—|No — session-scoped|
|Synthesis Engine|Interpretation Plane|Evidence Plane, Relationship Engine|No — triggers a state change, retains nothing itself|
|Local Intelligence Services|nothing|Substrate (all three planes)|No — stateless suggestions|
|Interaction Shell|Evidence Plane (Capture), Interpretation Plane (Interpret)|Substrate, via Projections|No|
|Projection Layer|nothing|Substrate|No — fully derivable|
|Publication Layer|nothing|Substrate (maturity-scoped)|No — fully derivable|

Two rows matter more than the rest: only the **Evidence Plane** and **Interpretation Plane** hold anything that would be a loss if deleted. Every other component in the system is, by design, disposable and reconstructible — which is precisely the property that lets intelligence, views, and even the graph itself evolve, get replaced, or be rebuilt from scratch without ever threatening what the researcher actually knows.

---

# Why This Division Holds Under Growth

The test of an architecture like this is not whether it works for a small project — it's whether the same nine components remain sufficient as a project grows from a handful of Note Blocks into years of accumulated research.

- **New complexity produces new Projections, never new component types.** A sprawling thread doesn't need a tenth kind of component; it needs another instance of the Projection Layer rendering a narrower question.
- **New intelligence produces new Local Intelligence Services, never new authority.** A better similarity method or a smarter recommender slots into the same read-only, suggestion-only contract as the one it replaces.
- **New scientific ground produces new Evidence, never edited history.** Whatever the project has become, the Evidence Plane's append-only guarantee means nothing about the past has to be renegotiated to accommodate the present.
- **New understanding produces new Interpretation, resolved through Synthesis, never through direct edits from Surface or Process shortcuts.** The single narrow gate for changing "what we currently believe" is what keeps confidence, threads, and conflict trustworthy no matter how large the graph gets.

This is the sense in which the division of responsibility above is not just tidy but load-bearing: each invariant in Phase 1 survives scale because it was assigned to exactly one component whose contract cannot be bypassed by any other.