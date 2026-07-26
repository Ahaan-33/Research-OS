# Research OS – Design Invariants

### Version 0.1

---

# Purpose

This document defines the fundamental design invariants of the Research OS.

Unlike philosophy documents, which explain _why_ the system exists, or architecture documents, which explain _how_ it is implemented, these invariants define the principles that must remain true regardless of implementation.

Every future architectural decision should be evaluated against these invariants.

---

# I. Purpose

## 1. Preserve Research Momentum

The primary objective of the Research OS is preserving scientific momentum, not storing information.

Every feature should ultimately reduce the effort required to continue scientific work.

---

## 2. Minimise Cognitive Overhead

The system should minimise the mental effort required to navigate, organise, and resume research.

Using the system should never become a significant cognitive task in itself.

---

## 3. Organisation Exists to Enable Science

Organisation is never the goal.

Every organisational feature must justify itself by improving scientific reasoning, discovery, or productivity.

---

# II. Scientific Philosophy

## 4. The Scientist Reasons

Scientific reasoning always belongs to the researcher.

The software must never generate scientific understanding, construct theories, or determine truth.

---

## 5. The Software Organises

The software is responsible for

- organisation,
    
- retrieval,
    
- visualisation,
    
- similarity,
    
- navigation,
    
- metadata suggestion.
    

The software organises.

The scientist reasons.

---

## 6. Evidence Is Permanent

Scientific evidence is immutable.

Every observation, experiment, hypothesis, protocol, conclusion, and negative result remains permanently recoverable.

Nothing meaningful is ever discarded.

---

## 7. Interpretation Evolves

Interpretation is mutable.

The system represents the project's current best understanding rather than historical opinion.

Confidence, relationships, synthesis, and organisational structure should evolve naturally as new evidence accumulates.

---

## 8. Conflicts Are Valuable

Contradictions are not errors.

Conflicts identify regions where further scientific investigation is required.

The system should expose conflicts rather than conceal them.

---

# III. Research State

## 9. The Research State Is Canonical

There exists exactly one authoritative representation of a project.

Every user-visible interface is derived from this canonical Research State.

---

## 10. Views Never Own Information

Dashboards, maps, reports, timelines, thread views, publications, and every other interface are projections of the Research State.

No information belongs exclusively to a view.

---

## 11. The Graph Represents Current Understanding

The graph represents the project's current scientific understanding.

It is not a historical archive.

History is preserved by immutable evidence, not by frozen graph structure.

---

## 12. The Graph Continuously Evolves

The Research State should continuously reorganise itself as interpretation changes.

Static organisation should be the exception rather than the norm.

---

# IV. Knowledge Representation

## 13. Note Blocks Are Atomic

Every scientific contribution enters the system as a Note Block.

Knowledge is constructed from these atomic units.

---

## 14. Metadata Represents Interpretation

Metadata is not tagging.

Metadata represents the current scientific interpretation of a Note Block.

---

## 15. Metadata Is Measurement

Metadata defines measurable organisational dimensions.

These measurements determine similarity, proximity, confidence, and relationships within the Research State.

---

## 16. Relationships Emerge

Graph relationships should primarily emerge from

- metadata,
    
- organisational dimensions,
    
- semantic similarity,
    
- explicit structural relationships.
    

Manual graph construction should be the exception rather than the rule.

---

## 17. Organisation Is Multi-dimensional

Every Note Block occupies a position within a high-dimensional organisational space.

No single hierarchy should dominate organisation.

---

# V. User Interaction

## 18. Capture Must Remain Effortless

Capturing ideas should interrupt scientific thought as little as possible.

Scientific thinking always has priority over organisational work.

---

## 19. Metadata Must Justify Its Cost

Every additional metadata field must provide organisational value greater than the effort required to enter it.

---

## 20. Organisation Should Never Become Tedious

The researcher should spend substantially more effort generating scientific knowledge than organising it.

As a practical guideline, metadata entry should require no more than approximately half the effort required to write the Note Block itself.

---

## 21. The User Never Organises Unnecessarily

Whenever organisation can emerge automatically from existing information, the system should perform it.

Manual organisation should exist only where human judgement is genuinely required.

---

# VI. Navigation

## 22. Navigation Follows Abstraction

Moving through the system changes conceptual scale rather than document size.

Navigation should progressively reveal or hide information according to abstraction level.

---

## 23. Context Is Never Lost

The user should always understand

- the active project,
    
- the current thread,
    
- the surrounding scientific context,
    
- their position within the broader research landscape.
    

---

## 24. Complexity Creates New Views

Increasing project complexity should create richer organisational perspectives rather than increasing visual clutter.

Organisation should become more expressive as projects grow.

---

## 25. Scale Must Preserve Usability

Increasing project size should not proportionally increase cognitive load.

Large projects should remain as navigable as small ones through progressively richer abstraction.

---

# VII. Review

## 26. Review Is Synthesis

Review sessions exist to refine scientific interpretation rather than clean organisational structure.

Review is an active process of scientific synthesis.

---

## 27. Review Improves the Research State

Every review session should move the Research State closer to accurately representing reality.

---

## 28. Metadata Is the Instrument of Synthesis

Outside of creating new Note Blocks, metadata refinement is the primary mechanism through which the Research State evolves.

Adjusting metadata is therefore the principal act of synthesis within the Research OS.

---

# VIII. Local Intelligence

## 29. Intelligence Assists

Local intelligence exists solely to reduce interaction cost.

It should assist navigation, organisation, and metadata entry.

---

## 30. Intelligence Never Reasons

Local intelligence may

- classify,
    
- rank,
    
- retrieve,
    
- recommend,
    
- suggest.
    

It must never

- determine scientific truth,
    
- generate hypotheses,
    
- interpret biological meaning,
    
- replace researcher judgement.
    

---

## 31. Suggestions Remain Suggestions

The researcher always retains final authority over organisational decisions.

Every automated suggestion should remain optional.

---

# IX. Publications

## 32. Publication Is the Measure of Completion

Projects are complete when they naturally produce scientifically defensible publications.

Publication represents the primary metric of project completion.

---

## 33. Publications Are Derived

A publication should emerge naturally from a mature Research State.

It should not require maintaining an independent organisational structure.

---

# X. Long-Term Evolution

## 34. The System Represents Understanding, Not Files

The primary object managed by the Research OS is the evolving state of scientific understanding rather than a collection of documents.

---

## 35. Every Conclusion Is Traceable

Every scientific conclusion should remain traceable back to the observations, experiments, and reasoning that support it.

Scientific provenance must never be lost.

---

## 36. Every Design Decision Must Reduce Friction

Whenever multiple equivalent implementations exist, preference should always be given to the design that reduces cognitive effort while preserving scientific rigour.

---

# Fundamental Law

> **The Research OS exists to maintain the best current representation of a scientific project's understanding while minimising the cognitive effort required to create, organise, navigate, and refine that understanding.**

Everything within the Research OS—including Note Blocks, metadata, graphs, views, synthesis, review, local intelligence, and publications—should exist only insofar as it serves this principle.