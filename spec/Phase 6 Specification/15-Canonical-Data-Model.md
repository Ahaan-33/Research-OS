# Research Operating System — Canonical Data Model

### Phase 6 Implementation · Document 2 of N

### Version 0.1

---

## Purpose

_[[12-system-architecture-first-draft]]_ fixed what Subsystem 1 (Persistent Research State) owns: `E` and `I`, and nothing else. _[[06-Research-State-Mathematics]]_ fixed what `E` and `I` mathematically are. _[[14-Provenance-Structure]]_ fixed what `prov` concretely is. None of these documents fixed a **serializable schema** — a concrete, storage-technology-independent shape for every value that must actually be written to durable storage and read back byte-for-byte identical in meaning. That is this document's sole job.

"Storage-technology-independent" does not mean vague. Every type below is specified precisely enough that two independent implementations, one on a relational store and one on a document store, produce observably identical `Legal` states from the same input sequence — the schema is the contract; the storage engine is not. Where a genuinely storage-specific decision is unavoidable (e.g., an index structure), it is deferred explicitly to _[[16-Subsystem-Interface-Contracts]]_ or flagged as an implementation choice, not silently resolved here.

References back to: _[[06-Research-State-Mathematics]]_ D1–D14 (the objects being serialized), _[[14-Provenance-Structure]]_ (the `prov` type), _[[12-system-architecture-first-draft]]_ Subsystem 1 (the owner of this schema). References forward to: _[[16-Subsystem-Interface-Contracts]]_ (the operations that read and write these shapes).

---

## Notation

Schemas below use a minimal, storage-agnostic type notation: `record { field: Type, ... }` for a fixed-shape composite, `Type[]` for an ordered list, `Set<Type>` for an unordered collection with no duplicates (by the type's own equality), `Map<K,V>` for a partial function, `A | B` for a tagged union, and `Type?` for an optional field. This is deliberately not any specific IDL (Protobuf, JSON Schema, SQL DDL) — a concrete implementation may compile it to any of these; what must not vary is the set of fields, their types, and which are optional.

---

## D4 — Identity

**Decision required:** D4 specifies only that `id(e)` is drawn from "an unbounded identity space, assigned once, never reassigned or reused." A concrete type is required.

**Candidates considered:**
- **Sequential integer, database-assigned.** Rejected: requires a single centralized allocator, which conflicts with nothing in the mathematics directly but forecloses any future multi-writer or offline-capture scenario without a redesign — and nothing in D4 requires centralization, so adopting it here would be an unforced implementation-narrowing decision.
- **Content hash (e.g., SHA-256 of the payload).** Rejected outright, and for a reason grounded directly in the mathematics, not merely convenience: D4 is explicit that "two elements with textually identical content are still distinct elements if independently captured" (D4, citing _Discovery Roadmap §3_) — a content-derived identity would make two independent captures of identical content collide into one identity, which is proven-wrong behavior (it would violate D4.1's injectivity theorem for the very capture sequence that theorem's proof sketch relies on: "Capture always mints a fresh identity"). Content hashing is the one candidate structurally incompatible with an already-proven theorem, not merely a weaker option.
- **UUIDv7 (time-ordered 128-bit random identifier, RFC 9562).** Adopted. It requires no central allocator (any Capture/Interpret site, including a future offline or multi-agent writer, can mint one unilaterally with negligible collision probability), it is monotonically sortable by creation time without a separate timestamp field for the common case of "list elements roughly in capture order," and its 128-bit space is unbounded for any practical project size, satisfying D4's "unbounded identity space" literally rather than approximately.

```
type ElementId = UUIDv7   // 128-bit, RFC 9562, time-ordered
```

**Consequence for D4.1 (Identity Injectivity).** The theorem's proof sketch depends on Capture "always mints a fresh identity" — with UUIDv7, freshness is probabilistic, not structural (collision probability ~2⁻¹²² per pair). This is the standard, accepted gap in any UUID-based identity scheme and is noted rather than hidden: **Engineering requirement E1** — Subsystem 2 (Transformation Engine) MUST reject a Capture whose minted identity already exists in `E` (an O(1) existence check against Subsystem 1 before commit) rather than assume freshness silently. This turns D4.1 back into a structurally-enforced guarantee (a rejected collision is not a silent injectivity violation) at negligible cost, and is the concrete implementation of D10 condition 1 ("`id` is injective on `E`") as a checked precondition rather than an assumed one.

---

## D1–D3 — Content Element, Relation Element, Evidence Set

```
type ElementRole = "content" | "relation"

record ContentElement {
    id: ElementId,
    role: "content",
    kind: ContentKind,         // observation | hypothesis | experiment | dataset |
                                // result | interpretation | decision | implementation |
                                // literature_reference   (Research Information Model)
    payload: ContentPayload,   // kind-specific body; opaque to Subsystem 1, meaningful only
                                // to Interaction layer and Projection Engine renderers
    prov: ProvenanceExpr,      // [[14-Provenance-Structure]]
}

record RelationElement {
    id: ElementId,
    role: "relation",
    relationType: RelationType,   // "supports" | "contradicts" | "derives_from" | "supersedes" | ...
                                    // (Relationship Ontology; "supersedes" is the reserved type of D8)
    endpoints: ElementId[],        // ≥ 2, per D2's "between two or more content elements"
    prov: ProvenanceExpr,
}

type Element = ContentElement | RelationElement

// D3: E := C ∪ R, realized as one uniform collection distinguished by `role`
type EvidenceSet = Set<Element>   // keyed by `id`; D4.1 (as strengthened by E1) guarantees
                                    // this is a genuine set, never a multimap
```

**Note on `endpoints` cardinality.** D2 permits relations among "two or more" content elements, so `endpoints` is a list, not a fixed pair — a binary relation (`supports`, `contradicts`) will have exactly two, but nothing in D1–D3 forbids a genuinely n-ary relation type (e.g., a single relation element asserting that three results are jointly inconsistent), and the schema does not artificially exclude it. `Relationship Ontology`'s registered relation types each declare their own required arity as part of `RelationType`'s definition — a concern local to that registry, not to this schema.

**Note on `payload` opacity.** _[[06-Research-State-Mathematics]]_ never specifies what a content element's actual scientific content looks like — that is `Research Information Model`'s domain, not the algebra's. This schema deliberately leaves `ContentPayload` as a kind-tagged opaque body rather than inventing a universal content schema here: doing so would be exactly the kind of new abstraction the brief instructs against introducing without the implementation genuinely forcing it, and nothing in D1–D14 forces a specific content shape — only that it be immutable and identity-bearing, both already satisfied by `ContentElement` treating `payload` as write-once (see Immutability, below).

---

## D5, D6, D14 — Dimension Registry, Interpretation Function, Examination Status

### Dimension Registry

D5 fixes `D` as "an open, registered set... at any fixed instant a well-defined finite set." A registration act is required to add to it (Ambiguity Audit A8, confirmed in _[[06-Research-State-Mathematics]]_ Open Question 2's deferral, which assumed no removal).

```
record DimensionDefinition {
    dimension: DimensionId,        // stable string key, e.g. "thread", "stage", "confidence"
    valueSpace: ValueSpaceSpec,    // discriminates how V_d's members are validated/compared
    registeredAt: Timestamp,
    registeredBy: ProvenanceExpr,  // registration is itself a provenanced act, per D7's scope
}

type ValueSpaceSpec =
      EnumSpace   { values: Set<string> }             // e.g. stage ∈ {draft, reviewed, published}
    | ScalarSpace { min: number?, max: number? }        // e.g. confidence ∈ [0,1]
    | RefSpace    { targetRole: ElementRole }            // e.g. thread ∈ ElementId (an element used as a grouping anchor)
    | FreeTextSpace { }                                  // unconstrained string value

type DimensionRegistry = Map<DimensionId, DimensionDefinition>   // owned by Subsystem 1,
                                                                    // append-only (no removal — D5's
                                                                    // fixed-D-per-instant treatment,
                                                                    // per Open Question 2's deferral)
```

`ValueSpaceSpec` is a closed union of the four shapes actually attested across Phase 1's dimension examples (thread/stage/confidence/positivity and their kin); it is not intended as a universal type system, only as enough structure for Subsystem 2 to validate a coordinate write against D5's `V_d` before commit (Engineering requirement E2, below) without falling back to "any value is legal for any dimension," which would silently weaken D10 into accepting garbage coordinates.

### Interpretation Function (Coordinate Entries)

D6 fixes `I : E × D ⇀ 𝒱(V_d)` as multi-value-set-valued; D14 extends the codomain with examination status. A coordinate entry must carry, per value, its own provenance (D7 attaches provenance "for a specific coordinate assignment `I(e,d) ∋ v`" — per-value, not per-pair):

```
record CoordinateValue {
    value: V_d,                 // validated against the dimension's ValueSpaceSpec at write time
    prov: ProvenanceExpr,       // this value's own justification, per D7 and [[14-Provenance-Structure]]
    writtenAt: Timestamp,
}

record CoordinateEntry {
    element: ElementId,
    dimension: DimensionId,
    values: Set<CoordinateValue>,     // |values| = 0 legal only if status = unexamined;
                                         // |values| ≥ 2 is precisely a Conflict Region (D13)
    status: "unexamined" | "examined", // D14
}

// D6/D14 combined, realized as a sparse collection rather than a dense function:
// only (element, dimension) pairs that have been written OR explicitly examined-and-found-empty
// have an entry at all — an absent entry and an `unexamined` entry with |values|=0 are
// deliberately the SAME representation (both mean "never touched"), per D14's own framing
// that the distinguishing marker is what an entry records once one exists, not that
// every possible pair must have a row.
type Interpretation = Set<CoordinateEntry>   // keyed by (element, dimension)
```

**Note on the sparse representation.** D14's codomain extension `I : E × D ⇀ (𝒱(V_d) × {examined,unexamined})` is a partial function; realizing "unassigned, never examined" as a genuinely absent entry (rather than a materialized row with `status = unexamined`) is the more faithful reading of `⇀` (partiality) and avoids materializing `|E| × |D|` rows for a typical project where most pairs are never touched (INV-5's "most (element,dimension) pairs are simply unassigned"). A `status = "unexamined"` row is only ever materialized for a pair a Synthesis run specifically checked and found nothing for (D14's "the former has simply never been assigned; the latter means a Synthesis run specifically checked... and found no basis for any value") — this is the concrete storage meaning of D14's distinction: **absent row = never touched; present row with empty `values` and `status="examined"` = checked, nothing found.**

### Conflict Region — Derived, Not a Separate Table

Per D13 and _[[06-Research-State-Mathematics]]_'s own note ("not a separately maintained registry as a mathematical matter... though, as an engineering matter, it should be materialized explicitly"), this schema takes the engineering recommendation while keeping the mathematics honest: `Conflicts(S)` is not a distinct persisted collection, it is an **indexed view** — a query `SELECT (element, dimension) FROM Interpretation WHERE |values| ≥ 2`, which Subsystem 1 is expected to maintain a live index over (a materialized-view or equivalent, invisible to `S`'s own definition) purely for read performance, satisfying INV-20's requirement that "no conflict" be distinguishable from "not examined" without requiring a second source of truth that could drift from `Interpretation` itself.

---

## D8, D9, D10 — Supersession, the Research State, Legality

Supersession is not a separate table: per T-Supersede-Distinct, it is a `RelationElement` with `relationType = "supersedes"` and `endpoints = [new, old]`. `Current(E)` (D8's derived predicate) is likewise not stored — it is computed as `{e ∈ E : e ∉ {endpoints[1] of any element with relationType="supersedes"}}`, and, like `Conflicts(S)`, may be backed by a maintained index for read performance without becoming a second source of truth.

```
record ResearchState {
    evidence: EvidenceSet,          // D3
    interpretation: Interpretation, // D6/D14
    dimensions: DimensionRegistry,  // D5 (carried alongside S for practical reasons — see note)
}
```

**Note on carrying `DimensionRegistry` inside `ResearchState`.** D9 defines `S := (E, I)` — two components only, and this document does not add a third to the mathematical object. `DimensionRegistry` is included in the persisted `ResearchState` record purely as a storage-locality convenience (dimension definitions must exist before any coordinate can be validated against them, so they are naturally co-located and co-durable with `I`), not as a claim that `D` is part of `S`. This mirrors _[[01-State-Model]]_'s "third category" (authoritative-but-non-scientific) treatment already given to Configuration in Subsystem 13 — `DimensionRegistry` sits in that same category, and its inclusion here is a physical co-location decision, not a mathematical one; no theorem in Documents 06–11 references `D` as part of `S`, and none should be read as being amended by this schema's storage layout.

### D10 — Legality as a Checked Predicate

```
function isLegal(s: ResearchState) -> boolean {
    // D10.1 (strengthened by E1): id injective on E — checked at write time (Capture), see E1
    // D10.2: every e ∈ E has a provenance — prov is a non-optional field on Element; enforced by schema, not by a runtime check
    // D10.3: dom(I) ⊆ E × D — every CoordinateEntry.element must reference an id present in evidence,
    //        and every CoordinateEntry.dimension must be a registered DimensionId
    // D10.4: supersedes acyclic — checked incrementally at each Supersede (E3, below), not by a full graph scan per write
}
```

D10.2 and the non-optionality of `prov`/`id` are enforced structurally (a value that does not type-check as `Element` cannot be constructed at all — the direct realization of _[[06-Research-State-Mathematics]]_'s "Engineering Implications" note that `Legal` should be a maintained invariant, not a post-hoc check). D10.3 and D10.4 require an active check, stated as engineering requirements:

- **E2** (D10.3, dimension-side): Subsystem 2 rejects any Interpret whose `dimension` is absent from `DimensionRegistry`, and rejects any `value` failing its `ValueSpaceSpec` validation.
- **E3** (D10.4, acyclicity): Subsystem 2 rejects any Supersede whose `old` already (transitively, via any chain of `supersedes` relation elements) supersedes the element being minted as `new` — this is a bounded check (walk `old`'s own supersession chain backward, which is finite by construction since every step mints a fresh identity, per D4.1/E1) rather than a full-graph cycle detection, since only the single new edge being added can possibly introduce a cycle, and only along the one chain it touches (a direct instance of the Locality principle, _[[06-Research-State-Mathematics]]_, applied to a legality check rather than a derived-structure computation).

---

## Timestamps and Ordering

`Timestamp` (used in `CoordinateValue.writtenAt`, `DimensionDefinition.registeredAt`, and inside `ProvenanceExpr`'s atomic act tokens per _[[14-Provenance-Structure]]_) is a monotonic, storage-assigned instant — **not** researcher-supplied wall-clock time, and not the sole ordering mechanism for causality. D6/T2's merge semantics (_[[06-Research-State-Mathematics]]_, T2) are explicitly order-independent (`⊔` is commutative regardless of arrival order) — `Timestamp` here is for human-facing display and for the "roughly in capture order" convenience UUIDv7 already provides at the identity level, not a mechanism anything in D10's legality predicate depends on. No theorem above requires a global total order on writes; none is introduced.

---

## Full Type Summary

```
ElementId          = UUIDv7
ProvenanceExpr      = per [[14-Provenance-Structure]]: antichain of Set<AtomicActRef>
DimensionId         = string (registered key)
V_d                 = validated against the owning dimension's ValueSpaceSpec

Element             = ContentElement | RelationElement
EvidenceSet         = Set<Element>
CoordinateValue     = { value, prov, writtenAt }
CoordinateEntry     = { element, dimension, values: Set<CoordinateValue>, status }
Interpretation      = Set<CoordinateEntry>
DimensionDefinition = { dimension, valueSpace, registeredAt, registeredBy }
DimensionRegistry   = Map<DimensionId, DimensionDefinition>
ResearchState       = { evidence, interpretation, dimensions }
```

This is the complete, closed schema for everything Subsystem 1 durably owns. Every other subsystem's data (Subsystem 4's proximity cache, Subsystem 5's indices, Subsystem 7's render cache, Subsystem 11's Session Frames, Subsystem 13's weighting/projection registry) is explicitly out of scope for this document, per _[[12-system-architecture-first-draft]]_'s ownership boundaries — each is disposable, recomputable, or non-scientific by that document's own classification, and none requires the same durability guarantee this schema exists to give `Legal` a concrete shape for.

---

## Relationship to Previous Documents

This document gives _[[06-Research-State-Mathematics]]_ D1–D14 and _[[14-Provenance-Structure]]_'s `PosBool(Acts)` result a single closed, serializable schema, and discharges three concrete engineering requirements (E1, E2, E3) that turn D10's legality predicate from a stated invariant into a checked one at specific, named enforcement points — directly satisfying _[[02-System-Invariants]]_'s own instruction ("INV-9 through INV-13 are stated as structural... guarantees, not runtime checks, wherever possible") extended here to D10's remaining two conditions, which do require a runtime check (D10.1/D10.2 are structural by construction; D10.3/D10.4 are not, and are named honestly as such rather than claimed to be free).

---

## Open Questions

1. Whether `ValueSpaceSpec`'s four shapes (Enum/Scalar/Ref/FreeText) are exhaustive for every dimension _Research State & Epistemic Model_ and _Organisational Spaces_ actually name, or whether a fifth (e.g., a structured/compound value space for multi-field dimensions) will be forced once concrete dimensions beyond thread/stage/confidence/positivity are enumerated — left open pending that enumeration, consistent with this document's own instruction not to invent structure the mathematics does not yet require.
2. Whether `CoordinateValue.writtenAt` should additionally carry a vector-clock-style causality token (as `[[00-Runtime-Specification]]` anticipated for concurrent-write detection) now that D6/T2 have been shown not to require one for correctness — left to _[[16-Subsystem-Interface-Contracts]]_, since it is a question about what the Transformation Engine's write API surface accepts, not about the stored shape itself.

---

_See also: [[06-Research-State-Mathematics]] for the mathematical objects this schema serializes. [[14-Provenance-Structure]] for the `ProvenanceExpr` type used throughout. [[12-system-architecture-first-draft]] Subsystem 1 for the ownership boundary this schema fills. [[16-Subsystem-Interface-Contracts]] for the operations that construct and mutate these types._
