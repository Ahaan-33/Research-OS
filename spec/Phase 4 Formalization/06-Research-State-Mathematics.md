# Research Operating System — Research State Mathematics

### Phase 4 Formalization · Document 1 of 6

### Version 0.1

---

## Purpose

_Discovery Roadmap_ proposed, tested, and left partially open the claim `S = (E, I)`. It named the algebraic shapes it expected — join-semilattice, multi-value register, closure operator, category with functors, provenance semiring, filtration/coarsening poset — and explicitly commissioned the next document as _"The Research State Algebra... define the category whose objects are Research States and whose four morphism-generators are Capture, Supersede, Interpret, and Synthesize; state the join-semilattice axioms for E and verify they hold; state the multi-value register semantics for I and verify concurrent-write behavior matches."_

This document is that document, for the first of its two halves: it defines the primitive objects, their identity conditions, their composition and equivalence, their ordering, and their notions of refinement, convergence, completion, contradiction, and locality — precisely, and only, in the terms already established by _Computational Principles_, _Computational Model_, _Convergence Pass_, and _Discovery Roadmap_. Nothing here is a new component, a new write authority, or a new name. Everything here is a proof, a verification, or an explicit flag that a prior claim remains a hypothesis.

References back to: _Discovery Roadmap_ (the claims being verified), _[[02-System-Invariants]]_ (the assertions this mathematics must make provable rather than merely stated). References forward to: _[[07-Transformation-Algebra]]_ (the morphisms defined precisely here), _[[09-Topology-of-Research]]_ (the filtration/coarsening poset sharpened into an explicit topology).

---

## Definitions

### D1 — Content Element

A **content element** is an immutable, identity-bearing record of a single scientific idea: an observation, hypothesis, experiment, dataset, result, interpretation, decision, implementation, or literature reference (_Research Information Model_). Write `c ∈ C` for the set of content elements existing at any given instant.

### D2 — Relation Element

A **relation element** is an immutable, identity-bearing record asserting a typed relationship between two or more content elements — "supports," "contradicts," "derives from," and so on (_Relationship Ontology_). _Discovery Roadmap §1_ already reclassified these as belonging to `E`, not to a separately-maintained Structural Link Registry; this document adopts that reclassification without further argument, since it was already justified there. Write `r ∈ R` for the set of relation elements.

### D3 — Evidence Set

```
E := C ∪ R
```

a single set of two closed roles (content, relation), exactly as _Discovery Roadmap §1_ concluded. Every element of `E`, of either role, carries a **Provenance Tag** (D7, below) and may participate in a **Supersession Relation** (D6, below).

### D4 — Identity

Every element `e ∈ E` carries a stable identity `id(e)` drawn from an unbounded identity space, assigned once at creation and never reassigned or reused. Identity is independent of content: two elements with textually identical content are still distinct elements if independently captured (_Research Information Model_, "Object Identity"; confirmed formally in _Discovery Roadmap §3_: "capturing the same content twice produces two distinct elements — identity, not content, is what's compared").

**Theorem D4.1 (Identity Injectivity).** The map `id: E → IdentitySpace` is injective for every `E` reachable via the legal transformations of _[[07-Transformation-Algebra]]_. _Proof sketch._ Capture always mints a fresh identity (INV-3 requires a Provenance Tag distinct per act of capture; nothing in the algebra reuses an identity, since Supersede always mints a new identity for the replacement and never overwrites the old one's identity, per INV-2). By induction over the finite sequence of legal transformations producing any reachable `E`, injectivity is preserved at every step. ∎

### D5 — Dimension and Coordinate

A **dimension** `d ∈ D` is a named organisational axis (thread, stage, publication scope, positivity, confidence, and so on; _Research State & Epistemic Model_). `D` is an open, registered set (per Ambiguity Audit A8) — elements can be added to `D` by an explicit registration act, but at any fixed instant `D` is a well-defined finite set.

A **coordinate** is a value `v` drawn from the value space `V_d` associated with dimension `d`.

### D6 — Interpretation Function

```
I : E × D ⇀ 𝒱(V_d)
```

`I` is a **partial function** (⇀) from (element, dimension) pairs to _sets_ of values drawn from the relevant value space, not to single values — this is the formal statement of the multi-value-register semantics _Discovery Roadmap §3_ identified: `I(e, d)` may hold exactly one value (the ordinary, uncontested case), or it may hold **two or more values simultaneously**, which is precisely a **Conflict Region** (D13, below) rendered as a first-class feature of the codomain rather than as an exception. Partiality captures the fact that most (element, dimension) pairs are simply unassigned (INV-5).

### D7 — Provenance

`prov(e)` for `e ∈ E`, and `prov(e, d, v)` for a specific coordinate assignment `I(e,d) ∋ v`, is a reference to the Investigation-completion act, direct Capture act, Interpret act, or Synthesis run that produced it. Provenance is itself drawn from a structure with two combinators — introduced formally in _[[07-Transformation-Algebra]]_ and tested for semiring axioms in _[[11-Formal-Foundations-Survey]]_ — and is attached at write time, never revised (INV-3, INV-17).

### D8 — Supersession Relation

```
supersedes ⊆ E × E
```

`(e', e) ∈ supersedes` reads "`e'` supersedes `e`." This is itself represented as a relation element (D2) — Supersede is not a special operation type distinct from Capture-of-a-relation-element; it is Capture of a specific, reserved relation type (_Discovery Roadmap §1_'s unification is preserved exactly).

**Definition (Current Elements).** `Current(E) := { e ∈ E : ∄ e' ∈ E, (e', e) ∈ supersedes }` — the elements not (yet) superseded by anything. This is a derived predicate over `E`, never a separately stored flag.

### D9 — The Research State

```
S := (E, I)
```

exactly as _Discovery Roadmap §1_ proposed, with the correction already made there incorporated: `E` is the provenance-connected, two-role collection above, and `I` is the single uniform (now explicitly set-valued, per D6) assignment function over it. This document adds no third component to `S`. Everything else identified in _[[01-State-Model]]_ — the graph, the geometry, Local Intelligence's indices, Projection output — is _derived from_ `S`, never part of `S` itself; this is proven formally, not merely asserted, in _[[07-Transformation-Algebra]]_, Theorem T-Functor.

### D10 — Legal State

A pair `(E, I)` is a **legal Research State** iff:

1. `id` is injective on `E` (D4.1);
2. every `e ∈ E` has a provenance (D7);
3. `dom(I) ⊆ Current(E) × D` is not required — critically, `I` may still hold values for superseded elements (interpretation of history is not erased by supersession, only new interpretation of the _replacement_ is not automatically inherited, per Ambiguity Audit A2) — so the domain condition is simply `dom(I) ⊆ E × D`;
4. `supersedes` is acyclic (an element cannot, even transitively, supersede itself) — this is the formal statement behind "history accumulates," since a cycle would make "the historical record" ill-defined.

Write `Legal` for the set of all legal Research States. `[[00-Runtime-Specification]]`'s Runtime State Vector `Runtime(t)` always carries an `S(t) ∈ Legal`; this is the precise target of INV-1 through INV-8 restated as a single membership condition.

---

## Composition, Equivalence, and Partial Order

### Composition of Evidence

`E` is closed under a **merge** operation `⊔`:

```
E₁ ⊔ E₂ := E₁ ∪ E₂  (as sets, with identity as the equality test)
```

**Theorem T1 (Join-Semilattice).** `(E, ⊔)` is a join-semilattice: `⊔` is idempotent (`E ⊔ E = E`), commutative (`E₁ ⊔ E₂ = E₂ ⊔ E₁`), and associative (`(E₁ ⊔ E₂) ⊔ E₃ = E₁ ⊔ (E₂ ⊔ E₃)`). _Proof._ All three properties hold immediately from `⊔` being set union and identity comparison being the sole equality test (D4) — two elements merge to one entry regardless of which side of the union they came from, satisfying idempotence directly, and union is commutative/associative as a basic set-theoretic fact. ∎ This verifies, rather than merely restates, the join-semilattice claim from _Discovery Roadmap §3, §6_, and gives it the precise equality condition (identity, not content) that makes idempotence actually hold — capturing identical _content_ twice does **not** collapse under `⊔` (per D4.1's injectivity, those are different elements), but merging the _same evidence set with itself_ trivially does.

### Composition of Interpretation

`I` is closed under a **pointwise union** operation, matching the multi-value register:

```
(I₁ ⊔ I₂)(e, d) := I₁(e, d) ∪ I₂(e, d)
```

where the right-hand union is set union over the codomain `𝒱(V_d)`, and an undefined side is treated as `∅`.

**Theorem T2 (Multi-Value Register Merge).** `(I, ⊔)` is idempotent, commutative, and associative under pointwise union, and — critically, the property that distinguishes it from a lattice with a meet — **no information is lost when two divergent interpretations of the same (element, dimension) pair are merged**: `I₁(e,d) = {v₁}`, `I₂(e,d) = {v₂}`, `v₁ ≠ v₂` ⟹ `(I₁ ⊔ I₂)(e,d) = {v₁, v₂}`, which is precisely a Conflict Region (D13) rather than a collapsed or arbitrarily-chosen single value. _Proof._ Immediate from set union's own idempotence/commutativity/associativity, applied pointwise. ∎ This is the precise verification the Discovery Roadmap called for: "state the multi-value register semantics for I and verify concurrent-write behavior matches." It does — by construction, not by policy enforced elsewhere.

### The Partial Order on Legal States

Define `S₁ ⊑ S₂` iff `E₁ ⊆ E₂` and, for every `(e,d) ∈ dom(I₁)`, `I₁(e,d) ⊆ I₂(e,d)`.

**Theorem T3 (Poset of Legal States).** `(Legal, ⊑)` is a partially ordered set, and `⊔` (applied componentwise to `E` and `I`) is its join operation: `S₁ ⊔ S₂` is the least upper bound of `S₁` and `S₂` under `⊑`. _Proof sketch._ Reflexivity, antisymmetry, and transitivity of `⊑` follow directly from `⊆` on both components. That `S₁ ⊔ S₂` is an upper bound follows from `⊔`'s definition; that it is the _least_ upper bound follows because any `S₃` with `S₁ ⊑ S₃` and `S₂ ⊑ S₃` must contain the union of both `E` components and the pointwise union of both `I` components, which is exactly `S₁ ⊔ S₂`. ∎

**This partial order is the formal object behind "knowledge accumulates."** Every legal transition in _[[07-Transformation-Algebra]]_ moves `S` upward or stays in place under `⊑` — this document does not yet claim monotonicity for _every_ transformation (Interpret, taken alone, is explicitly not monotone in the naive sense, since a single write can be later contradicted by another write producing a Conflict Region rather than simply enlarging the set — though note that under this definition, adding a second value to `I(e,d)` **is** an enlargement, i.e. `⊑`, not a shrinkage; this is precisely why Conflict Regions are compatible with monotonicity while last-write-wins would not be). This point is treated rigorously in _[[07-Transformation-Algebra]]_, Theorem T-Interpret-Monotone.

### Equivalence

Two legal states `S₁, S₂` are **equivalent**, written `S₁ ≡ S₂`, iff `S₁ ⊑ S₂` and `S₂ ⊑ S₁` — by antisymmetry, this holds iff `S₁ = S₂` exactly (same `E`, same `I` as functions). There is, deliberately, **no weaker equivalence relation on `S` itself** (e.g., no "equivalent up to relabeling") — identity (D4) is load-bearing precisely because it must distinguish `S` from every _view_ of `S`, and two Research States with differently-labeled but isomorphic content are not scientifically the same project; they are two different projects that happen to look alike. (Equivalence _of Projections_ — a different and much weaker notion — is treated in _[[10-Projection-Formalism]]_.)

---

## Refinement, Convergence, Completion, Contradiction, Locality

### Refinement

`S₂` is a **refinement** of `S₁` iff `S₁ ⊑ S₂` **and** the additional interpretation content in `I₂ \ I₁` narrows rather than merely enlarges — formally, for every `(e,d)` where `I₁(e,d)` was already non-empty and `I₂(e,d) ⊋ I₁(e,d)`, the added value(s) either resolve a Conflict Region present in `I₁` (i.e., `|I₁(e,d)| ≥ 2` and `|I₂(e,d)| = 1`, meaning the addition was accompanied by an explicit closure — see D14) or represent new dimensions/elements not previously interpreted at all. This is _not_ automatically true of every `⊑`-increase — merely piling a second, third, fourth conflicting value onto an already-conflicted pair is a `⊑`-increase but is _not_ a refinement in this stronger sense, since it adds ambiguity rather than reducing it. This distinction is what "Interpretation Evolves" (_Design Invariants §7_) is precisely getting at: mutability of `I` is not automatically progress; refinement is progress, and progress is a strictly narrower notion than mere growth.

### Convergence

A sequence of legal states `S₀ ⊑ S₁ ⊑ S₂ ⊑ …` (fixing `E`, varying only `I`, as produced by repeated Synthesis over a stable evidence snapshot — see _[[07-Transformation-Algebra]]_, Synthesize) **converges** iff there exists `N` such that `Sₙ = S_N` for all `n ≥ N` — i.e., the sequence is eventually constant. This is the precise formal target of the idempotence property _Discovery Roadmap §3_ flagged as a hypothesis, not a result, for Synthesize; this document does not prove it holds (no proof is available without a concrete Synthesis implementation), but states it as the formal convergence criterion any concrete Synthesis implementation must be checked against — see _[[07-Transformation-Algebra]]_, Open Questions.

### Completion (Closed Points)

`S = (E, I)` is **complete relative to `E`** iff `Synthesize(E, I) = I` (a fixed point, D9 above) **and** no `(e,d)` has `|I(e,d)| ≥ 2` (no open Conflict Region). This is exactly _Discovery Roadmap §3_'s reframing of Publication-readiness as "the predicate `Synthesize(E, I) = I` and no Conflict Region remains" — restated here as the formal definition of a **closed point** in the poset `(Legal, ⊑)`, restricted to states sharing a fixed `E`. Completion is always relative to a specific `E` — new Evidence can always reopen a previously-complete state, which is precisely why "the Research State is never complete" (_First Principles_) at the level of the _project_ even though individual `E`-relative states can be complete.

### Contradiction

`S` **contains a contradiction at `(e,d)`** iff `|I(e,d)| ≥ 2`. Write `Conflicts(S) := { (e,d) ∈ E × D : |I(e,d)| ≥ 2 }` for the **Conflict Region set** — this is not a separately maintained registry as a mathematical matter (it is a derived predicate over `I`), even though _Internal Structure of Components_ correctly specifies that, as an _engineering_ matter, it should be materialized explicitly rather than recomputed on every query (INV-20's distinction between "no conflict found" and "not yet examined" — see D14, below, for how this document represents that distinction formally, which _Computational Principles_ Principle 8's prose left implicit).

### D14 — Examination Status

To make INV-20's distinction precise: extend the codomain of `I` with a distinguished marker. Formally, `I : E × D ⇀ (𝒱(V_d) × {examined, unexamined})`. A pair with `unexamined` status and empty value-set is different from a pair with `examined` status and empty value-set — the former has simply never been assigned; the latter means a Synthesis run specifically checked this pair against current Evidence and found no basis for any value (which is itself an interpretive act with provenance, per D7). This is the mathematical object behind the engineering recommendation already made in _[[05-Design-Review-Stress-Test]]_, Section 5 and INV-20 — this document supplies the formal structure that recommendation was missing.

### Locality

An operation `f` is **local to a set `L ⊆ E × D`** iff, for any two legal states `S₁, S₂` agreeing everywhere outside `L` (`I₁(e,d) = I₂(e,d)` for all `(e,d) ∉ L`, and `E₁ = E₂`), `f(S₁)` and `f(S₂)` agree everywhere outside `L` as well. This is the precise formal target of INV-24's performance bound: Interpret's effect is local to `{(e,d)}` for the single pair written (trivially, by definition of a pointwise write); the Relationship/Emergence functor's _recomputation_ is local to the neighborhood of `L` under the Dimension Weighting configuration (a claim examined rigorously, and partially revised, in _[[05-Design-Review-Stress-Test]]_, Section 2b — that revision is restated here as a formal locality bound in _[[07-Transformation-Algebra]]_'s treatment of the Emergence functor).

---

## Theorems Summary

|#|Statement|Status|
|---|---|---|
|T1|`(E, ⊔)` is a join-semilattice|Proven|
|T2|`(I, ⊔)` is a multi-value-register merge, idempotent/commutative/associative, conflict-preserving|Proven|
|T3|`(Legal, ⊑)` is a poset with `⊔` as join|Proven|
|D4.1|Identity is injective on any reachable `E`|Proven by induction over legal transformations|
|—|Synthesize converges (eventually constant) relative to fixed `E`|**Open** — stated as the formal convergence criterion, not proven; see _[[07-Transformation-Algebra]]_|

---

## Engineering Implications

- **`Legal` is the precise type every persistence layer must maintain as an invariant.** A Runtime Specification "startup" that loads an illegal state (D10 violated) must halt rather than proceed — this gives _[[00-Runtime-Specification]]_'s Failure Recovery table's first row ("halt before accepting Events") a formal precondition to check against.
- **The multi-value codomain of `I` (D6) is not an implementation detail** — it is the mathematical reason a Conflict Region requires no special-cased data structure beyond "a set with more than one element." Any implementation representing `I` as a single-value map with a bolted-on separate conflict table has chosen a _different, non-isomorphic_ representation and must independently prove it round-trips to this one.
- **The examination-status marker (D14) is now a formal requirement, not merely a recommended engineering pattern** — _[[01-State-Model]]_ should be revised to include it explicitly in the Interpretation State's definition.

---

## Rejected Alternatives

- **Modeling `E` as a category rather than a join-semilattice.** Considered, since content and relation elements plus supersession edges resemble objects and morphisms. Rejected for `E` itself: a category needs composition of morphisms (if `a` supersedes `b` and `b` supersedes `c`, does that compose to a direct `a`-supersedes-`c` morphism?) which the architecture does not require and _Design Invariants_ never implies — supersession chains are meant to remain fully traversable step-by-step (each link independently provenanced), not collapsed by composition. The categorical structure is reserved, correctly, for the _transformations between whole states_ (`Legal` as objects, morphisms between them) — treated in _[[07-Transformation-Algebra]]_ — not for `E`'s internal structure.
- **Modeling `I` as a total function with a designated "conflict" value in the codomain (e.g., `I(e,d) ∈ V_d ∪ {⊥, CONFLICT}`).** Rejected: this collapses the _specific competing values_ into a single opaque flag, losing exactly the information (which two values are in tension, and their individual provenance) that _Design Invariants §8_ requires to remain inspectable. The set-valued codomain (D6) preserves this; a flag-valued codomain would not.
- **A full lattice (with meet) for `E`.** Explicitly re-rejected here, consistent with _Discovery Roadmap §6_'s prior rejection: no operation in the algebra ever computes an intersection-as-combination over `E`; only join is ever used.

---

## Open Questions

1. Whether Synthesize's convergence (stated formally above as "eventually constant") can be _proven_ for a general class of Synthesis implementations, or must be checked per-implementation. This is the single largest open item inherited unresolved from _Discovery Roadmap_, now stated with enough precision (D-Convergence, above) to be checked against a concrete implementation once one exists.
2. Whether the registered-but-open dimension set `D` (Ambiguity Audit A8) requires its own formal treatment as a _directed system_ of interpretation functions (one `I_D` per version of `D`, with restriction maps as `D` grows) rather than being treated, as here, as a fixed set at each instant. Deferred — the fixed-`D`-per-instant treatment is sufficient for every theorem above; a directed-system treatment would only be needed if dimension _removal_ were ever supported, which it currently is not.

---

_See also: [[07-Transformation-Algebra]] for the morphisms operating on the objects defined here. [[08-Semantic-Distance-and-Meaning]] for a structure defined over `I`, distinct from and not to be confused with the partial order `⊑` defined here. [[09-Topology-of-Research]] for the filtration/coarsening poset built on top of `Legal`. [[11-Formal-Foundations-Survey]] for verification of the provenance-semiring hypothesis this document's D7 depends on._