# Contributing

## The one rule that isn't obvious from reading the code

`packages/core/src/persistent-research-state/writes.ts` is importable **only**
from `packages/core/src/transformation-engine/**`. This is enforced by
`eslint.config.js` (`no-restricted-imports`) at the repo root, per **ADR-0004**.
If your change needs to write an Element or a coordinate value from somewhere
else, it doesn't — route it through `TransformationEngine`, or, if it's
config-registry state (like a dimension definition) rather than `E`/`I`
themselves, give it its own small write module the way
`configuration/registry-writes.ts` does (see ADR-0004 and
`spec/Phase 6 Specification/16-Subsystem-Interface-Contracts.md`, Subsystem 13).

## Before adding a subsystem capability the spec didn't already give it

1. Check `spec/` first — Phases 1–6 are the source of truth, not a starting
   point to improve on.
2. If the spec is genuinely silent on an engineering question (not a
   philosophical or architectural one — those are closed), write an ADR
   before writing the code, continuing the existing numbering.
3. Cite the ADR in the code that implements it, the way every module here
   cites the spec document it realizes.

## Tests

New algebraic properties (anything provable the way Docs 06/07/14 prove
things) get a `fast-check` property test in `packages/core/test/`, per
ADR-0005 — not just example-based unit tests.
