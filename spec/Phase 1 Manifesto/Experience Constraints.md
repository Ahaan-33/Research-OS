# Research OS – Experience Constraints

## Draft v0.1

---

# Purpose

This document defines the **experience of using the Research OS**, independent of implementation details. While the philosophy documents define _what the system believes about knowledge_, this document specifies _how interacting with that knowledge should feel_.

The guiding objective is not efficient file management or knowledge storage.

The objective is to maximise **research momentum**.

---

# 1. Information Retrieval Through Abstraction

The primary method of navigating information is **abstraction**, not documents.

Every object within the system exists simultaneously at multiple levels of abstraction.

Moving through the system should resemble zooming through layers of thought rather than opening increasingly detailed files.

At every level of zoom:

- information appropriate to that scale becomes visible,
    
- lower-level implementation details are progressively hidden,
    
- higher-level summaries become increasingly dominant.
    

The user is never simply enlarging text.

They are changing the conceptual scale at which information is represented.

---

# 2. Map-Like Navigation

The entire knowledge base should behave more like a navigable map than a collection of folders.

Navigation should feel spatial.

Instead of traversing

```
Folder
    ↓
File
    ↓
Heading
```

the user explores

```
Concept
    ↓
Connected Concepts
    ↓
Underlying Ideas
```

The system should encourage movement through semantic relationships rather than storage locations.

---

# 3. Dynamic Semantic Organisation

The knowledge map is fundamentally semantic.

Its layout is allowed to evolve as the knowledge base grows.

Spatial proximity should emerge from semantic relationships encoded within the graph rather than manually designed layouts.

Hierarchy may exist internally as an implementation convenience, but hierarchy is **not** the conceptual model presented to the user.

---

# 4. Layered Abstraction

Every scale of navigation should present an overview appropriate for that level.

Zooming inward progressively reveals

- broader concepts
    
- component ideas
    
- note blocks
    
- implementation details
    

Zooming outward progressively reveals

- synthesis
    
- research themes
    
- project state
    
- overall objectives
    

The experience should always preserve context.

The user should never feel "lost inside a document."

---

# 5. Multiple Perspectives

A concept may naturally belong to multiple higher-level abstractions.

The system should not force a unique parent.

Instead, users should be able to arrive at the same concept through multiple semantic routes.

Likewise, moving upward through abstraction should not always produce a single deterministic parent.

Instead, the interface may offer several equally valid conceptual directions.

---

# 6. The Note Block

The atomic unit of knowledge is the **Note Block**.

A note block represents one coherent piece of scientific work.

Examples include

- an idea
    
- a hypothesis
    
- an experiment
    
- an observation
    
- a result
    
- a protocol
    
- a theory
    

Typically this corresponds to roughly two to four paragraphs of text.

The original text always remains part of the permanent knowledge base.

Knowledge objects are therefore composed of

```
Text
+
Metadata
+
Semantic Connections
=
Knowledge Object
```

---

# 7. Metadata as Organisation

Metadata exists primarily to organise knowledge.

Metadata should be manually authored by the user whenever scientific judgement is required.

The software may assist by suggesting metadata using semantic similarity and autocomplete mechanisms.

The software should organise.

The scientist should reason.

Scientific interpretation should never be delegated to the organisational system.

---

# 8. The Dashboard

The dashboard is the highest level of abstraction.

It is not

- a launcher,
    
- a recent files page,
    
- a project browser.
    

Instead, it answers a single question:

> **"What is the current state of this research project?"**

Every interaction begins from this global overview before progressively descending into finer levels of detail.

Different dashboard views may exist depending on the perspective selected.

---

# 9. Minimal-Friction Capture

The primary interaction with the Research OS is capturing thought.

Whenever the user produces a documentable scientific idea, it should become a note block with as little interruption as possible.

The intended workflow is

```
Think

↓

Capture

↓

Minimal Metadata

↓

Continue Thinking
```

The organisational burden should fall on the software rather than interrupting the user's cognitive flow.

---

# 10. The Inbox

The Inbox is the interface between biological cognition and the Research OS.

It is not temporary storage.

It is the primary destination for newly captured thoughts.

Every documentable thought should enter the system through the Inbox before being organised into the wider semantic graph.

Classification should never become a barrier to recording ideas.

---

# 11. Complexity Creates New Views

Large collections of connected ideas should not simply accumulate.

If a region becomes excessively complex, the system should evolve additional semantic perspectives that organise the information differently.

Complexity should therefore create richer organisational structures rather than denser graphs.

The objective is not to compress information.

The objective is to preserve navigability.

---

# 12. Persistent Project Context

Navigation should remain grounded within the active research project.

Regardless of where the user explores, the system should always preserve awareness of how the current work contributes toward the project's publication goals.

The project serves as the persistent context for navigation.

---

# 13. Building Rather Than Browsing

Using the Research OS should feel less like browsing information and more like constructing a machine.

The user repeatedly

- builds a subsystem,
    
- zooms outward,
    
- evaluates the whole,
    
- identifies weaknesses,
    
- returns to improve local components.
    

The map exists to support construction of the machine.

---

# 14. Daily Workflow

The intended workflow is

```
Open Dashboard

↓

Understand Current State

↓

Locate an unfinished thread

↓

Read current context

↓

Continue reasoning

↓

Capture new note blocks

↓

Return to overview
```

The user should never spend time searching for where information is stored.

Instead, attention is directed toward where scientific progress is required.

---

# 15. Present State Over History

The primary interface should optimise understanding of the current state of the project.

Historical evolution remains important but should exist as a specialised temporal view similar to version control.

The everyday question is

> "Where are we now?"

rather than

> "How did we get here?"

---

# 16. Completion

Knowledge is rarely complete.

A research component reaches completion only when it is publication-ready.

Completed work remains integrated within the semantic network because it continues to support future reasoning and evidence.

Completion changes status rather than visibility.

---

# 17. Research Assistant, Not Knowledge Assistant

The Research OS is fundamentally a research assistant.

Its objective is not helping users remember facts.

Its objective is helping users remember unfinished scientific work.

The dashboard should therefore prioritise

- incomplete reasoning,
    
- unresolved conflicts,
    
- missing evidence,
    
- ongoing experiments,
    
- publication progress,
    

over static knowledge retrieval.

Knowledge serves research.

Research does not serve knowledge.

---

# 18. Adaptive Interface Maturity

As research projects grow, the interface should naturally mature.

Small projects require lightweight organisation.

Large projects gradually expose richer capabilities including

- synthesis,
    
- conflict resolution,
    
- publication tracking,
    
- review workflows,
    
- strategic planning,
    
- evidence management.
    

The user should not need to adopt a fundamentally different workflow as complexity increases.

Instead, the interface should progressively expose additional organisational power while preserving the same underlying interaction model.

---

## Core Design Statement

> **The Research OS is not designed to remember information. It is designed to preserve research momentum by making the current state of scientific work immediately understandable, navigable, and extensible.**