# Research Operating System — System Invariants

### Phase 3 Architecture · Document 3 of 6

### Version 0.1

---

## Purpose

_[[Design Invariants]]_ (Phase 1) lists 36 principles in the register of design philosophy — "why," addressed to a human reading about the system's values. This document translates every principle that has a **runtime consequence** into an engineering invariant: a statement precise enough to become an assertion in code, expressed in terms of the state objects defined in _[[01-State-Model]]_ and the pipelines defined in _[[00-Runtime-Specification]]_.

Not every Phase 1 principle produces an invariant here. Several (e.g., "capture should require no more than half the effort of writing the note") are UX heuristics with no discrete, checkable runtime condition — those are noted explicitly as _not_ engineering invariants, to avoid manufacturing false precision.

Each invariant below is numbered, stated as a checkable assertion, and traced to its philosophical origin and its algebraic origin where one exists (_Discovery Roadmap_).

---

## I. Evidence Invariants

**INV-1. `E` never shrinks.** For any two observed instants `t₁ < t₂`, every element present in `E(t₁)` is present in `E(t₂)`. No operation removes an element from `E`. _Origin:_ _Design Invariants §6_ ("Evidence Is Permanent"); _Computational Principles_ Principle 2. _Algebraic form:_ `E` is a join-semilattice under a grow-only merge (_Discovery Roadmap §3_). _Checkable as:_ a runtime assertion that no code path issues a delete against Evidence storage — deletion is not merely discouraged, it is a code path that must not exist.

**INV-2. Supersession never removes the superseded element.** `Supersede(old, new)` is defined as `{append(new), append(supersession_edge(new → old))}`; it never mutates or removes `old`. _Origin:_ _Design Invariants §7_, _Knowledge Evolution_. _Checkable as:_ the supersession operation's postcondition includes "old element still resolvable by its original identity."

**INV-3. Every element in `E` carries a Provenance Tag identifying the Investigation or direct-Capture act that produced it, and this tag is immutable once written.** _Origin:_ _Design Invariants §35_; _Computational Model_, Evidence Plane invariants ("every object carries provenance"). _Checkable as:_ an element with a null or later-modified Provenance Tag is a schema violation, not a valid state.

**INV-4. Object identity is stable and independent of organisation, location, or view.** The same element, referenced from two different Projections at two different abstraction levels, resolves to the same identity. _Origin:_ _Research Information Model_ ("Object Identity"). _Checkable as:_ identity equality must not depend on which Projection or Organisational Space is asking.

---

## II. Interpretation Invariants

**INV-5. `I` is total-domain-partial-range**: a coordinate may be unassigned, but if assigned, it is always attributable to exactly one of the two legal writers (Interaction Shell's Interpret, or a specific Synthesis run). _Origin:_ _Computational Model_, Interpretation Plane invariants ("every write is attributable to either a specific researcher action or a specific Synthesis run"). _Checkable as:_ every `I` write carries a non-null attribution field; an unattributed write is rejected at the write boundary, not merely logged as an anomaly.

**INV-6. Concurrent conflicting writes to the same (element, dimension) pair are never resolved by silent overwrite.** If two writes to the same pair arrive with no causal ordering between them (see _[[00-Runtime-Specification]]_, causality tokens), both values are retained and a Conflict Region is opened. _Origin:_ _Design Invariants §8_, _Scientific Synthesis_ ("Contradiction as Signal"); _Discovery Roadmap §3_ (multi-value register semantics). _Checkable as:_ the write path for `I` has no "last write wins" branch anywhere in its implementation.

**INV-7. A Conflict Region, once opened, is closed only by a subsequent write that names the evidence or Synthesis run responsible for closing it — never by deletion.** _Origin:_ _Computational Model_, Interpretation Plane invariants; _Design Invariants §8_. _Checkable as:_ the Conflict Registry has no delete operation, only a close-with-attribution operation, structurally distinct from delete.

**INV-8. `I` never touches, restructures, or removes anything in `E`.** No Interpretation write, however large a Synthesis batch, alters an Evidence element's content or provenance. _Origin:_ _Computational Model_; the Evidence/Interpretation asymmetry identified as load-bearing in _Convergence Pass_ ("the one asymmetry the whole architecture is built to protect").

---

## III. Authority Invariants

**INV-9. Exactly two components may write `E`: the Interaction Shell (single-object) and the Lifecycle Orchestrator's Completion Gate (on completion only). No other component, present or future, may gain this authority without this being a change to the architecture itself, not a configuration option.** _Origin:_ _System Architecture_, Contract Table; _Computational Model_, "Transitions Impossible by Construction."

**INV-10. Exactly two components may write `I` at scale or singly: the Interaction Shell (Interpret, single-coordinate) and the Synthesis Engine (batch). No other component may write `I`.** _Origin:_ same as INV-9.

**INV-11. No component other than the above four write-paths (Capture, Supersede, Interpret, Synthesize) can alter `S`. Every other component is either a functor out of `S` (Project, Local Intelligence, Relationship/Emergence) or an admission functor into `S` from outside the algebra entirely (Lifecycle Orchestrator's Completion Gate).** _Origin:_ _Discovery Roadmap §2, §4_ ("an illegal transition is not a morphism with a false guard, it is the absence of a morphism"). _Checkable as:_ this is not a runtime check at all — it is a structural guarantee enforceable at compile-time / module-boundary time: the interfaces exposed by Projection, Local Intelligence, and Relationship/Emergence contain no write method to `E` or `I`, full stop. A missing method cannot be bypassed by a bug in a guard clause, because there is no guard clause — there is no method.

**INV-12. An in-progress Investigation's content is invisible to `E` and `I` until the Completion Gate fires.** _Origin:_ _Computational Model_, Lifecycle Orchestrator invariants; _System Architecture_. _Checkable as:_ no read path from Evidence Plane or Interpretation Plane consumers can observe Session state — the Lifecycle Orchestrator's internals are simply not in the read set of anything except the Projection Layer's explicitly-carved-out, read-only, ephemeral "active session" query.

**INV-13. Local Intelligence has no write authority anywhere, including back into its own inputs.** _Origin:_ _Design Invariants §31_; _System Architecture_. _Checkable as:_ the Local Intelligence service interface is read-in, suggestion-out — its output type is structurally incapable of being fed back as a write without passing through the Interaction Shell's explicit-acceptance step.

---

## IV. Derivation Invariants

**INV-14. Every derived structure (graph, geometry, indices, Render Cache) equals a deterministic pure function of `S` (and, where declared, non-authoritative configuration such as Dimension Weighting). Deleting it and recomputing it from the same `S` must always yield the same result.** _Origin:_ _Computational Principles_ Principle 5; _Discovery Roadmap §5_'s formal test. _Checkable as:_ a regression test class — "delete Cache entry X, recompute, compare to pre-deletion value" — should be definable for every cached structure with zero expected diffs, ever.

**INV-15. No Cache is ever the sole holder of a fact that isn't recoverable from `S`.** Equivalent statement: a total-data-loss test that wipes every Cache and rebuilds from `E` and `I` alone must reconstruct an observably identical set of Projections. _Origin:_ _Convergence Pass_ loss test, applied architecture-wide.

**INV-16. Two Projections of the same query at the same abstraction level, against the same `S`, always render identically (naturality).** Coarsening a Projection's abstraction level and then examining what a finer level adds must agree with rendering the finer level directly and then coarsening. _Origin:_ _Abstraction and Scale_ ("changing abstraction should never change scientific meaning"); _Discovery Roadmap §3_ (naturality condition, filtration/coarsening poset).

---

## V. Provenance Invariants

**INV-17. Every mutation of `S` identifies what initiated it, what justified it, and which prior state it transformed.** _Origin:_ _Computational Principles_ Principle 7; _System Architecture_, "The Cross-Cutting Spine." _Checkable as:_ no write path to `E` or `I` accepts a payload lacking a provenance reference.

**INV-18. Provenance composes across joint-necessity and alternation** — an interpretation reached from several jointly-necessary pieces of evidence records their joint necessity distinctly from an interpretation reachable via either of two independent lines of support. _Origin:_ _Discovery Roadmap §3_ (provenance-semiring hypothesis — flagged there as unproven, retained here as a design target rather than a settled guarantee; see _Open Questions_).

---

## VI. Conflict Invariants

**INV-19. Conflict is preserved, never manufactured away.** No legal computation may cause a Conflict Region to disappear except through a write (evidence-attributed or Synthesis-attributed) that explicitly resolves it. _Origin:_ _Computational Principles_ Principle 8; INV-7 restated at the philosophical level.

**INV-20. The absence of conflict cannot be a default state manufactured by omission** — i.e., a system must not simply fail to compute a Conflict Region it should have detected and call that "no conflict." Absence of a Conflict Region means Synthesis actually checked and found none, not that Synthesis hasn't run yet. _Origin:_ _Computational Principles_ Principle 8 ("It must emerge"). _Checkable as:_ a Conflict Region's absence must be distinguishable, in the runtime's own bookkeeping, from "Synthesis has never examined this region" — these are different states and must be represented differently (this is a genuine engineering consequence not explicit in Phase 1/2 prose; flagged also in the Ambiguity Audit).

---

## VII. Determinism Invariants

**INV-21. Every Local Intelligence service is deterministic for identical input.** _Origin:_ _Local Intelligence_ ("Determinism"); _Design Invariants §30_.

**INV-22. Capture and Supersede are irreversible operations, but the algebra as a whole is inspectable — every transition, its causal predecessor, and its provenance can be reconstructed by traversing `E`.** _Origin:_ _Discovery Roadmap §3, §4_.

**INV-23. Synthesis, relative to a fixed snapshot of `E`, is intended to be idempotent** — running it twice against the same frozen evidence produces no further change to `I` beyond the first run. _Origin:_ _Discovery Roadmap §3_ — explicitly flagged there as "a missing invariant surfaced by the formal question, not a restatement of an existing one." This document promotes it from candidate to stated invariant, because without it "maturity" (readiness for Publication) has no stable meaning, but flags it as **not yet proven for any concrete Synthesis implementation** — see _Open Questions_.

---

## VIII. Scale Invariants

**INV-24. The cost of reflecting a single Interpret write is bounded by the local neighborhood of the changed element, not by the size of the project.** _Origin:_ _Design Invariants §25_ ("Scale Must Preserve Usability"), translated into a falsifiable performance bound in _[[00-Runtime-Specification]]_, Incremental Recomputation. _Checkable as:_ a benchmark asserting that median single-Interpret-write-to-Cache-consistency latency does not grow with total project size beyond a bounded neighborhood factor.

**INV-25. Increasing project complexity produces additional Projection instances, not additional component types and not proportionally increasing per-Projection rendering cost.** _Origin:_ _Design Invariants §24_; _System Architecture_, "Why This Division Holds Under Growth."

---

## IX. Session / Lifecycle Invariants

**INV-26. The only things an in-progress Investigation can lose (on crash, on abandonment) are things that were never yet knowledge.** _Origin:_ _Convergence Pass_, Lifecycle Orchestrator caveat, stated there as its own explicit invariant and preserved verbatim here as an engineering assertion: no crash-recovery guarantee for Session state may ever be strengthened to the point that it starts masquerading as an `E`/`I` durability guarantee (doing so would blur the one asymmetry INV-8 protects, by giving un-admitted reasoning the same durability status as admitted evidence).

**INV-27. An Investigation's exit produces exactly two artifacts — human documentation and structured evidence — never more, never fewer, never partial.** _Origin:_ _Computational Model_, Lifecycle Orchestrator invariants; _Internal Structure of Components_, Completion Gate.

---

## X. Publication Invariant

**INV-28. Publication-readiness is not a separately maintained flag; it is the predicate `Synthesize(E, I) = I ∧ no open Conflict Region` over the scoped region in question.** _Origin:_ _Discovery Roadmap §3_ ("publication-readiness is... the predicate..."). This depends on INV-23 holding; if Synthesis idempotence is not actually achieved by a given implementation, this predicate is not well-defined and Publication-readiness has no stable meaning for that implementation — a dependency worth stating explicitly rather than leaving implicit.

---

## Explicitly Not Engineering Invariants

For completeness and to avoid manufacturing false precision, the following Phase 1 principles are _design heuristics_, not checkable runtime assertions, and are excluded above:

- "Metadata entry should require no more than approximately half the effort of writing the Note Block" (_Design Invariants §20_) — a UX design target, not a runtime-checkable condition (no state object measures "effort").
- "Orientation should take less than one minute" (_Experience & Interaction Specification_, Success Criteria) — a UX benchmark for user testing, not a system assertion.
- "The user should never feel lost" (_Design Invariants §23_) — a subjective experiential goal without a discrete state predicate.

These remain important to the project's success but belong in a UX evaluation plan, not in this document.

---

## Engineering Decisions

1. **INV-9 through INV-13 are stated as structural (interface-level) guarantees, not runtime checks, wherever possible.** This is a deliberate strengthening beyond what Phase 1/2 prose requires: a runtime `if` that rejects an illegal write is strictly weaker than an interface that has no method through which the write could even be attempted. _Discovery Roadmap §4_'s reframing of authority as "absence of a morphism" makes this the correct implementation target, not merely a nice-to-have.
2. **INV-20 (distinguishing "no conflict found" from "not yet examined") is introduced as a new, explicit invariant** not directly stated in Phase 1/2 prose, because _Computational Principles_ Principle 8 ("the absence of conflict cannot be manufactured... it must emerge") only has teeth if the runtime can actually tell these two states apart.
3. **INV-23 and INV-28's dependency on unproven Synthesis idempotence is stated explicitly, not glossed over.** This mirrors the Discovery Roadmap's own intellectual honesty in flagging it as "a property the model should have, not one already proven" — carrying that honesty forward into the invariant list rather than silently upgrading it to settled fact.

---

## Rejected Alternatives

- **Treating all 36 Design Invariants as directly implementable assertions.** Rejected: several are subjective or effort-based and have no corresponding state predicate; forcing them into this document would dilute the ones that are genuinely checkable.
- **Making INV-23 (Synthesis idempotence) a hard precondition that blocks Publication until formally verified.** Considered and rejected for v0.1 — this would block a real, useful feature (Publication views) on a mathematical proof obligation the architecture itself only flags as a hypothesis. Instead, the dependency is stated (INV-28) so implementers know exactly what they are trusting.

---

## Open Questions

1. Whether provenance genuinely satisfies semiring axioms (joint-necessity, alternation, composability) — flagged in _Discovery Roadmap §3, §6_ as unproven and repeated here as INV-18's caveat. Requires a dedicated formal check before any implementation relies on semiring-specific algorithms (e.g., algebraic provenance-strength computation) rather than simpler ad hoc tracking.
2. Whether Synthesis idempotence (INV-23) can be guaranteed by construction (e.g., by making the Interpretation Writer's output a monotone function under a well-chosen semantic order) or only tested empirically per-implementation. Deferred to the eventual "Research State Algebra" document the _Discovery Roadmap_ calls for.
3. Whether INV-24's performance bound should be a hard architectural requirement (implementations that violate it are non-conformant) or a soft target. This document treats it as hard, per the prompt's own framing ("Scale Must Preserve Usability" as a Design Invariant, §25) — but a future revision could relax it for specific deployment contexts (e.g., extremely constrained hardware).

---

## Implementation Consequences

- Interfaces for Projection, Local Intelligence, and Relationship/Emergence must be designed with **no write capability at all**, at the type-system or module-boundary level, not merely by convention (INV-11, INV-13).
- The Conflict Registry's data model must represent three distinct states per region — _unexamined_, _open conflict_, _closed conflict-with-attribution_ — not two (INV-20).
- A conformance test suite should include, at minimum: a Cache-deletion-and-recompute equivalence test (INV-14), a naturality test across abstraction levels (INV-16), a Synthesis-idempotence test against a frozen `E` snapshot (INV-23, flagged as best-effort until proven), and a locality-of-invalidation benchmark (INV-24).

---

_See also: [[00-Runtime-Specification]] for the pipelines these invariants constrain. [[01-State-Model]] for the objects these invariants govern. [[03-Ambiguity-Audit]] for open interpretive gaps this document's invariants had to resolve in order to be stated precisely. [[05-Design-Review-Stress-Test]] for adversarial pressure-testing of these invariants under scale and concurrency._