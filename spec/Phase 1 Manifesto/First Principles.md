# Research Operating System
# First Principles

This document defines the design axioms of the Research Operating System. All architectural decisions should follow from these principles.

---

## Purpose

The Research Operating System bridges the gap between scientific work and scientific output.

Research, documentation, organisation and communication are treated as a single continuous process rather than separate activities.

---

## Research State

The primary object is the **Research State**, not documents.

The Research State is the complete, current scientific understanding represented by the system.

Documents, papers, dashboards and visualisations are projections of this state.

See:
- [[Research Information Model]]
- [[Relationship Ontology]]

---

## The Scientist Owns Meaning

Scientific meaning belongs to the researcher.

The system may assist retrieval, navigation and organisation.

It never determines scientific interpretation.

---

## AI Assists Retrieval

AI supports:

- retrieval
- semantic search
- similarity
- document processing
- suggestions

Scientific reasoning remains the responsibility of the researcher.

---

## Capture Without Administration

Every interaction should advance research.

The system should not require maintenance tasks whose only purpose is maintaining the software.

---

## Maintenance is Synthesis

Maintenance consists of refining scientific understanding.

Not:

- reorganising files
- moving notes
- adding tags
- repairing folders

See:
- [[Scientific Synthesis]]

---

## Research is Cyclical

Research proceeds through continuous refinement.

```
Explore
    ↓
Capture
    ↓
Interpret
    ↓
Synthesis
    ↓
Updated Research State
```

See:
- [[Knowledge Acquisition]]
- [[Scientific Synthesis]]
- [[Knowledge Evolution]]

---

## Single Source of Truth

Scientific knowledge is recorded once.

Every representation derives from the same Research State.

Organisation is therefore a consequence of understanding rather than a prerequisite for it.

 ---
## Local Intelligence 

All computational intelligence operates locally.

The Research Operating System must remain fully functional without network access or external services.

Knowledge never leaves the local machine.

---

## Deterministic Assistance

Artificial intelligence assists navigation rather than reasoning.

Its responsibilities include:

- search
- retrieval
- similarity
- indexing
- recommendation
- semantic linking

These operations should be deterministic and reproducible.

Scientific interpretation remains the responsibility of the researcher.

---

## No Cloud Dependence

The Research Operating System has no mandatory cloud services.

Core functionality must not depend upon:

- remote APIs
- cloud-hosted language models
- online accounts
- subscriptions
- telemetry

The system remains completely usable offline.

---

## Replaceable Components

Computational intelligence is modular.

Search, indexing and recommendation engines should be replaceable without affecting the underlying Research State.

The knowledge model is independent of implementation.