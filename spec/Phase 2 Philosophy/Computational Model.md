# Research Operating System

# Computational Model

### Companion to: Research OS - System Architecture, Layer Two - Component Internals, Convergence Pass

### Version 0.1

---

# Purpose

The prior documents established what exists and why it doesn't collapse further. This document specifies how the eight converged components communicate: what may cross each boundary, who is allowed to initiate each transition, and which transitions are impossible by construction rather than merely discouraged.

Still no implementation. Every "output" below is a description of information, not a data structure. Every "authority" is a description of a right, not a function signature.

---

# Component Contracts

## Evidence Plane

- **Inputs:** a completed Investigation's two outputs (documentation, structured evidence) from the Lifecycle Orchestrator's Completion Gate; a directly captured Note Block from the Interaction Shell's Capture Surface; a supersession declaration naming the object it replaces.
- **Outputs:** Scientific Objects with stable identity; supersession chains; provenance linking each object to the Investigation or direct capture that produced it.
- **Authority:** the sole authority to create a Scientific Object. The sole authority to record that one object supersedes another. No authority — its own included — to alter or remove an object once written.
- **Invariants:** append-only, permanently; every object carries provenance; supersession never deletes the superseded object.
- **Dependencies:** written to by the Interaction Shell (single objects, direct) and the Lifecycle Orchestrator (structured evidence, on completion only). Read by every other component except Local Intelligence's non-indexing services, which read it indirectly through the Indexing Service. Reads nothing itself — it has no evaluative role in what it accepts.

## Interpretation Plane

- **Inputs:** a single metadata edit from the Interaction Shell's Interpret Surface; a batch of reconciled metadata changes from the Synthesis Engine's Interpretation Writer.
- **Outputs:** the current coordinate of every object along every organisational dimension — thread, stage, publication scope, positivity, confidence — plus the Conflict Registry and Thread Assignment state.
- **Authority:** the sole authority over what the project currently interprets. Fully mutable, by exactly two writers and no others.
- **Invariants:** never restructures or removes anything in the Evidence Plane; a Conflict Region, once registered, is only closed by a subsequent interpretation change that itself references the evidence or synthesis run responsible — never by silent deletion; every write is attributable to either a specific researcher action or a specific Synthesis run.
- **Dependencies:** reads the Evidence Plane (to know what exists to interpret). Written by the Interaction Shell and the Synthesis Engine only. Read by the Relationship/Emergence Layer, the Projection Layer, Local Intelligence, and the Synthesis Engine (which reads its own prior output before writing more).

## Lifecycle Orchestrator

- **Inputs:** a Research Intent, from the Interaction Shell (researcher-originated) or the Synthesis Engine's Intent Generator (synthesis-originated).
- **Outputs:** while active, a session state describing which stage an Investigation currently occupies (available to the Projection Layer as read-only, ephemeral information). On completion, exactly two artifacts, handed to the Evidence Plane: documentation and structured evidence — never more, never fewer.
- **Authority:** the sole authority over the internal stage of an in-progress Investigation. No authority over the Interpretation Plane, ever. Authority over the Evidence Plane only at the single moment of completion.
- **Invariants:** an Investigation ends only through the Completion Gate; nothing an Investigation produces while active is visible to the Evidence Plane or Interpretation Plane before that gate is passed; work done in the Engineering Sandbox reaches the Evidence Plane only if it is folded into the completing Investigation's own two outputs, never directly.
- **Dependencies:** reads Research Intent from the Interaction Shell and the Synthesis Engine. Writes the Evidence Plane (completion only). Read by the Projection Layer (active-session state only — this state is never treated as part of the Research State itself).

## Synthesis Engine

- **Inputs:** the accumulated Evidence Plane since its last run; the current Interpretation Plane.
- **Outputs:** revised Interpretation — confidence shifts, thread reassignment, Conflict Region creation or closure, whichever dimension changed; new Research Intent, one per unresolved gap or contradiction it surfaces.
- **Authority:** the sole authority to write the Interpretation Plane _at scale_ — across many objects in one reconciling pass. Never writes the Evidence Plane under any circumstance.
- **Invariants:** every run is attributable to a specific, stable snapshot of the Evidence Plane, so every interpretation change it makes can be traced back to the evidence that justified it; a Conflict Region it resolves must name the evidence or reasoning that resolved it.
- **Dependencies:** reads the Evidence Plane and the Interpretation Plane; may optionally read Local Intelligence's Similarity Service as an aid to detecting agreement or contradiction, but the resulting judgment is the Synthesis Engine's own — Local Intelligence never asserts agreement or contradiction on its own authority. Writes the Interpretation Plane and the Lifecycle Orchestrator's Intent Queue.

## Relationship / Emergence Layer

- **Inputs:** the current Interpretation Plane (organisational dimensions, thread assignments); the Evidence Plane (for object identity); the Structural Link Registry (explicit researcher-authored links); Local Intelligence's Similarity Service.
- **Outputs:** the live graph — a computed arrangement of relationships among Scientific Objects — exposed only to the Projection Layer.
- **Authority:** none over the Substrate. Full authority over its own output, which may be discarded and recomputed at any time without loss.
- **Invariants:** its entire output must be reconstructible from its declared inputs at any moment; it never writes the Interpretation Plane or the Evidence Plane, in either direction; identical inputs and identical dimension weighting always produce identical output.
- **Dependencies:** reads the Evidence Plane, the Interpretation Plane, and Local Intelligence. Writes nothing persistent. Read by the Projection Layer only.

## Local Intelligence Services

- **Inputs:** read access to the Evidence Plane and the Interpretation Plane, scoped to whatever a given service needs — the Indexing Service reads Evidence text, the Similarity Service reads organisational coordinates, the Metadata Suggestion Service reads existing Interpretation patterns.
- **Outputs:** suggestions only — similarity scores, ranked candidates, autocomplete options, recommended metadata values.
- **Authority:** none whatsoever. Cannot write to any component, including its own output back into the Substrate.
- **Invariants:** deterministic and reproducible for identical input; replaceable, service by service, without any other component's contract changing; never outputs a scientific claim, only an organisational signal.
- **Dependencies:** reads the Evidence Plane and the Interpretation Plane. Writes nothing. Read by the Interaction Shell (as acceptable suggestions), the Relationship/Emergence Layer (as a similarity input), and optionally the Synthesis Engine (as an advisory aid only).

## Interaction Shell

- **Inputs:** a human action — a thought to capture, a metadata change, a navigation request, an acceptance of a suggestion, a Research Intent to submit.
- **Outputs:** a new Scientific Object to the Evidence Plane (Capture); a metadata change to the Interpretation Plane (Interpret); a Research Intent to the Lifecycle Orchestrator; a query dispatched to the Projection Layer (Navigate).
- **Authority:** the only component authorised to originate a direct, single-object write to the Evidence Plane or the Interpretation Plane on a researcher's own initiative. No authority to write across many objects at once — that remains the Synthesis Engine's alone for interpretation, and the Lifecycle Orchestrator's Completion Gate alone for evidence.
- **Invariants:** Capture is never blocked by a classification requirement; a Local Intelligence suggestion becomes a write only through explicit acceptance here, never automatically.
- **Dependencies:** writes the Evidence Plane, the Interpretation Plane, and the Lifecycle Orchestrator's Intent Queue. Reads Local Intelligence (for suggestions) and the Projection Layer (to render what the researcher is currently looking at while acting).

## Projection Layer

- **Inputs:** a query definition and an abstraction parameter, supplied by the Interaction Shell; read access to the Evidence Plane, the Interpretation Plane, the Relationship/Emergence Layer's output, and the Lifecycle Orchestrator's active-session state.
- **Outputs:** a rendered view — Dashboard, Semantic Map, Thread View, Timeline, Review Panel, or a Publication-configured view (Publication is a maturity-scoped query definition here, not a separate component).
- **Authority:** none. Cannot write to any component. Cannot persist any fact that isn't already recoverable from what it read.
- **Invariants:** its cache may be discarded at any time without information loss; the same query at the same abstraction level, against the same Substrate, always renders identically.
- **Dependencies:** reads everything listed above. Writes nothing. Read by the researcher, through the Interaction Shell.

---

# Message Flow

## The long cycle — evidence into understanding into view

```text
Interaction Shell (Capture)
    ↓
Evidence Plane
    ↓
Synthesis Engine
    ↓
Interpretation Plane
    ↓
Relationship / Emergence Layer
    ↓
Projection Layer
```

This is the batch path: evidence accumulates, Synthesis periodically reconciles it into interpretation, the Emergence Layer recomputes the graph from the new interpretation, and a Projection renders the result. Every arrow here crosses exactly one authority boundary and no arrow skips a link.

## The feedback loop — understanding into new inquiry

```text
Synthesis Engine
    ↓
Intent Generation
    ↓
Lifecycle Orchestrator
    ↓
Completion Gate
    ↓
Evidence Plane
```

This is what keeps the long cycle from terminating: every Synthesis run that surfaces a gap deposits a new Research Intent, which the Lifecycle Orchestrator eventually turns back into evidence, re-entering the long cycle at its start.

## The two fast lanes — minimal-friction writes

Two direct paths exist in parallel with the cycles above, and neither one is a shortcut around them — they are the deliberately narrower alternative to the batch/structured paths, matching the same authority already granted to the Interaction Shell:

```text
Interaction Shell (Capture) ──────────────→ Evidence Plane
Interaction Shell (Interpret) ────────────→ Interpretation Plane
```

The first lane is what makes atomic Note Block capture (the Inbox) possible without waiting for a full Investigation to complete. The second is what makes a single metadata edit possible without waiting for a Synthesis run. Both still respect the same authority rule as the batch paths — Evidence only ever grows, Interpretation is the only thing that changes meaning — they simply operate at the grain of one object instead of many.

## The read side — always one direction

```text
Evidence Plane ──┐
Interpretation Plane ──┼──→ Relationship / Emergence Layer ──→ Projection Layer ──→ Interaction Shell
Lifecycle Orchestrator (session state) ──┘
Local Intelligence ──→ Interaction Shell
Local Intelligence ──→ Relationship / Emergence Layer
```

Nothing on the read side ever writes back. This is what makes every component below the Projection Layer safe to query as often as needed.

---

# Transitions Impossible by Construction

These are not discouraged; they have no path in the model above:

- Any component other than the Interaction Shell (single object) or the Lifecycle Orchestrator (Completion Gate) writing the Evidence Plane.
- Any component other than the Interaction Shell (single object) or the Synthesis Engine (batch) writing the Interpretation Plane.
- The Relationship/Emergence Layer writing the Interpretation Plane or the Evidence Plane, in either direction.
- Local Intelligence writing anything, anywhere.
- The Projection Layer writing anything, anywhere.
- The Lifecycle Orchestrator writing the Interpretation Plane, at any stage, for any reason.
- The Evidence Plane or Interpretation Plane mutating an existing entry in place — the only permitted change to an existing Evidence object is a new object naming it as superseded; the only permitted change to Interpretation is a new coordinate value replacing the old one, attributed to whichever of the two writers made it.
- An Investigation's in-progress state (inside the Lifecycle Orchestrator) becoming visible to the Evidence Plane or Interpretation Plane before the Completion Gate.

---

# Authoritative State vs. Derived State

|State|Status|If lost|
|---|---|---|
|Evidence Plane contents|Authoritative|Unrecoverable|
|Interpretation Plane contents|Authoritative|Unrecoverable|
|Relationship / Emergence Layer output|Derived|Fully recomputable from Evidence + Interpretation + Local Intelligence|
|Any Projection, including Publication views|Derived|Fully recomputable from whatever it queried|
|Local Intelligence outputs|Derived|Fully recomputable, and non-binding until accepted|
|Lifecycle Orchestrator active-session state|Transient|Lost work-in-progress, but never lost knowledge — nothing here was ever committed|

Two rows in this table are irreplaceable. Every other component in the architecture, no matter how central it feels to daily use, exists to compute, filter, or gate access to those two rows — never to hold a third kind of fact alongside them.