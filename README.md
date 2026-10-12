<div align="center">

# Dynamic UI

**Abstract tooling for building visual editors of dynamic interfaces.**
One canonical DSL on the output, adapters for any framework and any runtime form library.

[![status](https://img.shields.io/badge/status-early%20development-orange)](#status)
[![license](https://img.shields.io/badge/license-MIT-blue)](#license)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](#)
[![Angular](https://img.shields.io/badge/Angular-20-dd0031?logo=angular&logoColor=white)](#)
[![Built with Nx](https://img.shields.io/badge/built%20with-Nx-143055?logo=nx&logoColor=white)](https://nx.dev)

[Install](#install) · [Quick start](#quick-start) · [How it works](#how-it-works) · [Packages](#packages) · [Core docs](libs/studio/README.md) · [Angular docs](libs/ngx-studio/README.md)

</div>

---

## The problem

Most projects with dynamic forms — and, more broadly, dynamic interfaces like tables, dashboards and report builders — have a library that can render UI from a JSON config. But **the tooling to visually assemble that JSON usually doesn't exist.** Developers write schemas by hand, managers file tickets, feedback loops are slow.

Existing visual builders (SurveyJS, FormIO, Builder.io, Plasmic, Puck) are **nailed to their runtimes** — either their own rendering engine, or React. If your project runs on Angular Reactive Forms with an in-house UI kit, they don't help you.

**Dynamic UI** separates the editor from the runtime: a studio emits a pure, serializable tree, and a thin adapter you write once turns that tree into a real interface in _your_ stack.

## Features

- 🧩 **One tiny node contract.** The whole tree is nodes of a single four-field shape — no built-in notion of "input", "field", "section" or "form". Everything domain-specific lives in the components _you_ register.
- 📦 **Pure, serializable DSL.** The studio emits plain JSON: no functions, closures or framework references. Store it, diff it, version it, ship it over the wire.
- 🔌 **Adapters for any runtime.** An adapter is a single `map(root)` function. Target React Hook Form, Formily, Angular Reactive Forms, a backend schema, generated code — anything.
- ✅ **Framework-agnostic validation.** Attach a [valibot](https://valibot.dev) schema to any prop; `studio.validate()` reports failures per node. Advisory by design — it never blocks edits or mutates values.
- 🎨 **Native, stylable UI packages.** No Shadow DOM fights. Style the editor with your framework's normal mechanisms. Angular UI ships light/dark themes that follow the OS.
- 🅰️ **Angular 20 implementation today.** Standalone components, Angular Material, drag-and-drop canvas, layer tree and a per-node gear panel. React/Vue implementations are planned.

## Packages

| Package                                     | What it is                                                                                                          | Docs                                |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| [`@dynamic-ui/studio`](libs/studio)         | Core: registry, node tree, relations, validation, canonical DSL. Pure TypeScript — **no UI, no DOM, no framework**. | [README](libs/studio/README.md)     |
| [`@dynamic-ui/ngx-studio`](libs/ngx-studio) | Angular 20 editor UI (Material + CDK). Three-panel shell, canvas, inspector, adapter/preview views.                 | [README](libs/ngx-studio/README.md) |

## Install

> The packages are not yet on npm. During this phase they're installed **straight from GitHub** — each built package lives on its own branch (see [Publishing build branches](#publishing-build-branches)).

### Angular app

Installing the UI package pulls the core (`@dynamic-ui/studio`) automatically:

```bash
npm i github:dk-kasumov/dynamic-ui#builds/ngx-studio
```

Then add its peer dependencies to your app:

```bash
npm i @angular/cdk @angular/material @angular/material-date-fns-adapter date-fns \
  @codemirror/autocomplete @codemirror/commands @codemirror/lang-json \
  @codemirror/language @codemirror/lint @codemirror/state @codemirror/view @lezer/highlight
```

The host app provides animations and a Material theme (the package bundles neither):

```ts
// app.config.ts
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'

export const appConfig = { providers: [provideAnimationsAsync()] }
```

```scss
// styles.scss — any Material theme works
@use '@angular/material' as mat;
html {
  @include mat.theme(
    (
      color: mat.$azure-palette,
      typography: Roboto,
      density: 0
    )
  );
}
```

### Core only (no UI)

```bash
npm i github:dk-kasumov/dynamic-ui#builds/studio
```

## Quick start

### 1. Register components and validate (core)

```ts
import { Studio } from '@dynamic-ui/studio'
import * as v from 'valibot'

const textInput = Studio.defineComponent({
  title: 'Controls/TextInput',
  props: {
    // Attach a valibot schema to any prop — the editor surfaces failures inline.
    label: Studio.text({ validation: v.pipe(v.string(), v.minLength(1, 'Label is required')) }),
    placeholder: Studio.text(),
    maxLength: Studio.decimal()
  },
  relations: {
    visible: Studio.relation({ returns: 'boolean' }),
    required: Studio.relation({ returns: 'boolean' })
  }
})

const studio = new Studio({ components: [textInput] })

const id = studio.addNode(studio.root.id, { name: 'Controls/TextInput' })
studio.setProp(id, ['label'], '') // leave the required label empty

studio.validate()
// Map { <id> => [{ path: ['label'], label: 'Label', messages: ['Label is required'] }] }
```

Mutations apply to an immutable tree; subscribe to `studio.state$` to react to every change. See the [core README](libs/studio/README.md) for the full API.

### 2. Drop in the Angular editor

```ts
import { Component } from '@angular/core'
import { Studio } from '@dynamic-ui/studio'
import { NgxStudioComponent, StudioPreviewDirective } from '@dynamic-ui/ngx-studio'

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [NgxStudioComponent, StudioPreviewDirective],
  template: `
    <ds-ngx-studio [studio]="studio" [adapters]="{ schema }">
      <!-- optional live preview: render your own UI from adapter outputs -->
      <ng-template dsStudioPreview let-ast let-outputs="outputs">
        <my-form [schema]="outputs['schema']" />
      </ng-template>
    </ds-ngx-studio>
  `
})
export class EditorComponent {
  readonly schema = Studio.defineAdapter({ map: root => root })
  readonly studio = new Studio({ components: [/* your Studio.defineComponent(...) list */] })
}
```

The studio renders the palette, canvas and gear panel. An **adapter** is `{ map(root) }` returning anything JSON-serializable; the Output view shows each adapter's result and the preview template receives them as `outputs`.

## How it works

The entire tree is made of nodes of a single shape:

```ts
type Node = {
  id: string // stable instance identifier
  name: string // registered component title, e.g. "Controls/TextInput"
  fieldName?: string // key of this node's value in the output
  props: object // static values the component consumes directly
  relations: object // dynamic links to other nodes (visible, disabled, computed…)
  children?: Node[] // only present if the component is a container
}
```

Four fields — the entire contract. The core knows nothing beyond this: not "inputs", not "validators", not "sections". Those meanings live in the components you register and in the adapter that reads the output.

### Three load-bearing invariants

1. **The studio renders abstract DSL cards, not real forms.** Live preview is the job of an adapter you inject, not the core's responsibility.
2. **The DSL is pure data.** No functions, closures, Symbols or framework references in the serialized output.
3. **A runtime's limitations are the adapter's problem, not the core's.** The DSL may be more expressive than any single runtime — that's expected.

**Why framework-specific UI packages instead of web components:** web components isolate styles behind Shadow DOM, turning branding and design-system integration into a fight with `::part`, `exportparts` and manual token plumbing. Native per-framework packages let consumers style the studio with the mechanisms they already use.

## Repository layout

```
libs/
├── studio/                 # Core: studio logic, DSL, relations, validation. No UI.
├── ngx-studio/             # Angular 20 UI implementation (Material + CDK)
├── react-studio/           # (planned) React UI implementation
├── vue-studio/             # (planned) Vue UI implementation
└── adapters/
    ├── jsonforms/          # (planned) reference adapter — JSONForms target
    ├── react-hook-form/    # (planned) reference adapter
    └── angular-reactive/   # (planned) reference adapter
```

## Development

```bash
npm install                # install workspace deps
npm run test:core          # core unit tests (Jest)
npm run storybook          # Storybook for the Angular UI (port 4400)
npm run lint               # ESLint across the workspace
npx nx build ngx-studio    # produce the publishable artifact in dist/
```

> **Note:** the Angular unit-test target (`npm run test:ngx`) currently relies on
> `@nx/angular:unit-test`, which requires Angular ≥ 21. On this Angular 20
> baseline it is disabled pending a Vitest-for-Angular-20 setup; core tests and
> both library builds run normally.

The workspace is an [Nx](https://nx.dev) monorepo. Project tags (`type:core` / `type:ui`) enforce that the core never imports a UI framework. Commits follow [Conventional Commits](https://www.conventionalcommits.org/) (checked by commitlint); `pre-commit` runs ESLint + Prettier on staged files.

### Publishing build branches

The GitHub-install flow above is backed by a script that builds both packages and pushes each built artifact to its own branch (`builds/studio`, `builds/ngx-studio`):

```bash
npm run publish:git
```

`builds/ngx-studio` declares `@dynamic-ui/studio` as a git dependency pointing at `builds/studio`, so a single install resolves both. Re-run the script after changes to refresh the branches.

## Roadmap

- Freeze the canonical DSL shape and introduce versioning (`schemaVersion`).
- Complete the `Studio.*` primitive set and `Studio.relation()` expression tree.
- Pressure-test the DSL with adapters for two radically different runtimes (one declarative, one imperative).
- Harden the first UI implementation and publish to npm.

## Status

Early development. The public API is still unstable and may change without notice.

## License

[MIT](LICENSE)
