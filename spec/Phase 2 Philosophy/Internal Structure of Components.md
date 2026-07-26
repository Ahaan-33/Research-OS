# Research Operating System

# Layer Two — Internal Structure of Each Component

### Companion to: Research OS - System Architecture

### Version 0.1

---

# How to Read This Document

The System Architecture document establishes the governing cut — three planes, nine components, and the contract table that says who may write where. This document does not revise a single boundary from it. It zooms in, the same way [[Abstraction and Scale]] asks a researcher to zoom in on their own project: resolution changes, meaning doesn't.

What follows is what sits _inside_ each of the nine components — the sub-responsibilities that make its single mandate achievable, and the internal seams that keep it that way. Still no implementation. A sub-component here is a responsibility, not a class, table, or process.

---

# Inside the Evidence Plane

- **Object Ledger** — gives every captured Scientific Object a stable identity, independent of anything that will later be said about it.
- **Supersession Index** — tracks which objects have been superseded and by what, without ever removing the superseded object. This is the only place "history" lives as a structural fact rather than a narrative.
- **Provenance Tag** — attached to every object at the moment of writing, recording which Investigation produced it. This is not interpretation; it is closer to a shipping label than a scientific claim, which is why it can live in a plane that otherwise never changes.

---

# Inside the Interpretation Plane

- **Metadata Store** — the current coordinate for each object along every organisational dimension: thread, stage, publication target, positivity, confidence, and so on. Confidence is not a separate mechanism — it is one dimension among the others, measured and revised through exactly the same path as any other coordinate. Treating it as its own ledger would imply it needs different write rules than the rest of interpretation; it doesn't.
- **Conflict Registry** — holds Conflict Regions as addressable objects in their own right, each pointing at the interpretations in tension. A conflict is registered here, not inferred on demand, so that it cannot quietly disappear from view.
- **Thread Assignment** — deliberately allows one object to carry membership in more than one thread at once, which is what makes "multiple perspectives on the same concept" ([[Experience Constraints]]) a property of the data rather than a trick of the interface.

---

# Inside the Relationship / Emergence Engine

- **Dimension Weighting** — the configuration describing how strongly each organisational dimension, confidence included, pulls objects together. A tuning surface, not a fact about the world — changing it changes the map, never the knowledge.
- **Structural Link Registry** — the small set of relationships a researcher chose to state explicitly, kept separate from the much larger set the engine infers, so explicit intent is never silently overwritten by an emergent signal.
- **Graph Assembly** — combines weighted dimensions, structural links, and similarity signals borrowed from Local Intelligence into the single queryable graph everything else reads. This sub-component owns nothing permanent; deleting its output and recomputing it must always be safe.

---

# Inside the Lifecycle Orchestrator

- **Intent Queue** — holds open Research Intents, whichever their origin — the researcher, or new intent handed back by Synthesis — waiting to be picked up.
- **Session Frame** — tracks where one active Investigation currently sits along Intent → Exploration → Hypothesis → Engineering → Experiment → Result → Conclusion. This is the only sub-component that needs to know the Investigation's internal stage at all.
- **Engineering Sandbox** — an optional, clearly bounded workspace for the supporting, non-scientific work a hypothesis sometimes requires. It never contributes directly to Evidence; anything worth keeping has to pass back through the Session Frame like everything else.
- **Completion Gate** — the single choke point an Investigation must pass through to end. It enforces, structurally, that exactly two things leave a finished Investigation: documentation and structured evidence — nothing partial, nothing extra.

---

# Inside the Synthesis Engine

- **Evidence Scanner** — reads what has accumulated in the Evidence Plane since the last run.
- **Agreement / Contradiction Reader** — compares interpretations already on record against what the new evidence implies, surfacing where they align and where they don't.
- **Interpretation Writer** — the only sub-component in the entire architecture, across every plane, permitted to write the Interpretation Plane at scale. Every metadata revision this produces — a confidence shift, a thread merge, a new Conflict Region — is the same kind of write, made through the same gate.
- **Intent Generator** — turns whatever the scan didn't resolve — gaps, contradictions, weak evidence — into new Research Intent, deposited directly into the Lifecycle Orchestrator's Intent Queue. This is the seam that closes the loop.

---

# Inside Local Intelligence Services

- **Indexing Service**, **Similarity Service**, **Recommendation Service**, **Metadata Suggestion Service** — four independent services, each doing exactly one deterministic thing, each replaceable without the others noticing.
- **Service Registry** — the boundary that makes replacement real rather than aspirational: it is the only thing Process and Surface ever call, so a service can be swapped behind it without either plane knowing a change occurred. This is the sub-component that turns "modular intelligence" ([[Local Intelligence]]) into an enforced seam rather than a coding convention.

---

# Inside the Interaction Shell

- **Capture Surface** — the Inbox: the lowest-friction possible entry point for a new thought, deliberately kept unaware of where the thought will eventually belong.
- **Interpret Surface** — the affordances (dropdowns, autocomplete, suggestion acceptance) through which a researcher edits metadata, confidence included. This is the only sub-component that ever turns a Local Intelligence suggestion into a real write.
- **Mode Selector** — the switch between Work Mode and Review Mode. It changes which of Capture or Interpret is emphasised; it does not introduce a third verb.
- **Session Memory** — short-lived, UI-scoped continuity ("where was I") that lets work resume naturally. Explicitly not part of the Research State — if it were lost, nothing scientific would be lost with it.

---

# Inside the Projection Layer

- **Query Definition** — the specific question a given Projection exists to answer (state of the project, contents of a thread, shape of a conflict).
- **Abstraction Parameter** — the zoom level a Projection is currently rendering at. Zooming is this parameter changing, not a different component taking over, which is what keeps navigation from ever feeling like leaving one thing to enter another.
- **Render Cache** — purely a performance convenience. Discarding it can never discard anything the Substrate wouldn't happily recompute.
- **Projection Registry** — the catalogue of currently active Organisational Spaces, which is what allows "complexity creates new views" (Design Invariants §24) to mean spinning up an addressable new Projection, not an ad hoc, unaccounted-for window.

---

# Inside the Publication Layer

- **Maturity Filter** — the threshold, expressed in terms of confidence and resolved conflict — both just read off the Interpretation Plane's metadata — that a region of the Substrate must clear to be eligible for this Projection at all.
- **Scope Selector** — which project or thread the publication is drawn from.
- **Assembly** — otherwise identical machinery to any other Projection's rendering step. The Publication Layer earns no special privileges; it is simply the Projection Layer pointed at the most demanding question the system knows how to ask: is this ready?

---

# What Doesn't Move

Zooming in adds resolution; it cannot relocate a boundary. Every sub-component above still answers to the plane and contract established in the System Architecture document — an Interpretation Writer inside Synthesis is still bound by "Synthesis is the only writer of Interpretation," not a loophole around it. Folding confidence into the Metadata Store rather than giving it its own ledger is exactly this principle at work: a dimension doesn't earn a separate mechanism just because it's important — it earns one only if it's actually written through a different path, and confidence isn't.

The next zoom past this one stops being architecture at all: it is the point where a sub-component's responsibility has to become a concrete data structure or algorithm, which is deliberately out of scope here.