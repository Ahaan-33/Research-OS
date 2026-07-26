# Research Operating System — Design Review & Stress Test

### Phase 3 Architecture · Document 6 of 6

### Version 0.1

---

## Purpose

This document attempts, in good faith, to break everything established in _[[00-Runtime-Specification]]_, _[[01-State-Model]]_, _[[02-System-Invariants]]_, _[[03-Ambiguity-Audit]]_, and _[[04-Implementation-Dependency-Graph]]_. It is written as a decade-scale architecture review would be written: assume the system succeeds, assume it runs for years, assume adversarial usage patterns and hardware failure, and find where the model actually breaks rather than where it merely feels uncomfortable.

Each finding follows the same structure: **Attack** (what could go wrong), **Where it actually breaks or doesn't** (a considered analysis, not a reflexive dismissal), **Verdict** (survives / requires a stated mitigation / genuine open weakness), **Consequence** (what, if anything, changes in the preceding five documents).

---

## 1. Hidden Circular Dependencies

**Attack:** Does Synthesis, which reads Local Intelligence's Similarity Service "as an aid to detecting agreement or contradiction" (_Computational Model_), create a cycle if Local Intelligence's Similarity Service itself, to compute similarity, needs to know about Conflict Regions (which live in `I`, written by Synthesis)?

**Where it breaks or doesn't:** Local Intelligence reads `I` (per its contract) at the time it computes a similarity score. If Synthesis is mid-run, reading `I` gets whatever snapshot existed when Local Intelligence's read began — not a future value Synthesis hasn't written yet. There is no cycle here because both reads are against a versioned snapshot, not a live mutable reference: Synthesis reads a snapshot of `E`+`I` at its start, Local Intelligence reads whatever snapshot is current at _its_ start, and neither waits on the other's completion. A cycle would require Synthesis's _output_ to be required as _input_ to the same Synthesis run — which does not happen, since Local Intelligence's similarity computation never depends on the specific Synthesis run currently in flight, only on whatever `I` looked like before it started.

**Verdict:** Survives. The apparent cycle is an artifact of describing both processes informally as "reading current state" without specifying the snapshot boundary; once snapshot semantics are made explicit (as _[[00-Runtime-Specification]]_'s Update Ordering section does), there is no cycle, only a well-ordered sequence of reads against successive versions.

**Consequence:** None to the architecture; this confirms _[[00-Runtime-Specification]]_'s snapshot-based Update Ordering section is load-bearing and should not be treated as a minor implementation detail — it is precisely what prevents this attack from succeeding.

---

**Attack:** Does the Relationship/Emergence Engine's dependence on Local Intelligence's Similarity Service, combined with A10's finding that Local Intelligence must never read the Emergence Engine's output, actually hold under a plausible future feature — "suggest a metadata value based on what's nearby in the graph"?

**Where it breaks or doesn't:** This is a real tension the Ambiguity Audit (A10) already flagged and resolved by forbidding the reverse read — but it's worth stress-testing whether that resolution survives a genuinely useful feature request. "Suggest a thread based on graph proximity" is a plausible, valuable Metadata Suggestion feature. Under A10's resolution, Local Intelligence cannot read the graph directly. But it _can_ achieve the same effect by reading `I`'s existing Thread Assignment dimension for elements it already judges similar via its own independent similarity computation (which does not require the Emergence Engine's derived graph at all — the Emergence Engine's graph is itself just a function of similarity plus dimension weighting, so Local Intelligence recomputing "who's similar" independently, without going through the graph, is not a workaround, it's simply not needing the graph in the first place).

**Verdict:** Survives, but the survival depends on recognizing that the graph offers Local Intelligence no information it couldn't derive directly from the same underlying inputs (`E`, `I`, its own similarity computation) that the graph itself is built from. If a future feature genuinely required graph-_specific_ structure (e.g., "objects that are graph-theoretically close via a multi-hop path, not just directly similar"), the current architecture would need either a new derived read for Local Intelligence to consume (breaking acyclicity, requiring a documented exception) or acceptance that this specific feature is out of scope for Local Intelligence and belongs to the Emergence Engine itself (e.g., as a graph-analysis feature exposed through Projection instead).

**Consequence:** Flagged as a design constraint to make explicit in a future revision of _[[03-Ambiguity-Audit]]_: multi-hop graph-structural suggestions are not implementable as a Local Intelligence service under the current acyclic contract, and should be implemented (if ever needed) as a Relationship/Emergence Engine capability surfaced through Projection, not smuggled into Local Intelligence.

---

## 2. Unbounded Recomputation

**Attack:** A single Synthesis run, by design, "reads the accumulated Evidence Plane since its last run" (_Computational Model_). For a project running continuously for a decade, does the size of "accumulated Evidence since last run" grow without bound if Synthesis is deferred (e.g., a researcher who never triggers a manual Review and the scheduled trigger silently fails for months)?

**Where it breaks or doesn't:** Yes, this genuinely can happen, and nothing in _[[00-Runtime-Specification]]_ currently bounds it. A Synthesis run's cost is proportional to the Evidence accumulated since the last run — if that interval grows unboundedly, the eventual Synthesis run's cost grows unboundedly too, and per INV-24's _spirit_ (though INV-24 is stated specifically about single Interpret writes, not Synthesis batches) this is a genuine scaling risk the architecture does not currently address.

**Verdict:** Genuine open weakness, not fully mitigated by the current documents.

**Consequence:** This document recommends — as a new item for _[[00-Runtime-Specification]]_'s Open Questions and _[[03-Ambiguity-Audit]]_'s A3 — that the Synthesis trigger policy include a hard ceiling: if accumulated-since-last-run Evidence exceeds a threshold, Synthesis should be triggered automatically regardless of schedule or manual invocation, converting an unbounded liability into a bounded one. This does not violate "Synthesis is a deliberate act of review, not a background daemon" (_System Architecture_) because the researcher retains full agency over _smaller_, regular Synthesis runs — the ceiling only forces a run when deferral has already gone further than any reasonable review cadence, which is a safety net, not a daemon silently reinterpreting meaning on every write.

---

**Attack:** Does the Relationship/Emergence Engine's incremental recomputation (_[[00-Runtime-Specification]]_, Incremental Recomputation, point 2) actually stay bounded, or does it hide an unbounded case? The claim is that a single Interpret write's affected edge set is bounded by "elements sharing at least one dimension value with the changed element." What if one dimension value — e.g., a single, enormous Thread — is shared by a huge fraction of the entire project?

**Where it breaks or doesn't:** This is a real failure mode. If "Thread: MitoLearner" is shared by 40,000 Note Blocks after a decade of continuous research, then a single Interpret write changing one object's confidence within that thread could, under a naive implementation of "recompute all edges sharing a dimension value," trigger recomputation across all 40,000 co-thread objects — precisely the unbounded-recomputation failure mode the runtime specification claims not to have.

**Verdict:** Genuine weakness in the _stated bound_, though not necessarily in the achievable _implementation_ — the Runtime Specification's claim ("bounded by the local neighborhood of the changed element") is true only if edge weight computation for a given pair of elements does not require recomputing _every other pair_ sharing that dimension, only the _specific pair_ in question. This is achievable (edge weight between A and B, both in a large thread, is a function of A and B's full coordinate vectors, computable independently of every other pair in that thread) but the current documents state the bound informally enough that an implementer could plausibly build the naive, non-bounded version and believe they'd satisfied the specification.

**Consequence:** _[[02-System-Invariants]]_ INV-24 should be tightened in a future revision to state explicitly: "the cost of reflecting a single Interpret write on one (element, dimension) pair is bounded by the number of _other_ elements that could plausibly interact with the changed element under the current Dimension Weighting — which may itself be large for widely-shared dimension values like a large Thread — and any implementation must therefore support _approximate or capped_ recomputation (e.g., only recomputing the top-K most-weighted neighbors, or lazily recomputing edges only for the sub-region currently rendered by an open Projection) rather than assuming every co-dimension pair is cheap to touch." This is a real engineering consequence: the Relationship/Emergence Engine cannot assume it needs to maintain a complete, always-current graph over the entire project — it should support partial, on-demand graph materialization scoped to what a Projection is actually asking to see, which is a stronger requirement than the original Runtime Specification stated.

---

## 3. State Explosion

**Attack:** _[[01-State-Model]]_ allows Thread membership to be multi-valued (an object may belong to many threads at once, per A9's resolution treating Thread as an `E` object referenced from `I`'s Thread Assignment dimension). Combined with Conflict Regions being retained rather than resolved (INV-19), does the Interpretation Plane's state grow combinatorially — e.g., does every possible combination of (thread × stage × confidence × conflict status) need to be separately represented?

**Where it breaks or doesn't:** No — `I` is defined as a function over (element, dimension) _pairs_, not over the full cross-product of all dimensions simultaneously (_Discovery Roadmap §1_: "a uniform assignment function... where element ranges over both content and relation elements uniformly"). Each element's coordinates are independent, small, per-dimension values — the state size is `O(elements × dimensions)`, linear, not combinatorial. Conflict Regions add one additional record per actual, occurring conflict, not per theoretically-possible conflict — there is no data structure anywhere in the model that attempts to enumerate all possible coordinate combinations.

**Verdict:** Survives cleanly — the attack conflates "many possible combinations exist in principle" with "the system stores all of them," which the uniform-function definition of `I` explicitly avoids.

**Consequence:** None. This is a case where the formal treatment in _Discovery Roadmap_ already inoculated the architecture against a failure mode a less rigorously specified system might have fallen into.

---

**Attack:** Does the Session/Lifecycle state (in-progress Investigations) explode if a researcher habitually starts many Investigations and abandons most without completing them, given that _[[00-Runtime-Specification]]_ states Session data is never merged into `E`?

**Where it breaks or doesn't:** Abandoned Investigations accumulate in Session state indefinitely unless something prunes them — and the current documents specify checkpointing (for crash recovery) but not pruning (for indefinite accumulation of _never-crashed, simply-abandoned_ Investigations). Over a decade, hundreds of abandoned half-finished Investigations sitting in Session state is a plausible, unaddressed accumulation.

**Verdict:** Genuine gap, moderate severity (Session state was already explicitly non-authoritative and disposable, so this is a housekeeping/UX gap, not a correctness violation — but it is a real state-growth concern the current documents don't address).

**Consequence:** Recommend adding to _[[01-State-Model]]_: an explicit Investigation-archival policy (e.g., an abandoned Investigation past some inactivity threshold is either checkpoint-frozen to cold storage, distinct from active Session state, or surfaced to the researcher as a stale-Intent needing an explicit decision to abandon or resume) — this does not change any invariant, since abandoning an Investigation was always a legitimate, lossless (from `S`'s perspective) action; it only changes how the runtime manages the bookkeeping around _many_ abandoned Investigations existing simultaneously.

---

## 4. Memory Leaks (Conceptual, Not Literal)

**Attack:** Local Intelligence's internal indices are described as fully rebuildable and disposable — but if the Indexing Service maintains an incremental structure (as recommended for performance, _[[04-Implementation-Dependency-Graph]]_'s translation of database-internals research), does incremental indexing leak stale entries for superseded Evidence elements that are never explicitly removed (since `E` never deletes anything, per INV-1)?

**Where it breaks or doesn't:** This is real and needs an explicit answer the current documents don't fully give. A superseded element still exists in `E` (INV-2) and is therefore still, technically, legitimately indexable — the question is whether it should still surface in ordinary similarity/search results as if it were current. If the Indexing Service treats every element in `E` (including long-superseded ones) as equally live, search results over a decade-old project will be dominated by historical clutter — not a leak in the memory sense, but a "semantic leak" where derived convenience structures fail to reflect the Interpretation Plane's notion of "current."

**Verdict:** Requires a stated mitigation not currently explicit in the architecture.

**Consequence:** Recommend that Local Intelligence services be specified as defaulting to indexing/surfacing only _non-superseded_ elements (elements not named as "old" by any Supersession edge) unless a query explicitly requests historical inclusion — this is not a change to any invariant (superseded elements remain fully present and queryable in `E`, satisfying INV-1/INV-2 exactly as stated) but is a needed clarification of Local Intelligence's _default_ behavior, to be added to a future revision of the _Local Intelligence_ component contract.

---

## 5. Semantic Inconsistencies

**Attack:** INV-16 requires Projection naturality: coarsening and then examining agrees with examining and then coarsening. Does this actually hold once Conflict Regions are involved — if a coarse-level Projection summarizes ten objects into one aggregate "confidence" value, but three of those ten objects are in active mutual conflict, what does the coarse view's single confidence number even mean, and can it be naturally derived from the fine view without loss that breaks the naturality guarantee?

**Where it breaks or doesn't:** This is a genuine, substantive gap. Naturality as stated in _Discovery Roadmap §3_ is about _coarsening commuting with projecting_ — it does not specify _what the coarsening function itself is_ for a dimension like confidence when the underlying elements disagree. If ten objects have confidences {0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.1, 0.1, 0.1} because of an unresolved three-way conflict, a naive coarsening (e.g., averaging) produces a single number (~0.6) that actively _hides_ the conflict — directly violating _Computational Principles_ Principle 8 ("conflict is preserved... no legal computation may silently remove contradiction") at the Projection layer, even though Projection never _writes_ anything and therefore was assumed throughout the architecture to be incapable of violating this principle.

**Verdict:** Genuine weakness — a real gap between "Projection cannot write anything" (true, and sufficient to avoid destroying `I`) and "Projection cannot obscure something `I` already records" (false, as shown, if the coarsening function is chosen carelessly). This is the most substantive finding in this review: **read-only is not the same as non-lossy**, and the architecture's provenance/conflict invariants were framed entirely in terms of write authority, leaving a blind spot around lossy-but-authority-respecting rendering.

**Consequence:** This document recommends a new invariant for _[[02-System-Invariants]]_: **INV-29 — a Projection's coarsening function for any dimension touched by an open Conflict Region must surface the conflict's existence at every abstraction level, even if it cannot show full detail at coarse levels.** Concretely: an aggregate confidence display must be visually/structurally distinct when it summarizes a region containing unresolved conflict versus one that doesn't — coarsening may compress detail, but must never compress away the _fact_ of unresolved disagreement. This closes the gap identified here without requiring any change to write authority, since it constrains only the (already read-only) coarsening function's required output shape, not who may write what.

---

## 6. Poor Scaling

**Attack:** Does the entire architecture assume single-user, single-project scale, and silently fail for a research group with dozens of researchers sharing one Evidence Plane (a plausible future direction the corpus never explicitly rules out, since _Research OS_ is framed around "the researcher" throughout but the Synchronization Layer already anticipates multi-device use)?

**Where it breaks or doesn't:** The join-semilattice/multi-value-register foundation (`E`, `I`) scales conceptually to many concurrent writers without new mechanism — this was already the point of choosing CRDT-shaped algebra (_[[04-Implementation-Dependency-Graph]]_'s translation section). What does _not_ obviously scale is Synthesis: "the sole authority to write the Interpretation Plane at scale" being a single serialized process (_[[00-Runtime-Specification]]_, Update Ordering: "Synthesis runs are strictly serialized against each other") becomes a genuine bottleneck if many researchers are each expecting timely, personally-relevant Synthesis over a shared, fast-growing Evidence Plane — one global serialized Synthesis process reconciling an entire multi-researcher project's Evidence could take a very long time per run, and per Section 2's finding above, a growing accumulation-since-last-run only compounds this.

**Verdict:** Genuine open weakness for the multi-researcher case specifically; not a flaw for the single-researcher case the corpus is explicitly designed around (_First Principles_, _Design Invariants_ — this is consistently a single-scientist tool in its own stated framing).

**Consequence:** Flagged explicitly as **out of scope for the current architecture** rather than silently assumed to be handled — a future revision targeting multi-researcher use would need to revisit whether Synthesis can be partitioned (e.g., per-Thread Synthesis runs rather than one project-wide run) without breaking INV-23's idempotence-relative-to-a-fixed-snapshot property, which currently implicitly assumes "the snapshot" is well-defined project-wide. This is not a defect in the single-researcher architecture the corpus specifies — it is a boundary of that architecture's validity that should be stated rather than left implicit.

---

## 7. Race Conditions

**Attack:** Two concurrent Interpret writes to the same (element, dimension) pair are handled correctly by INV-6 (both retained, Conflict Region opened) — but what about a race between an Interpret write and a Synthesis run's Interpretation Writer targeting the _same_ pair, where Synthesis's write is based on a snapshot that predates the concurrent researcher edit?

**Where it breaks or doesn't:** This is exactly the multi-value register's designed-for case, not an edge case it fails to cover — _Discovery Roadmap §3_ is explicit that concurrent conflicting writes to the same pair, from _any_ two sources, are retained rather than one overwriting the other. A Synthesis-originated write racing a researcher-originated write on the same pair produces a Conflict Region attributing one value to the Synthesis run and one to the researcher action, exactly as INV-6/INV-7 already specify. There's no special case needed because the multi-value register model was designed from the start to be indifferent to _which two writers_ raced.

**Verdict:** Survives.

**Consequence:** None — this confirms the multi-value-register choice was the right one specifically because it collapses "researcher vs. researcher," "researcher vs. Synthesis," and (in the Synchronization Layer's future multi-device case) "device vs. device" into the same single mechanism, rather than needing three separate race-handling policies.

---

## 8. Non-Local Updates

**Attack:** _[[00-Runtime-Specification]]_ claims Cache invalidation is local ("the runtime's entire job is to keep both moving without either blocking the other"), but does a _Dimension Weighting Configuration_ change (_[[01-State-Model]]_, State 4a) — which is, by definition, a global parameter affecting how every pair of elements' edge weight is computed — force a full, non-local recomputation of the entire organisational geometry and graph?

**Where it breaks or doesn't:** Yes, unavoidably, and the current documents do not pretend otherwise but also don't flag it prominently — a Dimension Weighting change genuinely is a global invalidation event, structurally different from every other write discussed in the Runtime Specification (which are all local, single-element or single-coordinate). This is not a flaw exactly — a global configuration change _should_ cost a global recomputation, there's no way around that — but it is worth naming explicitly as the one legitimate exception to the "bounded by local neighborhood" performance guarantee (INV-24), so an implementer doesn't mistake INV-24 as an unconditional promise.

**Verdict:** Survives as a correctly-modeled cost, but was insufficiently flagged in prior documents as an explicit exception.

**Consequence:** Recommend _[[02-System-Invariants]]_ INV-24 be annotated with an explicit exception clause: "this bound applies to Capture, Supersede, and Interpret writes; it does not apply to Dimension Weighting Configuration changes, which are expected to trigger full geometry/graph recomputation and should be treated by the runtime as an explicit, rare, user-initiated 'rebuild' operation rather than an ordinary write" — distinguishing it in the UI/UX layer as a heavier operation (e.g., "recomputing organisational geometry..." with a progress indicator) rather than silently blocking or silently taking unexpectedly long.

---

## 9. Algorithmic Bottlenecks

**Attack:** The Relationship/Emergence Engine's Graph Assembly, even incrementally, computes pairwise edge weights. For a project with `n` elements, is there a hidden `O(n²)` assumption anywhere — e.g., "find the top-K most similar elements to X" implemented naively as "compare X to all n others"?

**Where it breaks or doesn't:** _[[04-Implementation-Dependency-Graph]]_'s translation of spatial indexing (R-trees, locality-sensitive structures) directly targets exactly this risk, recommending an incremental spatial index rather than brute-force comparison — but this recommendation is only as good as an implementer actually following it. The architecture documents do not currently state a hard requirement that similarity/nearest-neighbor computation must use sub-linear (or at least sub-quadratic) structures; they only recommend it as a translated research technique. Nothing in _[[02-System-Invariants]]_ currently makes "no O(n²) similarity computation" a checkable invariant the way INV-24 makes single-write-locality checkable.

**Verdict:** Requires a stated mitigation — the recommendation exists but is not yet elevated to an invariant, which is a gap between the Dependency Graph document's advice and the Invariants document's enforceable list.

**Consequence:** Recommend a new invariant, **INV-30 — Local Intelligence's Similarity Service and the Relationship/Emergence Engine's neighbor-finding must not require comparing a changed element against every other element in the project; a sub-linear-in-project-size candidate-narrowing step (spatial index, locality-sensitive hashing, or equivalent) is required before any exact comparison.** This elevates Document 5's advisory translation into Document 3's enforceable list, closing the gap this attack surfaced.

---

## 10. Places Where the Philosophy Cannot Actually Be Implemented

**Attack:** "Topology emerges from meaning" (_Untitled.md_, governing principle) and "visualizations are projections of topology" — but _Discovery Roadmap §6_ explicitly rejects point-set topology as overreach, settling instead for a filtration/coarsening poset. Is the governing principle's use of the word "topology" simply unimplementable as literally stated, since no actual topological space (in the mathematical sense — open sets, continuity, a metric) is ever constructed anywhere in this architecture?

**Where it breaks or doesn't:** This is real, but it is a terminology gap, not a design gap. The _behavioral content_ the governing principle is actually asking for — that structure (the graph, the organisational geometry, the abstraction hierarchy) is never separately authored but always computed from meaning (`I`, `E`) — is fully implemented, exactly as _Discovery Roadmap §5_'s formal test establishes ("the graph is derived... it carries no information that S doesn't already carry"). What is not implemented, and should not be attempted, is "topology" in the load-bearing mathematical sense the word technically denotes. The philosophy documents use "topology" colloquially (as in "the shape of the knowledge"); the formal documents correctly decline to manufacture unneeded mathematical machinery to match that word literally.

**Verdict:** Survives, with an explicit terminology caveat that should be stated plainly rather than left as an implicit tension between the philosophy and formal documents.

**Consequence:** Recommend that any future glossary or terminology-reconciliation document explicitly state: "'topology,' as used in the governing principles, refers to emergent organisational structure (the graph, the geometry, the abstraction poset) — not to a mathematical topological space. This is a deliberate translation, confirmed and justified by _Discovery Roadmap §6_'s explicit rejection of point-set topology as unneeded machinery." No architectural change follows; only a documentation clarification, to prevent a future implementer from either (a) trying to build literal point-set topology where none is needed, or (b) concluding the philosophy's "topology" language was simply wrong.

---

**Attack:** "Users manipulate research, never layouts" (_Untitled.md_) — but the organisational geometry (State 4) depends on a Dimension Weighting Configuration (State 4a) that is, by its own classification, a _layout_ parameter the researcher can adjust. Doesn't adjusting weights count as "manipulating a layout," directly contradicting the governing principle?

**Where it breaks or doesn't:** This is a genuinely close call worth taking seriously rather than dismissing. The distinction that saves it: adjusting Dimension Weighting changes _how strongly_ existing, researcher-asserted organisational dimensions (thread, confidence, stage — all themselves scientific interpretation, written via ordinary Interpret/Synthesize operations) pull elements together in the rendered geometry — it does not let the researcher directly drag a node to a screen position, or manually author an edge that doesn't correspond to any actual shared dimension or similarity signal. "Manipulate research, never layouts" is best read as forbidding direct, meaning-free spatial authorship (dragging a dot because it "looks better there") — Dimension Weighting adjustment is one step removed from that: it is tuning _how the system interprets existing meaning into space_, not authoring space directly. This is a real distinction, but it is thinner than most of the other resolved ambiguities in this review, and reasonable implementers could disagree about whether it holds.

**Verdict:** Requires the distinction to be stated explicitly rather than assumed — currently the closest documents come is _[[01-State-Model]]_'s framing of Weighting as "a tuning surface, not a fact about the world," which is correct but does not, on its own, fully preempt this specific challenge.

**Consequence:** Recommend _[[01-State-Model]]_'s State 4a entry be strengthened with an explicit boundary statement: "Dimension Weighting Configuration adjusts the _strength_ of relationships already present in `I` and `E`; it must never be extended into a mechanism for directly authoring node position, manually overriding a specific pair's computed distance, or otherwise letting a researcher hand-place an element irrespective of its actual coordinates. Any future feature request resembling 'let me just drag this node here' should be rejected as a violation of this boundary, not accommodated as a convenience." This is a preventative clarification, not a correction of an existing violation — no such feature currently exists in the specified architecture — but the boundary was implicit rather than explicit, and this attack shows why making it explicit matters before a plausible, well-intentioned future feature request erodes it.

---

## Summary of Findings

|#|Area|Verdict|Consequence|
|---|---|---|---|
|1a|Synthesis/Local Intelligence read cycle|Survives|None — confirms snapshot semantics are load-bearing|
|1b|Local Intelligence reading graph output|Survives, narrowly|Flag multi-hop graph suggestions as out of Local Intelligence's scope|
|2a|Unbounded Synthesis deferral|**Weakness**|Add hard ceiling trigger to Synthesis policy (A3)|
|2b|Large-thread recomputation bound|**Weakness**|Tighten INV-24; require capped/partial graph materialization|
|3a|Interpretation combinatorial explosion|Survives|None|
|3b|Abandoned Investigation accumulation|**Gap**|Add Investigation-archival policy to State Model|
|4|Superseded-element index clutter|**Gap**|Local Intelligence defaults to indexing non-superseded elements only|
|5|Coarsening obscuring conflict|**Weakness (most significant finding)**|New INV-29: conflict must survive coarsening|
|6|Multi-researcher Synthesis bottleneck|Out of scope, flagged|State single-researcher boundary of validity explicitly|
|7|Interpret/Synthesis write race|Survives|None — confirms multi-value register generality|
|8|Dimension Weighting as global invalidation|Survives, under-flagged|Annotate INV-24 with explicit exception|
|9|O(n²) similarity bottleneck|**Weakness**|New INV-30: sub-linear candidate-narrowing required|
|10a|"Topology" as colloquial vs. mathematical term|Survives, terminology gap|Add glossary clarification|
|10b|Dimension Weighting vs. "never layouts"|Close call, under-specified|Strengthen State 4a's boundary statement explicitly|

---

## Overall Assessment

The two-plane Substrate (`E`, `I`) and its algebraic treatment (join-semilattice + multi-value register, per _Discovery Roadmap_) is the architecture's strongest, most battle-tested layer — every attack in this review that targeted `E`/`I` directly (Sections 3a, 7) survived cleanly, because the algebra was chosen specifically to make those failure modes structurally impossible rather than merely policed at runtime.

The architecture's genuine weak points cluster in one place: **the boundary between "read-only" and "lossless."** Sections 2b, 5, 8, and 9 all share a common shape — a component that correctly has no write authority over `E` or `I` (satisfying every invariant framed in terms of authority) can still, through an under-specified derivation function, either scale badly or silently obscure something the underlying state actually records. This is worth naming as the review's central finding: **the architecture's authority model is sound; its performance and fidelity obligations on the read side were comparatively under-specified**, and this document's recommended additions (INV-29, INV-30, the tightened INV-24, the Investigation-archival and superseded-indexing policies) are aimed specifically at closing that gap rather than at the write-side authority model, which needed no correction.

---

## Rejected Panic Responses

In the spirit of the assignment's request to attempt to break the architecture honestly, it is worth stating explicitly what this review did _not_ find, to avoid over-correcting:

- No hidden violation of the Evidence/Interpretation asymmetry was found — every attack respected it, and none needed to compromise it to succeed.
- No genuine circular _write_ dependency was found anywhere in the eight-subsystem graph.
- No race condition was found that the multi-value register model doesn't already handle by construction.
- The architecture does not need a redesign; it needs the six targeted additions enumerated in the Summary table, all of which are extensions to existing documents, not replacements of any existing decision.

---

_See also: [[00-Runtime-Specification]], [[01-State-Model]], [[02-System-Invariants]], [[03-Ambiguity-Audit]], [[04-Implementation-Dependency-Graph]] — every recommendation above is a targeted amendment to one of these five documents, not a new architectural layer. A future revision pass should fold INV-29, INV-30, the tightened INV-24, the Investigation-archival policy, the superseded-indexing default, and the Dimension Weighting boundary statement directly into their respective documents._