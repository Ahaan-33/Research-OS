// Realizes [[14-Provenance-Structure]] (PosBool(Acts), Theorem P1) and the
// ProvenanceService interface of [[16-Subsystem-Interface-Contracts]].
import { uuidv7 } from '../util/uuid7';
import type { AtomicActRef, AtomicActType, ProvenanceExpr } from '../types';

function actKey(a: AtomicActRef): string {
  return a.id;
}

/** ⊗ is itself idempotent per-element (a⊗a=a): an inner joint-set is a true
 *  set of acts, not a multiset. Dedupe by id before any key/subset logic —
 *  skipping this step made two multiset spellings of the same set (e.g.
 *  [a] and [a,a]) compare as distinct-and-mutually-subset, silently erasing
 *  both under absorption. Caught by the associativity property test. */
function dedupeSet(s: readonly AtomicActRef[]): readonly AtomicActRef[] {
  const byId = new Map<string, AtomicActRef>();
  for (const a of s) byId.set(actKey(a), a);
  return [...byId.values()];
}

function setKey(s: readonly AtomicActRef[]): string {
  return dedupeSet(s).map(actKey).sort().join(',');
}

/** True subset-or-equal, on the deduplicated sets. */
function isSubsetOf(a: readonly AtomicActRef[], b: readonly AtomicActRef[]): boolean {
  const as = dedupeSet(a);
  const bs = new Set(dedupeSet(b).map(actKey));
  return as.every((x) => bs.has(actKey(x)));
}

/** Absorption: a ⊗ (a ⊕ b) = a. Keep only minimal sets; drop duplicates and
 *  any set that is a strict superset of another distinct set. */
function normalize(expr: ProvenanceExpr): ProvenanceExpr {
  const deduped = expr.map(dedupeSet);
  const seen = new Map<string, readonly AtomicActRef[]>();
  for (const s of deduped) {
    const k = setKey(s);
    if (!seen.has(k)) seen.set(k, s);
  }
  const sets = [...seen.values()];
  const minimal = sets.filter((s) => {
    const sk = setKey(s);
    return !sets.some((other) => setKey(other) !== sk && isSubsetOf(other, s));
  });
  return minimal;
}

/** ⊗ — joint necessity: these acts, together, are required. */
export function joint(refs: readonly AtomicActRef[]): ProvenanceExpr {
  if (refs.length === 0) return []; // 0, the empty antichain — never legal on a stored coordinate (D10.2)
  return normalize([refs]);
}

/** ⊕ — alternation: any one of these (possibly joint) justifications suffices. */
export function alternative(...exprs: readonly ProvenanceExpr[]): ProvenanceExpr {
  return normalize(exprs.flat());
}

/** Merge two provenance expressions already attached to the same coordinate
 *  (e.g. independent convergence, per Doc14 "why ⊕ is forced"). This *is* ⊕. */
export function mergeProvenance(a: ProvenanceExpr, b: ProvenanceExpr): ProvenanceExpr {
  return alternative(a, b);
}

let counter = 0;
/** Mints one fresh AtomicActRef. Called once per Capture/Supersede/Interpret,
 *  once per whole Synthesis run (never per-coordinate-inside-a-batch), per
 *  Doc14 Open Question 1 and Doc16's ProvenanceService.attribute. */
export function attribute(actType: AtomicActType, agent: string, timestamp: number = Date.now()): AtomicActRef {
  counter += 1;
  return { id: `${uuidv7()}-${counter}`, actType, agent, timestamp };
}

/** compose per [[16-Subsystem-Interface-Contracts]] Subsystem 12. */
export function compose(refs: readonly AtomicActRef[], mode: 'joint' | 'alternative'): ProvenanceExpr {
  return mode === 'joint' ? joint(refs) : alternative(...refs.map((r) => joint([r])));
}
