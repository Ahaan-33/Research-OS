# Research Operating System — Reference Implementation Strategy

### Phase 6 Implementation · Document 4 of N

### Version 0.1

---

## Purpose

Documents 06–16 fixed the mathematics, the subsystem boundaries, the runtime dynamics, the provenance structure, and the operation-level contracts. What they deliberately did not fix — because nothing in the mathematics forced it — is how any of this actually gets built: what process it runs in, what writes bytes to disk, what language it's written in, and what the smallest version of it looks like.

This document makes those calls. It is an engineering strategy document, not a formal one. It does not introduce, revise, or question any subsystem boundary, invariant, or theorem from Documents 06–16 — it takes them as fixed and asks, for each remaining open engineering question, either "does the existing specification actually force an answer here" or, where it doesn't, "what is the correct trade-off given the constraints that do exist."

Audience: the engineer opening an empty repository next. Every section should leave them with fewer decisions to make, not more things to think about.

---

## Reading the Specification for What It Already Decided

Before evaluating options, it's worth being explicit about which of the questions this document was asked to answer are not actually open. Three are not:

**1. Markdown files cannot be the authoritative storage of `ResearchState`.** This is not a stylistic preference — it's forced by INV-9/INV-11 (exactly one write path into `Legal`, structurally, not by convention) combined with D10 (every write must pass a legality check before it lands). A directory of `.md` files editable by any text editor, any other plugin, or direct filesystem access has no mechanism to gate a write through Subsystem 2's legality check. The moment `ResearchState` lives as freely-editable files, "exactly one writer" stops being a structural fact and becomes a request the user is trusting themselves and every other program on their machine to honor. That is precisely the weaker guarantee _[[02-System-Invariants]]_ explicitly rejected in favor of the stronger one ("a runtime `if` that rejects an illegal write is strictly weaker than an interface that has no method through which the write could even be attempted"). Markdown's legitimate role is downstream of `S`, not underneath it — see below.

**2. Local Intelligence's default implementation must not require a network call.** Already fixed by INV-21 and Ambiguity Audit A7 ("no cloud AI assumed"); this document doesn't re-litigate it, it just makes sure the technology choices below don't accidentally violate it (e.g., by defaulting to a hosted embedding API with no offline fallback).

**3. The Visualization Layer owns no persistent state.** Already fixed structurally in _[[12-System-Architecture-First-Draft]]_ and given a zero-return-type interface in _[[16-Subsystem-Interface-Contracts]]_. Any implementation choice below that would tempt a UI layer to cache authoritative data locally (e.g., "just keep a copy of `I` in the frontend's state store for snappy rendering") is a violation to design against, not a convenience to allow.

Everything else in this document — delivery form, physical storage engine, language, initial scope — is a genuine engineering trade-off, not a forced conclusion, and is treated as such below.

---

## 1. What Markdown Actually Is in This Architecture

Worth resolving first because it reframes several of the questions below. Markdown is neither the authoritative store nor merely one interchange format among equals — it has two distinct, legitimate roles, and conflating them is the most likely early design mistake:

- **As a Projection.** A rendered Markdown document — a Publication View, a Thread View exported for reading elsewhere — is exactly an instance of `Project` (_[[10-Projection-Formalism]]_, D28), no different in kind from a rendered Timeline or Semantic Map. It is disposable, regenerable, and never read back as an input to anything. This is Markdown's primary role in ROS, and it is a strong one: because several of the named Projection operators (Thread View, Publication View) are naturally list-and-heading-shaped, Markdown is arguably the _best-fitting_ renderer for exactly those two views, not a compromise.
- **As an ingestion format for Capture.** A researcher's existing Markdown notes (from Obsidian or anywhere else) are legitimate `Payload` inputs to `Capture` (_[[07-Transformation-Algebra]]_, G1) — parsed, minted a fresh identity, and admitted into `E` through the normal gated path, exactly like any other captured content. This is real and useful, but it is Capture of Markdown-as-content, not Markdown-as-state: once ingested, the original file is not treated as a live, continuously-synced representation of the resulting element — editing the file afterward does not mutate `E` (there is no generator for that), only a fresh Capture/Interpret action does.

**What this rules out, explicitly:** a design where ROS "is" a live two-way sync between a vault of `.md` files and `ResearchState`, such that editing a file's frontmatter is treated as an `Interpret` write. This is a common and tempting Obsidian-plugin pattern, and it is incompatible with D10's legality gate for the reason given above. If two-way sync is wanted later as a convenience feature, it must be built as a mediated Capture/Interpret action triggered by a detected file change and routed through Subsystem 2 like any other write — never as direct file-content-equals-state.

---

## 2. Delivery Form: Obsidian Plugin vs. Standalone App vs. Library

|Option|What it buys|What it costs|
|---|---|---|
|**Obsidian plugin only**|Existing UI shell, existing user base of exactly the target audience (researchers doing markdown-centric note work), cross-platform (desktop + mobile) for free, fast path to real usage|Obsidian's plugin API gives no exclusive control over the vault directory — anything else touching those files is a threat to the "exactly one writer" guarantee unless `ResearchState` is stored entirely outside the files Obsidian shows the user (see below); Obsidian's rendering model is built for prose, not for the Semantic Map / Tree / Dashboard projections, which need genuinely custom interactive rendering the plugin API supports but doesn't make easy|
|**Standalone desktop app only**|Full control over the entire read/write path and every pixel; the Interaction Shell can be designed exactly around Capture/Interpret/Navigate rather than adapted from a general-purpose editor's UX; the natural long-term home for all six Projection operators rendered well|Substantially more upfront UI work (every screen built from nothing); no existing distribution channel or user base; slower to get real usage validating the architecture, which is the actual goal of a first implementation|
|**Library only (no UI)**|Forces Subsystems 1, 2, 3, 4, 5, 9, 12, 13 to be built and correctness-tested directly against Documents 15/16 with zero UI-driven scope creep; cleanly reusable by either shell above|Validates only half the architecture — Subsystems 8, 10, 11 (Interaction, Navigation, Lifecycle) never get exercised by a real user, and those are exactly the subsystems most likely to reveal that a "settled" interface contract is awkward in practice|

**Recommendation: library first, Obsidian plugin as the first shell, standalone app deliberately deferred.**

The core reasoning: the goal stated for this phase is the smallest implementation that faithfully validates the architecture and can evolve into the complete system — not the smallest implementation that ships a good product. A headless core library (everything except Subsystems 8 and the UI-facing half of 10) is the correct first deliverable regardless of what UI eventually sits on top of it, because _[[16-Subsystem-Interface-Contracts]]_ already specifies its entire external surface — building it is mechanical translation of an already-settled document, not a design exercise. The only remaining question is which shell to pair it with first to get Subsystems 8/10/11 exercised cheaply, and Obsidian wins that comparison decisively: it is not "automatically right because the project began there," it is right because it is the cheapest way to get a real Interaction Shell and Visualization Layer in front of real usage without spending the first implementation's entire budget building a UI from scratch. A standalone app is very likely the right long-term home for the harder Projection operators (Semantic Map's graph rendering in particular does not fit Obsidian's rendering model well) — but that is a Phase 7-or-later decision, made easier, not harder, by having a library with a clean contract already validated against one real shell.

**The load-bearing design constraint this recommendation requires, stated explicitly:** the plugin must store `ResearchState` in its own SQLite file inside the plugin's data directory (Obsidian gives every plugin a private, non-vault-visible storage area for exactly this purpose), never as `.md` files inside the vault the user sees and edits. Obsidian, under this design, is Subsystem 8 (Visualization Layer) and the UI-facing half of Subsystem 10 (Event Processing) — nothing more. The vault's visible Markdown files are Projection output (Section 1, above) plus a Capture-ingestion source, never the live representation of `S`. This is the one non-negotiable consequence of choosing Obsidian as the first shell, and it should be stated to anyone joining the project before they write a line of code, because it is the opposite of Obsidian's own native mental model (where the files _are_ the data) and the temptation to "just sync the frontmatter" will recur.

---

## 3. Canonical Representation of `ResearchState`

Already fixed at the _logical_ level by _[[15-Canonical-Data-Model]]_: `ResearchState = { evidence, interpretation, dimensions }`, exactly D9's `(E, I)` plus the co-located dimension registry. What remains is the _physical_ representation — what's actually on disk.

**Recommendation: an append-only event log as the physical source of truth, with materialized `E`/`I` tables as a derived, rebuildable read-index that Subsystem 1 itself maintains.**

Reasoning: every legal mutation of `S` is already, by construction, one of four generator applications (_[[07-Transformation-Algebra]]_), each committed atomically by exactly one subsystem (_[[16-Subsystem-Interface-Contracts]]_, `TransformationEngine`). Recording each committed generator application as an immutable, ordered log entry is not a new abstraction layered on top of the mathematics — it is the most direct possible physical encoding of the mathematics already stated: the log _is_ the morphism path `S₀ → S₁ → S₂ → …` through `Res` that _[[06-Research-State-Mathematics]]_ and _[[07-Transformation-Algebra]]_ already describe, and the materialized `E`/`I` tables are simply the fold of that path applied so far. This gets three things essentially for free that would otherwise require separate design work: full provenance/audit history (the log already contains it — this is not a duplicate of `ProvenanceExpr`, it's the same commit history the antichain in _[[14-Provenance-Structure]]_ is describing, viewed as a sequence rather than as a lattice), trivial crash recovery (replay from the last durable log position), and a mechanical way to write the INV-14/INV-23 conformance tests _[[02-System-Invariants]]_ already calls for (rebuild the materialized tables from the log and diff against the live tables — should always be empty).

**What "canonical" means precisely, to avoid ambiguity:** the canonical representation of `ResearchState` for any query, comparison, or external contract remains the materialized `(E, I, D)` triple exactly as _[[15-Canonical-Data-Model]]_ specifies it — the event log is a storage and recovery technique, not a fourth component of `S`, and no subsystem outside Subsystem 1's own internals should ever need to read the log directly. This preserves D9's "no third component" finding without qualification; it only decides how the two components that do exist are physically kept durable.

---

## 4. Persistence Engine

Given Section 3's event-sourced design, the physical engine needs: single-writer atomic transactions (D10's "commit either fully lands or not at all"), efficient point lookups (`getElement`, `getCoordinate`), efficient indexed predicates (`Current(E)`, `Conflicts(S)` — both specified in _[[15-Canonical-Data-Model]]_ as index-backed views, not scans), no server process (matches "no cloud AI assumed" extended to storage generally — a local-first research tool should not require the researcher to run a database server), and a single-file artifact simple enough to back up by copying one file.

**Recommendation: SQLite**, used two ways in one file — an append-only `events` table (the log, Section 3) and a set of ordinary mutable tables (`elements`, `coordinate_values`, `dimensions`) that are the materialized read-model, rebuilt by folding `events`. SQLite's transaction guarantees map directly onto `commit`'s atomicity requirement; its mainstream embedded bindings exist in every language under consideration below; a single `.sqlite` file per project is the simplest possible backup/portability story available, which matters more than it might initially seem for a tool whose entire value proposition is "your research history is never lost" (INV-1, INV-2, INV-7).

**Alternatives considered and why they lose:**

- **A pure key-value embedded store (LMDB, RocksDB, LevelDB).** Would handle the event log well but forces `Current(E)`/`Conflicts(S)`'s indexed-predicate requirement to be hand-built rather than expressed as an ordinary indexed query — more code, more places to get the locality bound (INV-24) wrong, for no benefit SQLite doesn't already provide at this scale.
- **A server-based database (Postgres, etc.).** Rejected for the first implementation on the same "no cloud AI assumed" reasoning extended to infrastructure generally: requiring a running server process for a local research tool is a real adoption and reliability cost with no corresponding benefit until multi-user or multi-device concurrent access is an actual requirement, which is out of scope for a first implementation. Nothing in Document 15's schema is SQL-specific, so this remains a swappable later decision, not a foreclosed one.
- **Flat files (one JSON/YAML file per element).** Rejected: no atomic multi-file transaction primitive without building one, which is exactly the atomicity guarantee D10 requires and which SQLite already provides natively.

---

## 5. Language and First-Implementation Stack

**Recommendation: TypeScript for the core library, `better-sqlite3` (synchronous, embedded) for storage, packaged so the same library is consumed directly by the Obsidian plugin.**

The deciding factor is not a claim that TypeScript is the best possible language for this problem in the abstract — it is that Obsidian plugins are necessarily JavaScript/TypeScript, and putting the core library in a different language would require either a foreign-function boundary (WASM, native addon) or an IPC boundary (a sidecar process) between the shell and the core on every single call, including ones on the researcher's typing-latency path (Capture, per _[[13-Runtime-Architecture]]_ §1, is explicitly required not to be blocked). One language across the whole first stack removes an entire class of serialization and deployment complexity that buys nothing at this stage. This also does not foreclose a future Rust/Tauri standalone app: that path would front the same SQLite file and could either re-host the TypeScript core (via a bundled Node runtime) or reimplement Subsystems 1–2 natively against the same schema — a decision correctly deferred until a standalone app is actually being built, not one this document needs to make now.

**`ProvenanceExpr` storage, specifically:** _[[14-Provenance-Structure]]_'s antichain-of-act-sets is small in practice (Section "Consequence for Subsystem 12" of that document already notes this) and is recommended, for the first implementation, as a normalized `provenance_terms` table (one row per antichain element, referencing an `acts` table) rather than a serialized JSON blob on the coordinate row — this keeps `⊗`/`⊕` composition and future querying ("which coordinates trace back to this act") index-friendly from day one, at the cost of a few more tables. This is a genuine trade-off, not a forced one: a JSON blob would also be legal and is simpler to write on day one. The normalized form is recommended because provenance querying is a named use case in _[[02-System-Invariants]]_ (INV-17, INV-22's "inspectable by traversing `E`") and retrofitting normalization after the blob form is in production is real, avoidable rework.

**Semantic Computation / Local Intelligence, specifically:** implement the first `agree()` functions (_[[08-Semantic-Distance-and-Meaning]]_, D16) as plain, deterministic, hand-written comparisons per value-space type (set overlap for `EnumSpace`, numeric decay for `ScalarSpace`) — no embedding model of any kind in the first implementation. This is not a placeholder to be embarrassed about; it is the literal content of T4/T5's finding that proximity is "never a function of raw text content, never an ML embedding," and a hand-written `agree` function is sufficient to validate every theorem in _[[08-Semantic-Distance-and-Meaning]]_ and _[[09-Topology-of-Research]]_ end to end. A learned similarity estimator is real future work for Subsystem 6, gated behind the same interface, and should not be pulled into the critical path of a first implementation whose job is to validate the architecture, not to demonstrate machine learning.

---

## 6. What's Replaceable, What's Locked, What's a Judgment Call

This is the section engineers should reread when tempted to reconsider a decision mid-implementation.

**Locked in by the mathematics/architecture (not this document's decision, just observed and respected here):**

- Exactly one write gate into `Legal`, structurally enforced, not policy-enforced (INV-9, INV-11).
- `E` and `I` are grow-only; no code path may delete from either (INV-1, INV-2, INV-7).
- Every write is legality-checked before commit, atomically (D10, _[[13-Runtime-Architecture]]_ §9).
- The Visualization Layer stores nothing (Section "Reading the Specification," above).
- Local Intelligence's default path requires no network dependency (INV-21, A7).
- Markdown is a Projection/ingestion format, never the live representation of `S` (Section 1, above — this is this document's own derived conclusion, but it follows from the locked invariants above, not from a preference).

**Deliberately replaceable behind an interface, per _[[16-Subsystem-Interface-Contracts]]_, and unaffected by anything decided in this document:**

- Local Intelligence's internal method (hand-written heuristics now; a learned model is a drop-in future replacement, per Section 5).
- `TextIndex` / `CoordinateIndex` implementations (Section 5 says nothing about these beyond "no embeddings yet" — the indexing technique itself is untouched by this document).
- The Interaction Shell / Visualization Layer entirely (Obsidian now; a standalone app is a peer implementation of the same contract later, not a rewrite of the core).
- The physical storage engine underneath Subsystem 1's contract (SQLite now; Document 15's schema is engine-agnostic by design, so a future server-backed engine is a swap, not a redesign).

**Genuine engineering judgment calls made in this document, stated as such so a future team can revisit them without treating them as settled:**

- TypeScript over Rust/Python/Go for the core library (Section 5) — an ecosystem-fit decision, not a correctness one.
- SQLite over an alternative embedded engine (Section 4) — a simplicity/maturity decision.
- Event-sourced log plus materialized read-model, over a simpler mutable-tables-with-an-audit-log design (Section 3) — chosen for provenance/recovery alignment; a simpler design would still satisfy every invariant, just with more hand-built bookkeeping.
- Normalized provenance storage over a JSON blob (Section 5) — chosen for future query-ability, at some up-front schema cost.
- Obsidian plugin over standalone app as the first shell (Section 2) — chosen for validation speed, not because it's the better long-term home for every Projection operator.

---

## 7. Recommended First-Implementation Scope

The full thirteen-subsystem architecture is not the right target for a first implementation — validating the architecture does not require every subsystem to exist, only enough of them, correctly, to prove the core invariants hold under real use. Recommended v0 scope:

**Build:**

- Subsystem 1 (Persistent Research State) — full, per Sections 3–4 above.
- Subsystem 2 (Transformation Engine) — all four generators, with E1–E3 (_[[15-Canonical-Data-Model]]_) enforced.
- Subsystem 12 (Provenance) — full, since every write depends on it.
- Subsystem 9 (Dependency Tracker) — minimal version; even a naive "mark everything dirty" implementation is legal per its own contract and can be sharpened to true locality later without an interface change.
- Subsystem 13 (Configuration Boundary) — dimension registry only; weighting/projection registry can start with hardcoded defaults.
- Subsystem 4 (Semantic Computation) — proximity (D16) only; defer clustering/topology (D21–D24) until proximity itself is validated against real coordinate data.
- Subsystem 7 (Projection Engine) — Thread View and Timeline only, the two operators requiring no clustering input and the best fit for Markdown rendering (Section 1).
- Subsystem 8 / Subsystem 10 (UI-facing half) — the Obsidian plugin shell: Capture and Interpret actions, Thread View and Timeline rendering.

**Explicitly defer:**

- Subsystem 3 (Synthesis Engine) — deferred deliberately, not for lack of time: its idempotence property is still an open mathematical question (_[[07-Transformation-Algebra]]_, Open Question 1), and building a concrete implementation before a first, simpler system has generated real interpretation data to reason about would mean guessing at a conformance test target the specification itself says isn't yet pinned down. Interpret (single-coordinate, researcher-driven) is fully sufficient to validate `I`'s core multi-value/conflict machinery on its own.
- Subsystem 6 (Local Intelligence) — explicitly advisory infrastructure (INV-13); its absence degrades nothing about legality, provenance, or conflict-handling, which are what a first implementation needs to prove out.
- Subsystem 11 (Lifecycle Orchestrator) — the pre-formal Investigation staging is a real feature but not one that exercises anything about `Legal`'s core guarantees; direct Capture/Interpret is enough to validate the Completion Gate's _shape_ by inspection of the contract without building the staging UI around it yet.
- Semantic Map, Tree, Dashboard, Publication View (the remaining four Projection operators) — each depends on either clustering (deferred above) or aggregation-conflict-faithfulness (T14) machinery not yet worth building against synthetic data.

This scope is deliberately narrow enough to be buildable by a small team in a bounded first phase, and every subsystem within it maps to an already-fully-specified contract in _[[16-Subsystem-Interface-Contracts]]_ — there is no remaining design work inside the v0 boundary, only implementation.

---

## Is Further Specification Work Needed Before Implementation Begins?

No, for the v0 scope above. Every subsystem in it has a closed interface contract (_[[16-Subsystem-Interface-Contracts]]_), a closed data model (_[[15-Canonical-Data-Model]]_), and, per this document, a closed physical storage and delivery strategy. The three items flagged as open in _[[16-Subsystem-Interface-Contracts]]_'s own Open Questions (the `AgreeFnRef` registry shape, `QueryDefinition`'s parameter shape, and the exact `LegalityViolation` enum) are all small enough to resolve inline during implementation, by the engineer writing that specific code, without blocking start — none of them affects a subsystem boundary or another subsystem's contract. Writing a further specification document now would be speculative relative to code that doesn't exist yet; the correct next artifact is the repository itself, informed by whatever this v0 build actually surfaces once real usage exercises it — which is precisely the kind of thing no further paper analysis can substitute for.

---

## Relationship to Previous Documents

This document makes no change to any subsystem boundary, invariant, theorem, or interface contract in Documents 06–16. It resolves the delivery-form, storage-engine, language, and initial-scope questions those documents correctly left open, and identifies — rather than re-derives — the handful of places (Markdown's role; the single-writer requirement) where the existing specification already forced the answer.

---

_See also: [[12-System-Architecture-First-Draft]] and [[13-Runtime-Architecture]] for the subsystem boundaries and dynamics this strategy implements. [[15-Canonical-Data-Model]] for the schema the storage design in Sections 3–4 physically encodes. [[16-Subsystem-Interface-Contracts]] for the interfaces the v0 scope in Section 7 is required to satisfy exactly, with no deviation._70