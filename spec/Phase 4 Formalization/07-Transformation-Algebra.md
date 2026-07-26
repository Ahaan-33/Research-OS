# Research Operating System — Transformation Algebra

### Phase 4 Formalization · Document 2 of 6

### Version 0.1

---

## Purpose

_[[06-Research-State-Mathematics]]_ defined the objects: `E`, `I`, `S = (E, I)`, and the poset `(Legal, ⊑)`. This document defines the arrows. It answers the _Discovery Roadmap_'s remaining commissioned items for this half of the work: _"define the four morphism-generators... define Synthesize's closure axioms explicitly, including the semantic order needed for extensivity, and add idempotence as a stated requirement... define the functor signatures for Project, Local Intelligence, and Emergence, proving once — generically, for any S → X functor — that non-authority follows from the shape alone."_

It also answers the current task's Second and Third Tasks together: every named transformation (Capture, Interpret, Synthesize, Supersede, Project) is given domain, codomain, and the requested properties; **Discover** and **Review**, named in the current task's list but never introduced as primitives anywhere in the existing corpus, are shown below to be _existing_ operations under new names, not new operations — consistent with the instruction that "every concept introduced must already exist somewhere in the specification." The algebra itself (Task 3) is then built from these morphisms directly, as operator notation rather than prose.

References back to: _[[06-Research-State-Mathematics]]_, _Discovery Roadmap §2, §4_ (transitions and their "impossibility by construction" framing), _[[02-System-Invariants]]_ (INV-9 through INV-13, the authority invariants this document proves rather than merely restates).

---

## The Category `Res`

Define the category `Res`:

- **Objects:** legal Research States, `S ∈ Legal` (_[[06-Research-State-Mathematics]]_, D10).
- **Morphisms:** structure-preserving maps `Legal → Legal` generated freely by four **generators** — `Capture`, `Supersede`, `Interpret`, `Synthesize` — under composition, plus the identity morphism `id_S` for every `S`.
- **Composition:** ordinary function composition; associative by construction, with `id_S` as the two-sided identity.

**This is precisely the category _Discovery Roadmap §7_ commissioned** ("the category whose objects are Research States and whose four morphism-generators are Capture, Supersede, Interpret, and Synthesize"). Everything below either instantiates a generator or proves a derived fact about the category so defined.

---

## The Four Generators

### G1 — Capture

```
Capture : Legal × Payload → Legal
Capture(S, p) = (E ∪ {new(p)}, I)
```

where `new(p)` mints a fresh identity (D4) for the content described by payload `p`, with `prov(new(p))` set to the capturing act.

|Property|Value|Justification|
|---|---|---|
|Domain|`Legal × Payload`|any legal state, any capturable content|
|Codomain|`Legal`|preserves legality (D10) — new element has fresh id, valid provenance|
|Precondition|none beyond `S ∈ Legal`|Capture is never blocked (_Design Invariants §18_)|
|Postcondition|`E' = E ∪ {new(p)}`, `I' = I`|Capture never writes `I`|
|Idempotent?|**No**|`Capture(Capture(S,p), p) ≠ Capture(S,p)` — two captures of the same payload mint two distinct identities (D4.1); Capture is idempotent _only_ up to the semilattice merge `⊔` of two independently-grown copies of `E` (_[[06-Research-State-Mathematics]]_, T1), never as a repeated single-state operation|
|Commutative with itself?|Yes, up to `⊑`-join|`Capture(Capture(S,p₁),p₂) = Capture(Capture(S,p₂),p₁)` since both add disjoint fresh elements — order doesn't matter, matching T1's commutativity of `⊔`|
|Monotone?|**Yes**|`S ⊑ Capture(S,p)` always (strictly `E`-growing, `⊑` by _[[06-Research-State-Mathematics]]_ T3)|
|Invertible?|**No**|INV-1: `E` never shrinks; no morphism in `Res` decreases `E`|
|Information-preserving?|**Yes**, trivially — adds, never removes||
|Lossy?|No||
|Functorial?|N/A — a generator, not a functor out of `S`||

### G2 — Supersede

```
Supersede : Legal × ElementId × Payload → Legal
Supersede(S, old, p) = (E ∪ {new(p), rel(new(p), old)}, I)
```

where `rel(new(p), old)` is the reserved supersession relation element (_[[06-Research-State-Mathematics]]_, D8).

|Property|Value|Justification|
|---|---|---|
|Domain|`Legal × ElementId × Payload`, requiring `old ∈ E`|can only supersede something that exists|
|Codomain|`Legal`|preserves acyclicity of `supersedes` (D10.4) — `new(p)` is fresh, so no cycle can form|
|Postcondition|`old` unchanged, still resolvable; `new(p) ∈ Current(E')`; `old ∉ Current(E')`|INV-2|
|Idempotent?|No, for the same reason as Capture||
|Monotone?|Yes|`S ⊑ Supersede(S, old, p)`|
|Invertible?|No|INV-2: superseding never removes `old`|
|`I` untouched?|**Yes, by definition** — this is the formal statement resolving Ambiguity Audit A2: Supersede is _strictly_ an Evidence-side operation; it does not, cannot, and by this definition structurally _has no mechanism to_, carry any `I` coordinate forward. (An engineering layer _raising a Research Intent_ that a new element lacks interpretation is a _separate_, subsequent act — possibly an Interpret or an Intent-submission — not part of the Supersede morphism itself.)||

**Theorem T-Supersede-Distinct.** `Supersede` is not a distinct morphism-generator at the level of `E`'s algebra; it is `Capture` applied to a payload of the reserved supersession-relation type. It is retained as its own named generator in this document only because it carries additional postconditions (`old`'s exclusion from `Current`) that are worth naming, exactly as _Discovery Roadmap §1_ found ("Supersede... is best modeled as ordinary Capture of a specific, reserved relation type, not as a fifth primitive"). _This document confirms rather than revises that finding._

### G3 — Interpret

```
Interpret : Legal × ElementId × Dimension × Value → Legal
Interpret(S, e, d, v) = (E, I[(e,d) ↦ I(e,d) ∪ {v}])
```

|Property|Value|Justification|
|---|---|---|
|Domain|`Legal × ElementId × Dimension × Value`, requiring `e ∈ E`, `d ∈ D`|can only interpret something and along a registered dimension|
|Codomain|`Legal`|preserves D10 trivially — no change to `E` or its provenance|
|Idempotent?|**Yes**, exactly — `Interpret(Interpret(S,e,d,v), e,d,v) = Interpret(S,e,d,v)` since `{v} ∪ {v} = {v}` (set union idempotence)|this is a genuinely different idempotence result from Capture's, and worth stating precisely: writing the _same_ value twice is idempotent; writing a _different_ value is not overwrite, it is _enlargement_ (see below)|
|Monotone?|**Yes**|`S ⊑ Interpret(S,e,d,v)` always, by _[[06-Research-State-Mathematics]]_ T3 — this holds **even when `v` conflicts with an existing value**, because the codomain of `I` is set-valued (D6): adding a conflicting value _enlarges_ `I(e,d)` rather than replacing it, which is exactly why Conflict Regions are compatible with a monotone, ever-growing interpretation function.|
|Commutative with itself (different pairs)?|Yes|disjoint (e,d) writes trivially commute|
|Commutative with itself (same pair, different values)?|**Yes** — commutative, but not "idempotent-after-one"|`Interpret(Interpret(S,e,d,v₁),e,d,v₂)` and the reversed order both yield `I(e,d) = {v₁, v₂}` — order doesn't matter to the _result_, only to _provenance ordering_ (which write is recorded as "first"), consistent with _[[06-Research-State-Mathematics]]_ T2|
|Invertible?|**Yes, considered alone** — "Interpret, considered alone, is fully reversible: any value is reachable from any other by direct edit" (_Discovery Roadmap §3_, confirmed here formally): `Interpret(S,e,d,v)` followed by an operation removing `v` from the set... — **but note**: no generator in `Res` removes a value from `I(e,d)`'s set once added, only `Synthesize` may, under specific closure conditions (see G4). So Interpret's _reversibility_ is a statement about `I`'s value-space having no arrow of time on its own, not a statement that `Res` contains a literal inverse morphism for `Interpret`.||

### G4 — Synthesize

```
Synthesize : Legal → Legal   (relative to a fixed E snapshot)
Synthesize(E, I) = (E, I*)
```

where `I*` is computed by the Synthesis Engine's Evidence Scanner + Interpretation Writer (_Computational Model_), and may both **add** new coordinate values (ordinary enlargement, as with Interpret) and **close** Conflict Regions by producing a coordinate assignment tagged as resolving a specific prior conflict (D14, _[[06-Research-State-Mathematics]]_) — this is the one way `Res` allows the _examination status_ of a pair to change from `unexamined`/`open-conflict` to `examined`/`resolved`, though — critically, per INV-19 — **never by removing the competing values from the historical record**; resolution is itself an additional, provenanced write (a new coordinate entry recording "this value is the resolved one, as of this Synthesis run"), not a deletion of the prior conflicting entries.

|Property|Value|Justification|
|---|---|---|
|Domain|`Legal`, parameterized by a frozen `E`|Synthesis "reads Evidence... since its last stable snapshot" (_[[00-Runtime-Specification]]_)|
|Codomain|`Legal`||
|Extensive?|**Yes, relative to the semantic order, not raw value count** — `I ⊑_sem Synthesize(E,I)` where `⊑_sem` orders by "how well `I` currently reflects the evidence available" (_Discovery Roadmap §3_), a distinct, weaker-grained order than `⊑` itself: extensivity here is a **claim to be checked per concrete implementation**, not a theorem provable from the generic definition alone, since "reflects the evidence" is not fixed by the algebra — see Open Questions||
|Monotone (in `⊑`)?|**Yes**, unconditionally — every value `Synthesize` adds is an addition to the set-valued codomain, never a removal, so `I ⊑ I*` always holds by construction, regardless of whether the _semantic_ extensivity claim above is verified||
|Idempotent relative to fixed `E`?|**Open — the central unresolved question, carried forward unchanged from _Discovery Roadmap_.** Formally: does `Synthesize(E, Synthesize(E,I)) = Synthesize(E,I)`?|This document adds precision but not proof: idempotence, if it holds, makes `Synthesize(E, ·)` a **closure operator** on the fixed-`E` slice of `(Legal, ⊑)` in the standard order-theoretic sense — extensive, monotone, idempotent. Monotone and extensive (relative to `⊑_sem`) are argued above; idempotence remains unproven for any general implementation and is stated as the required conformance test for any concrete Synthesis Engine (see _[[02-System-Invariants]]_ INV-23, restated here with its precise formal target).|
|Invertible?|**No**|no generator removes a coordinate value once added|
|Functorial?|No — `Synthesize` is a generator of `Res`'s morphisms, an endomorphism `S → S'` on states sharing `E`, not a functor _out of_ `S` into a different category (contrast with G5–G7, below)||

**Theorem T-Closure (conditional).** _If_ `Synthesize(E, ·)` is idempotent, _then_ it is a closure operator on the poset `({I : (E,I) ∈ Legal}, ⊑_sem)`, and its closed points are exactly the complete states (_[[06-Research-State-Mathematics]]_, "Completion"), and Publication-readiness is exactly the predicate "`S` is a closed point of `Synthesize(E, ·)`." This theorem is conditional precisely because idempotence is not proven — it restates _Discovery Roadmap §3_'s finding as a formal conditional rather than resolving the condition.

---

## The Three Functors (Non-Write Operations)

These are not generators of `Res` — they map `Legal` _out of_ the category of Research States into other categories (Views, Suggestions, Graphs) and never map back in.

### G5 — Project

```
Project : Legal × QueryDef × AbstractionParam → View
```

`View` is a separate category (objects: rendered outputs; morphisms: refinements between abstraction levels — formalized fully in _[[10-Projection-Formalism]]_). `Project` is a **functor** `Res → View`, indexed by `(QueryDef, AbstractionParam)`.

**Theorem T-Functor (Non-Authority from Shape Alone).** _For any functor `F : Res → 𝒳` into any category `𝒳` whose objects are not themselves `Legal`-typed_ (i.e., `𝒳` is not `Res` or a subcategory admitting a forgetful-then-identity embedding back into `Legal`), _`F` cannot, by its own type signature, be composed with a `Res`-endomorphism generator to produce a new element of `Legal`._ Concretely: there is no well-typed expression `Capture(F(S), ...)`, `Interpret(F(S), ...)`, etc., because `F(S) ∈ 𝒳`, not `F(S) ∈ Legal`, and the generators G1–G4 are typed to take `Legal` as their first argument. Non-authority is therefore not a policy enforced by a runtime guard — it is **a type error**, exactly as _Discovery Roadmap §4_ argued informally ("an illegal transition is not a morphism with a false guard, it is the absence of a morphism") and _[[02-System-Invariants]]_ INV-11 required. This single theorem, proven once here generically, is what the _Discovery Roadmap_ asked for ("proving once — generically, for any S → X functor — that non-authority follows from the shape alone") and discharges it for all three functors below simultaneously.

Applying T-Functor: `Project : Res → View`, so Project has no write authority, period — not because a rule forbids it, but because `View` is not `Legal`.

**Properties of Project:**

|Property|Value|
|---|---|
|Preserves naturality across abstraction|**Yes — required** (T-Naturality, below)|
|Injective?|**No, generally** — a coarse Projection discards detail (this is the point; see _[[10-Projection-Formalism]]_)|
|Idempotent as a functor application?|Trivially, `Project(Project(S,q,a),...)` is not even well-typed (the first argument must be `Legal`, and `Project(S,q,a) ∈ View`), so idempotence is not a meaningful question for a strict functor `Res → View` — this itself is a consequence of T-Functor|

**Theorem T-Naturality.** For abstraction levels `a₁ ⊑_abs a₂` (`a₁` coarser), there exists a coarsening morphism `coarsen : View_{a₂} → View_{a₁}` such that `Project(S, q, a₁) = coarsen(Project(S, q, a₂))` for every `S, q`. This is the formal statement of _Discovery Roadmap §3_'s naturality condition and _[[02-System-Invariants]]_ INV-16, and is developed fully as a commuting-square diagram in _[[10-Projection-Formalism]]_.

### G6 — Local Intelligence ("Discover")

```
Discover : Legal → Suggestions
```

`Suggestions` is a category of ranked, scored candidates — never assertions. **This document identifies `Discover`, as named in the current task, with the functor already defined in the _Discovery Roadmap_ as "Local Intelligence"** — no new operation is introduced; the current task's vocabulary is mapped onto the existing one. By T-Functor, `Discover` has no write authority (`Suggestions ≠ Legal`).

|Property|Value|
|---|---|
|Deterministic?|**Yes** — required (INV-21)|
|Label-bearing output?|**No** — per Ambiguity Audit A11, output is restricted to continuous scores, never relationship-category labels|
|Reads Emergence functor's output?|**No** — per Ambiguity Audit A10, kept acyclic|

### G7 — Relationship / Emergence

```
Emergence : Legal × WeightConfig → Graph
```

`Graph` is a category of derived structures (nodes, weighted edges). By T-Functor, `Emergence` has no write authority (`Graph ≠ Legal`).

|Property|Value|
|---|---|
|Deterministic given `WeightConfig`?|**Yes**|
|Locality (per _[[06-Research-State-Mathematics]]_, "Locality")?|**Bounded by co-dimension neighborhood, revised** — _[[05-Design-Review-Stress-Test]]_ Section 2b found the naive bound insufficient for widely-shared dimension values; the corrected formal statement is: `Emergence` restricted to any _specific pair_ of elements is local to that pair's own coordinate vectors (an `O(1)` computation per pair), but _materializing the full graph_ is not bounded by a single Interpret write's locality — only _incremental, on-demand, capped_ graph materialization (per INV-30, _[[05-Design-Review-Stress-Test]]_) preserves the intended bound|

### G8 — "Review" Is Not a Fourth Functor or Fifth Generator

The current task lists `Review` alongside the generators and functors as something to formalize. Cross-checking the corpus: _System Architecture_ is explicit that "Work Mode and Review Mode... are postures over the same two verbs, not separate subsystems," and no document anywhere defines Review as an operation with its own domain/codomain distinct from the generators already defined.

**Formal treatment:** `Review` denotes a **labeled temporal region** of the morphism sequence — a maximal subsequence of `Res`-morphisms in which `Synthesize` is invoked and the researcher's `Interpret` calls are directed at resolving flagged Conflict Regions or Research Intents, as opposed to `Capture`-dominated "Work Mode" regions. Formally:

```
Review(S₀, S_n) := true  iff  the morphism path S₀ → S₁ → ... → S_n contains at least one Synthesize application
```

`Review` is a **predicate over morphism paths**, not a morphism itself, and requires no addition to `Res`'s generator set. This resolves the current task's request cleanly: Review is named, given a precise formal referent, and shown to require no new mathematics — consistent with "do not invent notation unnecessarily."

---

## The Algebra of Research (Task 3)

With generators and functors defined, the requested algebraic expressions resolve to precise compositions:

**Research State + Evidence:**

```
S + e  :=  Capture(S, payload(e))          [∈ Legal]
```

Well-typed and total (Capture has no precondition beyond legality).

**Research State → Projection:**

```
S → V  :=  Project(S, q, a)   for some (q,a)     [∈ View]
```

A functor application, not a `Res`-morphism — the arrow `→` here denotes a _different kind_ of arrow than composition within `Res`, precisely because `Project`'s codomain leaves `Res` (T-Functor). Notating both with the same arrow symbol would be the "invent notation unnecessarily" the task warns against conflating — this document uses `⟶` for `Res`-internal composition and `↦` for functor application to keep the distinction explicit.

**Interpretation ∘ Capture:**

```
Interpret(Capture(S,p), new-id, d, v)
```

Well-typed only because `Capture`'s codomain (`Legal`) matches `Interpret`'s domain requirement — both are `Res`-endomorphisms, so ordinary categorical composition applies: `Interpret(·,new-id,d,v) ∘ Capture(·,p) : Legal → Legal`. This composed morphism is exactly the common "capture, then immediately annotate" sequence in the Interactive Loop (_[[00-Runtime-Specification]]_).

**Synthesis(A,B):** Cross-checking usage: nowhere in the corpus does Synthesize take two Research-State arguments — it takes one `(E,I)` pair, relative to a fixed `E` (G4). The task's example notation `Synthesis(A,B)` is therefore reinterpreted, per "do not invent notation unnecessarily," as **not a binary operation on two separate states**, but as shorthand occasionally used loosely in prose for `Synthesize` applied where `A` denotes the Evidence component and `B` the Interpretation component of a single state: `Synthesize(E,I)` exactly as defined in G4. No new binary operator is introduced.

**Conflict(A,B):** For two elements `e_A, e_B ∈ E` interpreted along the same dimension `d`:

```
Conflict(e_A, e_B, d)  :=  I(e_A,d) ∩ I(e_B,d) ≠ ∅ ∧ (contradictory relation asserted between e_A, e_B via some r ∈ R)
```

More precisely, and more usefully: `Conflict` is not a binary function of two _elements_ at all in the primary sense already defined — the primary notion of conflict (_[[06-Research-State-Mathematics]]_, "Contradiction") is `|I(e,d)| ≥ 2` for a _single_ `(e,d)` pair. A two-element conflict (`e_A` contradicts `e_B`) is represented, consistently with _Relationship Ontology_, as a **relation element** `r ∈ R` of the reserved "contradicts" type linking `e_A` and `e_B` — itself just an ordinary Capture (G1) of a typed relation, not a new operation.

**Projection(V):** Already `Project(S,q,a) = V`; `Projection(V)` as a further operation on an already-produced view is a `View`-internal morphism (e.g., the coarsening map of T-Naturality), formalized fully in _[[10-Projection-Formalism]]_, not a new `Res`-level operation.

---

## Theorems Summary

|#|Statement|Status|
|---|---|---|
|T-Supersede-Distinct|Supersede is Capture of a reserved relation type, not a fifth primitive|Proven|
|T-Functor|Any functor `Res → 𝒳` (𝒳 ≠ Legal-typed) has no write authority, by type shape alone|Proven, generic|
|T-Naturality|Project commutes with abstraction-level coarsening|Stated; full proof in _[[10-Projection-Formalism]]_|
|T-Closure (conditional)|If Synthesize idempotent, it is a closure operator with closed points = complete states|Conditional — idempotence itself remains open|
|—|Capture, Supersede: monotone, non-idempotent (per-application), irreversible|Proven|
|—|Interpret: monotone, idempotent-per-identical-value, invertible-in-value-space-only|Proven|

---

## Engineering Implications

- **T-Functor should be treated as the formal justification for enforcing INV-11/INV-13 as compile-time type boundaries rather than runtime checks** (already recommended in _[[02-System-Invariants]]_, Engineering Decision 1) — this document supplies the proof that makes that recommendation not just good practice but mathematically exact: a correctly-typed implementation _cannot_ express an illegal write, not merely _is instructed not to_.
- **The `Review`-as-predicate-over-paths finding (G8) means no new UI state or system mode needs its own persistence or write authority** — this confirms _[[01-State-Model]]_'s State Object 8 (Interaction/Session-Memory State) already correctly captures "current Mode" as ephemeral, non-authoritative bookkeeping, with nothing further required.
- **Synthesize's conditional closure-operator status (T-Closure) means Publication tooling should explicitly track and expose whether idempotence has been empirically verified for the currently-running Synthesis implementation**, rather than silently assuming it — a testable conformance requirement, not a cosmetic one.

---

## Rejected Alternatives

- **Treating Discover/Review as genuinely new primitives with their own generator status in `Res`.** Rejected: neither has a distinct domain/codomain not already covered by existing generators/functors; inventing new generators would violate the task's explicit "every concept introduced must already exist somewhere in the specification" and would also break the minimality already established for `Res`'s four-generator presentation.
- **A single unified `Write : Legal × Op → Legal` generator subsuming Capture/Supersede/Interpret/Synthesize.** Rejected: collapsing them loses exactly the distinctions (which one may run in a batch vs. singly, which one touches `E` vs. `I`, which one is idempotent) that _[[02-System-Invariants]]_ INV-9/INV-10 depend on being separately nameable; the four-generator presentation is the minimal decomposition that keeps each invariant statable as "generator X has property Y," rather than "some writes have property Y under condition Z."

---

## Open Questions

1. **Synthesize idempotence remains fully open**, exactly as inherited from _Discovery Roadmap_. This document sharpens the question (T-Closure's conditional statement, the `⊑_sem` order) but does not resolve it. Resolution requires either a proof against a specific Synthesis Engine's Interpretation Writer algorithm, or an empirical conformance test suite (as recommended in _[[02-System-Invariants]]_).
2. Whether `⊑_sem` (the semantic order used for extensivity) can be given a fully general, implementation-independent definition, or is necessarily specific to each Synthesis implementation's own notion of "how well `I` reflects the evidence." This document leaves it as a named-but-undefined order, deliberately, rather than force a premature specific definition — see _[[08-Semantic-Distance-and-Meaning]]_ for the closest available formal candidate.

---

_See also: [[06-Research-State-Mathematics]] for the objects these morphisms act on. [[08-Semantic-Distance-and-Meaning]] for the semantic order `⊑_sem` this document names but does not fully define. [[09-Topology-of-Research]] and [[10-Projection-Formalism]] for the categories `Graph`/`View` this document's functors map into. [[11-Formal-Foundations-Survey]] for category-theoretic context and falsification of the claims above._