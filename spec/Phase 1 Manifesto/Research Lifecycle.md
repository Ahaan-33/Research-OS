# Research Lifecycle

## Phase 2 Architecture

---

# Purpose

The purpose of the Research Lifecycle is to define **how scientific understanding evolves** within the Research OS.

Unlike conventional knowledge management systems, whose lifecycle revolves around capturing, organising and retrieving information, the Research OS models the lifecycle of **scientific investigation**.

The primary object flowing through the system is **understanding**.

Scientific Objects, relationships, experiments and notes exist only because they contribute to the evolution of the Research State.

The lifecycle therefore represents the complete process by which curiosity becomes understanding.

---

# Design Principles

The lifecycle is built around several principles.

- Research begins with curiosity, not documentation.
    
- Documentation should occur naturally as a consequence of research.
    
- Results and conclusions are fundamentally different entities.
    
- Individual investigations should remain independent until synthesis.
    
- The Research State should only change during synthesis.
    
- Scientific evidence should accumulate automatically wherever possible.
    
- Every completed cycle should generate new questions.
    

---

# The Research Lifecycle

## Stage 1 — Research Intent

Every research cycle begins with an intent.

An intent may originate from either the researcher or the current Research State.

Examples include

- a question
    
- an observation
    
- an unexpected result
    
- a contradiction
    
- curiosity
    
- inspiration
    
- a gap in understanding
    
- an unresolved thread
    

This creates the starting point of a new investigation.

The intent is documented.

---

## Stage 2 — Exploration

The researcher begins exploring the problem.

Exploration may be

### External

- literature
    
- previous experiments
    
- datasets
    
- discussions
    
- references
    
- internet resources
    

### Internal

- thinking
    
- sketching
    
- note taking
    
- connecting ideas
    
- reasoning
    
- synthesis of existing knowledge
    

The software assists both forms equally.

The objective of exploration is not to collect information, but to develop understanding sufficient to formulate a testable hypothesis.

All exploration is documented.

---

## Stage 3 — Hypothesis Formation

Exploration eventually produces a hypothesis.

A hypothesis represents a concrete explanation or prediction that can be investigated.

This becomes the beginning of a formal investigation.

The hypothesis is documented.

---

## Stage 4 — Engineering (Optional)

Some hypotheses require supporting work before experimentation.

Examples include

- software development
    
- protocol development
    
- hardware construction
    
- image processing pipelines
    
- assay optimisation
    
- simulation development
    

Engineering supports science but is not itself scientific evidence.

This stage is optional.

Engineering work is documented.

---

## Stage 5 — Experiment

An experiment is designed to evaluate the hypothesis.

This stage defines

- protocol
    
- variables
    
- controls
    
- measurements
    
- datasets
    
- equipment
    
- methodology
    

The experiment itself is documented.

---

## Stage 6 — Result

The experiment produces observations.

Results represent **facts recorded during experimentation**.

They should remain free from interpretation.

Examples include

- measurements
    
- microscope images
    
- sequencing outputs
    
- quantified statistics
    
- observations
    
- raw data
    
- processed data
    

Results answer

> "What happened?"

Results do **not** answer

> "What does it mean?"

The results are documented.

---

## Stage 7 — Conclusion

The researcher interprets the results.

Conclusions answer

> "What do these observations imply?"

Unlike Results, Conclusions contain reasoning.

They may

- support the hypothesis
    
- reject the hypothesis
    
- partially support the hypothesis
    
- reveal unexpected behaviour
    
- identify limitations
    
- generate uncertainty
    

The conclusion is documented.

---

# Investigation

The sequence

Hypothesis

↓

Engineering (optional)

↓

Experiment

↓

Result

↓

Conclusion

constitutes a single **Investigation**.

An Investigation is the fundamental scientific unit of the Research OS.

Investigations remain independent.

They do not directly modify the Research State.

---

# Evidence Accumulation

Completion of an Investigation automatically contributes to the project's Evidence Repository.

This process should require minimal manual effort.

Rather than asking the scientist to curate metadata, the software should assemble structured evidence from the natural research workflow.

Each Investigation therefore produces two outputs.

## Human Documentation

The complete narrative of the investigation.

This includes reasoning, discussion and scientific context.

## Structured Evidence

Machine-readable information extracted from the workflow.

Examples include

- hypothesis
    
- variables
    
- protocols
    
- treatments
    
- measurements
    
- datasets
    
- quantitative outputs
    
- controls
    
- equipment
    
- conclusions
    
- confidence
    
- relationships
    

The purpose of this structure is **not** to replace scientific writing.

Its purpose is to enable automatic accumulation and later synthesis.

The software should perform this orchestration wherever deterministically possible.

---

# Evidence Repository

The Evidence Repository is not a user-managed folder.

It is an automatically maintained representation of the structured evidence contained throughout the project.

It enables questions such as

- Which hypotheses have been tested?
    
- Which experiments contradict each other?
    
- Which treatments have been used?
    
- Which protocols consistently fail?
    
- Which conclusions are supported by the greatest body of evidence?
    

The repository is generated automatically from completed Investigations.

---

# Synthesis

Synthesis occurs periodically rather than continuously.

Its purpose is to review accumulated evidence across multiple investigations.

Synthesis analyses

- agreement
    
- contradiction
    
- confidence
    
- completeness
    
- missing evidence
    
- emerging patterns
    

Synthesis is the only process permitted to modify the canonical Research State.

---

# Outputs of Synthesis

Every synthesis produces two outputs.

## Updated Research State

The current best-supported understanding of the project.

The Research State always reflects the latest synthesis rather than individual experiments.

Even if no scientific understanding changes, the completion of synthesis itself constitutes an update to the Research State.

---

## New Research Intent

Scientific understanding naturally produces new uncertainty.

Synthesis therefore generates

- unanswered questions
    
- contradictions
    
- future experiments
    
- new hypotheses
    
- unexplored ideas
    
- missing evidence
    

These become the starting points for future investigations.

---

# Automatic Accumulation

A central architectural principle of the Research OS is that scientific knowledge should accumulate automatically.

Every investigation should leave behind not only documentation, but also structured evidence that enriches the project's collective body of knowledge.

The responsibility for constructing this evidence base belongs to the software, not the scientist.

The scientist performs research.

The software performs organisation.

---

# Lifecycle Summary

Research Intent

↓

Exploration

↓

Hypothesis

↓

Engineering (Optional)

↓

Experiment

↓

Result

↓

Conclusion

↓

Investigation Complete

↓

Automatic Evidence Accumulation

↓

Evidence Repository

↓

Periodic Synthesis

↓

Updated Research State

New Research Intent

↓

Repeat

---

# Architectural Consequences

The Research Lifecycle establishes several architectural responsibilities.

- Sessions manage active work.
    
- Investigations manage scientific inquiry.
    
- Scientific Objects preserve documentation.
    
- The Evidence Repository accumulates structured evidence.
    
- The Graph connects knowledge.
    
- Synthesis updates the Research State.
    
- Views project the current Research State to the user.
    

This separation ensures that documentation, evidence, understanding and presentation remain independent while continuously reinforcing one another.