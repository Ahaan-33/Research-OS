# Research Operating System — Reference Repository (v0)

This is the first reference implementation of ROS, built strictly from the
specification in `spec/` and the engineering decisions in `ADR-*.md`. It does
not redesign anything in `spec/`; every non-trivial choice not already fixed
there is recorded as an ADR before use.

## Layout

```
spec/                    Phases 1–6: philosophy, architecture, mathematics,
                         subsystem contracts, reference implementation strategy
ADR-0001.md … ADR-0006.md   Concrete engineering decisions (monorepo layout,
                         storage driver, migrations, write-boundary enforcement,
                         testing strategy, build tooling)
packages/core/           @ros/core — headless library, Subsystems 1, 2, 4, 7,
                         9 (minimal), 12, 13 (dimension registry only)
packages/obsidian-plugin/  @ros/obsidian-plugin — Subsystem 8 + the UI-facing
                         half of Subsystem 10
```

## v0 scope

Fixed by *Reference Implementation Strategy* (`spec/Phase 6 Specification/17-…`),
§7. **Built:** Capture, Supersede, Interpret (all four D10 legality checks
E1–E3 enforced); provenance (`PosBool(Acts)`); dimension registration;
proximity (no clustering yet); Thread View and Timeline projections; an
Obsidian shell exercising Capture/Interpret/render. **Explicitly deferred:**
Synthesis Engine (Subsystem 3 — idempotence is still an open question, see
`spec/Phase 4 Formalization/07-Transformation-Algebra.md`), Local Intelligence
(Subsystem 6), Lifecycle Orchestrator (Subsystem 11), and four of the six
Projection operators (Semantic Map, Tree, Dashboard, Publication View).

**Desktop only.** Obsidian Mobile is not supported in v0 — see ADR-0002.

## Build & test

```sh
pnpm install
pnpm build   # tsc -b core, typecheck + esbuild-bundle the plugin
pnpm test    # vitest + fast-check property tests (ADR-0005) against @ros/core
pnpm lint    # enforces ADR-0004's write-boundary rule
```

To install the built plugin in Obsidian: copy
`packages/obsidian-plugin/{manifest.json,main.js}` into
`<vault>/.obsidian/plugins/ros/`.

## Provenance of this repository

Every subsystem boundary, invariant, and interface here traces to a specific
document under `spec/`. Where the specification is silent — storage driver,
build tooling, test framework, write-boundary enforcement mechanism — an ADR
records the decision and its justification before the corresponding code was
written. See `CONTRIBUTING.md` for the convention this repo expects future
changes to follow.
