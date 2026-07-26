# Research Operating System

# Convergence Pass — Testing the Minimal Set

### Companion to: Research OS - System Architecture, Layer Two - Component Internals

### Version 0.1

---

# Purpose

This is not a third layer of detail. It is the opposite move: instead of zooming in, this pass tests whether the nine components already on the table are the smallest set that can exist without erasing a real distinction.

The method, applied to every component in turn:

1. **Ontological or operational?** Does this exist because it represents a genuinely different kind of thing in the research world — or because it updates on a different schedule, is written by a different piece of code, or is simply convenient to isolate?
2. **What would actually be lost?** If this component vanished tomorrow, is there knowledge that disappears with it — or does everything it held just get recomputed from what remains?

A component survives only if the answer to (1) is "genuinely different kind of thing" and the answer to (2) is "yes, something real is lost."

---

# Running the Test

## Evidence Plane — survives

Ontologically distinct: it holds _what happened_. Nothing else in the system holds this. Loss test: if it vanished, every observation, protocol, and result is gone. Total, irreversible loss. This is the strongest possible pass.

## Interpretation Plane — survives

Ontologically distinct: it holds _what we currently believe about what happened_, which is a different kind of claim than the evidence itself — a belief, not an event. Loss test: if it vanished, the project doesn't lose its history, but it loses everything it currently understands. Confidence, thread structure, active conflicts — all gone. Also a real loss, of a different kind than the Evidence Plane's.

These two do not merge. This is the one asymmetry the whole architecture is built to protect: one plane is a record, the other is an opinion about the record. Collapsing them would mean interpretation could no longer be revised without evidence being touched, which is the exact failure mode [[Knowledge Evolution]] and [[Design Invariants]] §6–7 exist to prevent.

## Relationship / Emergence Engine — does not survive in its current position

Ontologically: this component was described as part of the Substrate — the plane that holds truth. But look at what it actually is: a computed arrangement of the two planes above it, plus similarity signals borrowed from elsewhere. It generates nothing that isn't already implied by Evidence and Interpretation. Loss test: if it vanished, **nothing is lost.** It is, by its own definition, fully rebuildable from what remains. This is a clean fail on the second test, and the failure is informative: a component whose entire contents can be recomputed from other components has no business being classified alongside the two components whose contents cannot be.

**Correction:** the Relationship / Emergence Engine is relocated out of Substrate and into Process. It was never a store of truth — it is a derivation, and derivations belong with the rest of the machinery that computes things from the Research State, not with the Research State itself. This also resolves a nagging inconsistency in the original contract table, which already listed it as "not persistent, fully derivable" — a description that never actually matched Substrate's other two members.

## Lifecycle Orchestrator — survives, with a caveat worth stating plainly

Ontologically distinct: it is the only component that understands the internal shape of an individual, unfinished line of inquiry. Loss test: if it vanished mid-Investigation, the _in-progress_ reasoning — the specific hypothesis being tested, the stage reached — is lost. But nothing _committed_ is lost, because by design this component never writes Evidence until an Investigation completes. This is worth stating as its own invariant: **the only things this component can lose are things that were never yet knowledge.** That is a feature, not a gap.

## Synthesis Engine — survives, but the loss test needs a sharper distinction

Loss test: if it vanished, no evidence disappears and no existing interpretation reverts. What disappears is the _capacity for understanding to keep evolving._ This is a different category of loss than Evidence or Interpretation disappearing — call it **progress loss** rather than **knowledge loss.** It's still a real loss (a system that can't synthesise is a system that can't do the thing Research State & Epistemic Model calls "living representation"), so the component stays. But it's worth naming the distinction, because it's the same distinction that will matter again below.

## Local Intelligence Services — survives, and passes cleanly

Loss test: if every service vanished, nothing is lost — every suggestion these produce only becomes real once a researcher accepts it through the Interaction Shell. This is exactly what [[Local Intelligence]] and [[Design Invariants]] §31 demand of it, and the fact that it passes the "nothing lost" test _by design_ is the clearest confirmation that its placement is correct. Convenience is its entire mandate — it is allowed to be pure convenience.

## Interaction Shell — survives

Ontologically distinct: it is the only component that turns a human act into one of the two write primitives, Capture or Interpret. Nothing else touches that boundary. Loss test: no stored knowledge is lost if it disappeared, but there is no longer any way to _produce_ stored knowledge going forward. This is closer to the Lifecycle Orchestrator's caveat than to a true knowledge loss — it doesn't hold understanding, it's the only door through which understanding can enter.

## Projection Layer — survives

Ontologically distinct: it exists to answer a question about the current state, not to hold one. Loss test: nothing is lost — every Projection is fully recomputable, by definition. It passes for the same reason Local Intelligence does: it is _supposed_ to be weightless.

## Publication Layer — does not survive as its own component

Apply the ontological question directly: is "is this ready to be published" a fundamentally different kind of question than "what does this thread currently look like" or "what's unresolved in this project"? It isn't. Both are questions asked of the same Substrate, answered by rendering a slice of it at a chosen scope and a chosen threshold of maturity. The only thing that made Publication feel separate was that its question is the _most demanding one the system knows how to ask_ — an operational distinction (how strict the filter is), not an ontological one (what kind of thing it's asking).

**Correction:** the Publication Layer is absorbed into the Projection Layer as a configuration of it — a Query Definition scoped by a maturity threshold, using the same Abstraction Parameter, Render Cache, and Registry as every other Projection. It keeps its name as a _concept_ — "this Projection's answer happens to be a publication" — but it stops being a separate box in the diagram.

---

# What Was Considered and Rejected

In the spirit of ideating aggressively before pruning, three further collapses were tested and did not hold:

- **Evidence Plane merged into Interpretation Plane** — rejected. This is the asymmetry the system exists to protect; collapsing it would mean revising a belief and rewriting history become the same act.
- **Synthesis Engine merged into Lifecycle Orchestrator** — rejected. One operates on a single Investigation's local arc and never touches Interpretation; the other operates across the whole accumulated Evidence Plane and is the _only_ writer of Interpretation. Different scope, different plane, different authority.
- **Local Intelligence merged into the (relocated) Relationship / Emergence Layer** — tempting, since both are read-only derivations over Substrate that a human never has to directly maintain. Rejected on a genuine ontological ground rather than an operational one: Local Intelligence assists the _write_ path (it helps a researcher decide what to capture or how to interpret something) while the Emergence Layer assists the _read_ path (it helps a researcher navigate what already exists). Assisting someone about to add a belief and assisting someone trying to see the current landscape of beliefs are different moments in the same loop, not the same responsibility wearing two hats.

---

# The Converged Map

```
SUBSTRATE  (2)                 — the only components a "what did we actually lose"
  Evidence Plane                 test can answer "something real."
  Interpretation Plane

PROCESS  (4)                   — owns no facts; changes the Substrate, or computes
  Lifecycle Orchestrator          disposable read-models over it.
  Synthesis Engine
  Relationship / Emergence Layer   ← relocated here from Substrate
  Local Intelligence Services

SURFACE  (2)                   — owns nothing; every one of these is fully
  Interaction Shell                recomputable from Substrate.
  Projection Layer                 (Publication is now a mode of this, not a peer of it)
```

Eight components, down from nine — not because a responsibility was deleted, but because one (Publication) was recognised as a special case of an existing one, and one (the Emergence Layer) was recognised as belonging to a different plane than originally assigned. No invariant from the System Architecture or Layer Two documents was weakened to get here; several were sharpened.

---

# Invariants Made Explicit by This Pass

- **A derived structure is never authoritative, regardless of how central it feels to daily navigation.** The Emergence Layer's relocation is this invariant, not an exception to it — the graph _felt_ foundational because researchers look at it constantly, but centrality of use is not the same as authority over truth.
- **Only a component whose loss deletes something un-recomputable belongs to the Substrate.** This is now the actual admission test for that plane, replacing the looser "holds part of the Research State" framing.
- **Knowledge loss and progress loss are different failure modes, and only one of them is catastrophic.** Losing Synthesis or the Lifecycle Orchestrator freezes the system's ability to move forward; it does not erase what the system already knows. This distinction is what allows both components to keep a narrow, well-justified place in Process without being mistaken for stores of truth themselves.
- **A component earns a separate identity only if its _question_ is a different kind of question, not merely a stricter one.** This is what dissolved Publication into Projection: "is this ready" and "what does this look like" are the same kind of question at different settings, not two kinds of question.

---

# What Remains Open

This pass did not find a way to reduce below eight, and every rejected collapse above failed for a stated ontological reason rather than an unexamined one. That is the target state this exercise was aiming for — not the fewest possible boxes, but boxes that resist merging because the reasons not to merge them are explicit.

The one seam still worth watching as the design matures: the Relationship / Emergence Layer now sits inside Process next to Local Intelligence, and both are read-only derivations over the same Substrate. They were kept apart on the write-path/read-path distinction above. If a future revision finds a responsibility that assists _both_ directions at once, that will be the moment to re-open this question — not before.