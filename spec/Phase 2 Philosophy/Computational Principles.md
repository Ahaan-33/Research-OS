# Research Operating System

# Computational Principles

### Foundation beneath the Computational Model

### Version 0.1

---

# Purpose

The preceding architectural documents describe the components of the Research Operating System, the responsibilities assigned to them, and the legal flow of information between them. They deliberately avoid implementation and formal mathematics.

This document occupies the layer immediately beneath that architecture.

Its purpose is not to define software modules, but to identify the computational principles that every implementation, optimization, or mathematical formalization must preserve.

These principles are intended to be implementation-independent. They describe the nature of scientific information within the Research Operating System, the transformations permitted upon it, and the invariants that distinguish valid computation from invalid computation.

The mathematical model developed later must emerge naturally from these principles rather than replacing them.

---

# Principle 1 — The Research State is the Only Authoritative Representation

The Research Operating System possesses exactly one authoritative representation of scientific knowledge.

This representation is the **Research State**.

Everything else produced by the system is derived from it.

The Research State therefore serves three roles simultaneously:

- the canonical representation of scientific understanding,
- the substrate upon which computation operates,
- the source from which every external representation is generated.

No view, graph, dashboard, publication, recommendation, or organisational structure possesses authority independent of the Research State.

Deleting any derived representation must never result in information loss.

Deleting the Research State always does.

This distinction separates state from computation.

---

# Principle 2 — Scientific Information is Conserved

The purpose of computation is not to replace scientific information.

It is to reorganise it.

Scientific information therefore obeys a conservation principle.

Once evidence has entered the Research State it cannot cease to exist.

New computation may:

- reinterpret it,
- contextualise it,
- supersede it,
- relate it,
- weaken its influence,
- strengthen its influence,

but never erase the historical fact that it existed.

The Research State therefore evolves through accumulation rather than replacement.

Understanding changes.

History does not.

---

# Principle 3 — Computation Changes Interpretation, Not History

Every legal computation belongs to one of two fundamentally different categories.

The first introduces new scientific information.

The second changes how existing information is understood.

These operations must never be confused.

Scientific history is immutable.

Scientific understanding is intentionally mutable.

Every computational process therefore exists to evolve interpretation while preserving evidence.

---

# Principle 4 — Authority Exists Only Where Information Changes

Authority is not ownership of software.

Authority is ownership of information.

A computational process possesses authority if and only if it is capable of altering the Research State.

Processes incapable of changing the Research State possess no authority regardless of their complexity.

This distinction separates:

- computation,
- suggestion,
- observation.

A projection computes.

A similarity engine computes.

A dashboard computes.

None possess authority because none alter the Research State.

Authority is therefore determined by state mutation rather than computational effort.

---

# Principle 5 — Derived Information Must Remain Disposable

A representation is considered derived if it can be reconstructed entirely from the current Research State.

Derived representations include:

- semantic maps,
- relationship graphs,
- dashboards,
- publication views,
- recommendations,
- search indexes,
- organisational summaries.

Derived representations may be cached, optimized, or discarded without affecting scientific knowledge.

Any representation whose deletion would destroy knowledge has been incorrectly classified.

The architecture therefore distinguishes authoritative information from computational convenience.

---

# Principle 6 — Scientific Structure Emerges

Scientific structure is not explicitly maintained.

It emerges from interaction between evidence and interpretation.

The system therefore distinguishes two fundamentally different kinds of structure.

**Explicit structure** consists of relationships intentionally asserted by the researcher.

These possess provenance and are themselves scientific evidence.

**Emergent structure** consists of computationally discovered organisation arising from similarity, interpretation, and explicit relationships.

Emergent structure is never authoritative.

It is an observation about the Research State rather than part of the Research State itself.

The semantic landscape is therefore computed rather than stored.

---

# Principle 7 — Every Mutation Must Preserve Provenance

A legal transformation never produces information without explanation.

Every mutation of the Research State must identify:

- what initiated it,
- what information justified it,
- which prior state it transformed.

Scientific reasoning is therefore computationally traceable.

The system records not merely what is currently believed, but how that belief evolved.

The evolution of understanding is itself scientific information.

---

# Principle 8 — Conflict is Information

Contradiction represents incomplete understanding rather than computational failure.

When incompatible interpretations arise they are preserved rather than eliminated.

Conflict therefore constitutes a first-class computational object.

No legal computation may silently remove contradiction.

Only new evidence or explicit reinterpretation may resolve it.

The absence of conflict cannot be manufactured.

It must emerge.

---

# Principle 9 — Computation is Monotonic Wherever Possible

Whenever scientific correctness permits, computation should preserve previously accumulated information.

Adding information should never require recomputing historical truth.

The preferred computational model is therefore monotonic.

Only interpretation is intentionally non-monotonic.

This separation minimizes the amount of the Research State that must change when new evidence appears.

---

# Principle 10 — Every Transformation Exists to Reduce Scientific Effort

The purpose of computation is not to replace scientific reasoning.

It is to reduce unnecessary cognitive work while preserving necessary intellectual work.

The system therefore automates:

- organisation,
- retrieval,
- navigation,
- synthesis assistance,
- relationship discovery,

while deliberately refusing to automate:

- scientific judgment,
- hypothesis formation,
- acceptance of evidence,
- interpretation without attribution.

The scientist remains responsible for reasoning.

The system remains responsible for computation.

---

# Principle 11 — The Research State Evolves Through Legal Mutations

The Research State never changes arbitrarily.

It evolves through a finite set of legal transformations.

Every state transition must:

- preserve computational invariants,
- preserve provenance,
- preserve historical evidence,
- produce another valid Research State.

Illegal transitions are not incorrect computations.

They are undefined computations.

The architecture therefore constrains evolution through the existence of legal transformations rather than through runtime prohibition.

---

# Principle 12 — Computation Exists to Preserve Recoverability

The defining objective of the Research Operating System is not storage.

Nor visualisation.

Nor automation.

Its objective is **recoverability**.

At any future point the system should enable the researcher to recover:

- what was known,
- why it was believed,
- what remained uncertain,
- what questions motivated subsequent work,
- how conclusions emerged,
- where conflicts existed,
- what evidence justified every interpretation.

Scientific understanding is therefore represented not as a snapshot but as a continuously recoverable process.

---

# Computational Consequences

Taken together, these principles imply several consequences that are not architectural decisions but necessary computational facts.

- There can be only one authoritative Research State.
- Every legal computation is either a mutation of the Research State or a derivation from it.
- Derived representations never possess authority.
- Scientific history accumulates; interpretation evolves.
- Provenance is inseparable from computation.
- Conflict is preserved rather than eliminated.
- Recoverability is optimized above convenience.

These consequences are independent of implementation.

Any implementation violating them is not an implementation of the Research Operating System described by this specification.

---

# Toward the Research State Algebra

The principles above intentionally avoid mathematical notation.

They instead identify the properties that any formal model must satisfy.

The next document no longer needs to ask _what_ the Research State is, or _why_ it behaves as it does. Those questions have been answered here.

Its task is instead to define the smallest mathematical structure capable of expressing these principles exactly.

That document becomes **The Research State Algebra**.