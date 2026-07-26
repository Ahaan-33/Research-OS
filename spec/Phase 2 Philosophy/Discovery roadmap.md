# Research Operating System

# Toward a Formal Foundation — A Discovery Roadmap

### Companion to: System Architecture, Layer Two, Convergence Pass, Computational Model

### Version 0.1

---

# Method

This document does not formalize the architecture. It interrogates whether the architecture was already describing a mathematical object, and lets the answer stand even where it disagrees with the prose. Two structures proposed below are flagged as unproven hypotheses rather than results, because the honest answer at this stage is "this appears to fit, and here is the check that would confirm it" — not a derivation. Two prior architectural decisions are revised as a direct consequence of taking the mathematics seriously rather than the diagram.

---

# 1. The Canonical Object

The hypothesis on the table was S = (E, I). It survives, with one correction.

**E is not a bare set.** Re-examining what actually gets captured, two kinds of immutable element exist: content elements (an observation, a hypothesis, a result) and relation elements (an explicit assertion that two content elements are connected — "supports," "contradicts," "derives from"). [[Relationship Ontology]] already insists relationships are first-class, not inferred — which means a relation, once asserted, is exactly as immutable and provenance-bearing as any other captured fact. There is no principled reason to give relation-assertions a separate registry outside Evidence. **Correction:** the Structural Link Registry, previously described as an internal sub-component of the Relationship/Emergence Layer, is reclassified. It was never derived data — it is directly captured data, and belongs in E like everything else a researcher asserts. E is therefore best understood as one set of immutable elements, closed under two roles (content, relation), connected by a single provenance structure that records both what produced each element and what supersedes it.

**I stays exactly as described** — a function assigning a value to every (element, dimension) pair, where "element" now ranges over both content and relation elements uniformly, so confidence, thread, and stage apply to a relation exactly as they apply to an observation.

So: **S = (E, I)** holds, where E is not merely "a set of facts" but "a provenance-connected collection of two kinds of immutable element," and I is one uniform assignment function over that collection. Nothing richer than this pair is required — the correction was to what E contains, not to the shape of S itself.

One thing sits outside S entirely and should not be squeezed into it: an in-progress Investigation. It fails S's own invariants (its content is not yet evidence, has no stable identity, is not interpretable) — it belongs to a separate, weaker category of "pre-states," addressed in Section 7.

---

# 2. Classifying Every Process

Once S is fixed, every one of the eight components turns out to be one of exactly three shapes — not eight different kinds of thing, three:

**(a) Endomorphisms of S** — operations that take a Research State and produce another Research State: Capture, Supersede, Interpret, Synthesize. These are the only things that can change what S is on the next observation.

**(b) Functors out of S** — operations that read S and produce something in a different category, with no path back: Project (S → Views), Local Intelligence (S → Suggestions), Relationship/Emergence (S → Graphs). Structurally these three are the same pattern applied to three different targets — the same reason none of them is authoritative is the same reason: a functor's output is, by construction, entirely determined by its source, so nothing is lost if it's discarded.

**(c) One admission functor into S** — Investigation → (a Capture, or Capture-plus-Supersede, morphism). This is the only bridge between the pre-formal category of in-progress work and the algebra of S, and it only ever runs in one direction.

Every component from the Computational Model document lands in exactly one bucket:

|Component|Shape|
|---|---|
|Evidence Plane, Interpretation Plane|The object S itself, not a process|
|Capture, Supersede|(a) endomorphism|
|Interpret|(a) endomorphism|
|Synthesis Engine|(a) endomorphism (the richest one)|
|Projection Layer|(b) functor, target = Views|
|Local Intelligence|(b) functor, target = Suggestions|
|Relationship/Emergence Layer|(b) functor, target = Graphs|
|Lifecycle Orchestrator|(c) admission functor, source = Investigations|

Nothing is left over. This is a genuine compression: the eight-component picture wasn't wrong, but eight is the count of _responsibilities_, not the count of _mathematical kinds_. There are three kinds.

---

# 3. The Algebra

**Capture and Supersede, on E.** E only grows, is union-closed, and merging two independently captured sets is always well-defined with no possibility of conflict — two branches can both supersede the same element without contradiction, since neither erases anything. This is precisely the shape of a **join-semilattice** (equivalently, a grow-only-set: idempotent, commutative, associative merge). Capture is not idempotent as an operation (capturing the same content twice produces two distinct elements — identity, not content, is what's compared), but the _semilattice merge_ of two evolving copies of E is idempotent, commutative, and associative by definition. Capture is irreversible: no operation in the algebra removes an element.

**Interpret, on I.** Two concurrent edits to different (element, dimension) pairs commute trivially. Two concurrent edits to the _same_ pair do not commute — and critically, the architecture already refuses to resolve this the simple way. It does not silently keep the last write; it keeps both and records a Conflict Region. That is exactly the behavior of a **multi-value register**, not a last-write-wins register — the well-known distinction in concurrent-state formalisms between discarding a stale write and retaining it as an unresolved alternative. Interpret, considered alone, is fully reversible: any value is reachable from any other by direct edit. There is no arrow of time in I by itself — only Synthesis introduces one.

**Synthesize, on (E, I) → I.** This is the operation worth the most scrutiny. Held against E fixed, does running Synthesis twice equal running it once? The architecture doesn't currently guarantee this — it's a property the model _should_ have, not one already proven. If it holds, Synthesize is a **closure operator** relative to fixed E: extensive, monotone, idempotent. This requires care about which order extensivity is measured against — not the raw confidence value, which can go down, but a semantic order such as "how well I currently reflects the evidence available." Under that order, a mature, publishable state is precisely a **closed point** of the operator — a fixed point with no remaining obstruction. This reframes Publication cleanly: publication-readiness is not a separate filter over the state, it is the predicate "Synthesize(E, I) = I and no Conflict Region remains." **This is a missing invariant surfaced by the formal question, not a restatement of an existing one — the architecture should say explicitly that Synthesis must be idempotent against a fixed evidence snapshot, because without that guarantee, "maturity" has no stable meaning.**

**Provenance, across all of the above.** Every element of E and every write to I should be attributable to what produced it, and that attribution composes: an interpretation reached from several pieces of jointly-necessary evidence should record their joint necessity; one reached from either of two independent lines of support should record the alternation. This is exactly what **provenance semirings** were built to express — a value drawn from a structure with two operations, one for "used together," one for "either would do." This is flagged as a hypothesis, not a result: the next document would need to check that the architecture's actual provenance requirements (joint necessity, alternation, and composability across a Synthesis run) satisfy the semiring axioms before relying on the formalism further.

**Project, across abstraction levels.** Two Projections at different abstraction levels of the same question should agree wherever they overlap — zooming out should never contradict what zooming in already showed. This is a **naturality condition**: a family of projections indexed by abstraction level, where coarsening commutes with projecting. This is the precise mathematical content behind "changing abstraction never changes meaning."

**Summary of properties, derived rather than assumed:**

|Operation|Closed|Idempotent|Irreversible|Commutes|Requires provenance|
|---|---|---|---|---|---|
|Capture|Yes|No (per-instance); merge is|Yes|With independent captures only|Yes|
|Supersede|Yes|Yes, as a relation|Yes|With unrelated edits|Yes|
|Interpret|Yes|Yes, per single write|No|Only on disjoint (element, dimension) pairs|Yes (researcher or Synthesis run)|
|Synthesize|Yes|Only relative to fixed E — not yet guaranteed|Not intrinsically (I is revisable)|No, not with Capture|Yes, compositionally|
|Project|Yes|N/A — it doesn't write|N/A|N/A|No — it only reads|

**On the suggested candidates Merge, Split, and Compose:** none of these earns a place as a primitive. "Merge" and "split" of threads are patterns of many ordinary Interpret writes performed in one Synthesis pass — naming the pattern is useful for a researcher, but the algebra doesn't need a new operation to express it. "Compose" is not a new operation at all — it is what a category already gives for free: any two composable legal transitions form a legal multi-step transition. Introducing either would violate the same minimality this whole exercise has been enforcing.

---

# 4. Authority, Formalized

English described authority as "who may write where." The more precise statement: legality is not a rule checked at runtime against a forbidden list — it is the simple fact that a transition of a given shape either has an instance in the algebra or it doesn't. Framed as a category whose objects are Research States and whose morphisms are exactly Capture, Supersede, Interpret, and Synthesize: **an illegal transition is not a morphism with a false guard, it is the absence of a morphism.** There is no morphism "Projection writes Interpretation" to forbid, because no such arrow was ever defined into the category. This reframes every entry in the Computational Model's "impossible by construction" list from a rule to check into a fact about which hom-sets are non-empty — which is a stronger and cheaper guarantee than any runtime check could provide, because it isn't a check at all.

---

# 5. Recovering the Topology — Is the Graph Fundamental?

No, and the reasoning is now precise rather than a loss-test heuristic. The Relationship/Emergence Layer's output is, by definition, a total function of E, I, and the (now-relocated) relation elements within E, plus Local Intelligence's similarity signal. A structure that is fully determined by a function of the canonical object is, by the definition already used informally in the Convergence Pass, in the image of a functor — it carries no information that S doesn't already carry. Formally: **X is Substrate if and only if X cannot be written as f(S) for any deterministic f; X is derived if and only if it can.** The graph is derived by this test, confirming the earlier finding on firmer ground: storing it wouldn't just be redundant engineering, it would be storing a value that is, by construction, always recomputable — a generator that isn't actually generating anything.

---

# 6. Hidden Structures — Kept and Rejected

**Kept, because they fit without forcing:**

- **Join-semilattice / grow-only structure**, for E. This is exactly what "append-only, no deletion" means algebraically, and it's a well-established structure with known merge behavior for concurrent growth.
- **Multi-value register semantics**, for I under concurrent conflicting writes. This is exactly what "conflicts coexist rather than being overwritten" means, and it explains _why_ a Conflict Region is the natural outcome rather than an arbitrary design choice: it's what a register does when it refuses to silently discard a concurrent write.
- **Closure operator**, for Synthesize relative to fixed E — with the caveat above that idempotence needs to be added as an explicit invariant, not assumed.
- **Sheaf-theoretic obstruction**, for Conflict specifically. Treat I as an assignment of local interpretation over the provenance structure of E. The question "do locally-consistent interpretations glue into one globally consistent belief" is exactly the sheaf gluing condition, and the architecture's decision to preserve contradictions rather than force resolution is exactly a decision to preserve the _failure_ of that condition as visible, structured information rather than silently patching over it. A Conflict Region is the obstruction, not an error.
- **Category with functors**, for the overall shape — Section 2's classification.
- **Filtration / coarsening poset**, for abstraction levels — not literal point-set topology, but a nested sequence of increasingly coarse views of the same elements, ordered by refinement, with Projection as the quotient map between adjacent levels. This is the honest answer to "what topology emerges" — it is closer to the filtrations used in persistent structure analysis than to open-set topology, and that distinction matters: claiming a full topological space would overreach what the architecture actually needs.

**Rejected, explicitly:**

- **Full lattice structure** for E. A join (union) is meaningful and used; no meet (intersection-as-combination) operation is ever performed by the architecture, so claiming a lattice rather than a join-semilattice overstates what's there.
- **Graph transformation / rewriting systems** (DPO, SPO) as the model for the Relationship/Emergence Layer. That formalism is for systems where the graph _is_ the primary data being rewritten. Since the graph here is never rewritten — only recomputed from something else — this entire family of techniques doesn't apply and would import complexity the architecture doesn't have.
- **Point-set topology** for the semantic map, as opposed to the filtration/coarsening framing above. "Neighbourhoods" and "zooming" are real, but nothing in the architecture needs open sets, continuity, or a metric — a poset of coarsenings says everything that's actually being claimed.

---

# 7. Stress Test — What Compresses, What Disappears

**The entire Research Lifecycle collapses to a single morphism, seen from S.** Intent, Exploration, Hypothesis, Engineering, Experiment, Result, Conclusion — every stage of an Investigation — is invisible to the algebra of Research States. All of it is pre-formal scaffolding that exists to eventually produce one Capture (or Capture-plus-Supersede) morphism. This does not make the Lifecycle document unimportant — it describes how a human actually does the science that eventually crosses the boundary — but mathematically, an in-progress Investigation is best modeled as an unevaluated thunk in a separate category, with exactly one exit functor into S. Nothing about its internal stages needs algebraic representation once this is understood.

**Confidence remains a coordinate, now for a sharper reason.** I is a single uniform assignment function over (element, dimension) pairs. Confidence is one dimension in that product, with no distinguished algebraic role — it is written through exactly the same operation, with exactly the same closure-operator treatment under Synthesis, as thread assignment or experimental stage. There was never a structural argument for giving it a separate mechanism, and now there's a structural argument against one: doing so would mean I is not actually a uniform function, which it needs to be for the closure-operator framing to hold at all.

**The Structural Link Registry moves from Emergence to Evidence.** This is the one place the mathematics disagreed with the existing diagram rather than just explaining it. A relation asserted by a researcher is captured, immutable, provenance-bearing data — indistinguishable in kind from any other captured element — and had no principled reason to be managed separately by the layer that merely computes derived proximity from it.

**Projection, Local Intelligence, and Relationship/Emergence do not merge, but they are now known to share one shape.** All three are functors of type S → X for some target category. This is a real compression — one property (non-authoritative, fully discardable, deterministic) can be proven once for the shape and inherited by all three, instead of argued three separate times — but it is a compression of _proof burden_, not of _identity_. They remain three components because they target three different categories with three different mappings, the same way addition and multiplication share the shape "binary operation on a set" without being the same operation.

---

# Summary

|Question|Answer|
|---|---|
|Irreducible object|S = (E, I); E is a provenance-connected set of two kinds of immutable element (content, relation); I is one uniform assignment function over that set|
|Invariants|E only grows (join-semilattice); I is freely revisable but concurrent conflicting writes are retained, not overwritten (multi-value register); every element and write carries provenance|
|Transformations|Four endomorphisms of S (Capture, Supersede, Interpret, Synthesize); three read-only functors out of S (Project, Local Intelligence, Emergence); one admission functor into S (Investigation completion)|
|Emergent topology|A filtration/coarsening poset over abstraction levels, with Projection as the quotient map between levels — not a graph, and not point-set topology|
|Algebra|A join-semilattice (E) composed with a multi-value register algebra (I), evolved by a closure operator (Synthesis) relative to fixed E, annotated throughout by a provenance structure|
|What moved|Structural Link Registry: Emergence → Evidence. Publication: a separate filter → the predicate "closed point of Synthesis, no open obstruction." The entire Research Lifecycle: a modeled process → an invisible pre-formal category with one exit morphism|
|What's still a hypothesis, not a result|That provenance genuinely satisfies semiring axioms for this system; that Synthesize can be made strictly idempotent relative to fixed E under a well-chosen semantic order|

---

# What the Next Document Should Be

Not a "Mathematical Appendix." The material above is load-bearing, not decorative — it revised two architectural decisions and surfaced one missing invariant that the prose-only passes never found. The next document should be named for what it actually is:

**The Research State Algebra.**

Its job is to take every "kept" structure in Section 6 and state it as a checkable definition rather than a fitting description: define the category whose objects are Research States and whose four morphism-generators are Capture, Supersede, Interpret, and Synthesize; state the join-semilattice axioms for E and verify they hold; state the multi-value register semantics for I and verify concurrent-write behavior matches; define Synthesize's closure axioms explicitly, including the semantic order needed for extensivity, and add idempotence as a stated requirement rather than a hope; define the provenance structure precisely enough to test the semiring hypothesis against it; and define the functor signatures for Project, Local Intelligence, and Emergence, proving once — generically, for any S → X functor — that non-authority follows from the shape alone.

If that document holds together, the implementation that follows it will not be a new design exercise. It will be an obvious realization of a structure that was already fully specified.