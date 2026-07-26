# Research Operating System — Ambiguity Audit

### Phase 3 Architecture · Document 4 of 6

### Version 0.1

---

## Purpose

Every prior document in this set (_[[00-Runtime-Specification]]_, _[[01-State-Model]]_, _[[02-System-Invariants]]_) made specific engineering decisions where Phase 1/2 prose was, on close reading, ambiguous — capable of supporting more than one implementation. This document makes that process auditable: each ambiguity is quoted verbatim from its source, the ambiguity is named precisely, candidate implementations are listed, one is recommended, and the recommendation is justified against the rest of the corpus.

The test applied throughout, per the assignment: _if five engineers independently implemented the quoted sentence alone, would they build the same system?_ Where the answer is no, the ambiguity is recorded here.

---

### A1. What exactly is a Note Block, structurally?

> "Typically this corresponds to roughly two to four paragraphs of text." — _Experience Constraints_, §6

**Why ambiguous:** "Typically" and "roughly" are explicitly non-binding. Five engineers would disagree on whether a Note Block has a hard size constraint, a soft UI-suggested constraint, or none at all — and whether the system enforces atomicity or merely encourages it.

**Possible implementations:** (a) A hard length cap enforced at Capture time, rejecting overlong input. (b) A soft UI hint (e.g., a length indicator) with no enforcement. (c) No length signal at all; atomicity is a purely editorial discipline left to the researcher.

**Recommendation:** (b), soft hint only, no enforcement.

**Justification:** _Design Invariants §18_ ("Capture Must Remain Effortless") and _Knowledge Acquisition_ ("Minimise Friction") both explicitly rank frictionless capture above organisational correctness. A hard cap would directly violate "capture is never blocked" (_Computational Model_, Interaction Shell invariants). Atomicity is presented throughout Phase 1 as a _property to aspire to_ (_Research Information Model_: "objects should be as small as possible while remaining scientifically meaningful"), not a mechanically enforced constraint — the system should not adjudicate what "scientifically meaningful" means.

---

### A2. Does interpretation carry forward automatically on Supersession?

No source document states this either way. The closest is:

> "Scientific objects are superseded rather than rewritten. Earlier conclusions remain part of the historical record. Current conclusions represent present understanding." — _Knowledge Evolution_

**Why ambiguous:** This tells us the old object survives, but says nothing about what interpretation (thread, confidence, stage) the _new_ object starts with. Five engineers would split roughly evenly between "inherit the old object's coordinates as a starting point" and "start uninterpreted."

**Possible implementations:** (a) New object silently inherits all of the superseded object's `I` coordinates. (b) New object starts with no `I` coordinates; a Research Intent is raised. (c) New object inherits coordinates but flags them as "unconfirmed since supersession."

**Recommendation:** (b), as already adopted in _[[00-Runtime-Specification]]_, Semantic Update Pipeline.

**Justification:** _Computational Model_'s Interpretation Plane invariant that "every write is attributable to either a specific researcher action or a specific Synthesis run" would be violated by silent inheritance (option a) — nobody actually asserted the new object deserves the old coordinates. Option (c) is a reasonable fallback but adds a state dimension ("unconfirmed") not present anywhere else in the algebra, which the closure-operator framing in _Discovery Roadmap §3_ gives no natural home to. Option (b) is the minimal choice consistent with existing machinery: an uninterpreted new object is exactly what a fresh Capture already looks like, and the existing Research Intent mechanism already exists to surface exactly this kind of gap.

---

### A3. What triggers a Synthesis run?

> "Synthesis occurs periodically rather than continuously." — _Research Lifecycle_ "Review sessions occur approximately weekly." — _Experience & Interaction Specification_ "Runs periodically rather than continuously — synthesis is a deliberate act of review, not a background daemon silently rewriting meaning while the researcher works." — _System Architecture_

**Why ambiguous:** "Periodically," "approximately weekly," and "a deliberate act of review" are three different framings — a fixed schedule, a rough UX cadence, and an explicit researcher-invoked action — that are not obviously the same policy. Five engineers would build: a cron-like fixed timer, a manually-triggered-only button, or some hybrid.

**Possible implementations:** (a) Fixed timer (e.g., every N hours) regardless of researcher action. (b) Explicit-only: Synthesis never runs unless the researcher invokes Review Mode. (c) Hybrid: a default schedule, explicitly overridable, plus a manual trigger, plus a threshold trigger (e.g., Intent Queue depth).

**Recommendation:** (c), hybrid, as already adopted in _[[00-Runtime-Specification]]_, Event Flow / Open Questions.

**Justification:** _Design Invariants §26_ frames Review as "an active process of scientific synthesis," implying researcher agency should remain central, ruling out pure timer-only automation (option a) as the _sole_ mechanism — but _Experience & Interaction Specification_'s "approximately weekly" cadence implies the system should not rely entirely on the researcher remembering to invoke it either, ruling out pure manual-only (option b). The hybrid is the only option consistent with both sources; the exact default parameters (interval, threshold) are left as an explicit Open Question rather than resolved further here, because no source document commits to a number precise enough to derive one.

---

### A4. Is the Relationship/Emergence Layer's output ever partially persisted, or fully ephemeral?

> "The graph is derived, not authored... it can be cached, rebuilt, or thrown away and reconstructed without any loss." — _System Architecture_ "Its entire output must be reconstructible from its declared inputs at any moment." — _Computational Model_

**Why ambiguous:** "Can be cached" is compatible with a persistent on-disk cache surviving across sessions, or with a purely in-memory structure discarded at every shutdown. The corpus never says which.

**Possible implementations:** (a) Never persisted; recomputed from scratch on every startup. (b) Persisted as an optimization, but validated/invalidated against `S`'s version on load, never trusted blindly. (c) Persisted and trusted as-is across restarts for speed.

**Recommendation:** (b).

**Justification:** _[[00-Runtime-Specification]]_, Caching Philosophy, already derives this: option (c) would violate the principle that "correctness must never depend on cache history," since a persisted-and-trusted cache could silently diverge from `S` if the persistence format or the derivation function changes between versions. Option (a) is safe but unnecessarily slow for large projects, contradicting _Design Invariants §25_ ("Scale Must Preserve Usability"). Option (b) is the only choice that is both safe and performant — it is not explicitly stated in Phase 2 prose but follows necessarily from combining the two quoted sentences above with the scale invariant.

---

### A5. Does "no sessions" (governing principle in _Untitled.md_) forbid all notion of a bounded unit of work, including Investigations?

> "no sessions" — _Untitled.md_, list of non-negotiable principles. "An Investigation is the fundamental scientific unit of the Research OS." — _Research Lifecycle_ "The Lifecycle Orchestrator... Manages the sequence Intent → Exploration → Hypothesis → Engineering → Experiment → Result → Conclusion... This is a session, not a permanent record." — _System Architecture_

**Why ambiguous:** The governing principle says "no sessions" flatly, yet the architecture explicitly uses the word "session" to describe Investigation state and even Interaction Shell continuity ("Session Memory," "Session Frame"). Five engineers reading only the governing principle would likely reject the entire Lifecycle Orchestrator design as a violation.

**Possible implementations:** (a) "No sessions" means no _application-level_ login/logout or start/stop session boundary — the software never has a notion of "you are not currently in a session" the way a web app might. Investigation-scoped and Interaction Shell-scoped "session" objects are a different, permitted concept: bounded units of _work_, not bounded units of _access_. (b) "No sessions" is taken literally and the Lifecycle Orchestrator's Session Frame, Investigation-as-session framing, and Session Memory are all renamed/redesigned to avoid the word and the concept entirely. (c) The principle is aspirational UX language, not an engineering constraint, and can be set aside where architecturally convenient.

**Recommendation:** (a).

**Justification:** This exact ambiguity is resolved directly in _[[00-Runtime-Specification]]_, "What Exists When the Software Is Idle": "there is no notion of an active vs. inactive _application_ session distinct from the Lifecycle Orchestrator's own investigation-level sessions." Option (c) is rejected because the assignment is explicit that "if an implementation conflicts with them, the implementation is wrong" — the principle cannot simply be set aside. Option (b) is rejected as needless churn: renaming a concept doesn't change its behavior, and the actual behavioral content of "no sessions" — no forced login/logout boundary, no state that only exists "between session start and session end" at the application level — is already satisfied by the Lifecycle Orchestrator's design, which the architecture documents independently derived without reference to this exact governing phrase. Option (a) reconciles both without weakening either.

---

### A6. Does "graph is not the model; graph is merely one possible projection" (_Untitled.md_) conflict with earlier Phase 1 language calling the Research State "a semantic graph"?

> "The Research State is therefore a semantic graph rather than a hierarchy." — _Relationship Ontology_ "graph is not the model / graph is merely one possible projection" — _Untitled.md_

**Why ambiguous:** Taken at face value, these two statements contradict each other — one calls the Research State _a graph_, the other insists the graph is _not_ the model but a projection of something else.

**Possible implementations:** (a) Treat _Relationship Ontology_'s framing as authoritative (the graph _is_ the canonical structure) and treat the later governing principle as a stylistic overstatement to discount. (b) Treat the later governing principle as authoritative and demote the graph to derived status, requiring identification of what the "something else" (the actual model) is. (c) Resolve by recognizing these were written at different points in the project's own evolution, and that the later, more mathematically scrutinized documents (_Convergence Pass_, _Discovery Roadmap_) already performed exactly this reconciliation.

**Recommendation:** (c) — and the resolution is already on record within the corpus itself, not invented here.

**Justification:** _Convergence Pass_ explicitly revisits and corrects the graph's status: "the Relationship/Emergence Engine is relocated out of Substrate and into Process... it is a derivation, and derivations belong with the rest of the machinery that computes things from the Research State, not with the Research State itself." _Discovery Roadmap §5_ proves this formally: the graph "is fully determined by a function of the canonical object," and is therefore, by the stated test, not Substrate. The actual model — the "something else" the governing principle implies — is `S = (E, I)` (_Discovery Roadmap §1_). _Relationship Ontology_'s earlier "semantic graph" language is best read, in light of this, as an early-phase description later refined by the project's own subsequent, more rigorous documents — exactly the kind of internal correction the corpus explicitly performs elsewhere (e.g., Publication's absorption into Projection). No invention was required here; the audit's job was to notice that the contradiction was already resolved in-corpus and make that resolution explicit and load-bearing for the runtime documents.

---

### A7. What does "continuous interaction" and "no cloud AI / no LLM dependence" imply for Local Intelligence's actual technique — must it categorically exclude any embedding-based or ML method?

> "no cloud AI / no LLM dependence" — _Untitled.md_ "Machine learning is optional infrastructure rather than a foundational dependency." — _Local Intelligence_ "the underlying representation of a project is a semantic embedding space" — _Experience & Interaction Specification_

**Why ambiguous:** "No LLM dependence" clearly forbids depending on a cloud LLM. It's less clear whether it forbids _any_ local ML model (e.g., a local embedding model) or only forbids the _dependence_ — i.e., whether the system must remain functional with such models disabled, while still permitting their use when available.

**Possible implementations:** (a) No ML of any kind, anywhere — symbolic/statistical methods only. (b) Local ML permitted (including local embedding models) as one _replaceable_ implementation of Local Intelligence, but the system must remain fully functional with it absent or disabled. (c) Local ML required as the default implementation, non-optional.

**Recommendation:** (b).

**Justification:** _Local Intelligence_'s own text resolves this directly: "Machine learning is optional infrastructure rather than a foundational dependency" and "Replaceable Components... Search, indexing and recommendation engines should be replaceable without affecting the underlying Research State." This is not "no ML," it is "ML is one swappable implementation among several, never a required one." Option (c) is rejected because it would make "no LLM dependence" untestable — you cannot verify a _dependency_ doesn't exist except by confirming the system works with the candidate dependency removed, which requires that removal to be a supported configuration. Option (a) over-reads the principle: the corpus explicitly discusses "a semantic embedding space" as the organisational geometry's own vocabulary (_[[01-State-Model]]_, State Object 4), and separately discusses Local Intelligence's internal similarity techniques (_[[01-State-Model]]_, State Object 6) as implementation-swappable — nothing forbids a local, offline embedding model as one such implementation, only a _cloud_ one or a _mandatory_ one.

---

### A8. How many organisational dimensions exist, and is the set fixed or extensible?

> "Metadata defines measurable organisational dimensions... Examples include: Project, Thread, Information Type, Experimental Stage, Publication Target, Confidence, Positivity of Result, Review Status." — _Research State & Epistemic Model_ "Relationship types are extensible." — _Relationship Ontology_ "Object types... The information model is extensible." — _Research Information Model_

**Why ambiguous:** Object types and relationship types are explicitly called extensible. Organisational dimensions are never explicitly called extensible or fixed — "examples include" implies openness but does not commit to it, and an extensible dimension set has real runtime consequences (INV-14, INV-24 depend on the dimension set being well-defined for Cache invalidation to be bounded).

**Possible implementations:** (a) Fixed, closed set of dimensions, hardcoded. (b) Fully open, researcher-definable dimension set, unbounded. (c) An open but _registered_ dimension set — new dimensions can be added, but each addition is itself a tracked, provenance-bearing act (closer to a schema migration than an ad hoc field), so that Cache dependency-tracking (which keys on (element, dimension) pairs, per _[[00-Runtime-Specification]]_) remains well-defined at every instant.

**Recommendation:** (c).

**Justification:** Given that object types and relationship types are explicitly extensible elsewhere in the same document family, treating organisational dimensions as uniquely fixed (option a) would be an unjustified asymmetry. But fully unbounded, unregistered extensibility (option b) breaks INV-24's locality guarantee: the Relationship/Emergence Layer's Dimension Weighting configuration (_[[01-State-Model]]_, State 4a) needs a well-defined, enumerable set of dimensions to weight over at any given instant, and dependency tracking needs a well-defined universe of (element, dimension) pairs. Option (c) preserves extensibility while keeping the dependency-tracking substrate well-founded — a new dimension's registration is itself an event the Cache invalidation system can observe and react to (e.g., recomputing the geometry once a new dimension is added), rather than a silent mutation of the dimension universe.

---

### A9. Is a Thread a first-class Scientific Object, an Interpretation-Plane dimension value, or both?

> "Threads represent coherent lines of scientific investigation... New threads begin when a newly captured Note Block does not naturally belong within any existing thread." — _Experience & Interaction Specification_ "Thread Assignment — deliberately allows one object to carry membership in more than one thread at once." — _Internal Structure of Components_

**Why ambiguous:** The first quote's language ("threads begin," "threads may branch or merge") suggests Threads are things with their own identity and lifecycle — candidates for being Scientific Objects in `E`. The second quote treats "thread" purely as a dimension value inside `I` (Thread Assignment), with no independent identity implied.

**Possible implementations:** (a) Thread is purely a value within `I`'s Thread Assignment dimension — a label, with no independent object identity, existence, or provenance of its own. (b) Thread is itself a Scientific Object in `E` (with its own identity, creation provenance, and possibly its own supersession chain when threads merge/split), and Thread Assignment in `I` merely references that object's identity as a dimension value.

**Recommendation:** (b).

**Justification:** Treating Thread purely as a label (option a) cannot account for "threads may branch or merge" (_Experience & Interaction Specification_) — a label has no lifecycle to branch or merge; only an object with identity does. It also cannot account for the _Research State & Epistemic Model_ passage on Thread Formation ("Threads originate from three primary sources... New Idea... Unexplained Observation... Conflict"), which describes thread creation as an event with its own cause and justification — exactly the shape of a Capture into `E`, not a metadata assignment into `I`. Recommendation (b) treats a Thread as an ordinary content element in `E` (created via Capture, subject to the same provenance and immutability rules as any other element, superseded rather than deleted when threads merge), while Thread Assignment in `I` remains exactly what _Internal Structure of Components_ already describes: a dimension whose value, for a given Note Block, is a reference to one or more such Thread objects. This requires no new mechanism — it reuses `E`'s existing content-element category and `I`'s existing multi-valued-dimension mechanism — and is therefore the minimal resolution consistent with both quoted passages.

---

### A10. Does "Metadata Suggestion" (a Local Intelligence service) ever read the Relationship/Emergence Layer's output, or only raw Evidence/Interpretation?

> "the Metadata Suggestion Service reads existing Interpretation patterns." — _Computational Model_, Local Intelligence Services inputs. "Local Intelligence — reads the Evidence Plane and the Interpretation Plane. Writes nothing. Read by the Interaction Shell... the Relationship/Emergence Layer (as a similarity input)..." — _Computational Model_, dependencies list.

**Why ambiguous:** The dependency list states Local Intelligence is read _by_ the Relationship/Emergence Layer (Local Intelligence → Emergence), but does not explicitly forbid or permit the reverse — Metadata Suggestion consulting the _already-computed_ graph as an additional signal (e.g., "objects near this one in the emergent graph tend to share dimension X").

**Possible implementations:** (a) Local Intelligence is strictly upstream of Relationship/Emergence; it never reads the graph, only raw `E`/`I`, preserving a clean one-directional data flow. (b) Metadata Suggestion is permitted to read the Emergence Layer's output as one additional signal, creating a cycle in the read graph (Local Intelligence → Emergence → Local Intelligence).

**Recommendation:** (a).

**Justification:** _Computational Model_'s "Message Flow / The read side — always one direction" diagram explicitly draws Local Intelligence as flowing only into the Relationship/Emergence Layer and the Interaction Shell, never the reverse, and states "Nothing on the read side ever writes back. This is what makes every component below the Projection Layer safe to query as often as needed." While that sentence is about writes, permitting a _read_ cycle between two derived, cached components (option b) would still complicate cache invalidation ordering: recomputing the graph might now need Local Intelligence's output which might now need the graph's _previous_ output, creating exactly the kind of layering ambiguity _[[00-Runtime-Specification]]_'s Update Ordering section works to avoid. Option (a) keeps the dependency graph acyclic, which is both simpler to implement and consistent with the explicit "always one direction" framing, even though that framing was written about writes rather than reads.

---

### A11. Does "Local Intelligence never reasons" forbid pattern-based conflict _detection_ as an advisory signal, given that Synthesis "may optionally read Local Intelligence's Similarity Service as an aid to detecting agreement or contradiction"?

> "Local Intelligence never asserts agreement or contradiction on its own authority." — _Computational Model_, Synthesis Engine dependencies. "Local intelligence must never... interpret biological meaning, infer truth..." — _Research State & Epistemic Model_

**Why ambiguous:** These two statements together are consistent, but the boundary between "providing a similarity score that happens to correlate with contradiction" and "asserting contradiction" is not crisply drawn anywhere. Five engineers might build a Similarity Service that outputs a single scalar similarity score (clearly non-assertive) or one that outputs a labeled category like "likely_contradiction: 0.82" (arguably already an assertion dressed as a score).

**Possible implementations:** (a) Local Intelligence services output only continuous, semantically-neutral scores (similarity, distance, ranking) — never labels that name a scientific relationship (e.g., "contradicts," "supports"). (b) Local Intelligence services may output labeled candidates (e.g., "possible contradiction") as long as the final judgment is made by Synthesis or the researcher.

**Recommendation:** (a).

**Justification:** _Computational Model_ is explicit that "the resulting judgment is the Synthesis Engine's own — Local Intelligence never asserts agreement or contradiction on its own authority." A service that outputs a label like "likely_contradiction" has already performed the categorical judgment the sentence forbids, merely hedged with a confidence number — the _category_ itself ("contradiction") is a scientific-relationship assertion, which _Design Invariants §30_ forbids Local Intelligence from making ("It must never... interpret biological meaning"). Option (a) keeps Local Intelligence's output strictly in the register of organisational geometry (distance, similarity, rank) and leaves the naming of a relationship as "supporting" or "contradicting" entirely to Synthesis or the researcher, consistent with the Relationship Ontology's insistence that relationship types belong to scientific understanding, not to computed convenience.

---

## Summary Table

|#|Ambiguity|Resolution|
|---|---|---|
|A1|Note Block size enforcement|Soft hint, no enforcement|
|A2|Interpretation inheritance on Supersede|No inheritance; raise Intent|
|A3|Synthesis trigger policy|Hybrid: schedule + manual + threshold|
|A4|Emergence Layer cache persistence|Persisted but always validated against `S`|
|A5|"No sessions" vs. Investigation/Interaction sessions|Applies to application-level access boundary only|
|A6|"Graph is the model" vs. "graph is a projection"|Later documents (Convergence Pass, Discovery Roadmap) supersede earlier framing; `S=(E,I)` is the model|
|A7|ML/embedding use vs. "no LLM dependence"|Local ML permitted as swappable, non-mandatory implementation|
|A8|Fixed vs. extensible organisational dimensions|Open but registered dimension set|
|A9|Thread: object or dimension value?|Both — Thread is an `E` object; Thread Assignment is an `I` dimension referencing it|
|A10|Local Intelligence reading Emergence output|Forbidden; keep dependency graph acyclic|
|A11|Similarity Service output granularity|Continuous scores only, never relationship labels|

---

## Open Questions Carried Forward

Each ambiguity above was resolved with a specific recommendation, but three deserve explicit flagging as **not fully closed** even after resolution, because the resolution depends on a parameter the corpus never specifies:

- A3's exact schedule/threshold defaults (see _[[00-Runtime-Specification]]_, Open Questions #1).
- A8's registration mechanism for new dimensions — whether registration itself requires a Synthesis-like reconciliation step or can happen inline during ordinary Interpret writes.
- A9's consequence for Thread merge/split semantics — if Thread is an `E` object, does merging two threads produce a Supersession (old threads superseded by a new merged thread) or a purely `I`-side reassignment (objects' Thread Assignment dimension updated to point at a shared thread, with the old thread objects left un-superseded but simply unreferenced)? This document recommends the former (Supersession) for consistency with INV-1/INV-2, but flags it as a genuine remaining design choice for the eventual data-model document.

---

_See also: [[00-Runtime-Specification]] and [[01-State-Model]], both of which already incorporate these resolutions rather than leaving them implicit. [[02-System-Invariants]] for the assertions these resolutions had to satisfy. [[05-Design-Review-Stress-Test]] for further adversarial examination of A3, A8, and A9 under scale._