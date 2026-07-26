# Research OS – Experience & Interaction Specification

### Version 0.2

---

# Purpose

This document specifies **how the Research OS should feel to use**.

The philosophy documents define why the system exists.

The architecture documents define how it will be implemented.

This document defines the interaction principles that bridge those two.

The Research OS is not intended to be a knowledge management system.

It is an operating environment for scientific research whose primary objective is maintaining **research momentum** while minimizing administrative overhead.

---

# Core Experience

The system should make scientific work feel like constructing an increasingly sophisticated machine.

The user repeatedly

- observes the whole,
    
- identifies incomplete subsystems,
    
- zooms into one region,
    
- develops it,
    
- zooms back out,
    
- observes how the entire machine has changed.
    

Navigation exists only to support this process.

The objective is never exploration for its own sake.

The objective is continuous progress towards publication.

---

# Research State

The fundamental purpose of the interface is communicating the **current state of the project**.

Not its history.

Not its stored information.

Not its files.

The interface should answer

> **Where does this research currently stand?**

The user should be able to answer this question within approximately one minute of opening the application.

Everything visible on the dashboard should contribute towards understanding this state.

---

# Layered Abstraction

Every interaction with the Research OS occurs through progressively changing levels of abstraction.

Zooming inward reveals

- component systems
    
- local threads
    
- note blocks
    
- implementation details
    

Zooming outward reveals

- synthesis
    
- research direction
    
- publication progress
    
- overall project state
    

The user is never enlarging documents.

They are navigating between conceptual scales.

---

# Semantic Map Navigation

Navigation should resemble exploring a map.

However, unlike a geographical map, proximity represents semantic relationships.

The user navigates by

Concept

↓

Connected Concepts

↓

Threads

↓

Note Blocks

The experience should minimise the feeling of entering and leaving documents.

Instead, the user continuously explores one connected semantic landscape.

---

# Dynamic Organisation

The semantic map is permitted to reorganise itself.

Large regions containing excessive complexity should evolve into richer semantic structures rather than simply accumulating more nodes.

Complexity should create new perspectives.

It should never create visual clutter.

Hierarchy may exist internally for engineering purposes.

The conceptual model remains graph-based.

---

# Multiple Perspectives

Every project may be explored through different views.

Different views expose different abstractions over the same underlying research state.

No view owns the knowledge.

Every view represents a projection of the same semantic space.

---

# Dashboard

The dashboard represents the highest abstraction level of the active project.

It is not

- a launcher
    
- a file browser
    
- a recent documents page
    

Instead it provides immediate orientation.

The dashboard should answer five questions.

1. Where does the project currently stand?
    
2. Which scientific leads appear most promising?
    
3. Which threads am I actively working on?
    
4. Where was I last blocked?
    
5. What should I probably work on next?
    

The dashboard exists to reduce orientation time.

---

# Persistent Context

Regardless of navigation depth, the interface should always preserve awareness of

- current project
    
- current thread
    
- abstraction level
    
- immediate navigation context
    

The user should never feel lost.

---

# Primary Interaction

The Research OS has only two dominant interactions.

## 1. Navigate

The user continuously moves between different scales of abstraction by selecting regions of the semantic map.

Navigation should require almost no conscious effort.

---

## 2. Capture

Whenever the user generates a documentable scientific thought, it immediately becomes a Note Block.

Capturing knowledge should interrupt scientific thinking as little as possible.

---

# Note Block Capture

Every piece of research enters the system as a Note Block.

A Note Block represents one coherent scientific unit.

Examples include

- idea
    
- hypothesis
    
- experiment
    
- observation
    
- conclusion
    
- synthesis
    
- literature insight
    
- protocol
    

The original written text always remains preserved.

The user never writes directly into the graph.

The graph is constructed from Note Blocks.

---

# Metadata

Metadata is not tagging.

Metadata represents measurable properties of a Note Block.

Examples include

- information type
    
- associated thread
    
- project
    
- publication target
    
- positivity of result
    
- confidence
    
- experimental stage
    

Metadata defines the organisational position of a Note Block.

It does not define scientific truth.

---

# Metadata Capture

Metadata should require minimal cognitive effort.

The interface should rely primarily upon

- lightweight dropdowns
    
- autocomplete
    
- suggestion systems
    
- sensible defaults
    

The objective is rapid capture rather than administrative precision.

The user remains responsible for final decisions.

---

# Local Intelligence

The Research OS intentionally avoids performing scientific reasoning.

Instead, local intelligence exists purely to reduce interaction cost.

Its responsibilities include

- suggesting metadata
    
- identifying similar threads
    
- autocomplete
    
- ranking likely organisational locations
    
- suggesting related note blocks
    

These suggestions should rely upon lightweight semantic analysis together with existing metadata.

The intelligence exists solely to improve navigation and organisation.

---

# Human Responsibilities

Scientific reasoning always belongs to the researcher.

The user determines

- hypotheses
    
- conclusions
    
- biological meaning
    
- scientific interpretation
    

The software never performs these tasks.

---

# Software Responsibilities

The software performs

- organisation
    
- similarity measurement
    
- navigation
    
- retrieval
    
- metadata suggestion
    
- visualisation
    
- state tracking
    

The software should organise.

The scientist should reason.

---

# Semantic Embedding Space

The underlying representation of a project is a semantic embedding space.

Every Note Block occupies a position within this space.

Its position emerges from

- manually curated metadata
    
- relationships
    
- organisational dimensions
    

The system does not attempt to understand scientific meaning.

Instead it constructs an organisational geometry describing the research state.

---

# Organisational Dimensions

Every metadata field represents a measurable organisational dimension.

Examples include

- thread
    
- information type
    
- publication
    
- experimental stage
    
- positivity
    
- confidence
    

Each dimension contributes to the weighted relationships between Note Blocks.

Different dimensions may contribute with different strengths.

The semantic graph therefore emerges naturally from the combination of many organisational dimensions rather than explicit manual graph construction.

---

# Emergent Relationships

Users should rarely need to manually connect Note Blocks.

Relationships should emerge naturally from

- shared metadata
    
- weighted organisational dimensions
    
- semantic similarity
    
- project structure
    

Manual connections remain possible where required.

The graph is primarily an emergent organisational structure.

---

# Research Projects

A Project represents a long-running scientific objective.

Examples include

- MitoLearner
    
- a PhD thesis
    
- an independent research programme
    

Projects intentionally remain loosely defined.

A project may produce multiple publications.

A project is complete only once every downstream publication has reached completion.

Completed projects become archives rather than disappearing.

---

# Threads

Threads represent coherent lines of scientific investigation.

New threads begin when a newly captured Note Block does not naturally belong within any existing thread.

Threads may

- branch
    
- merge
    
- converge
    
- develop independently
    

The organisational system should support these transitions naturally.

---

# Work Mode

During active work, the interface prioritises

- capture
    
- navigation
    
- continuation of existing reasoning
    

The user should experience almost no administrative interruption.

---

# Review Mode

Review sessions occur approximately weekly.

Review involves

- comparing accumulated results
    
- examining the overall research state
    
- updating synthesis
    
- refining metadata
    
- identifying conflicts
    
- generating reports
    

Review emphasises synthesis rather than knowledge capture.

---

# Beginning Work

The intended daily workflow is

Open Research OS

↓

Understand project state

↓

Identify active threads

↓

Recall previous stopping points

↓

Select an area requiring development

↓

Continue scientific work

↓

Capture new Note Blocks

↓

Repeat

---

# Ending Work

Ending work requires no explicit shutdown procedure.

The user simply stops working.

Meaningful outputs such as experiments or observations should already have been captured during the working session.

The system should preserve sufficient state that work can resume naturally tomorrow.

---

# Success Criteria

The Research OS succeeds when

- research momentum remains uninterrupted,
    
- administrative overhead approaches zero,
    
- orientation takes less than one minute,
    
- experimental reasoning is never lost,
    
- every experiment remains traceable to its motivation,
    
- negative results remain permanently recoverable,
    
- the researcher never wonders why something was done,
    
- project growth does not increase cognitive burden,
    
- the interface never overwhelms the user.
    

---

# Fundamental Design Principle

> **The purpose of the Research OS is not to remember knowledge.**

> **Its purpose is to preserve the current state of scientific thinking, minimise cognitive overhead, and maximise research momentum until publication.**