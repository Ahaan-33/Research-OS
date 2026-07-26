# Research Operating System — Provenance Structure

### Phase 6 Implementation · Document 1 of N

### Version 0.1

---

## Purpose

_[[06-Research-State-Mathematics]]_, D7, left `prov(e)` and `prov(e,d,v)` as references to "a structure with two combinators... tested for semiring axioms in _[[11-Formal-Foundations-Survey]]_." That survey never actually performed the test — no semiring theory appears in its Part I catalogue, and Part II's falsification pass does not touch INV-18. _[[02-System-Invariants]]_, INV-18, and _[[12-system-architecture-first-draft]]_, Subsystem 12, both carry the hypothesis forward as unresolved and explicitly gate a design decision on its resolution: Subsystem 12 states plainly that "whether Provenance deserves its own persistent structure... is deferred pending that resolution."

This document performs the deferred test and resolves it. It is scoped narrowly: one object (`prov`), one question (does it satisfy commutative semiring axioms, and if so, which semiring), and one consequence (what Subsystem 12 and Subsystem 1 must actually store). Nothing else from Documents 06–13 is revisited.

References back to: _[[06-Research-State-Mathematics]]_ D7 (the object being resolved), _[[07-Transformation-Algebra]]_ G1–G4 (the acts that generate provenance), _[[02-System-Invariants]]_ INV-18 (the invariant this document discharges), _[[12-system-architecture-first-draft]]_ Subsystem 12 (the open question this document closes). References forward to: _[[15-Canonical-Data-Model]]_ (the concrete representation this resolution licenses).

---

## Restating the Hypothesis Precisely

_Discovery Roadmap §3_ (quoted in full, since it is the origin of INV-18): "an interpretation reached from several pieces of jointly-necessary evidence should record their joint necessity; one reached from either of two independent lines of support should record the alternation." Two operations are required:

- a **joint** combinator (write `⊗`) — "these acts were used together to produce this fact; neither alone would suffice";
- an **alternative** combinator (write `⊕`) — "either of these acts alone would suffice to produce this fact; both happen to hold."

A **provenance semiring** is a structure `(P, ⊕, ⊗, 0, 1)` where `(P, ⊕, 0)` is a commutative monoid, `(P, ⊗, 1)` is a monoid, `⊗` distributes over `⊕` on both sides, and `0` annihilates under `⊗` (`0 ⊗ p = 0`). The question is whether ROS's actual provenance requirements — as fixed by the four generators, not as a free choice — instantiate a structure satisfying these axioms, and if so, which one.

**Both combinators are already forced by facts already proven, not merely desired:**

1. **`⊗` is forced by Synthesize (G4).** _[[07-Transformation-Algebra]]_ defines Synthesize's Interpretation Writer as reasoning over an accumulated evidence snapshot, not a single element — its Evidence Scanner / Agreement-Contradiction Reader division (_[[12-system-architecture-first-draft]]_, Subsystem 3) inherently identifies values that follow from _combinations_ of Evidence elements considered together. A coordinate value asserted because elements `e₁` and `e₂` jointly support it is not honestly attributable to `e₁`'s contribution alone or `e₂`'s alone — the joint combinator is required to state this truthfully, and no weaker structure (e.g., a flat unordered set of "contributing elements") can distinguish "these three were jointly necessary" from "any one of these three would have sufficed," which is precisely the distinction _Design Invariants §8_ and INV-19 require provenance to preserve.
2. **`⊕` is forced by T2 (Multi-Value Register Merge) together with G3's proven idempotence.** _[[07-Transformation-Algebra]]_'s Interpret table proves `Interpret(Interpret(S,e,d,v),e,d,v) = Interpret(S,e,d,v)` — writing the same value twice is idempotent **at the level of `I`**. But the two acts that each wrote `v` are still two distinct, independently-provenanced acts (e.g., a researcher's Interpret and a later Synthesis run independently arriving at the same value, or two Synthesis runs over evidence snapshots taken at different times both concluding `v`). `I(e,d)`'s value-set collapses to `{v}`; `prov(e,d,v)` must not silently collapse to only one of the two acts, or a real fact — that two independent lines of reasoning converged on `v` — is lost. This is exactly INV-19 ("no legal computation may cause a Conflict Region to disappear except through explicit resolution") applied to its dual case: independent _agreement_, not disagreement, must also remain visible, for the same underlying reason. The alternative combinator is what records this without inventing a new generator or violating G3's already-proven idempotence at the `I` level.

Both combinators are therefore not optional formal decoration; they are the only honest way to represent facts the architecture already produces.

---

## Candidate Structures, and Why the Obvious Ones Fail

**Candidate 1 — natural-number-weighted polynomials, `ℕ[X]`** (the classical "how-provenance" semiring of Green–Karvounarakis–Tannen, where `X` is the set of atomic acts, `⊗` is polynomial multiplication, `⊕` is polynomial addition). Rejected: `ℕ[X]`'s `⊕` is **not idempotent** (`1 ⊕ 1 = 2`, not `1`). Applying `⊕` to represent "act `a` alone justifies `v`, and it does so again" would make repeated identical justification accumulate weight — but re-examining the same evidence via a second Synthesis run over an unchanged snapshot must not manufacture a numerically "stronger" fact merely by having run twice (this would silently reintroduce a form of the non-idempotence problem G4's convergence question is already worried about, at the provenance layer instead of the `I` layer). `ℕ[X]` is the right structure when the question is "how many ways can this fact be derived" (its native use case, counting query derivations); ROS's question is "which acts, jointly or alternately, in fact justify this," which is a qualitative, not counting, question.

**Candidate 2 — the Boolean/tropical semiring, `𝔹 = {0,1}`** (used for plain yes/no provenance, or min-cost path provenance). Rejected: it collapses `prov(e,d,v)` to a single bit, discarding exactly the information — _which_ acts, and how they combined — that D7 and INV-17 require to survive ("every mutation of `S` identifies what initiated it"). `𝔹` answers "is there provenance," which is trivially always yes by D10.2; it cannot answer "which."

**Candidate 3 — sets of contributing acts with a single union operation (no distinction between `⊗` and `⊕`).** This is the structure implicitly assumed by treating `prov` as "a reference to the act" (D7's informal phrasing) generalized naively to "a set of references." Rejected outright: a flat set cannot distinguish joint necessity from alternation at all — it is precisely the structure _Discovery Roadmap §3_ identified as insufficient, which is why the semiring hypothesis was raised in the first place.

---

## The Resolution: `PosBool(Acts)`, the Free Distributive Lattice on Atomic Acts

Let `Acts` be the set of all atomic provenance-bearing acts — one token per Capture, per Supersede, per individual Interpret write, per Investigation-completion act, and per Synthesis run (a whole run is one atomic act at this level; the acts _internal_ to a run, e.g. which Evidence elements its Evidence Scanner read, are captured by `⊗`-composition of the elements' own prior provenance, not by decomposing the run itself — a run either happened as a unit or did not, matching G4's own treatment of Synthesize as a single morphism application).

Define `prov(e,d,v) ∈ PosBool(Acts)`: the free structure of monotone (positive) Boolean expressions over `Acts`, generated by `⊗` (meet/AND) and `⊕` (join/OR), quotiented by the standard absorption laws:

```
a ⊗ a = a                    a ⊕ a = a                    (idempotence, both operations)
a ⊗ b = b ⊗ a                a ⊕ b = b ⊕ a                (commutativity, both operations)
(a⊗b)⊗c = a⊗(b⊗c)            (a⊕b)⊕c = a⊕(b⊕c)            (associativity, both operations)
a ⊗ (a ⊕ b) = a               a ⊕ (a ⊗ b) = a              (absorption)
a ⊗ (b ⊕ c) = (a⊗b) ⊕ (a⊗c)                                (distributivity)
1 ⊗ a = a         (1 := the empty joint-set, "trivially available")
0 ⊕ a = a         (0 := the empty alternative-set, "no justification yet")
0 ⊗ a = 0
```

This is not a novel invention: `PosBool(X)` is the established name (Green–Karvounarakis–Tannen 2007; also called the semiring of "why-provenance" in its normal form) for the **free distributive lattice generated by a set `X`**, and it is a genuine commutative semiring — every axiom above is a standard lattice identity, not an assumption specific to ROS. Concretely, an element of `PosBool(Acts)` is representable, up to the absorption laws, as an **antichain of finite subsets of `Acts`** — a set of "minimal sufficient justification sets," none a subset of another (if one justification set is a subset of another, the larger one is redundant and absorbed).

**Verifying this against ROS's own requirements, term by term:**

|Requirement|How `PosBool(Acts)` satisfies it|
|---|---|
|Joint necessity (`⊗`)|A minimal justification set `{a₁, a₂}` in the antichain states exactly "`a₁` and `a₂` were jointly used, and this pairing is not reducible to either alone" — this is Synthesize's Agreement/Contradiction Reader output, one antichain element per joint justification it identifies.|
|Alternation (`⊕`)|Two distinct antichain elements `{a₁}` and `{a₂}` (neither a subset of the other) for the same `(e,d,v)` state exactly "either act alone already justifies `v`; both happen to hold" — this is the independent-convergence case forced by G3's idempotence, above.|
|Idempotence under repeated identical acts|`a ⊗ a = a` and `a ⊕ a = a` hold by construction — re-running an unchanged Synthesis pass, or re-issuing an identical Interpret write, adds the same antichain element again, which the absorption law collapses to no change. This is the provenance-layer statement of exactly the same idempotence G3 already proves for `I` itself — the two levels are now provably consistent with each other rather than merely both individually plausible.|
|No information ever lost (INV-19's dual, stated above)|The antichain only ever grows (a new justification either extends an existing minimal set — handled by `⊗` — or is absorbed if redundant, or is added as a new, incomparable alternative — handled by `⊕`) under any of the four generators; nothing in `PosBool`'s operations ever removes an antichain element once present, matching INV-1/INV-2/INV-7's "nothing is deleted, only extended" posture at the `E` and `I` layers.|
|`0` never occurs on a legal state|`prov = 0` (the empty antichain, "no justification at all") is structurally excluded by D10 condition 2 ("every `e ∈ E` has a provenance") — `0` exists in the algebra as the required semiring identity/annihilator, but no legal write path ever produces it, exactly as `I(e,d) = ∅` with `unexamined` status (D14) is legal while `prov = 0` is not: absence of interpretation is legal, absence of attribution is not.|

**Theorem P1 (Provenance Semiring, Resolved).** `(PosBool(Acts), ⊕, ⊗, ∅, {∅})` is a commutative semiring, and it is idempotent in both operations. _Proof._ `PosBool(X)` for any set `X` is the free bounded distributive lattice on `X`; every bounded distributive lattice `(L, ∨, ∧, 0, 1)` is a commutative idempotent semiring with `⊕ := ∨`, `⊗ := ∧` — this is a standard result in lattice theory (idempotent semirings and bounded distributive lattices are definitionally the same structure, differing only in which operation-pair is named "sum" and which "product"). The absorption, commutativity, associativity, and distributivity laws stated above are exactly the bounded-distributive-lattice axioms. ∎ This is a genuine proof, not a restatement of the hypothesis — INV-18 is hereby promoted from "design target" (its status in _[[02-System-Invariants]]_) to **proven**, and _[[11-Formal-Foundations-Survey]]_'s catalogue should be considered amended to include "Provenance Semirings — Adopted" alongside its existing entries, with `PosBool(Acts)` (equivalently: free distributive lattices) as the specific instance, not the more general `ℕ[X]` the original hypothesis's phrasing might have suggested.

---

## Why Idempotent, Specifically, and Not the More General `ℕ[X]`

This is worth stating as a deliberate choice, not an oversight, since `ℕ[X]` is the more commonly cited provenance semiring in the literature this hypothesis draws from. The choice is forced by a fact already proven elsewhere in the vault, not picked for convenience: G3 (Interpret) is proven idempotent at the level of `I` (_[[07-Transformation-Algebra]]_, G3 table). Any provenance structure whose `⊕` is not itself idempotent would make `prov` sensitive to a distinction — "how many times was this exact justification supplied" — that `I` itself, by the already-proven theorem, is not sensitive to. Keeping `I` idempotent while letting `prov` count multiplicities would make the pair `(I, prov)` jointly represent strictly more information than `I` alone claims to hold, silently reopening exactly the kind of "hidden state" _[[06-Research-State-Mathematics]]_'s Engineering Implications section warns against ("a different, non-isomorphic representation" of `S`). Idempotent `⊕` is therefore not merely permissible — it is the only choice consistent with a theorem already proven about a sibling structure.

---

## Consequence for Subsystem 12 (Provenance Subsystem)

_[[12-system-architecture-first-draft]]_, Subsystem 12, deferred whether it "deserves its own persistent structure" pending this resolution. The resolution:

**Subsystem 12 still owns no separate store.** An antichain-of-subsets-of-`Acts` is small (bounded, in practice, by the number of distinct joint/alternative justifications a single coordinate has actually accumulated — typically one or two elements, pathologically bounded by the number of Synthesis runs and Interpret writes ever made to that pair, which is itself bounded by project activity, not by `E`'s size) and is naturally stored as part of the coordinate entry it belongs to, exactly as Subsystem 12's original "carried as part of each element/coordinate, not a parallel structure" finding already argued — that finding is confirmed, not revised, by this resolution. What changes is only that the field's type is now fully specified: not an opaque "attribution record" but a concrete antichain-of-act-reference-sets value, given a canonical serialization in _[[15-Canonical-Data-Model]]_.

**One open item remains, deliberately narrow.** Whether Synthesize's Evidence Scanner, when it identifies a value as following from a large evidence set, should always record the _minimal_ jointly-sufficient subset (the honest reading of `⊗`, and the one this document assumes throughout) or may record a superset it did not actually verify was minimal. This is not a mathematical question — `PosBool`'s absorption law is well-defined regardless — it is a conformance obligation on any concrete Synthesis Engine implementation: an implementation that records non-minimal joint sets is not thereby producing an illegal `S` (D10 does not constrain `prov`'s internal precision), but it is producing provenance that is truthful yet less useful than it could be. Recorded here as a Synthesis Engine conformance note, not a blocking ambiguity.

---

## Relationship to Previous Documents

This document discharges the open item _[[06-Research-State-Mathematics]]_ D7 deferred to _[[11-Formal-Foundations-Survey]]_, which that document did not in fact perform. It promotes INV-18 (_[[02-System-Invariants]]_) from hypothesis to proven result, and closes _[[12-system-architecture-first-draft]]_'s Subsystem 12 Open Question 3. No subsystem boundary, generator, or invariant elsewhere in the vault is revised.

---

## Open Questions

1. Whether `Acts` should include a token per _individual_ coordinate write within a Synthesis batch, or one token per whole batch (this document assumed the latter, treating a Synthesis run as one atomic act, consistent with G4's treatment of Synthesize as a single morphism application) — revisiting this would only matter if a future requirement needed to distinguish "this value came from this run" from "this value came from this specific sub-step of this run," which no current invariant requires.
2. The Synthesis Engine minimality conformance note, above — left as an implementation-quality target, not a legality constraint.

---

_See also: [[06-Research-State-Mathematics]] D7 for the object resolved here. [[02-System-Invariants]] INV-18 for the invariant now discharged. [[12-system-architecture-first-draft]] Subsystem 12 for the subsystem whose data model this resolution fixes. [[15-Canonical-Data-Model]] for the concrete serialization of `PosBool(Acts)` values._
