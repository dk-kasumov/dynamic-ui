# Dynamic UI

> Abstract tooling for building visual editors of dynamic interfaces. One DSL on the output, adapters for any framework and any runtime form library.

**Status:** early development, API is unstable.

## The problem

On most projects that have dynamic forms (and more broadly — dynamic interfaces: tables, dashboards, report builders), there is usually a library that can render UI from a JSON config. But **tooling to visually assemble that JSON** typically doesn't exist. Developers write schemas by hand, managers file tickets, feedback loops are slow.

Existing solutions (SurveyJS, FormIO, Builder.io, Plasmic, Puck) are **nailed to their runtimes**: either to their own rendering engine, or to React. If your project runs on Angular Reactive Forms with an internal UI kit, they don't help you.

## What this is

**Dynamic UI** is three things:

1. **Studio** — a visual editor where a developer registers their own components up front, and a manager assembles the interface with drag-and-drop, a canvas, and a "gear" settings panel.
2. **Canonical DSL** — a pure, serializable JSON structure the studio emits. No functions, no closures, no framework-specific references.
3. **Adapters** — a thin layer the developer writes once for their runtime (React Hook Form, Formily, Angular Reactive Forms, a proprietary engine — anything). The adapter reads the DSL and builds the real form.

The studio itself **does not render a working form**. It shows abstract cards for each node with its configuration. The real form is produced by the adapter inside the developer's project.

## Mental model

The entire tree is made of nodes of a single shape:

```
Node = {
  id,          // stable instance identifier
  name,        // registered component name (e.g., "Controls/TextInput")
  props,       // static values the component itself consumes
  relations,   // links to other nodes (visibility, disabled state, computed values, ...)
  children?    // child nodes, if the component is a container
}
```

Four fields — the entire contract. The core knows nothing beyond this: not about "inputs", not about "validators", not about "sections".

## Three load-bearing invariants

These rules are fixed and must not be eroded as the project grows:

1. **The studio renders abstract DSL cards, not real forms.** Live preview is the job of an external plugin that injects an adapter, not the core's responsibility.
2. **The DSL is pure data.** No functions, closures, Symbols, or framework references in the serialized output.
3. **A specific runtime's limitations are the adapter's problem, not the core's.** The DSL can be more expressive than any single runtime — that's fine and expected.

## Repository layout

```
libs/
├── studio/                 # Core: studio logic, DSL, validation. No UI.
├── studio-ui-react/        # (planned) React UI implementation
├── studio-ui-angular/      # (planned) Angular UI implementation
├── studio-ui-vue/          # (planned) Vue UI implementation
└── adapters/
    ├── react-hook-form/    # (planned) Reference adapter
    └── angular-reactive/   # (planned) Reference adapter
```

**Why framework-specific UI packages instead of web components:** web components isolate styles via Shadow DOM, which turns branding and design-system integration into a fight with `::part`, `exportparts`, and manual token plumbing. Native per-framework packages let consumers style the studio with their framework's normal mechanisms.

## Tech stack

- **Nx** monorepo.
- Core is written in **TypeScript** with no DOM or framework dependencies.
- Tests use **Jest**.

## Where to start

For now, read the [core library documentation](libs/studio/README.md). The API is actively evolving; a "Getting started" section will appear once the minimal core, a reference adapter, and one UI implementation have stabilized.

## Roadmap

Near-term milestones:

- Freeze the canonical DSL shape and introduce versioning (`schemaVersion`).
- Implement the base set of `Studio.*` primitives and `Studio.relation()` with its AST.
- Pressure-test the DSL by writing adapters for two radically different runtimes (one declarative, one imperative).
- Ship the first UI implementation.

## License

MIT.
