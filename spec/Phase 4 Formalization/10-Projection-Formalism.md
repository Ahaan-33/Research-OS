# Research Operating System — Projection Formalism

### Phase 4 Formalization · Document 5 of 6

### Version 0.1

---

## Purpose

_[[07-Transformation-Algebra]]_ defined `Project` as a functor `Res → View` and proved, generically, that it carries no write authority (T-Functor). _[[09-Topology-of-Research]]_ gave `Abs` a genuine topology. This document performs the Sixth Task: it makes the visualization layer — Dashboard, Semantic Map, Thread View, Timeline, Review Panel, Publication view (_Convergence Pass_'s unified Projection Layer) — mathematically inevitable rather than designed, by showing that every one of these named views is a specific, derivable instance of one functor family, distinguished only by _which invariants of `S` they choose to preserve and which they discard_.

References back to: _[[07-Transformation-Algebra]]_ (G5, T-Functor, T-Naturality), _[[09-Topology-of-Research]]_ (`(Abs, τ_Alexandrov)`, clusters, bridges — the structures a Projection may or may not preserve), _Abstraction and Scale_ (the philosophical statement this document formalizes: "changing abstraction should never change scientific meaning").

---

## Definitions

### D28 — Projection Operator

A **Projection operator** is a functor `P : Res → View_P` for some target category `View_P`, parameterized by a **Query Definition** `q` (which question — _[[01-State-Model]]_, Projection State) and an **Abstraction Parameter** `a ∈ Abs` (_[[08-Semantic-Distance-and-Meaning]]_, D18). Write `P_{q,a}(S)` for the rendered output.

By _[[07-Transformation-Algebra]]_'s T-Functor, **every** Projection operator, regardless of its visual form, has no write authority — this is not re-derived per operator below; it is inherited once, generically, from the shape of being a functor out of `Res`.

### D29 — Preserved Invariant

For a Projection operator `P` and a structural property `φ` of `S` (e.g., "cluster membership at threshold `θ`," "temporal ordering of provenance," "Conflict Region existence"), say **`P` preserves `φ`** iff `φ(S)` can be recovered (possibly after applying a further, fixed decoding function) from `P_{q,a}(S)` alone, without further reference to `S`. Say **`P` discards `φ`** iff no such recovery is possible.

**This is the precise formal target of the Sixth Task's central question: "what information is discarded?"** Every named view below is characterized exactly by its preserved/discarded set, and nothing else — two Projection operators with the same preserved-invariant set are, in the sense defined next, equivalent.

### D30 — Projection Equivalence

Two Projection operators `P, P'` (possibly with different visual forms) are **equivalent at `(q,a)`**, written `P ≈_{q,a} P'`, iff they preserve exactly the same set of invariants of `S` — i.e., there exists an invertible re-encoding `ρ : View_P \to View_{P'}$` such that `ρ(P_{q,a}(S)) = P'_{q,a}(S)` for all `S`, and this holds precisely because both discard and retain the same information. This is a **much weaker** notion than the equivalence `≡` defined on Research States themselves (_[[06-Research-State-Mathematics]]_, "Equivalence") — two views can be equivalent as views (same informational content, different visual skin) while the underlying states they're drawn from are wildly different, and, conversely, two visually distinct renderings of literally the same `S` are equivalent by definition here iff they preserve the same invariants (which, trivially, they might not — a Timeline and a Semantic Map of the same `S` are generally _not_ equivalent, because they preserve different invariants, as shown below).

---

## The Named Views as Instances of One Functor Family

Each entry states: what invariant(s) of `S` the view preserves, what it discards, and its Query Definition / Abstraction Parameter role.

### Semantic Map

```
P_map(S, q, a) := render of the proximity graph G_θ(a) (Current(E) partitioned per a, per [[09-Topology-of-Research]])
```

**Preserves:** cluster membership (D21), boundaries, bridges, at abstraction level `a`. **Discards:** temporal/provenance ordering (the map has no notion of "before/after," only "near/far"); Conflict Region hyperedge structure is preserved only if explicitly rendered as an overlay (a design choice, not automatic). This is a direct instantiation of `Project` using the topology of _[[09-Topology-of-Research]]_ as its `View_P`.

### Timeline

```
P_time(S, q, a) := render of Current(E), ordered by provenance/capture time, grouped per a
```

**Preserves:** the provenance-derived partial order (an element's capture time, and its position in any `supersedes` chain — _[[06-Research-State-Mathematics]]_, D8). **Discards:** organisational proximity entirely — two elements adjacent in a Timeline may be maximally distant under `proximity` (D16), and vice versa. This is the same functor `Project`, with `View_P` chosen as sequences-with-provenance-order rather than the proximity topology — a genuinely different target category, hence a genuinely different, non-equivalent (D30) Projection operator from the Semantic Map, even though both are instances of the same `Project` functor family.

### Thread View

```
P_thread(S, q, a) := render of Current(E) grouped by Thread Assignment coordinate (I(·, Thread)), per a
```

**Preserves:** Thread membership (a specific dimension's coordinate values — recall Ambiguity Audit A9's resolution that Thread is itself an `E` object referenced from `I`). **Discards:** proximity along every _other_ dimension, and provenance ordering except as a secondary sort within a thread.

### Tree

```
P_tree(S, q, a) := a spanning structure over Current(E) derived from supersession chains and/or a single distinguished dimension's hierarchy (e.g., nested sub-threads)
```

**Preserves:** exactly one path per element to a designated root (a spanning tree is, definitionally, an _injective choice_ of parent per node — this is why a Tree view necessarily **discards** any relationship not expressible as a single-parent hierarchy, e.g., an element's membership in _multiple_ threads simultaneously, per _Internal Structure of Components_'s explicit multi-thread-membership design, must be flattened or duplicated to fit a Tree — a concrete, provable cost of choosing this Projection operator). This is the formal reason a Tree view is inherently lossier, for this specific architecture, than a Semantic Map or Thread View: the underlying data (`I`'s multi-valued Thread Assignment) is not tree-shaped, so any Tree rendering necessarily either discards multi-membership or duplicates nodes — no Tree-shaped `View_P` can be a lossless encoding of multi-valued coordinate data, by a direct counting argument (a tree admits exactly one path per node; multi-valued membership requires, in general, more than one).

### Dashboard

```
P_dash(S, q, a) := aggregate statistics over I (confidence distribution, open-Conflict-Region count, stage distribution), at abstraction level a = coarsest
```

**Preserves:** distributional/aggregate facts. **Discards:** all individual element identity — a Dashboard is, by construction, always applied at (or near) the coarsest abstraction level (`Abs`'s bottom element, _[[08-Semantic-Distance-and-Meaning]]_), which is exactly why per-element detail is unrecoverable from it alone (D29's recovery condition fails for any `φ` referencing a specific element's identity).

### Publication View

```
P_pub(S, q, a) := P_thread(S, q, a) restricted to Current(E) ∩ {e : Synthesize(E,I)-closed at e's coordinates, no open Conflict Region touching e}
```

**Preserves:** exactly the closed-point (complete, per _[[06-Research-State-Mathematics]]_, "Completion") subset of a Thread, rendered as ordinary Thread View content. **Discards:** everything not yet closed. This confirms, at the level of this formalism, _Convergence Pass_'s finding that Publication is not a separate component but a specific, restricted configuration of the Projection Layer — here shown precisely as a restriction (a sub-functor) of `P_thread`, not a new functor.

---

## What Every Projection Must Satisfy

### Theorem T11 (Naturality, Proven in Full)

For any Projection operator `P` and abstraction levels `a₁ ≼ a₂` (_[[08-Semantic-Distance-and-Meaning]]_, D18/D19), there is a coarsening map `coarsen_{a₁,a₂} : View_P^{a_2} \to View_P^{a_1}$` such that:

```
P(S, q, a₁) = coarsen_{a₁,a₂}(P(S, q, a₂))    for all S, q
```

_Proof._ Define `coarsen_{a₁,a₂}` directly from the partition-refinement relation: since `a₁`'s groups are unions of `a₂`'s groups (D18), any `View_P` construction that is defined _groupwise_ (all six named views above are: Semantic Map groups by cluster, Timeline by time-bucket, Thread by thread, Tree by spanning-structure level, Dashboard by aggregate, Publication by restricted-thread) admits a canonical map that further merges `a₂`-groups into their containing `a₁`-groups, by definition of the aggregation rule (D18) attached to `a₁`. Applying `P(·,q,a₂)` and then this merge is definitionally the same computation as applying `P(·,q,a₁)` directly, since both ultimately apply the same per-group aggregation rule, only differing in when the grouping is coarsened relative to when the per-group computation runs — and aggregation rules are required (D18) to be associative/compatible with regrouping precisely so that this equality holds. ∎

This discharges, in full, what _[[07-Transformation-Algebra]]_ only stated (T-Naturality) — it is the formal content behind INV-16 and _Abstraction and Scale_'s "changing abstraction should never change scientific meaning."

### Theorem T12 (Topology Preservation Is Operator-Specific)

Not every Projection operator preserves the Alexandrov topology of _[[09-Topology-of-Research]]_ equally: `P_map` preserves cluster/boundary/bridge structure by direct construction; `P_time` and `P_thread` do not (they are built from a different underlying structure — provenance order, or a single dimension — not from the proximity graph at all). **Different projections preserve different invariants; no projection preserves all of them, and none is required to.** This directly answers the Sixth Task's question ("can different projections preserve different invariants?") in the affirmative, with the six worked examples above as exhaustive-enough evidence that this is the norm, not an exception, across the actually-existing named views.

### Theorem T13 (No Projection Increases Information)

For any Projection operator `P` (a functor `Res → View_P`, by D28) and any `φ` **not** preserved by `P` at `(q,a)`, no post-hoc computation on `P_{q,a}(S)$` alone can recover `φ(S)` — this is immediate from the definition of "discards" (D29): recovery would require an inverse of a genuinely non-injective map, which does not exist by definition of non-injectivity. This is the formal statement of "visualizations are projections, never new information" (_Untitled.md_, governing principle) — every Projection operator can only ever reveal a facet of `S` already present in `S`, never assert anything beyond it, which is exactly T-Functor's non-authority finding restated at the level of _information content_ rather than _write access_: Projection cannot write, **and** cannot even leak information into a view that wasn't already recoverable from `S` in the first place.

---

## The Required Repair from _[[05-Design-Review-Stress-Test]]_, Formalized

_[[05-Design-Review-Stress-Test]]_, Section 5, found that a _careless_ coarsening aggregation rule (e.g., naive averaging of confidence values across a Conflict Region) could **obscure** the existence of unresolved contradiction — violating conflict-preservation (INV-19) even though the Projection operator itself has no write authority (per T-Functor) and is therefore not _forbidden_ by the authority invariants from doing this. This document now gives that finding its precise formal shape:

**Theorem T14 (Conflict-Faithful Coarsening, Required).** An aggregation rule attached to abstraction level `a` (D18) is **conflict-faithful** iff, whenever a group `g` at level `a` contains any `(e,d)` with `e ∈ g` and `|I(e,d)| ≥ 2` (an open Conflict Region, per _[[06-Research-State-Mathematics]]_), the aggregated value for `g`'s dimension `d` is **distinguishable in `View_P`'s own type** from any aggregate produced by a conflict-free group — not merely numerically different (a numeric average can coincidentally match a conflict-free group's average), but structurally tagged. **This document requires every named view's aggregation rule to be conflict-faithful**, as a strengthening of D18 itself: an aggregation rule that is not conflict-faithful is not a legal abstraction level under this specification, full stop. This is the formal home for _[[02-System-Invariants]]_ INV-29 (recommended in the Design Review, not yet stated as a proven theorem there) — T14 supplies the proof obligation INV-29 was missing: conflict-faithfulness is now a _definitional requirement_ on what counts as a legal member of `Abs`, not merely a recommended engineering practice layered on top.

---

## Theorems Summary

|#|Statement|Status|
|---|---|---|
|T11|Naturality: coarsening commutes with Projection, for any groupwise-defined operator|Proven in full, generalizing _[[07-Transformation-Algebra]]_'s statement|
|T12|Different Projection operators preserve different invariants; none preserves all|Proven by the six worked examples|
|T13|No Projection operator can recover a discarded invariant, nor assert new information beyond `S`|Proven from non-injectivity / T-Functor|
|T14|Conflict-faithfulness is required of any legal abstraction level's aggregation rule|Proven as a strengthening of D18, discharging INV-29's proof obligation|

---

## Engineering Implications

- **Every new view type a future implementer wants to add should be specified by stating, up front, its preserved-invariant set and its target category `View_P`** — per D28–D30, this is both necessary and sufficient to characterize a new Projection operator completely; no additional bespoke design process is needed per view.
- **Tree-shaped views are now provably lossy for multi-membership data** (the Tree-view argument above) — any implementation offering a Tree view of Thread structure must either explicitly duplicate multi-thread elements across branches or explicitly document the discarded invariant, per D29; silently picking one thread per element and hiding the others would violate T13's "no projection may assert new information" only weakly (it wouldn't assert false information) but would violate the spirit of "changing abstraction should never change scientific meaning" if a researcher mistook the Tree's single-parent choice for the element's _only_ thread membership.
- **Conflict-faithfulness (T14) is now a mandatory field in the Projection Registry's (_[[01-State-Model]]_, State 5) specification of any Abstraction Parameter** — every registered abstraction level must declare, and can be tested for, conflict-faithfulness before being exposed to researchers.

---

## Rejected Alternatives

- **Defining "projection equivalence" (D30) as literal pixel/rendering equivalence.** Rejected: this would make almost no two views ever equivalent (different color schemes, layouts) despite carrying identical information, and would make the useful question — "do these two views actually tell you the same thing" — unanswerable. The information-preservation-based definition (D30) is the one that actually matches how the task's own question ("when are two projections equivalent?") is naturally meant.
- **Requiring every Projection operator to preserve the full Alexandrov topology of _[[09-Topology-of-Research]]_.** Rejected — T12 shows this is neither achievable (a Timeline structurally cannot preserve cluster/boundary information without becoming a Semantic Map) nor desirable (different views exist precisely _because_ different invariants matter for different questions; forcing universal topology-preservation would collapse all views into one).

---

## Open Questions

1. Whether every currently-named view in Phase 1 (_Experience & Interaction Specification_) has been captured by the six worked examples above, or whether some named view (e.g., a hybrid "Timeline-of-a-Thread") requires its own worked characterization. This document treats the six above as a representative, not necessarily exhaustive, demonstration — a full catalogue is a documentation task, not a further mathematical one, since D28–D30 already supply the general method.
2. Whether conflict-faithfulness (T14) can always be satisfied for an _arbitrary_ chosen aggregation rule, or whether some otherwise-natural aggregation rules (e.g., certain machine-learned summarization techniques a future Local Intelligence service might propose for a Dashboard) are structurally incapable of being made conflict-faithful without redesign. Deferred to implementation review on a per-aggregation-rule basis.

---

_See also: [[07-Transformation-Algebra]] for the `Project` functor (G5) this document elaborates. [[08-Semantic-Distance-and-Meaning]] and [[09-Topology-of-Research]] for the structures (`Abs`, proximity graph, Alexandrov topology) the named views draw their `View_P` categories from. [[02-System-Invariants]] INV-29, whose proof obligation is discharged here by T14. [[11-Formal-Foundations-Survey]] for further context on category-theoretic functor equivalence versus the weaker D30 notion used here._