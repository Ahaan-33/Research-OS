# Research Operating System — Runtime Architecture

### Phase 5 Architecture · Document 2 of 2

### Version 0.1

---

## Purpose

_[[12-system-architecture-first-draft]]_ fixed thirteen subsystems and the interfaces between them. This document does not add, remove, merge, or rename any of them. It answers a different question: **while ROS is running, in what order do these thirteen subsystems actually talk to each other, and what guarantees hold at every point along the way?**

Every flow described below is a concrete instantiation of the formal apparatus from _[[06-Research-State-Mathematics]]_ through _[[11-Formal-Foundations-Survey]]_, routed through the specific subsystem boundaries of _[[12-system-architecture-first-draft]]_. Subsystem references use the numbering fixed there: **(1)** Persistent Research State, **(2)** Transformation Engine, **(3)** Synthesis Engine, **(4)** Semantic Computation Layer, **(5)** Indexing, **(6)** Local Intelligence, **(7)** Projection Engine, **(8)** Visualization Layer, **(9)** Dependency/Invalidation Tracker, **(10)** Event Processing, **(11)** Lifecycle Orchestrator, **(12)** Provenance, **(13)** Configuration Boundary.

This document supersedes _[[00-Runtime-Specification]]_ (the Phase 3 runtime document) in the sense that every claim there is now re-derived against the fixed subsystem boundaries and the proven formal properties rather than against Phase 1/2 prose — where the two agree, that is confirmation; this document is the more precise one wherever they differ, since it can name the exact subsystem and theorem responsible for each behavior.

---

## Governing Assumption

Throughout, `S(t) = (E(t), I(t))` denotes the current content of Subsystem (1) at instant `t`. Every dynamic behavior below is either: (a) a legal transition of `S`, applied exclusively through Subsystem (2), per T-Functor's proof that nothing else can; or (b) a read of some snapshot of `S`, producing disposable output in Subsystems (4), (5), (6), or (7), which by the same proof can never feed back into (1) except through (2) or the Completion Gate in (11).

---

## 1. Lifecycle of a Researcher Action

### 1a. Capture

```
Researcher enters content
    │
    ▼
Visualization Layer (8) — raw interaction, not yet classified — forwards to Interaction/Event Processing (10)
    │
    ▼
Event Processing (10) classifies the action as Capture, and forwards the payload
    │
    ▼
Transformation Engine (2)
    │  1. requests attribution from Provenance Subsystem (12)
    │  2. mints a fresh identity (D4) for the new element
    │  3. checks the resulting (E ∪ {new}, I) against the legality predicate (D10)
    │  4. commits
    ▼
Persistent Research State (1) — E grows by exactly one element; I is untouched
    │
    ▼
Transformation Engine (2) notifies Dependency/Invalidation Tracker (9): "new element, no dependents yet, but index it"
    │
    ▼
Acknowledgment returned to the researcher, via Event Processing (10) back to Visualization Layer (8)
```

**Where this terminates for the purposes of the researcher's perceived latency:** at the acknowledgment step, immediately after (1) commits. Nothing downstream of the Dependency Tracker's notification — indexing in (5), any eventual clustering in (4) — is on this path. This is the direct runtime meaning of "capture is never blocked": the chain above has exactly one subsystem (2) sitting between the researcher's action and a durable commit in (1), and every other subsystem's involvement happens after acknowledgment, asynchronously.

### 1b. Supersede

Identical to Capture, except the payload additionally names an existing element `old`. Transformation Engine (2) additionally: verifies `old ∈ E` (precondition of G2), mints the new element, and captures the reserved supersession relation element linking them — per T-Supersede-Distinct, this is still exactly one call into (2), not two. Consistent with Ambiguity Audit A2 (no automatic inheritance of `I` coordinates), the Dependency Tracker (9) is additionally notified that `old`'s identity is now excluded from `Current(E)`, which invalidates any cached structure keyed on `old`'s current-membership status — but not `old`'s content, which remains permanently resolvable.

### 1c. Interpret

```
Researcher assigns or edits a coordinate
    │
    ▼
Event Processing (10) classifies as Interpret, forwards (element, dimension, value)
    │
    ▼
Transformation Engine (2)
    │  1. requests attribution (12)
    │  2. computes I(e,d) ∪ {v} (set-valued enlargement, per D6/G3 — never overwrite)
    │  3. legality check (D10)
    │  4. commits
    ▼
Persistent Research State (1) — I(e,d) enlarges; if this creates |I(e,d)| ≥ 2, a Conflict Region now exists at (e,d)
    │
    ▼
Dependency/Invalidation Tracker (9) notified: exactly the pair (e,d) is dirty
    │
    ▼
Acknowledgment returned
```

**Note on conflict creation:** no special-casing occurs in this path when a write happens to conflict with an existing value — G3's set-valued codomain means "conflicting write" and "ordinary write" are the same operation at the level of (2); the Conflict Region is simply a fact readable afterward from (1) (`|I(e,d)| ≥ 2`), not a different code path. This is a direct runtime consequence of T2 (multi-value register merge) — there is no branch in the Transformation Engine for "is this a conflict," because there does not need to be one.

---

## 2. Lifecycle of a Synthesis Run

```
Event Processing (10) issues a trigger to Synthesis Engine (3), carrying a frozen snapshot boundary of E
    │
    ▼
Synthesis Engine (3)
    │  1. Evidence Scanner reads E (as of the frozen boundary) and current I from (1)
    │  2. (Advisory only) reads proximity/cluster data from Semantic Computation Layer (4)
    │  3. (Advisory only) reads similarity scores from Local Intelligence (6)
    │  4. Agreement/Contradiction Reader identifies candidate coordinate updates,
    │     including possible Conflict Region closures (D14 examination-status transitions)
    │  5. Interpretation Writer assembles a proposed batch of I-writes — NOT yet committed
    ▼
Proposed batch submitted to Transformation Engine (2)
    │
    ▼
Transformation Engine (2)
    │  1. requests attribution for the whole batch from Provenance Subsystem (12),
    │     tagged to this specific Synthesis run
    │  2. legality check (D10) against the batch as a single transition
    │  3. commits atomically — the batch either fully lands or not at all
    ▼
Persistent Research State (1) — I updated; any closed Conflict Regions marked examined+resolved (D14)
    │
    ▼
Dependency/Invalidation Tracker (9) notified of every (element,dimension) pair the batch touched
    │
    ▼
Synthesis Engine (3) additionally submits any new Research Intents to Lifecycle Orchestrator (11)
```

**Isolation property, restated at the subsystem level:** because Synthesis Engine (3) only ever _proposes_ and never itself writes (1), reproducibility (the still-open idempotence question, _[[11-Formal-Foundations-Survey]]_, F8) can be tested by re-invoking step group 1–5 against the identical frozen snapshot in complete isolation from live traffic — no other subsystem needs to be paused, quiesced, or otherwise coordinated with, because nothing about steps 1–5 touches (1) until the single commit step.

**Concurrent Capture/Interpret during a Synthesis run:** any Capture/Interpret landing in (1) after the frozen snapshot boundary was taken is simply not visible to _this_ run — it is picked up by the next triggered run. This is not a race condition requiring resolution; it is the intended behavior of reading a frozen snapshot, and is why Synthesis runs are serialized against each other (no two frozen-snapshot reads may be "in flight" for the same scope at once) but never serialized against Capture/Interpret (which write independently and are simply invisible to an already-in-progress read).

---

## 3. Lifecycle of Navigation

```
Researcher requests a view (or the Interaction layer defaults to one on startup)
    │
    ▼
Event Processing (10) classifies as Navigate, forwards (QueryDefinition, AbstractionParameter)
    │
    ▼
Projection Engine (7)
    │  1. checks its own Render Cache for a valid entry at (QueryDef, AbstractionParam, current S-version)
    │  2a. HIT → return cached view data immediately
    │  2b. MISS → recompute:
    │       reads Persistent Research State (1)
    │       reads Semantic Computation Layer (4) if the view needs cluster/proximity structure
    │       reads Local Intelligence (6) if the view needs suggestion overlays
    │       reads Lifecycle Orchestrator (11) read-only, if the view needs "active session" content
    │       applies the relevant Projection operator (Semantic Map / Timeline / Thread View / Tree / Dashboard / Publication)
    │       checks conflict-faithfulness (T14) on any coarsening aggregation used
    │       stores result in Render Cache
    ▼
View data handed to Visualization Layer (8)
    │
    ▼
Visualization Layer (8) renders; stores nothing; forwards any further researcher interaction back to (10)
```

**Nothing on this path ever reaches Transformation Engine (2) or Persistent Research State (1) as a write** — this is the direct runtime enforcement of "projections never modify research state," and it holds regardless of cache hit or miss, since both branches terminate in Visualization Layer (8), which itself has no write capability to anything (per Subsystem 8's zero-ownership design).

---

## 4. Invalidation Propagation

The Dependency/Invalidation Tracker (9) is the single subsystem responsible for this; every other subsystem either notifies it (Transformation Engine, after each commit) or is notified by it (Semantic Computation Layer, Indexing, Local Intelligence, Projection Engine).

```
Transformation Engine (2) commits a transition touching change-set Δ
    (Δ = a set of element identities and/or (element,dimension) pairs)
    │
    ▼
Dependency/Invalidation Tracker (9)
    │  for each registered derived artifact A in (4), (5), (6), (7):
    │      if A's recorded dependency set intersects Δ:
    │          mark A dirty
    ▼
Dirty signals delivered to (4), (5), (6), (7)
```

**Granularity.** Every registration is at the grain fixed by _[[06-Research-State-Mathematics]]_'s Locality definition: element identity, or `(element, dimension)` pair — never "the whole graph" or "the whole view." A single Interpret write's Δ is exactly one pair; a Synthesis batch's Δ is exactly the pairs the batch touched, never more.

**Monotonicity within a pass.** Once (9) marks an artifact dirty, it remains dirty until the owning subsystem (4, 5, 6, or 7) actually recomputes it — further writes landing in the interim only add to Δ for the _next_ recomputation, they never "undirty" anything early.

**The revised bound from _[[05-Design-Review-Stress-Test]]_, Section 2b.** For a widely-shared dimension value (a large Thread), Δ from a single Interpret write can register as a dependency for a large number of artifacts in (4). The Tracker (9) does not attempt to bound this by refusing to register such dependencies — it registers them faithfully — but Subsystem (4)'s own recomputation policy (below, Cache Rebuilding) is responsible for not materializing the full affected set eagerly, consistent with INV-30's capped/partial materialization requirement.

---

## 5. Cache Rebuilding

Every cache-owning subsystem — (4), (5), (7), and to a lesser extent (6)'s internal indices — follows the same policy, differing only in what they rebuild:

```
Subsystem observes its own dirty flag (set by Tracker (9))
    │
    ▼
Decision: rebuild now (eager) or rebuild on next read (lazy)?
    │
    ├── Semantic Computation Layer (4): lazy by default for full-graph structure;
    │   eager only for the specific pair(s) in Δ, bounded per INV-30 —
    │   full graph materialization is never triggered by a single Interpret write alone
    │
    ├── Indexing (5): eager, incremental — index updates are cheap and narrow
    │   (one element's text, one coordinate's position) and are kept warm
    │   so that (4) and (6) never block on a cold index
    │
    ├── Projection Engine (7): fully lazy — a Render Cache entry is only
    │   recomputed when actually requested again by Navigation; an unopened
    │   view can remain stale indefinitely with no cost
    │
    └── Local Intelligence (6): rebuilds its own internal models on its own
        independent schedule, never synchronized to any other subsystem's
        recomputation — its staleness is a latency property only (INV-21's
        determinism guarantee is about identical input producing identical
        output, not about being maximally current)
    ▼
Recomputation reads Persistent Research State (1) [and, for (4)/(6)/(7), each other, per the acyclic
read constraints already fixed in [[12-System-Architecture-First-Draft]]]
    │
    ▼
New cache content stored; dirty flag cleared for exactly the recomputed scope
```

**Correctness independent of warmth.** Every one of these caches is, by _[[06-Research-State-Mathematics]]_ and _[[07-Transformation-Algebra]]_'s T-Functor, a pure function of `(S, configuration)`. A cold cache and a fully warm cache must produce identical output for the same query against the same `S` — cache state is a latency concern the subsystems above manage independently, never a correctness concern for anything reading their output.

---

## 6. Event Scheduling

Event Processing (10) is the sole subsystem responsible for deciding _when_ things happen, as distinct from _what_ happens (fixed by the other twelve subsystems' contracts).

**Two distinct cadences, never conflated:**

- **Immediate dispatch:** Capture, Interpret, and Navigate actions are dispatched to (2) or (7) as soon as classified — no queuing delay is introduced by (10) itself for these.
- **Scheduled dispatch:** Synthesis triggers to (3) follow a policy combining an elapsed-time default, explicit researcher invocation, and — per the repair recommended in _[[05-Design-Review-Stress-Test]]_, Section 2 — a hard ceiling on accumulated-evidence-since-last-run, so that indefinite deferral cannot produce an unboundedly expensive eventual run.

**Review, as a scheduling-visible predicate.** Per _[[07-Transformation-Algebra]]_, G8, "Review" is a predicate over a morphism path, not a morphism itself — Event Processing (10) is the natural place this predicate is evaluated (it already sees every dispatched action in order), used only to label a span of activity for the researcher's own orientation (e.g., "you're in a Review-shaped sequence right now"), never to gate or restrict which actions are legal — every generator remains available regardless of the current path's Review-status.

**Idle behavior.** With no pending researcher action and no elapsed/threshold Synthesis trigger, Event Processing (10) issues nothing. This is the runtime-level confirmation that "no sessions" holds: there is no background clock driving anything forward on its own except the bounded Synthesis-scheduling check itself, which is a lightweight poll, not an active computation.

---

## 7. Consistency Guarantees

- **Within Persistent Research State (1):** every committed transition leaves `S` in a `Legal` state (D10) — Transformation Engine (2) is the sole gate enforcing this, and a transition that would violate legality is rejected outright, never partially applied.
- **Across (1) and its dependents (4, 5, 6, 7):** eventual consistency, with no upper bound promised on staleness _except_ where a subsystem's own query explicitly requests a fresh recomputation (a Navigate request always triggers a legality-respecting read of the current `S`, even if cached derived structure it also needs is stale — the view data returned will reflect current `E`/`I` for anything read directly from (1), and only the _derived_ structure component may lag).
- **Within a single Synthesis run:** snapshot isolation — the run sees a fixed, frozen `E` (and the `I` visible at the moment the snapshot was taken); nothing committed after that boundary is visible to this run, only to the next one.
- **Across concurrent Interpret writes to the same pair:** no consistency mechanism is needed beyond the multi-value-register merge already proven (T2) — both values are retained, and the "conflict" is simply an accurate readable fact about `I`, not an anomaly requiring reconciliation before either write can proceed.

---

## 8. Concurrency Assumptions

- **Capture and Interpret writes to _different_ elements or _different_ (element, dimension) pairs never block each other** — Transformation Engine (2) requires no exclusive lock broader than the specific element/pair being written, since T1/T2 guarantee that concurrent, non-overlapping writes commute.
- **Capture/Interpret writes are never blocked by Synthesis Engine (3) activity**, and vice versa — (3) reads a frozen snapshot and never acquires anything resembling a lock on live `(1)` state; (2) never waits on (3).
- **Two Synthesis runs over the same scope are serialized** — (10)'s scheduling policy guarantees at most one in-flight frozen-snapshot Synthesis pass per scope at a time, avoiding two runs proposing overlapping batches whose relative commit order would otherwise be ambiguous.
- **Reads from (4), (5), (6), (7) are always safe to run arbitrarily concurrently with each other and with any write**, because none of them ever acquire a write lock on (1) — this is the direct operational payoff of T-Functor: nothing downstream of a functor can require exclusivity over the category it merely reads from.

---

## 9. Failure Recovery

|Failure point|Behavior|
|---|---|
|Transformation Engine (2) crashes mid-commit to (1)|The commit either fully lands or not at all (atomicity of the legality-checked write, per D10's standing-invariant treatment) — no torn write is ever observable|
|Synthesis Engine (3) crashes before submitting its proposed batch|No effect on (1) whatsoever — the run simply did not happen; the next scheduled trigger re-reads a fresh snapshot and starts over. This is the direct payoff of (3) never writing (1) directly.|
|Synthesis Engine (3) crashes _after_ submitting but before (2) commits|Same as above — the proposal was never a commit; (2)'s own atomicity guarantee means a not-yet-committed proposal simply vanishes with no partial trace|
|Dependency/Invalidation Tracker (9) loses its bookkeeping|Rebuilt by re-scanning (1) against each cache-owning subsystem's declared dependency registrations — no scientific information is at risk, only a temporary loss of precise dirty-tracking, recoverable by treating everything as dirty until re-registered|
|Semantic Computation Layer (4), Indexing (5), or Local Intelligence (6) crashes|Isolated — Projection Engine (7) degrades gracefully (renders without cluster overlays, suggestion overlays, or fast indexed lookups respectively) rather than failing Navigation entirely; recovery is simply restarting the crashed subsystem and letting it recompute lazily from (1)|
|Projection Engine (7) crashes|Visualization Layer (8) has nothing to render until (7) restarts; no data is lost, since (7) owned only disposable cache and configuration-adjacent registry entries|
|Lifecycle Orchestrator (11) crashes with an in-progress Investigation|Bounded, explicit, previously-justified loss of uncheckpointed session content (per the pre-formal classification of Session state) — resumes from last checkpoint, exactly as _[[00-Runtime-Specification]]_'s Crash Consistency section already established, now attributed to a specific subsystem boundary|
|Persistent Research State (1) storage itself is unreadable at startup|See Startup, below — this is the one failure that halts the system rather than degrading a part of it|

---

## 10. Startup

```
1. Persistent Research State (1) is loaded from durable storage.
   If unreadable: halt before accepting any Event. Never guess, never
   silently initialize an empty Legal state over a possibly-recoverable one.
2. Configuration Boundary (13) loads Dimension Weighting and Projection Registry defaults —
   independent of step 1's success/failure in principle, but gated behind it in practice
   since nothing downstream is useful without (1).
3. Lifecycle Orchestrator (11) restores any in-progress Investigations from their last checkpoint.
4. Dependency/Invalidation Tracker (9) initializes empty — nothing is trusted as
   already-registered from a previous run; every cache-owning subsystem re-registers
   its dependencies as it lazily recomputes.
5. Semantic Computation Layer (4), Indexing (5), Local Intelligence (6), Projection
   Engine (7) all start cold. This is never a correctness risk (per Cache Rebuilding,
   above) — only a latency one, and only until each is first queried or opportunistically
   warmed during idle time.
6. Event Processing (10) begins accepting researcher actions only once step 1 has
   succeeded — steps 2–5 may continue concurrently with the researcher beginning
   to Capture, since a Capture never depends on any of them being warm.
```

---

## 11. Shutdown

There is no researcher-facing shutdown procedure to invoke, consistent with "no sessions." The runtime's obligation is narrower and specific:

1. Every write already acknowledged to the researcher (Section 1's Capture/Interpret acknowledgment step) must already be durable in Persistent Research State (1) at the moment of acknowledgment — shutdown, whenever it occurs, therefore never risks an acknowledged-but-unsaved write, because none exists by construction.
2. Lifecycle Orchestrator (11) checkpoints its current Session Frame at shutdown (and at bounded intervals beforehand, per its own crash-recovery bound) — this is the only subsystem with an active save-on-shutdown responsibility.
3. Every cache-owning subsystem (4, 5, 6, 7) requires no shutdown action whatsoever — their content is discarded implicitly, with zero consequence beyond next-startup latency.

---

## Summary Table — Dynamics by Subsystem

|Subsystem|Triggered by|Blocks acknowledgment?|Recovery posture|
|---|---|---|---|
|(1) Persistent Research State|Every committed transition|N/A (is the durability point)|Halt-and-report if unreadable|
|(2) Transformation Engine|Capture/Interpret/Supersede requests, Synthesis proposals|Yes — this is the acknowledgment path|Atomic commit or no-op|
|(3) Synthesis Engine|Scheduled/threshold/manual trigger|No|Restart from next scheduled snapshot|
|(4) Semantic Computation Layer|Dirty signal from (9)|No|Lazy, bounded recompute|
|(5) Indexing|Dirty signal from (9)|No|Eager, narrow recompute|
|(6) Local Intelligence|Own independent schedule|No|Independent rebuild|
|(7) Projection Engine|Navigate request|No (renders from cache or recomputes lazily)|Lazy recompute on next read|
|(8) Visualization Layer|Projection Engine output|N/A (no state to recover)|Restart with no data loss|
|(9) Dependency Tracker|Every (2) commit|No|Rebuild by re-registration|
|(10) Event Processing|Every researcher action; elapsed/threshold clock|Routes, does not itself block|Stateless re-derivable scheduling|
|(11) Lifecycle Orchestrator|Investigation stage transitions|No (except at Completion Gate, which routes through (2))|Bounded loss since last checkpoint|
|(12) Provenance|Every write|Yes — required field of every (2) commit|Attached at write time; no independent recovery needed|
|(13) Configuration Boundary|Researcher configuration change|No|Resettable to default; no scientific consequence|

---

## Relationship to Previous Documents

This document is the dynamic complement to _[[12-system-architecture-first-draft]]_ and a subsystem-precise re-derivation of _[[00-Runtime-Specification]]_'s claims. Every behavior above cites the specific subsystem (from Document 12) and the specific formal object or theorem (from Documents 06–11) responsible for it; no new architectural boundary, formal object, or invariant is introduced here.

---

## Open Questions

1. The exact numeric parameters of Event Processing's (10) Synthesis scheduling policy (elapsed-interval default, accumulation ceiling) remain a tuning question, not resolved here, consistent with _[[00-Runtime-Specification]]_'s original Open Question on the same point.
2. Whether Semantic Computation Layer (4) should ever proactively warm its cache during confirmed-idle periods, versus remaining strictly lazy — a latency/throughput trade-off with no correctness implication, left to implementation.
3. Whether Local Intelligence's (6) independent rebuild schedule should be made observable to Event Processing (10) for coordination purposes (e.g., to avoid two expensive rebuilds — Synthesis and Local Intelligence re-indexing — landing at the exact same moment under load) — a performance-tuning question, not an architectural one.

---

_See also: [[12-system-architecture-first-draft]] for the subsystem boundaries this document's dynamics run through. [[06-Research-State-Mathematics]] through [[11-Formal-Foundations-Survey]] for the formal objects and theorems each behavior above instantiates. [[00-Runtime-Specification]] for the earlier, pre-subsystem-precise treatment of the same dynamics, now superseded in specificity though not in substance._