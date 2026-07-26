// Realizes [[15-Canonical-Data-Model]]. Do not add fields here that Doc 15
// does not authorize — this is the closed schema, not a place to extend ad hoc.

export type ElementId = string; // UUIDv7, per D4 / Doc15 "D4 — Identity"
export type DimensionId = string; // registered key, per D5

// --- D7 / [[14-Provenance-Structure]] ---------------------------------------
export type AtomicActType =
  | 'capture' | 'supersede' | 'interpret' | 'synthesis_run' | 'investigation_completion';

export interface AtomicActRef {
  readonly id: string;
  readonly actType: AtomicActType;
  readonly agent: string;
  readonly timestamp: number;
}

/** PosBool(Acts): an antichain of minimal jointly-sufficient act sets.
 *  Outer array = OR (alternation, ⊕); inner array = AND (joint necessity, ⊗). */
export type ProvenanceExpr = readonly (readonly AtomicActRef[])[];

// --- D1 / D2 / D3 ------------------------------------------------------------
export type ElementRole = 'content' | 'relation';

export type ContentKind =
  | 'observation' | 'hypothesis' | 'experiment' | 'dataset' | 'result'
  | 'interpretation' | 'decision' | 'implementation' | 'literature_reference';

export interface ContentElement {
  readonly id: ElementId;
  readonly role: 'content';
  readonly kind: ContentKind;
  readonly payload: unknown; // opaque to Subsystem 1, per Doc15 "Note on payload opacity"
  readonly prov: ProvenanceExpr;
}

export type RelationType = string; // open registry; 'supersedes' is reserved (D8)

export interface RelationElement {
  readonly id: ElementId;
  readonly role: 'relation';
  readonly relationType: RelationType;
  readonly endpoints: readonly ElementId[]; // length >= 2, per D2
  readonly prov: ProvenanceExpr;
}

export type Element = ContentElement | RelationElement;

// --- D5 -----------------------------------------------------------------
export type ValueSpaceSpec =
  | { readonly kind: 'enum'; readonly values: readonly string[] }
  | { readonly kind: 'scalar'; readonly min?: number; readonly max?: number }
  | { readonly kind: 'ref'; readonly targetRole: ElementRole }
  | { readonly kind: 'freeText' };

export interface DimensionDefinition {
  readonly dimension: DimensionId;
  readonly valueSpace: ValueSpaceSpec;
  readonly registeredAt: number;
  readonly registeredBy: ProvenanceExpr;
}

// --- D6 / D14 -----------------------------------------------------------
export interface CoordinateValue {
  readonly value: unknown; // validated against ValueSpaceSpec at write time (E2)
  readonly prov: ProvenanceExpr;
  readonly writtenAt: number;
}

export type ExaminationStatus = 'unexamined' | 'examined';

export interface CoordinateEntry {
  readonly element: ElementId;
  readonly dimension: DimensionId;
  readonly values: readonly CoordinateValue[]; // |values| >= 2 => Conflict Region (D13)
  readonly status: ExaminationStatus;
}

// --- D9 / D10 -------------------------------------------------------------
/** Logical snapshot of S = (E, I), plus the co-located (non-S) dimension registry.
 *  See Doc15 "Note on carrying DimensionRegistry inside ResearchState": this is a
 *  storage-locality convenience, not a claim that D is part of S. */
export interface ResearchState {
  readonly evidence: readonly Element[];
  readonly interpretation: readonly CoordinateEntry[];
  readonly dimensions: readonly DimensionDefinition[];
}

// --- Change tracking (Doc16 shared types) --------------------------------
export type ChangeSetEntry = ElementId | `${ElementId}:${DimensionId}`;
export type ChangeSet = ReadonlySet<ChangeSetEntry>;

// --- Legality (D10), enumerated per Doc16 Open Question 3 ------------------
export type LegalityViolation =
  | { readonly code: 'DUPLICATE_ID'; readonly id: ElementId }
  | { readonly code: 'UNKNOWN_ELEMENT'; readonly element: ElementId }
  | { readonly code: 'UNKNOWN_DIMENSION'; readonly dimension: DimensionId }
  | { readonly code: 'INVALID_VALUE'; readonly dimension: DimensionId; readonly value: unknown }
  | { readonly code: 'SUPERSESSION_CYCLE'; readonly old: ElementId; readonly next: ElementId }
  | { readonly code: 'DUPLICATE_DIMENSION'; readonly dimension: DimensionId };

export type Result<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: LegalityViolation };

// --- Weighting / proximity (D16, Doc16 shared types) -----------------------
export type AgreeFnRef = 'enum-overlap' | 'scalar-decay' | 'ref-equality' | 'freetext-equality';

export interface WeightConfig {
  readonly weights: ReadonlyMap<DimensionId, number>;
  readonly agreeFns: ReadonlyMap<DimensionId, AgreeFnRef>;
}

// --- Projection (D28, Doc16 shared types) ----------------------------------
export type ProjectionOperator =
  | 'semantic_map' | 'timeline' | 'thread_view' | 'tree' | 'dashboard' | 'publication_view';

export interface QueryDefinition {
  readonly operator: ProjectionOperator;
  readonly parameters: Readonly<Record<string, string>>;
}

export type AbstractionParameter = string; // opaque level key; v0 has one level ("finest")

export interface ViewData {
  readonly operator: ProjectionOperator;
  readonly abstraction: AbstractionParameter;
  readonly content: unknown; // operator-specific; opaque at this contract's level
  readonly conflictFaithful: boolean; // T14 — MUST be true for any emitted ViewData
}

// --- Local Intelligence (Doc16 shared types; Subsystem 6 deferred, see Doc17 §7) --
export interface Suggestion {
  readonly kind: 'metadata_candidate' | 'similarity_ranking' | 'next_action';
  readonly target: ElementId | `${ElementId}:${DimensionId}`;
  readonly candidateValue?: unknown;
  readonly score: number; // in [0,1], continuous only — Ambiguity Audit A11
  readonly explanation?: string;
}
